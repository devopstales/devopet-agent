## 1. Reference spike (behavior only)

- [ ] 1.1 Read [ruizrica/agent-pi](https://github.com/ruizrica/agent-pi) and map **YAML schemas**, **`dispatch_agent`** usage, widget/toolkit patterns—record as **compatibility baseline** in **`COMPAT.md`**, not as mandatory vendoring.
- [ ] 1.2 Read [pi-messenger-swarm](https://github.com/monotykamary/pi-messenger-swarm) for channel/task/overlay semantics—same: **reference** for optional swarm implementation.

## 2. First-party extension scaffold

- [ ] 2.1 Create **`extensions/<name>/`** (e.g. **`multi-agent-orchestration/`** or split modules) with **`ExtensionAPI`** entrypoints covering **teams**, **chains**, **pipelines**, **subagent widget**, **toolkit commands**, and **orchestration UX** per delta specs.
- [ ] 2.2 Register in **`package.json` `pi.extensions`** with load order validated against **cleave**, **bootstrap**, **dashboard** (no keybinding/widget fights).
- [ ] 2.3 Remove any **transitional** git/npm/submodule wiring to agent-pi once in-tree satisfies specs; **`package.json`** deps SHOULD NOT list **agent-pi** as permanent if avoidable.

## 3. YAML and validation

- [ ] 3.1 Implement parsers/validators for **`agents/teams.yaml`**, **`agents/agent-chain.yaml`**, **`agents/pipeline-team.yaml`** with clear errors (file/line).
- [ ] 3.2 Add **`examples/`** or **docs** sample **`agents/`** trees.

## 4. UX and keybindings

- [ ] 4.1 Implement **`/agents-team`** (or documented spelling) per **`orchestration-ux`** spec.
- [ ] 4.2 Audit **Ctrl+X** vs **pi-tui** / devopet; resolve conflicts or make binding configurable per design.

## 5. Optional swarm (first-party)

- [ ] 5.1 Implement optional messenger feature **per** **`specs/messenger-swarm/spec.md`** (reference: **pi-messenger-swarm**); **no** long-term requirement on **`pi-messenger-swarm`** npm once behavior matches spec.
- [ ] 5.2 Document **`.pi/messenger/`**, **`PI_MESSENGER_*`**, **`/messenger`**; **when to use** swarm vs teams vs cleave.

## 6. Documentation

- [ ] 6.1 README / docs: multi-agent orchestration owned by **devopet extensions**; **agent-pi** and **pi-messenger-swarm** linked as **references**.
- [ ] 6.2 Relationship to **cleave** (decision matrix).

## 7. Verification

- [ ] 7.1 **`npm run check`**; YAML/fixture tests if implemented in-repo.
- [ ] 7.2 Manual: one team dispatch, one chain, optional pipeline; subagent widget visibility; optional **`/messenger`** smoke when swarm is enabled.
