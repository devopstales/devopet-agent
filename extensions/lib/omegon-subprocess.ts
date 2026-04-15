import { existsSync, openSync, readSync, closeSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

export interface devopetSubprocessSpec {
  command: string;
  argvPrefix: string[];
  omegonEntry: string;
}

let cached: devopetSubprocessSpec | null = null;

/**
 * Resolve the canonical devopet-owned subprocess entrypoint without relying on PATH.
 *
 * Internal helpers should spawn `process.execPath` with `bin/omegon-pi.mjs` explicitly,
 * rather than assuming a `pi` or `omegon` binary on PATH points back to this install.
 */
export function resolvedevopetSubprocess(): devopetSubprocessSpec {
  if (cached) return cached;

  const here = dirname(fileURLToPath(import.meta.url));
  const omegonEntry = join(here, "..", "..", "bin", "omegon-pi.mjs");
  cached = {
    command: process.execPath,
    argvPrefix: [omegonEntry],
    omegonEntry,
  };
  return cached;
}

// ─── Native agent binary ────────────────────────────────────────────────────

/**
 * Resolved native agent binary specification.
 *
 * When available, cleave children can be dispatched to this binary instead
 * of spawning a full Node.js + devopet TS process. The native binary is
 * faster to start, uses less memory, and has the core 4 tools built in
 * (read, write, edit, bash).
 */
export interface NativeAgentSpec {
  /** Path to the omegon binary */
  binaryPath: string;
  /** Path to the LLM bridge script (passed via --bridge when native providers unavailable) */
  bridgePath: string;
  /** Whether the binary has native LLM providers (no --bridge needed for anthropic/openai) */
  hasNativeProviders: boolean;
}

let nativeCached: NativeAgentSpec | null | undefined;
/** Timestamp of last successful resolution — stale after 30s so mid-session builds are picked up. */
let nativeCachedAt = 0;
const NATIVE_CACHE_TTL_MS = 30_000;

/**
 * Resolve the native omegon binary if available.
 *
 * Search order:
 * 1. OMEGON_AGENT_BINARY env var (explicit override for CI/testing)
 * 2. core/target/release/omegon (local development build)
 * 3. npm platform package (@styrene-lab/omegon-{platform})
 * 4. PATH lookup — find `omegon` on PATH if it's a native binary (not the JS shim)
 * 5. Legacy: core/target/release/omegon-agent or node_modules/.omegon/omegon-agent
 *
 * Returns null if no binary is found — callers must fall back to TS subprocess.
 * Result is cached for 30 s — long enough to avoid redundant stat() within a single
 * cleave_run but short enough that a mid-session `cargo build` is picked up.
 */
export function resolveNativeAgent(): NativeAgentSpec | null {
  // Return cached result if still fresh, but never cache a null result
  // (the binary may be built mid-session).
  if (nativeCached && Date.now() - nativeCachedAt < NATIVE_CACHE_TTL_MS) {
    return nativeCached;
  }

  const here = dirname(fileURLToPath(import.meta.url));
  const repoRoot = resolve(here, "..", "..");

  // Bridge is always relative to the repo/package root
  const bridgePath = join(repoRoot, "core", "bridge", "llm-bridge.mjs");

  const found = (binaryPath: string, native = true): NativeAgentSpec => {
    const spec: NativeAgentSpec = { binaryPath, bridgePath, hasNativeProviders: native };
    nativeCached = spec;
    nativeCachedAt = Date.now();
    return spec;
  };

  // 1. Explicit override via env var
  const envPath = process.env.OMEGON_AGENT_BINARY;
  if (envPath && existsSync(envPath)) {
    return found(envPath);
  }

  // 2. Local development build — try "omegon" first, then legacy "omegon-agent"
  for (const name of ["omegon", "omegon-agent"]) {
    const devBinary = join(repoRoot, "core", "target", "release", name);
    if (existsSync(devBinary)) {
      return found(devBinary);
    }
  }

  // 3. npm platform package (@styrene-lab/omegon-{platform})
  const platformPkg = resolvePlatformPackageBinary();
  if (platformPkg && existsSync(platformPkg)) {
    return found(platformPkg);
  }

  // 4. PATH lookup — find `omegon` on PATH if it's a native binary
  const pathBinary = resolveFromPath("omegon");
  if (pathBinary) {
    return found(pathBinary);
  }

  // 5. Legacy npm install location
  const npmBinary = join(repoRoot, "node_modules", ".omegon", "omegon-agent");
  if (existsSync(npmBinary)) {
    return found(npmBinary);
  }

  // Don't cache null — allow immediate retry after cargo build
  return null;
}

/**
 * Resolve the omegon binary from the platform-specific npm package.
 *
 * Maps `process.platform` + `process.arch` to `@styrene-lab/omegon-{platform}`
 * and finds the binary via createRequire resolution. Tries `omegon` first,
 * falls back to legacy `omegon-agent` name.
 */
function resolvePlatformPackageBinary(): string | null {
  const platformMap: Record<string, string> = {
    "darwin-arm64": "@styrene-lab/omegon-darwin-arm64",
    "darwin-x64": "@styrene-lab/omegon-darwin-x64",
    "linux-x64": "@styrene-lab/omegon-linux-x64",
    "linux-arm64": "@styrene-lab/omegon-linux-arm64",
  };

  const key = `${process.platform}-${process.arch}`;
  const pkg = platformMap[key];
  if (!pkg) return null;

  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const repoRoot = resolve(here, "..", "..");
    const req = createRequire(join(repoRoot, "package.json"));
    const pkgJson = req.resolve(`${pkg}/package.json`);
    const pkgDir = dirname(pkgJson);
    // Try "omegon" first, then legacy "omegon-agent"
    for (const name of ["omegon", "omegon-agent"]) {
      const binary = join(pkgDir, name);
      if (existsSync(binary)) return binary;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Find `omegon` on PATH and verify it's a native binary (not a JS shim).
 * Returns the absolute path if found and native, null otherwise.
 */
function resolveFromPath(name: string): string | null {
  try {
    const which = execFileSync("which", [name], { encoding: "utf-8" }).trim();
    if (!which || !existsSync(which)) return null;

    // Read the first 4 bytes to check if it's a Mach-O or ELF binary
    // (not a #!/usr/bin/env node script)
    const header = Buffer.alloc(4);
    const fd = openSync(which, "r");
    readSync(fd, header, 0, 4, 0);
    closeSync(fd);

    // Mach-O magic: 0xFEEDFACE (32), 0xFEEDFACF (64), 0xCAFEBABE (fat)
    // Mach-O LE:    0xCFFAEDFE (64), 0xCEFAEDFE (32)
    // ELF magic:    0x7F454C46
    const magic = header.readUInt32BE(0);
    const isNative =
      magic === 0xFEEDFACE || magic === 0xFEEDFACF ||
      magic === 0xCAFEBABE || magic === 0xCFFAEDFE || magic === 0xCEFAEDFE ||
      magic === 0x7F454C46;

    return isNative ? which : null;
  } catch {
    return null;
  }
}

/**
 * Clear the cached native agent spec. For testing only.
 * @internal
 */
export function _clearNativeAgentCache(): void {
  nativeCached = undefined;
  nativeCachedAt = 0;
}
