/**
 * Stable paths for devopet-owned configuration (distinct from pi core state under
 * PI_CODING_AGENT_DIR / ~/.pi/agent). See docs/devopet-config.md.
 */

import { existsSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

/** Env override for the global devopet config root (containers, tests). */
export const DEVOPET_CONFIG_HOME_ENV = "DEVOPET_CONFIG_HOME" as const;

function expandLeadingTilde(value: string, home: string): string {
  if (value === "~") return home;
  if (value.startsWith("~/")) return join(home, value.slice(2));
  return value;
}

/**
 * User-global devopet config directory (default `~/.devopet`).
 * Honors {@link DEVOPET_CONFIG_HOME_ENV} when set (supports `~` and `~/…` like pi agent dir code).
 */
export function getDevopetGlobalConfigDir(): string {
  const raw = process.env[DEVOPET_CONFIG_HOME_ENV]?.trim();
  const home = homedir();
  if (raw) {
    return resolve(expandLeadingTilde(raw, home));
  }
  return join(home, ".devopet");
}

/**
 * Walk from `cwd` upward; returns the first `.devopet` directory found, or `null`.
 * Ignores non-directory entries named `.devopet`.
 */
export function findDevopetProjectConfigDir(cwd: string): string | null {
  let cur = resolve(cwd);
  for (;;) {
    const candidate = join(cur, ".devopet");
    try {
      if (existsSync(candidate) && statSync(candidate).isDirectory()) {
        return candidate;
      }
    } catch {
      // ignore permission errors
    }
    const parent = dirname(cur);
    if (parent === cur) return null;
    cur = parent;
  }
}
