/**
 * Pure utility functions extracted for testability.
 * The main index.ts imports from here; tests import directly.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Config discrimination
// ---------------------------------------------------------------------------

export interface StdioServerConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface HttpServerConfig {
  url: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export type ServerConfig = StdioServerConfig | HttpServerConfig;

export function isHttpConfig(config: ServerConfig): config is HttpServerConfig {
  return "url" in config;
}

// ---------------------------------------------------------------------------
// Config validation
// ---------------------------------------------------------------------------

export interface ConfigError {
  server: string;
  message: string;
}

/**
 * Validate an mcp.json config object. Returns an array of errors (empty = valid).
 * Does not throw — caller decides how to surface problems.
 */
export function validateConfig(
  raw: any
): { servers: Record<string, ServerConfig>; errors: ConfigError[] } {
  const errors: ConfigError[] = [];
  const servers: Record<string, ServerConfig> = {};

  if (!raw || typeof raw !== "object" || !raw.servers || typeof raw.servers !== "object") {
    return { servers, errors: [{ server: "(root)", message: "missing or invalid 'servers' object" }] };
  }

  for (const [name, config] of Object.entries(raw.servers) as [string, any][]) {
    if (!config || typeof config !== "object") {
      errors.push({ server: name, message: "server config must be an object" });
      continue;
    }

    const hasUrl = typeof config.url === "string" && config.url.length > 0;
    const hasCommand = typeof config.command === "string" && config.command.length > 0;

    if (!hasUrl && !hasCommand) {
      errors.push({ server: name, message: "must have either 'url' (HTTP) or 'command' (stdio)" });
      continue;
    }

    if (hasUrl && hasCommand) {
      errors.push({ server: name, message: "has both 'url' and 'command' — pick one transport" });
      continue;
    }

    if (hasUrl) {
      try {
        new URL(config.url);
      } catch {
        errors.push({ server: name, message: `invalid url: ${config.url}` });
        continue;
      }
      if (config.headers && typeof config.headers !== "object") {
        errors.push({ server: name, message: "'headers' must be an object" });
        continue;
      }
      if (config.timeout !== undefined && (typeof config.timeout !== "number" || config.timeout <= 0)) {
        errors.push({ server: name, message: "'timeout' must be a positive number" });
        continue;
      }
    }

    if (hasCommand) {
      if (config.args !== undefined && !Array.isArray(config.args)) {
        errors.push({ server: name, message: "'args' must be an array" });
        continue;
      }
      if (config.env !== undefined && typeof config.env !== "object") {
        errors.push({ server: name, message: "'env' must be an object" });
        continue;
      }
    }

    servers[name] = config as ServerConfig;
  }

  return { servers, errors };
}

// ---------------------------------------------------------------------------
// Env var resolution
// ---------------------------------------------------------------------------

export function resolveEnvVars(
  value: string,
  env: Record<string, string | undefined> = process.env
): string {
  return value.replace(/\$\{(\w+)\}/g, (_, key) => env[key] ?? "");
}

export function resolveEnvObj(
  obj: Record<string, string>,
  env: Record<string, string | undefined> = process.env
): Record<string, string> {
  const resolved: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    resolved[k] = resolveEnvVars(v, env);
  }
  return resolved;
}

// ---------------------------------------------------------------------------
// Auth error detection
// ---------------------------------------------------------------------------

export const AUTH_REMEDIATION =
  "Your GitHub token may be expired or invalid.\n" +
  "Run `gh auth login` to re-authenticate, then restart your pi session.";

export function isAuthError(err: any): boolean {
  if (err?.code === 401 || err?.code === 403) return true;
  const msg = err?.message ?? "";
  if (/HTTP\s+40[13]\b/.test(msg)) return true;
  if (/unauthorized|forbidden|invalid.*token|expired.*token|token.*expired/i.test(msg)) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Transport error detection
// ---------------------------------------------------------------------------

export function isTransportError(err: any): boolean {
  const msg = err?.message ?? "";
  return (
    msg.includes("not connected") ||
    msg.includes("aborted") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("fetch failed") ||
    msg.includes("network") ||
    err?.code === "ECONNRESET"
  );
}

// ---------------------------------------------------------------------------
// Response text extraction
// ---------------------------------------------------------------------------

export function extractText(result: any): string {
  const content = Array.isArray(result?.content) ? result.content : [];
  return content
    .filter((c: any) => c.type === "text")
    .map((c: any) => c.text)
    .join("\n") || "(empty response)";
}

// ---------------------------------------------------------------------------
// Layered config loading
// ---------------------------------------------------------------------------

/** Where a server config was found */
export type ConfigSource = "project" | "user" | "bundled";

export interface SourcedConfig {
  servers: Record<string, ServerConfig>;
  sources: Record<string, ConfigSource>;
  errors: ConfigError[];
}

/**
 * Load a single mcp.json file. Returns validated servers or empty on failure.
 */
function loadConfigFile(filePath: string): {
  servers: Record<string, ServerConfig>;
  errors: ConfigError[];
} {
  if (!existsSync(filePath)) return { servers: {}, errors: [] };
  try {
    const raw = JSON.parse(readFileSync(filePath, "utf-8"));
    return validateConfig(raw);
  } catch (err: any) {
    return {
      servers: {},
      errors: [{ server: "(config)", message: `invalid JSON in ${filePath}: ${err.message}` }],
    };
  }
}

/**
 * Merge configs from project, user, and bundled sources.
 * Higher-priority sources (project > user > bundled) win on name collision.
 * All errors from all files are aggregated.
 */
export function loadMergedConfig(
  projectDir: string | null,
  userDir: string,
  extensionDir: string,
): SourcedConfig {
  const layers: Array<{ source: ConfigSource; path: string }> = [
    { source: "bundled", path: join(extensionDir, "mcp.json") },
    { source: "user", path: join(userDir, "mcp.json") },
  ];
  if (projectDir) {
    layers.push({ source: "project", path: join(projectDir, ".pi", "mcp.json") });
  }

  const merged: Record<string, ServerConfig> = {};
  const sources: Record<string, ConfigSource> = {};
  const allErrors: ConfigError[] = [];

  for (const layer of layers) {
    const { servers, errors } = loadConfigFile(layer.path);
    for (const err of errors) {
      allErrors.push({ server: err.server, message: `[${layer.source}] ${err.message}` });
    }
    // Higher-priority layers overwrite lower ones
    for (const [name, config] of Object.entries(servers)) {
      merged[name] = config;
      sources[name] = layer.source;
    }
  }

  return { servers: merged, sources, errors: allErrors };
}

/**
 * Find which config file a server should be written to / removed from.
 */
export function configFileForScope(
  scope: "project" | "user",
  projectDir: string | null,
  userDir: string,
): string | null {
  if (scope === "project") {
    if (!projectDir) return null;
    return join(projectDir, ".pi", "mcp.json");
  }
  return join(userDir, "mcp.json");
}

// ---------------------------------------------------------------------------
// URL / name helpers
// ---------------------------------------------------------------------------

/**
 * Derive a slug name from a URL hostname.
 * "https://scribe.recrocog.com/mcp/transport/" → "scribe"
 * "https://api.example.com/mcp/" → "api-example"
 */
export function slugifyUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.split(".");
    // Drop common TLDs and "com", "io", etc.
    const significant = parts.filter(
      (p) => !["com", "io", "org", "net", "dev", "app", "co", "www"].includes(p)
    );
    if (significant.length === 0) return parts[0] || "server";
    // If subdomain is something meaningful (not "api", "mcp"), prefer it
    if (significant.length >= 2 && !["api", "mcp"].includes(significant[0])) {
      return significant[0];
    }
    return significant.join("-");
  } catch {
    return "server";
  }
}

/**
 * Build an HttpServerConfig from user inputs.
 */
export function buildHttpConfig(
  url: string,
  authType: "bearer" | "api-key" | "none",
  secretName?: string,
  headerName?: string,
): HttpServerConfig {
  const config: HttpServerConfig = { url };

  if (authType === "bearer" && secretName) {
    config.headers = { Authorization: `Bearer \${${secretName}}` };
  } else if (authType === "api-key" && secretName && headerName) {
    config.headers = { [headerName]: `\${${secretName}}` };
  }

  return config;
}

/**
 * Build a StdioServerConfig from user inputs.
 */
export function buildStdioConfig(
  command: string,
  args?: string[],
  env?: Record<string, string>,
): StdioServerConfig {
  const config: StdioServerConfig = { command };
  if (args && args.length > 0) config.args = args;
  if (env && Object.keys(env).length > 0) config.env = env;
  return config;
}

/**
 * Parse a command string into command + args.
 * "npx -y @example/mcp-server --port 3000" → { command: "npx", args: ["-y", "@example/mcp-server", "--port", "3000"] }
 */
export function parseCommand(input: string): { command: string; args: string[] } {
  // Simple shell-word splitting (doesn't handle quotes, but good enough for typical cases)
  const parts = input.trim().split(/\s+/).filter(Boolean);
  return {
    command: parts[0] || "",
    args: parts.slice(1),
  };
}

/**
 * Extract secret names referenced in a server config via ${VAR} patterns.
 */
export function extractSecretRefs(config: ServerConfig): string[] {
  const refs: string[] = [];
  const pattern = /\$\{(\w+)\}/g;

  if (isHttpConfig(config)) {
    if (config.headers) {
      for (const value of Object.values(config.headers)) {
        let match;
        while ((match = pattern.exec(value)) !== null) {
          refs.push(match[1]);
        }
      }
    }
    // Check URL too (unlikely but possible)
    let match;
    while ((match = pattern.exec(config.url)) !== null) {
      refs.push(match[1]);
    }
  } else {
    if (config.env) {
      for (const value of Object.values(config.env)) {
        let match;
        while ((match = pattern.exec(value)) !== null) {
          refs.push(match[1]);
        }
      }
    }
  }

  return [...new Set(refs)];
}
