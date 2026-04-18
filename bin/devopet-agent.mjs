#!/usr/bin/env node
/**
 * devopet entry point.
 *
 * Keeps mutable user state in the shared pi-compatible agent directory while
 * injecting devopet-packaged resources from the installed package root.
 *
 * Resolution: node_modules/@mariozechner/pi-coding-agent (upstream pi)
 */
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve as pathResolve } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const devopetRoot = dirname(dirname(__filename));
const defaultStateDir = join(homedir(), ".pi", "agent");
const stateDir = process.env.PI_CODING_AGENT_DIR || defaultStateDir;
const usingExplicitStateOverride = Boolean(process.env.PI_CODING_AGENT_DIR);

const cli = join(devopetRoot, "node_modules/@mariozechner/pi-coding-agent/dist/cli.js");
const resolutionMode = "npm";

/** Basename of how this process was invoked (npm shim, symlink, or script path). */
function cliExecutableName() {
  const arg = process.argv[1];
  if (!arg) return "devopet";
  let name = basename(arg);
  if (name.endsWith(".mjs")) name = name.slice(0, -".mjs".length);
  else if (name.endsWith(".cmd")) name = name.slice(0, -".cmd".length);
  return name || "devopet";
}

/** Exposed to extensions so shutdown hints match the binary name (devopet vs devopet-agent). */
process.env.DEVOPET_CLI_NAME = cliExecutableName();

/**
 * Map devopet-specific flags to pi CLI before resource injection.
 * `--resume <id>` → `--session <id>` (same as `pi --session`; see upstream session docs).
 */
function mapDevopetFlagsToPi(argv) {
  const a = [...argv];
  const out = [];
  for (let i = 0; i < a.length; i++) {
    if (a[i] === "--resume" && a[i + 1] && !String(a[i + 1]).startsWith("-")) {
      out.push("--session", a[i + 1]);
      i++;
      continue;
    }
    out.push(a[i]);
  }
  return out;
}

/** Mirrors extensions/lib/devopet-config-paths.ts — keep in sync (bin must not depend on TS build). */
function getDevopetGlobalConfigDirFromEnv() {
  const raw = process.env.DEVOPET_CONFIG_HOME?.trim();
  const home = homedir();
  if (raw) {
    if (raw === "~") return home;
    if (raw.startsWith("~/")) return join(home, raw.slice(2));
    return pathResolve(raw);
  }
  return join(home, ".devopet");
}

function findDevopetProjectConfigDirFrom(cwd) {
  let cur = pathResolve(cwd);
  for (;;) {
    const candidate = join(cur, ".devopet");
    try {
      if (existsSync(candidate) && statSync(candidate).isDirectory()) {
        return candidate;
      }
    } catch {
      // ignore
    }
    const parent = dirname(cur);
    if (parent === cur) return null;
    cur = parent;
  }
}

function migrateLegacyStatePath(relativePath, kind = "file") {
  if (usingExplicitStateOverride) {
    return;
  }

  const legacyPath = join(devopetRoot, relativePath);
  const targetPath = join(stateDir, relativePath);
  if (!existsSync(legacyPath) || existsSync(targetPath)) {
    return;
  }

  mkdirSync(dirname(targetPath), { recursive: true });
  if (kind === "directory") {
    cpSync(legacyPath, targetPath, { recursive: true, force: false });
    return;
  }
  copyFileSync(legacyPath, targetPath);
}

function injectBundledResourceArgs(argv) {
  const injected = [...argv];
  const pushPair = (flag, value) => {
    if (existsSync(value)) {
      injected.push(flag, value);
    }
  };

  // devopet is the sole authority for bundled resources.
  // Suppress pi's auto-discovery of skills, prompts, and themes (which scans
  // ~/.pi/agent/*, installed packages, and project .pi/ dirs) so only our
  // manifest-declared resources load. The --no-* flags disable discovery
  // but still allow CLI-injected paths (our --extension manifest).
  // Extensions are NOT suppressed — project-local .pi/extensions/ should still work.
  injected.push("--no-skills", "--no-prompt-templates", "--no-themes");
  pushPair("--extension", devopetRoot);
  return injected;
}

if (process.argv.includes("--version") || process.argv.includes("-v")) {
  const pkg = JSON.parse(readFileSync(join(devopetRoot, "package.json"), "utf8"));
  process.stdout.write(pkg.version + "\n");
  process.exit(0);
}

if (process.argv.includes("--where")) {
  process.stdout.write(JSON.stringify({
    devopetRoot,
    cli,
    resolutionMode,
    agentDir: stateDir,
    stateDir,
    executable: cliExecutableName(),
    devopetConfigHome: getDevopetGlobalConfigDirFromEnv(),
    devopetProjectConfigDir: findDevopetProjectConfigDirFrom(process.cwd()),
  }, null, 2) + "\n");
  process.exit(0);
}

process.env.PI_CODING_AGENT_DIR = stateDir;

// Suppress the upstream runtime's version check and changelog display.
// devopet has its own /update command and version-check extension —
// the pi-coding-agent's built-in checks leak upstream version numbers.
process.env.PI_SKIP_VERSION_CHECK = "1";
migrateLegacyStatePath("auth.json");
migrateLegacyStatePath("settings.json");
migrateLegacyStatePath("sessions", "directory");

// Force quiet startup — the splash extension provides the branded header.
// This suppresses the built-in keybinding hints, expanded changelog, and
// resource listing that pi's interactive mode normally renders before
// extensions have a chance to set a custom header.
function forceQuietStartup() {
  try {
    const settingsPath = join(stateDir, "settings.json");
    mkdirSync(stateDir, { recursive: true });
    let settings = {};
    if (existsSync(settingsPath)) {
      settings = JSON.parse(readFileSync(settingsPath, "utf8"));
    }
    let changed = false;
    if (settings.quietStartup === undefined) {
      settings.quietStartup = true;
      changed = true;
    }
    if (settings.collapseChangelog === undefined) {
      settings.collapseChangelog = true;
      changed = true;
    }
    // Belt-and-suspenders: force lastChangelogVersion to a sentinel that is always
    // semver-greater than any upstream changelog entry. This prevents the upstream
    // "Updated to vX.Y.Z" banner even if PI_SKIP_VERSION_CHECK is somehow not set.
    const SENTINEL_VERSION = "999.0.0";
    if (settings.lastChangelogVersion !== SENTINEL_VERSION) {
      settings.lastChangelogVersion = SENTINEL_VERSION;
      changed = true;
    }
    if (changed) {
      writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n", "utf8");
    }
  } catch { /* best effort */ }
}
forceQuietStartup();

function purgeSelfReferentialPackages() {
  try {
    const settingsPath = join(stateDir, "settings.json");
    if (!existsSync(settingsPath)) return;
    const settings = JSON.parse(readFileSync(settingsPath, "utf8"));
    if (!Array.isArray(settings.packages)) return;
    const selfPatterns = [
      /github\.com\/cwilson613\/devopet/i,
      /github\.com\/cwilson613\/pi-kit/i,
      /github\.com\/styrene-lab\/devopet/i,
    ];
    const filtered = settings.packages.filter(
      (pkg) => !selfPatterns.some((re) => re.test(String(pkg))),
    );
    if (filtered.length === settings.packages.length) return;
    settings.packages = filtered;
    writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n", "utf8");
  } catch { /* graceful failure — do not block startup */ }
}
purgeSelfReferentialPackages();

// ---------------------------------------------------------------------------
// CLI launch — subprocess with restart-loop support.
//
// Instead of importing the CLI directly (which makes restart impossible since
// Node can't replace its own process image), we spawn it as a child process.
// If the child exits with code 75 (EX_TEMPFAIL), we re-spawn — this is the
// restart signal from /update and /restart commands.
//
// This keeps the wrapper as the foreground process group leader throughout,
// so the re-spawned CLI always owns the terminal and can receive input.
// ---------------------------------------------------------------------------
import { spawn as nodeSpawn } from "node:child_process";

const RESTART_EXIT_CODE = 75;

const cliArgs = injectBundledResourceArgs(mapDevopetFlagsToPi(process.argv)).slice(2);

const isInteractive = process.stdout.isTTY &&
  !process.argv.includes("-p") &&
  !process.argv.includes("--print") &&
  !process.argv.includes("--help") &&
  !process.argv.includes("-h");

function showPreImportSpinner() {
  if (!isInteractive) return undefined;
  const PRIMARY = "\x1b[38;2;42;180;200m";
  const DIM = "\x1b[38;2;64;88;112m";
  const RST = "\x1b[0m";
  const HIDE_CURSOR = "\x1b[?25l";
  const SHOW_CURSOR = "\x1b[?25h";
  const spinner = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let frame = 0;

  const restoreCursor = () => { try { process.stdout.write(SHOW_CURSOR); } catch {} };
  process.on("exit", restoreCursor);

  process.stdout.write(HIDE_CURSOR);
  process.stdout.write(`\n  ${PRIMARY}devopet${RST} ${DIM}loading…${RST}`);

  const spinTimer = setInterval(() => {
    const s = spinner[frame % spinner.length];
    process.stdout.write(`\r  ${PRIMARY}${s} devopet${RST} ${DIM}loading…${RST}`);
    frame++;
  }, 80);

  return () => {
    clearInterval(spinTimer);
    process.removeListener("exit", restoreCursor);
    process.stdout.write(`\r\x1b[2K${SHOW_CURSOR}`);
  };
}

function launchCli() {
  return new Promise((resolve) => {
    const cleanup = showPreImportSpinner();

    const child = nodeSpawn(process.execPath, [cli, ...cliArgs], {
      stdio: "inherit",
      env: process.env,
    });

    // Let the child handle SIGINT (Ctrl+C) — the wrapper ignores it.
    const ignoreInt = () => {};
    process.on("SIGINT", ignoreInt);
    // Forward SIGTERM so graceful shutdown works.
    const fwdTerm = () => child.kill("SIGTERM");
    process.on("SIGTERM", fwdTerm);

    // Clean up spinner once the child's TUI takes over. The child will
    // clear the screen on startup anyway, but a brief delay ensures the
    // spinner doesn't flicker.
    if (cleanup) {
      setTimeout(() => cleanup(), 200);
    }

    child.on("exit", (code, signal) => {
      process.removeListener("SIGINT", ignoreInt);
      process.removeListener("SIGTERM", fwdTerm);
      if (signal) {
        // Re-raise the signal so the wrapper exits with the right status
        process.kill(process.pid, signal);
      }
      resolve(code ?? 1);
    });
  });
}

// Main loop — restart on exit code 75
let exitCode;
do {
  exitCode = await launchCli();
} while (exitCode === RESTART_EXIT_CODE);

process.exit(exitCode);
