---
id: extension-consolidation
title: Extension Consolidation
status: implementing
tags: [architecture, refactor, tech-debt]
open_questions: []
branches: ["feature/extension-consolidation"]
openspec_change: extension-consolidation
---

# Extension Consolidation

## Overview

With the Rust rewrite branched away, the 31 TypeScript extensions have accumulated structural debt — functional overlap, micro-extensions that don't justify separate files, and cross-extension coupling that the extension boundary doesn't serve. This node explores consolidation to reduce the extension count, clarify ownership boundaries, and simplify the codebase for maintenance.

## Research

### Structural Analysis

**Current state:** 31 extensions, 48K lines of non-test TypeScript, 36 tool registrations, 35 command registrations, 18 `session_start` hooks.

**Shared infrastructure:** `extensions/lib/` (6.1K lines, 19 modules) provides model routing, shared state, operator profile, subprocess resolution, git state, and sci-ui rendering helpers. Cross-extension imports total 29 — most cluster around openspec↔design-tree↔cleave and dashboard↔everything.

**Key findings:**

### 1. Model/Inference Cluster — 4 extensions that are really 1 concern (2,533 lines)

- `model-budget.ts` (796 lines) — `set_model_tier`, `set_thinking_level` tools + error recovery cascade
- `effort/` (600 lines) — `/effort` command tier switching, wraps model-budget
- `offline-driver.ts` (410 lines) — Ollama provider registration, `/offline`/`/online`, `switch_to_offline_driver` tool
- `local-inference/` (727 lines) — `ask_local_model`, `list_local_models`, `manage_ollama` tools

All four share `lib/model-routing.ts`, `lib/local-models.ts`, and `lib/operator-profile.ts`. Effort imports from model-budget's tier config. Offline-driver re-exports local-inference's model lists. They all write to the same shared state slots. They are one domain carved into four extensions for no architectural reason.

### 2. Cosmetic/Ambiance Cluster — 3 extensions that are decoration (610 lines)

- `spinner-verbs.ts` (312 lines) — Replaces default spinner text with themed verbs
- `sermon.ts` (154 lines) — Data file of scrolling ambient text
- `sermon-widget.ts` (144 lines) — TUI widget that renders the sermon

These three have zero functional purpose and could be a single file. `sermon.ts` is a data constant imported by `sermon-widget.ts` — they're already one unit split across two files.

### 3. Micro-Extensions That Don't Justify Separate Files

- `auto-compact.ts` (42 lines) — Single `turn_end` hook, could be a function in project-memory
- `version-check.ts` (94 lines) — Single timer, could fold into bootstrap
- `session-log.ts` (174 lines) — Append-only log writer, trivial standalone
- `terminal-title.ts` (191 lines) — Sets terminal title from cleave/git state
- `core-renderers.ts` (193 lines) — Registers tool renderers, pure config

### 4. Dashboard Cluster — Already Well-Structured but Internally Sprawling (5,633 lines)

The dashboard is already one extension directory with 11 internal files. It has tight coupling to design-tree, openspec, and cleave via shared state + direct imports. The coupling is through `dashboard-state.ts` files that live *inside* design-tree and openspec directories — these are effectively dashboard adapters that shouldn't be in the domain extension.

### 5. Spec-Driven Pipeline — 3 Extensions with Heavy Cross-Coupling

- `design-tree/` (2,181 + 1,792 + 362 + ... = ~4,500 lines)
- `openspec/` (1,966 + 1,440 + ... = ~4,000 lines)  
- `cleave/` (3,137 + 1,374 + 865 + ... = ~7,500 lines)

These have 15+ cross-extension imports between them. design-tree imports from openspec (archive-gate, spec, reconcile). cleave imports from openspec (dashboard-state). They share lifecycle-emitter types. They operate as one system with three entry points.

### 6. No Overlap — Already Standalone

These extensions are correctly isolated and don't need touching:
- `00-secrets/` — Secret resolution, standalone
- `00-splash/` — Startup animation, standalone
- `01-auth/` — Auth probing, standalone
- `bootstrap/` — Setup wizard, standalone (imports auth, appropriate)
- `chronos/` — Date/time tool, standalone
- `project-memory/` — Knowledge store, standalone (3,527 lines but cohesive)
- `render/` — Image/diagram tools, standalone
- `vault/` — Markdown viewer, standalone
- `view/` — File viewer, standalone
- `web-search/` — Search tool, standalone
- `mcp-bridge/` — MCP protocol bridge, standalone
- `web-ui/` — HTTP dashboard, standalone (imports from others, but reads only)
- `tool-profile/` — Tool enable/disable, standalone
- `style.ts` — Design system reference, standalone
- `defaults.ts` — First-install deployer, standalone

## Decisions

### Decision: Keep spec pipeline as 3 separate extensions

**Status:** decided
**Rationale:** design-tree (4.5K), openspec (4K), and cleave (7.5K) each own distinct tool/command namespaces and are individually large enough to justify separate directories. The 15+ cross-imports are real coupling but merging 16K lines into one extension creates a worse maintenance problem than the current adapter pattern. The dashboard-state adapters can be relocated to dashboard/ without merging the core extensions.

### Decision: Target extension count: 21 (conservative — merge 10)

**Status:** decided
**Rationale:** Three merge groups: inference cluster (4→1, -3), cosmetics (3→1, -2), micro-extension absorption (5→0, -5). Total: 31 - 10 = 21. Each merge is low-risk because the extensions already share state and imports. Going more aggressive (merging spec pipeline) risks a worse codebase for marginal benefit.

### Decision: Execute as 3 independent merge waves to limit blast radius

**Status:** decided
**Rationale:** Each merge group is independently testable and shippable. Wave 1 (inference) is highest value and most clearly self-contained. Wave 2 (cosmetics) is trivial. Wave 3 (micro-absorption) touches the most host extensions but each absorption is small. Sequencing them avoids a single risky mega-change.

## Open Questions

*No open questions.*

## Implementation Notes

### File Scope

- `extensions/inference/` (new) — NEW — merged inference extension: model-budget + effort + offline-driver + local-inference. 6 tools, 6 commands, 3 event hooks.
- `extensions/inference/index.ts` (new) — Main entry: session_start hook (effort init, ollama probe, provider registration), tool registrations, command registrations
- `extensions/inference/tiers.ts` (new) — Moved from effort/tiers.ts — tier config unchanged
- `extensions/inference/types.ts` (new) — Moved from effort/types.ts + offline-driver types — merged type namespace
- `extensions/inference/recovery.ts` (new) — Extracted from model-budget.ts — error recovery cascade, cooldown, downgrade logic
- `extensions/inference/ollama.ts` (new) — Extracted from offline-driver.ts + local-inference — Ollama lifecycle (probe, register provider, manage tool)
- `extensions/model-budget.ts` (deleted) — DELETED — absorbed into inference/
- `extensions/effort/` (deleted) — DELETED — absorbed into inference/
- `extensions/offline-driver.ts` (deleted) — DELETED — absorbed into inference/
- `extensions/local-inference/` (deleted) — DELETED — absorbed into inference/
- `extensions/ambiance.ts` (new) — NEW — merged cosmetic extension: spinner-verbs + sermon + sermon-widget in one file
- `extensions/spinner-verbs.ts` (deleted) — DELETED — absorbed into ambiance.ts
- `extensions/sermon.ts` (deleted) — DELETED — absorbed into ambiance.ts
- `extensions/sermon-widget.ts` (deleted) — DELETED — absorbed into ambiance.ts
- `extensions/auto-compact.ts` (deleted) — DELETED — 42-line turn_end hook absorbed into project-memory/index.ts
- `extensions/project-memory/index.ts` (modified) — MODIFIED — absorbs auto-compact turn_end hook
- `extensions/version-check.ts` (deleted) — DELETED — absorbed into bootstrap/index.ts
- `extensions/bootstrap/index.ts` (modified) — MODIFIED — absorbs version-check hourly poll
- `extensions/session-log.ts` (deleted) — DELETED — absorbed into project-memory/index.ts
- `extensions/terminal-title.ts` (deleted) — DELETED — absorbed into dashboard/index.ts
- `extensions/dashboard/index.ts` (modified) — MODIFIED — absorbs terminal-title state display
- `extensions/core-renderers.ts` (deleted) — DELETED — absorbed into dashboard/index.ts (registerToolRenderer calls are pure UI config)
- `extensions/lib/shared-state.ts` (modified) — MODIFIED — update effort type imports to inference/types.ts
- `README.md` (modified) — MODIFIED — update extension count and descriptions

### Constraints

- All 36 existing tool registrations must be preserved — tool names are part of the agent prompt contract
- All 35 slash commands must be preserved with identical names and behavior
- shared-state.ts imports from effort/types.ts must be redirected to inference/types.ts
- The re-export of PREFERRED_ORDER from offline-driver.ts is unused externally (consumers import from lib/local-models.ts) — safe to remove
- Tests must move with their code — co-located test files follow the source
- Each wave should be independently committable and testable
