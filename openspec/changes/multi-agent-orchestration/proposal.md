## Why

devopet already supports parallel work via cleave and related tooling, but operators increasingly want **first-class multi-agent orchestration**: **named teams**, **sequential chains** where each step’s output feeds the next, and **hybrid pipelines** that combine phased planning with parallel dispatch. The **[agent-pi](https://github.com/ruizrica/agent-pi)** extension suite demonstrates a concrete pattern—**YAML-defined teams/chains/pipelines**, **agent definitions** in `agents/*.md` with frontmatter, **`dispatch_agent`** delegation, **subagent status widgets**, and **toolkit commands** generated from Markdown. Integrating this (by **bundling**, **vendoring**, or **porting** the architecture) gives devopet users parity with that workflow without maintaining a fork in isolation.

Separately, operators working **across terminals and sessions** need **file-backed swarm messaging**: channels (`#memory`, `#heartbeat`, session channels), task boards, and an overlay—without a daemon. **[pi-messenger-swarm](https://www.npmjs.com/package/pi-messenger-swarm)** (MIT, `pi install npm:pi-messenger-swarm`) provides this as an optional **messaging and coordination** path **complementary** to declarative `agents/` teams/chains.

## What Changes

- **Agent teams**: Support **`agents/teams.yaml`** defining named teams as ordered lists of agent names; primary agent acts as **dispatch-only orchestrator** delegating to specialists via **`dispatch_agent`** (or equivalent pi API), per agent-pi’s **agent-team** model.
- **Agent chains**: Support **`agents/agent-chain.yaml`** defining **sequential pipelines**; each step references an agent and a **prompt template** with **`$INPUT`** (previous step output) and **`$ORIGINAL`** (user’s original prompt), per **agent-chain**.
- **Pipeline teams**: Support **`agents/pipeline-team.yaml`** for **5-phase hybrid** flows (**UNDERSTAND → GATHER → PLAN → EXECUTE → REVIEW**) combining sequential phases with **parallel agent dispatch** where specified, per **pipeline-team**.
- **Subagent widget**: **Background subagent management** with **live status widgets** in the TUI (**subagent-widget** module behavior).
- **Toolkit commands**: **Dynamic slash commands** sourced from Markdown files (**toolkit-commands**).
- **Operator UX**: **`/agents-team`** slash command to **switch between agent teams**; **Ctrl+X** to **cycle installed themes** (if not already provided by pi/devopet—see design).
- **Swarm messaging (optional)**: Support **[pi-messenger-swarm](https://www.npmjs.com/package/pi-messenger-swarm)** as a **documented optional messaging extension**—channel-first coordination, `/messenger` overlay, task/spawn APIs, project-scoped `.pi/messenger/` storage (with env overrides per upstream docs). Not a replacement for cleave or agent-pi teams; **coexistence** is explicit.
- **Documentation**: Link to [ruizrica/agent-pi](https://github.com/ruizrica/agent-pi) and [pi-messenger-swarm](https://github.com/monotykamary/pi-messenger-swarm), file layout under `agents/` and `.pi/messenger/`, and migration notes for existing projects.

## Capabilities

### New Capabilities

- `agent-team-orchestration`: `teams.yaml` schema, team membership, dispatch-only orchestration via `dispatch_agent`.
- `agent-chain-sequential`: `agent-chain.yaml`, steps with `$INPUT` / `$ORIGINAL` templating, ordered execution.
- `pipeline-team-hybrid`: `pipeline-team.yaml`, five-phase hybrid pipeline with parallel segments where defined.
- `subagent-widget`: Background subagents with live status widgets in the UI.
- `toolkit-commands`: Slash commands generated from Markdown definitions.
- `orchestration-ux`: `/agents-team` team switcher; **Ctrl+X** theme cycling aligned with agent-pi behavior where applicable.
- `messenger-swarm`: Optional **pi-messenger-swarm** integration—install path, `pi.extensions` registration when bundled, coexistence with agent-pi and cleave, storage and env (`PI_MESSENGER_DIR`, `PI_MESSENGER_GLOBAL`) documented.

### Modified Capabilities

- *(none in repository root `openspec/specs/`.)*

## Impact

- **New or extended extensions** under `extensions/` and/or **`package.json` `pi.extensions`**; possible **git submodule / npm package** on `agent-pi` if published; **optional** npm dependency or install-docs-only for **pi-messenger-swarm** (implementation choice in design).
- **Repository layout**: `agents/` directory conventions in user projects; YAML parsing and validation; **`.pi/messenger/`** when swarm extension is used (project-scoped by default upstream).
- **TUI**: keybindings, widgets, slash command registration—coordination with **pi-tui** and existing dashboard/cleave code; **`/messenger`** overlay when swarm is installed.
- **Risk**: **BREAKING** if default keybindings conflict; complexity and maintenance burden of upstream drift from **agent-pi** and **pi-messenger-swarm** (pin versions; CI smoke where feasible).
