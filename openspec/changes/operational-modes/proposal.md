## Why

Operators need a **single, fast way** to switch how the agent behaves—standard assistance, **plan-first**, **spec-driven development**, or **multi-agent orchestration** (team dispatch, sequential chains, hybrid pipelines)—without restarting sessions or editing config files. The **[agent-pi](https://github.com/ruizrica/agent-pi)** ecosystem demonstrates **operational modes** with a **mode cycler** and **mode-specific system prompt injection**. devopet should expose **six operational modes** with a **Shift+Tab** chord to cycle, matching the mental model: **NORMAL → PLAN → SPEC → PIPELINE → TEAM → CHAIN** (order as specified).

## What Changes

- **Six modes**: **NORMAL** (default standard coding assistant), **PLAN** (plan-first: analyze → plan → approve → implement → report), **SPEC** (spec-driven: shape → requirements → tasks → implement), **PIPELINE** (5-phase hybrid with parallel dispatch), **TEAM** (dispatcher delegates to specialists), **CHAIN** (sequential pipeline; step outputs feed next).
- **Mode cycler**: **Shift+Tab** cycles **NORMAL → PLAN → SPEC → PIPELINE → TEAM → CHAIN** (wraps); implement or integrate **`mode-cycler`** behavior per [agent-pi](https://github.com/ruizrica/agent-pi) patterns.
- **System prompts**: Each mode **injects a tailored system prompt** (or equivalent instruction layer) so model behavior matches the mode; **PLAN** enforces plan-first workflow; **SPEC** drives SDD; **TEAM** / **CHAIN** / **PIPELINE** **activate** the respective orchestration systems (see `openspec/changes/multi-agent-orchestration/` when implemented).
- **Documentation**: Mode table (trigger, behavior), keybinding, interaction with themes/other chords, and relationship to **agent-pi** upstream.

## Capabilities

### New Capabilities

- `operational-mode-core`: Enumeration and semantics of NORMAL, PLAN, SPEC, PIPELINE, TEAM, CHAIN; default mode NORMAL.
- `mode-cycler-keybinding`: Shift+Tab cycle order, mode-cycler integration, no duplicate bindings without migration note.
- `mode-system-prompts`: Per-mode prompt injection; PLAN/SPEC workflow enforcement at prompt level; orchestration modes wired to team/chain/pipeline backends when present.

### Modified Capabilities

- *(none in repository root `openspec/specs/`.)*

### Related changes

- **`multi-agent-orchestration`**: TEAM, CHAIN, and PIPELINE modes **depend on** orchestration backends (teams, chains, pipeline-team YAML) when those features land; this change may ship **prompt-only** stubs until orchestration is available.

## Impact

- **Extensions / pi-tui**: keybinding registration (**Shift+Tab**), possible conflict audit with existing shortcuts.
- **Bootstrap / session**: persisted mode preference optional (design).
- **User education**: mode indicator in footer or status (optional).
