## Why

Operators need a **single, fast way** to switch how the agent behaves—standard assistance, **plan-first**, **spec-driven development**, or **multi-agent orchestration** (team dispatch, sequential chains, hybrid pipelines)—without restarting sessions or editing config files. **[agent-pi](https://github.com/ruizrica/agent-pi)** demonstrates **operational modes** with a **mode cycler** and **mode-specific system prompt injection**—a **reference** for UX and semantics.

devopet SHALL implement **six operational modes** with **Shift+Tab** to cycle **NORMAL → PLAN → SPEC → PIPELINE → TEAM → CHAIN** (wrapping) as **first-party extension code** under **`extensions/`**, **aligned with** that reference—**not** by shipping **agent-pi** as the primary integration (npm/git delegate). This matches **`ai-provider-extensions`**, **`multi-agent-orchestration`**, and related changes: **repo-owned** behavior, optional **transitional** reuse only during migration.

## What Changes

- **Six modes**: **NORMAL** (default), **PLAN**, **SPEC**, **PIPELINE**, **TEAM**, **CHAIN**—semantics unchanged; **implementation** is devopet-owned.
- **Mode cycler**: **Shift+Tab** cycles **NORMAL → PLAN → SPEC → PIPELINE → TEAM → CHAIN → NORMAL**; implemented **in-tree** **consistent with** [agent-pi](https://github.com/ruizrica/agent-pi) **mode-cycler** patterns (reference), not mandatory upstream package import.
- **System prompts**: Per-mode **tailored system prompt** (or equivalent instruction layer); **PLAN** / **SPEC** workflow enforcement; **PIPELINE** / **TEAM** / **CHAIN** **wire to** `multi-agent-orchestration` entrypoints when present, else prompt-only degradation (see related change).
- **Documentation**: Mode table, keybinding, conflicts, relationship to **agent-pi** as **reference** only.

## Capabilities

### New Capabilities

- `operational-mode-core`: Enumeration and semantics of NORMAL, PLAN, SPEC, PIPELINE, TEAM, CHAIN; default NORMAL.
- `mode-cycler-keybinding`: Shift+Tab cycle order; **first-party** cycler **consistent with** agent-pi reference; no duplicate bindings without migration note.
- `mode-system-prompts`: Per-mode prompt injection; PLAN/SPEC enforcement; orchestration modes linked to backends when present.

### Modified Capabilities

- *(none in repository root `openspec/specs/`.)*

### Related changes

- **`multi-agent-orchestration`**: TEAM, CHAIN, PIPELINE modes **depend on** orchestration when those features land; may ship **prompt-only** stubs until backends exist.

## Impact

- **`extensions/`** + **`package.json` `pi.extensions`**: new module(s); **no** long-term requirement to add **agent-pi** as an **npm** dependency for modes.
- **pi-tui**: keybinding registration (**Shift+Tab**); conflict audit.
- **Bootstrap / session**: optional persisted mode (design).
- **User education**: optional mode indicator in footer/status.
