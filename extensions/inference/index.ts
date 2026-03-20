/**
 * inference — Unified inference control extension.
 *
 * Consolidated from model-budget, effort, offline-driver, and local-inference.
 * Provides:
 *   - Effort tiers (7-level global inference cost control)
 *   - Model tier switching (set_model_tier, set_thinking_level)
 *   - Error recovery cascade with automatic model downgrade
 *   - Ollama provider registration and offline failover
 *   - Local model delegation (ask_local_model, list_local_models, manage_ollama)
 *
 * Tools: set_model_tier, set_thinking_level, switch_to_offline_driver,
 *        ask_local_model, list_local_models, manage_ollama
 * Commands: /effort, /effort cap, /effort uncap, /offline, /online,
 *           /gloriana, /victory, /retribution, /local-models, /local-status,
 *           /providers, /context
 */

import type { ExtensionAPI } from "@styrene-lab/pi-coding-agent";

import effortExtension from "./effort.ts";
import budgetExtension from "./budget.ts";
import offlineExtension from "./offline.ts";
import localExtension from "./local.ts";

export default function inferenceExtension(pi: ExtensionAPI) {
  // Order matters: effort initializes shared state on session_start,
  // budget registers tier-switching tools, offline registers Ollama provider,
  // local registers delegation tools.
  effortExtension(pi);
  budgetExtension(pi);
  offlineExtension(pi);
  localExtension(pi);
}
