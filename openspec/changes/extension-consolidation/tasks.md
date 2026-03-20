# Extension Consolidation — Tasks

## Wave 1: Inference Merge (4 → 1)

- [ ] 1.1 Create `extensions/inference/types.ts` — merge type definitions from `effort/types.ts` and offline-driver inline types into a single namespace
- [ ] 1.2 Create `extensions/inference/tiers.ts` — move `effort/tiers.ts` unchanged (re-path imports only)
- [ ] 1.3 Create `extensions/inference/recovery.ts` — extract error recovery cascade, cooldown tracking, and downgrade logic from `model-budget.ts`
- [ ] 1.4 Create `extensions/inference/ollama.ts` — merge Ollama lifecycle from `offline-driver.ts` (probe, registerProvider, model discovery) and `local-inference/index.ts` (ask_local_model, list_local_models, manage_ollama tool implementations)
- [ ] 1.5 Create `extensions/inference/index.ts` — main entry point wiring together all submodules: session_start hook (effort init + ollama probe + provider registration), tool registrations (set_model_tier, set_thinking_level, switch_to_offline_driver, ask_local_model, list_local_models, manage_ollama), command registrations (/effort, /effort cap, /effort uncap, /offline, /online, /gloriana, /victory, /retribution, /local-models, /local-status)
- [ ] 1.6 Move tests: collect `model-budget.test.ts`, `effort/*.test.ts`, `offline-driver.test.ts`, `local-inference/*.test.ts` into `extensions/inference/*.test.ts` — update imports, verify all pass
- [ ] 1.7 Update `extensions/lib/shared-state.ts` — redirect `effort/types.ts` imports to `inference/types.ts`
- [ ] 1.8 Delete source files: `extensions/model-budget.ts`, `extensions/effort/`, `extensions/offline-driver.ts`, `extensions/local-inference/`
- [ ] 1.9 Verify: `npm test` passes, all 6 tools and all commands function identically

## Wave 2: Cosmetics Merge (3 → 1)

- [ ] 2.1 Create `extensions/ambiance.ts` — combine `spinner-verbs.ts` (themed spinner replacement), `sermon.ts` (data constant), and `sermon-widget.ts` (TUI widget) into a single extension file
- [ ] 2.2 Delete source files: `extensions/spinner-verbs.ts`, `extensions/sermon.ts`, `extensions/sermon-widget.ts`
- [ ] 2.3 Verify: startup spinner and sermon scrawl render identically

## Wave 3: Micro-Extension Absorption (5 → hosts)

- [ ] 3.1 Absorb `auto-compact.ts` (42 lines) into `project-memory/index.ts` — add the `turn_end` compaction hook alongside existing memory event handlers
- [ ] 3.2 Absorb `session-log.ts` (174 lines) into `project-memory/index.ts` — session log is a write-side concern of the knowledge store
- [ ] 3.3 Absorb `version-check.ts` (94 lines) into `bootstrap/index.ts` — hourly update poll belongs with the /update lifecycle
- [ ] 3.4 Absorb `terminal-title.ts` (191 lines) into `dashboard/index.ts` — terminal title is dashboard display state
- [ ] 3.5 Absorb `core-renderers.ts` (193 lines) into `dashboard/index.ts` — registerToolRenderer calls are UI config that belongs with the dashboard
- [ ] 3.6 Delete source files: `extensions/auto-compact.ts`, `extensions/session-log.ts`, `extensions/version-check.ts`, `extensions/terminal-title.ts`, `extensions/core-renderers.ts`
- [ ] 3.7 Verify: `npm test` passes, all absorbed behaviors functional

## Finalize

- [ ] 4.1 Update `README.md` — extension count 31 → 21, update extension descriptions and utilities table
- [ ] 4.2 Smoke test: full `npm test` + manual session start confirming all tools, commands, dashboard, spinner, terminal title, version check, session log, and compaction work
