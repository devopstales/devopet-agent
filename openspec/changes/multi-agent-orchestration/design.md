## Context

- **[agent-pi](https://github.com/ruizrica/agent-pi)** (ruizrica): **Reference** for multi-agent orchestration—**agent-team**, **agent-chain**, **pipeline-team**, **subagent-widget**, **toolkit-commands**; config under **`agents/`** (`teams.yaml`, `agent-chain.yaml`, `pipeline-team.yaml`); agent specs **`agents/*.md`** with YAML frontmatter.
- **devopet** has **cleave**, **dashboard**, and subprocess tooling; this change adds **declarative** teams/chains/pipelines **implemented in devopet**—**complementary** to cleave, not a wholesale replacement unless documented.
- **[pi-messenger-swarm](https://www.npmjs.com/package/pi-messenger-swarm)** ([repo](https://github.com/monotykamary/pi-messenger-swarm)): **Reference** for swarm-first messaging—file-backed channels, **`/messenger`** overlay. **Different concern** from YAML orchestration (live mesh vs declarative pipelines).

**Policy:** Implement orchestration and optional swarm as **first-party `ExtensionAPI` modules** under **`extensions/`**, using agent-pi and pi-messenger-swarm for **behavior, file layout, and test baselines**. **Git/npm install of agent-pi** or **pi-messenger-swarm** MAY exist **only as a transitional bootstrap** or **parity spike**—not the product definition.

## Goals / Non-Goals

**Goals:**

- Deliver teams, chains, pipelines, subagent widgets, toolkit commands, UX, and optional swarm **per** OpenSpec delta specs with **observable parity** to reference docs.
- Keep **`agents/`** on-disk layout **compatible** with agent-pi examples so operators can **copy trees** from upstream.
- When swarm is implemented: preserve **reference** **`.pi/messenger/`** semantics and **`PI_MESSENGER_*`** unless a **documented** devopet fork (e.g. **`.devopet/`**) is introduced in a migration note.

**Non-Goals:**

- Treating **`npm install agent-pi`** or **`pi install npm:pi-messenger-swarm`** as the **only** integration path once in-tree code lands.
- Guaranteeing **line-by-line** parity with every future agent-pi commit—track references; document upgrade path.
- Using swarm as the **sole** orchestration story—**teams/chains/pipelines** and **cleave** remain alternatives.

## Decisions

1. **Implementation strategy**  
   - **Choice**: **Capabilities** are satisfied by **devopet code** in **`extensions/`** (single **`multi-agent-orchestration`** facade and/or submodules). **[agent-pi](https://github.com/ruizrica/agent-pi)** is a **reference** for YAML schemas, dispatch patterns, and UX.  
   - **Optional**: temporary **vendor subtree**, **git submodule**, or **dynamic import** from a checked-out repo **only until** in-tree passes specs—**remove** when done.

2. **dispatch_agent**  
   - **Choice**: Use **`@mariozechner/pi-coding-agent`** **ExtensionAPI** / task APIs **as agent-pi does**; **shim** only for pi version deltas inside devopet.

3. **Theme cycling (Ctrl+X)**  
   - **Choice**: If **Ctrl+X** conflicts with pi-tui or devopet, **do not override** without migration note; prefer **configurable** binding.

4. **Validation**  
   - **Choice**: Validate **`teams.yaml`**, **`agent-chain.yaml`**, **`pipeline-team.yaml`** at load; reject unknown agent names without **`agents/<name>.md`**.

5. **Parallelism**  
   - **Choice**: Pipeline parallel segments follow **reference** semantics; document happens-before vs async subagents.

6. **Swarm (optional)**  
   - **Choice**: **First-party** optional extension implementing messenger UX **consistent with** **pi-messenger-swarm**; **not** mandatory npm dependency in the long term. **Thin loader** to upstream package allowed **only** during migration.

7. **Swarm storage vs devopet config**  
   - **Choice**: Default **reference** layout **`.pi/messenger/`** and **`PI_MESSENGER_DIR`** / **`PI_MESSENGER_GLOBAL`** until **`devopet-config-folders`** migration explicitly moves state.

## Risks / Trade-offs

- **[More code vs upstream bundle]** → **Mitigation**: modular **`extensions/`**, spec scenarios, tests against YAML fixtures.
- **[Upstream drift]** → **Mitigation**: **COMPAT.md** reference pins; periodic diff.
- **[Peer mismatch]** → **Mitigation**: align with devopet’s **`@mariozechner/pi-coding-agent`** pin.
- **[UX overload]** → **Mitigation**: namespacing; docs (**`/messenger`** vs **`/agents-team`**).

## Migration Plan

1. Land first-party extension scaffolding + minimal **`agents/`** samples in **docs** or **examples/**.
2. Release note: new commands and keybindings.
3. Rollback: remove extension entries.

## Open Questions

- **One** **`extensions/multi-agent-orchestration/`** monolith vs **multiple** extension entries (team vs swarm).
- Overlap with **cleave**—document **when to use teams vs cleave** (decision matrix).
