## Context

- **[agent-pi](https://github.com/ruizrica/agent-pi)** documents **operational modes** and **mode-cycler**-style behavior—**reference** for cycle order, prompts, and UX.
- **devopet** implements modes in **first-party `ExtensionAPI` code** under **`extensions/`**, optionally **composing** with **`multi-agent-orchestration`** for PIPELINE/TEAM/CHAIN.

**Policy:** **[agent-pi](https://github.com/ruizrica/agent-pi)** is **not** the runtime architecture—capabilities are satisfied by **devopet-owned** modules. Copying snippets or **temporary** git/npm alignment MAY occur **only** during migration; **remove** when in-tree code passes specs.

## Goals / Non-Goals

**Goals:**

- **Deterministic cycle**: **NORMAL → PLAN → SPEC → PIPELINE → TEAM → CHAIN** → wrap to **NORMAL**.
- **Shift+Tab** as primary chord; **alternatives** if host steals the sequence.
- **Strong prompt separation** per mode (PLAN/SPEC visible to the model).

**Non-Goals:**

- Treating **npm install agent-pi** or **git submodule** as the **product definition** for operational modes.
- Guaranteeing full orchestration execution for TEAM/CHAIN/PIPELINE **before** `multi-agent-orchestration`—modes may **announce** intent via prompt until backends exist.

## Decisions

1. **Persistence**  
   - **Choice**: Persist **last mode** in `settings.json` or session state; **fallback** NORMAL. Key name **TBD** (e.g. `operationalMode`).

2. **PIPELINE vs TEAM order**  
   - **Choice**: **… SPEC → PIPELINE → TEAM → CHAIN** exactly unless **pi-tui** forces remapping (document).

3. **Shift+Tab**  
   - **Choice**: Register in **first-party** extension; **audit** conflicts; optional **`devopet.modeCycleKey`**.

4. **Orchestration coupling**  
   - **Choice**: PIPELINE/TEAM/CHAIN **call** `multi-agent-orchestration` entrypoints when available; **before** that, prompts + degraded messaging.

5. **SPEC mode**  
   - **Choice**: Align prompt vocabulary with **OpenSpec** / repo SDD terms.

6. **Implementation location**  
   - **Choice**: One **`extensions/operational-modes/`** (name MAY vary) registering mode state, keybinding, and **`before_agent_start`** (or equivalent) prompt injection.

## Risks / Trade-offs

- **[Keybinding conflict]** → configurable chord; terminal docs.
- **[Mode drift]** → visible indicator (footer/badge).
- **[Partial orchestration]** → clear degraded messaging.

## Migration Plan

1. Ship first-party modes + cycler + prompts; orchestration hooks per dependency graph.
2. Release note: keybinding and mode table.

## Open Questions

- Exact extension **name** and split vs monolith.
- Whether **NORMAL** after CHAIN (wrap) — **yes** per proposal.
