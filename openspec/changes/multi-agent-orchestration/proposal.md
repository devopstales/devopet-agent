## Why

devopet already supports parallel work via cleave and related tooling, but operators increasingly want **first-class multi-agent orchestration**: **named teams**, **sequential chains** where each step’s output feeds the next, and **hybrid pipelines** that combine phased planning with parallel dispatch. **[agent-pi](https://github.com/ruizrica/agent-pi)** is a **reference suite**—YAML-defined teams/chains/pipelines, **`agents/*.md`** with frontmatter, **`dispatch_agent`** delegation, **subagent status widgets**, and **toolkit commands** from Markdown.

Separately, operators working **across terminals and sessions** need **file-backed swarm messaging**: channels, task boards, and an overlay—without a daemon. **[pi-messenger-swarm](https://www.npmjs.com/package/pi-messenger-swarm)** is a **reference** for that coordination model.

This change delivers these capabilities as **devopet-owned extensions** under **`extensions/`**—behavior and on-disk layouts **aligned with** those references—**not** “install agent-pi / pi-messenger-swarm from npm and delegate” as the defining architecture. That matches **`ai-provider-extensions`**, **`add-ask-back-module`**, and **`add-permission-manager`**: **repo-controlled** codepaths, optional **transitional** loaders only during migration.

## What Changes

- **First-party extension(s)** implementing **agent teams**: **`agents/teams.yaml`**, named teams, **dispatch-only** orchestrator delegating via **`dispatch_agent`** (or equivalent **`ExtensionAPI`**), **consistent with** agent-pi’s **agent-team** model.
- **First-party extension(s)** implementing **agent chains**: **`agents/agent-chain.yaml`**, **`$INPUT`** / **`$ORIGINAL`** templating, **consistent with** agent-pi **agent-chain**.
- **First-party extension(s)** implementing **pipeline teams**: **`agents/pipeline-team.yaml`**, **UNDERSTAND → GATHER → PLAN → EXECUTE → REVIEW** hybrid flows **consistent with** agent-pi **pipeline-team**.
- **Subagent widget**: background subagents + **live TUI status** **consistent with** the reference **subagent-widget** behavior.
- **Toolkit commands**: Markdown-sourced **dynamic slash commands** **consistent with** **toolkit-commands** pattern.
- **Operator UX**: **`/agents-team`** team switcher; **Ctrl+X** theme cycling where **non-conflicting** (see design).
- **Swarm messaging (optional)**: **first-party optional module** (or feature flag) for channel/messenger UX **consistent with** **pi-messenger-swarm** docs—**`.pi/messenger/`**, **`PI_MESSENGER_*`**, **`/messenger`** overlay—not a replacement for cleave or YAML orchestration; **coexistence** explicit.
- **Documentation**: link **[ruizrica/agent-pi](https://github.com/ruizrica/agent-pi)** and **[pi-messenger-swarm](https://github.com/monotykamary/pi-messenger-swarm)** as **references**; **`agents/`** layout; migration from copy-paste agent-pi examples.

## Capabilities

### New Capabilities

- `agent-team-orchestration`: `teams.yaml` schema, dispatch-only orchestration (reference: agent-pi agent-team).
- `agent-chain-sequential`: `agent-chain.yaml`, `$INPUT` / `$ORIGINAL` (reference: agent-pi agent-chain).
- `pipeline-team-hybrid`: `pipeline-team.yaml`, five-phase hybrid pipeline (reference: agent-pi pipeline-team).
- `subagent-widget`: Background subagents + live status widgets (reference: agent-pi subagent-widget).
- `toolkit-commands`: Slash commands from Markdown (reference: agent-pi toolkit-commands).
- `orchestration-ux`: `/agents-team`; Ctrl+X theme cycle where applicable (reference: agent-pi UX).
- `messenger-swarm`: Optional swarm messaging (reference: pi-messenger-swarm).

### Modified Capabilities

- *(none in repository root `openspec/specs/`.)*

## Impact

- **New extensions** under **`extensions/`** and **`package.json` `pi.extensions`**; **no** long-term requirement to ship **agent-pi** or **pi-messenger-swarm** as **`npm` dependencies** once in-tree implementations satisfy specs.
- **Repository layout**: `agents/` conventions in user projects; YAML validation; **`.pi/messenger/`** when swarm feature is enabled (or documented devopet equivalent).
- **TUI**: keybindings, widgets, slash commands—coordinate with **pi-tui**, **dashboard**, **cleave**.
- **Risk**: keybinding conflicts; maintenance of **in-tree** logic vs upstream drift—**mitigate** with pins on **pi** stack, reference-version notes in **COMPAT.md**, CI smoke.
