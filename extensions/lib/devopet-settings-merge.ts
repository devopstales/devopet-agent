/**
 * Layered merge for pi + devopet settings.json (see devopet-settings-json-locations).
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";

import { findDevopetProjectConfigDir, getDevopetGlobalConfigDir } from "./devopet-config-paths.ts";
import { CONFIG_DIR_NAME, getAgentDir } from "./pi-package.ts";

/** Nested object merge; arrays and primitives: later wins. */
export function deepMergeSettings<T extends Record<string, unknown>>(base: T, overrides: Record<string, unknown>): T {
  const result = { ...base } as Record<string, unknown>;
  for (const key of Object.keys(overrides)) {
    const overrideValue = overrides[key];
    const baseValue = result[key];
    if (overrideValue === undefined) continue;
    if (
      typeof overrideValue === "object" &&
      overrideValue !== null &&
      !Array.isArray(overrideValue) &&
      typeof baseValue === "object" &&
      baseValue !== null &&
      !Array.isArray(baseValue)
    ) {
      result[key] = deepMergeSettings(baseValue as Record<string, unknown>, overrideValue as Record<string, unknown>);
    } else {
      result[key] = overrideValue;
    }
  }
  return result as T;
}

function tryReadJson(path: string): Record<string, unknown> | null {
  try {
    if (!existsSync(path) || !statSync(path).isFile()) return null;
    const raw = readFileSync(path, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Merge order: pi global → pi project → devopet global → devopet project (last wins per key).
 */
export function loadMergedSettingsLayers(cwd: string, agentDir = getAgentDir()): Record<string, unknown> {
  const piGlobal = tryReadJson(join(agentDir, "settings.json")) ?? {};
  const piProject = tryReadJson(join(cwd, CONFIG_DIR_NAME, "settings.json")) ?? {};
  const devGlobal = tryReadJson(join(getDevopetGlobalConfigDir(), "settings.json")) ?? {};
  const devProjDir = findDevopetProjectConfigDir(cwd);
  const devProject = devProjDir ? tryReadJson(join(devProjDir, "settings.json")) ?? {} : {};

  let merged: Record<string, unknown> = { ...piGlobal };
  merged = deepMergeSettings(merged, piProject);
  merged = deepMergeSettings(merged, devGlobal);
  merged = deepMergeSettings(merged, devProject);
  return merged;
}

const PATH_ARRAY_KEYS = ["extensions", "skills", "prompts", "themes", "packages"] as const;

/**
 * Resolve relative entries in settings arrays against `root` (global or project devopet dir).
 * Leaves absolute paths and `~` prefixes to pi-style resolution elsewhere.
 */
export function resolveDevopetSettingsPathArrays(
  settings: Record<string, unknown>,
  root: string,
): Record<string, unknown> {
  const out = { ...settings };
  for (const key of PATH_ARRAY_KEYS) {
    const v = out[key];
    if (!Array.isArray(v)) continue;
    out[key] = v.map((entry) => resolveDevopetResourceEntry(entry, root));
  }
  return out;
}

function resolveDevopetResourceEntry(entry: unknown, root: string): unknown {
  if (typeof entry === "string") {
    const t = entry.trim();
    if (t.startsWith("~/") || t === "~") return entry;
    if (isAbsolute(t)) return entry;
    return resolve(root, t);
  }
  if (entry && typeof entry === "object" && !Array.isArray(entry)) {
    const o = entry as Record<string, unknown>;
    if (typeof o.source === "string") {
      const s = o.source.trim();
      if (!s.startsWith("~/") && s !== "~" && !isAbsolute(s)) {
        return { ...o, source: resolve(root, s) };
      }
    }
  }
  return entry;
}
