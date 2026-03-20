/**
 * Provider preference — operator-configurable default provider ordering.
 *
 * Wraps the existing ProviderRoutingPolicy.providerOrder with persistence
 * (read/write to .pi/config.json) and display helpers.
 *
 * The preference is a routing policy layer on top of hard feasibility checks.
 * It never bypasses capability tier, thinking level, or context floor constraints.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { ProviderName, ProviderRoutingPolicy } from "./model-routing.ts";
import { getDefaultPolicy } from "./model-routing.ts";

// ─── Read / Write ────────────────────────────────────────────

interface PiConfig {
  providerOrder?: string[];
  avoidProviders?: string[];
  [key: string]: unknown;
}

function readConfig(cwd: string): PiConfig {
  try {
    const configPath = join(cwd, ".pi", "config.json");
    if (!existsSync(configPath)) return {};
    return JSON.parse(readFileSync(configPath, "utf-8"));
  } catch {
    return {};
  }
}

function writeConfig(cwd: string, config: PiConfig): void {
  const dir = join(cwd, ".pi");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "config.json"), JSON.stringify(config, null, 2) + "\n");
}

/**
 * Read persisted provider preference from .pi/config.json.
 * Returns the default policy if no preference is stored.
 */
export function readProviderPreference(cwd: string): Pick<ProviderRoutingPolicy, "providerOrder" | "avoidProviders"> {
  const config = readConfig(cwd);
  const defaults = getDefaultPolicy();
  return {
    providerOrder: (config.providerOrder as ProviderName[]) ?? defaults.providerOrder,
    avoidProviders: (config.avoidProviders as ProviderName[]) ?? defaults.avoidProviders,
  };
}

/**
 * Persist provider preference to .pi/config.json.
 * Merges with existing config — does not clobber other fields.
 */
export function writeProviderPreference(
  cwd: string,
  order: ProviderName[],
  avoid?: ProviderName[],
): void {
  const config = readConfig(cwd);
  config.providerOrder = order;
  if (avoid !== undefined) config.avoidProviders = avoid;
  writeConfig(cwd, config);
}

/**
 * Reset provider preference to the default ordering.
 */
export function resetProviderPreference(cwd: string): void {
  const config = readConfig(cwd);
  delete config.providerOrder;
  delete config.avoidProviders;
  writeConfig(cwd, config);
}

/**
 * Format provider order for display.
 */
export function formatProviderOrder(order: ProviderName[], avoid: ProviderName[]): string {
  const parts = order.map((p) => {
    const avoided = avoid.includes(p);
    return avoided ? `~~${p}~~` : p;
  });
  return parts.join(" → ");
}
