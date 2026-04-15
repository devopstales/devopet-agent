#!/usr/bin/env node
/**
 * Legacy compatibility shim.
 *
 * `pi` remains available temporarily so existing installs are not stranded,
 * but it immediately re-enters the same devopet-owned executable boundary as
 * the canonical `devopet-agent` command.
 */
await import("./devopet-agent.mjs");
