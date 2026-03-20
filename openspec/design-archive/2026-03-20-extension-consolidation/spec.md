# Extension Consolidation — Design Spec (extracted)

> Auto-extracted from docs/extension-consolidation.md at decide-time.

## Decisions

### Keep spec pipeline as 3 separate extensions (decided)

design-tree (4.5K), openspec (4K), and cleave (7.5K) each own distinct tool/command namespaces and are individually large enough to justify separate directories. The 15+ cross-imports are real coupling but merging 16K lines into one extension creates a worse maintenance problem than the current adapter pattern. The dashboard-state adapters can be relocated to dashboard/ without merging the core extensions.

### Target extension count: 21 (conservative — merge 10) (decided)

Three merge groups: inference cluster (4→1, -3), cosmetics (3→1, -2), micro-extension absorption (5→0, -5). Total: 31 - 10 = 21. Each merge is low-risk because the extensions already share state and imports. Going more aggressive (merging spec pipeline) risks a worse codebase for marginal benefit.

### Execute as 3 independent merge waves to limit blast radius (decided)

Each merge group is independently testable and shippable. Wave 1 (inference) is highest value and most clearly self-contained. Wave 2 (cosmetics) is trivial. Wave 3 (micro-absorption) touches the most host extensions but each absorption is small. Sequencing them avoids a single risky mega-change.

## Research Summary

### Structural Analysis

**Current state:** 31 extensions, 48K lines of non-test TypeScript, 36 tool registrations, 35 command registrations, 18 `session_start` hooks.

**Shared infrastructure:** `extensions/lib/` (6.1K lines, 19 modules) provides model routing, shared state, operator profile, subprocess resolution, git state, and sci-ui rendering helpers. Cross-extension imports total 29 — most cluster around openspec↔design-tree↔cleave and dashboard↔everything.

**Key findings:**

### 1. Model/Inference Cluster — 4 extensions that are really 1 concern (2,533 lines)

- `model-budget.ts` (796 lines) — `set_model_tier`, `set_thinking_level` tools + error recovery cascade
- `effort/` (600 lines) — `/effort` command tier switching, wraps model-budget
- `offline-driver.ts` (410 lines) — Ollama provider registration, `/offline`/`/online`, `switch_to_offline_driver` tool
- `local-inference/` (727 lines) — `ask_local_model`, `list_local_models`, `manage_ollama` tools

All four share `lib/model-routing.ts`, `lib/local-models.ts`, and `lib/operator-profile.ts`. Effort…

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
- `view/` — File viewer,…
