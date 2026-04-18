## Why

devopet already has **project-memory** (durable facts, episodes, SQLite) and **session telemetry**, but operators still lack a **first-party, devopet-namespaced** loop that turns recurring session behaviour into **lightweight, prompt-ready “instincts”** and optional **skills**—without depending on upstream `~/.pi/agent` layout. [pi-continuous-learning](https://www.npmjs.com/package/pi-continuous-learning) shows a proven pattern (observations → analysis → confidence-scored instincts → prompt injection → feedback), but devopet should own **paths, privacy, and integration** under **`~/.devopet`** and **`<project>/.devopet`**, and must **merge `INSTINCT.md` into the composed system prompt** alongside existing `SYSTEM.md` / `APPEND_SYSTEM.md` behaviour.

## What Changes

- Add a **separate extension** (e.g. `extensions/instinct/` or `extensions/continuous-learning/`) that implements an **observation → distill → store → inject** pipeline **inspired by** pi-continuous-learning (not a blind re-export of that package unless we explicitly depend on it later).
- Define **canonical artifacts**:
  - **`~/.devopet/INSTINCT.md`** — operator- and machine-maintained text of learned behaviours (global).
  - **`<project>/.devopet/INSTINCT.md`** — project-scoped instincts (optional; overrides or augments per design).
  - **`~/.devopet/skills/`** — graduated or hand-authored **Cursor/pi-style skills** that the runtime loads like other skill roots (exact loading mechanism in design).
  - **Observation / state files** under devopet-owned dirs (exact filenames in design; scrub secrets; JSONL-friendly).
- **Merge `INSTINCT.md` into system prompts** by extending **`extensions/lib/system-prompt-md.ts`** (or equivalent hook) so instincts appear in the **same composition pass** as packaged `config/SYSTEM.md`, merged `SYSTEM.md` layers, and `APPEND_SYSTEM.md`—at a **documented position** (e.g. append block after `APPEND_SYSTEM.md` segments, or dedicated “Instincts” section).
- Expose **operator controls** (slash commands and/or env toggles): enable/disable, run analysis, export/prune, “dream”/consolidate (optional phase2), and **never block** session start on analyzer failure.
- **Documentation**: `docs/devopet-config.md` reserved names, operator expectations, privacy (scrubbing), and relation to **project-memory** (complementary, not duplicate).

## Capabilities

### New Capabilities

- `instinct-continuous-learning`: Observation capture, instinct storage under `~/.devopet` / `.devopet`, optional graduation to `~/.devopet/skills/`, confidence/feedback semantics, and **system prompt composition that includes merged `INSTINCT.md`**.

### Modified Capabilities

- *(none in `openspec/specs/` require requirement edits if the new capability fully specifies prompt merge behaviour; if reviewers prefer a cross-link, a small delta to `devopet-config-layout` MAY be added in a follow-up change to list reserved `INSTINCT.md` / `skills/` paths.)*

## Impact

- **New extension module** + registration in `package.json` → `pi.extensions` (load order relative to `system-prompt-md` TBD in design).
- **`extensions/lib/system-prompt-md.ts`** (and possibly `extensions/system-prompt-md/index.ts`) — add instinct segments to `composeMarkdownSystemPrompt` / `needsCustomSystemPromptComposition`.
- **Skill discovery** — ensure `~/.devopet/skills/` is on the skill path (merge with existing `devopet-settings-merge` / `loadSkills` behaviour).
- **Tests** — unit tests for merge order, empty/missing `INSTINCT.md`, and scrubbing; no flaky network in CI.
- **Optional dependency**: may **reference** pi-continuous-learning concepts only; **vendoring or npm dependency** is a design decision (default: **no new npm dep** for v1 unless it accelerates safely).
