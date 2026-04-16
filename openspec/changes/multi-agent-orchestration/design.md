## Context

- **[agent-pi](https://github.com/ruizrica/agent-pi)** (ruizrica): Pi extension suite for multi-agent orchestration—modules include **agent-team**, **agent-chain**, **pipeline-team**, **subagent-widget**, **toolkit-commands**; config under **`agents/`** (`teams.yaml`, `agent-chain.yaml`, `pipeline-team.yaml`); agent specs in **`agents/*.md`** with YAML frontmatter.
- **devopet** already has **cleave**, **dashboard**, and subprocess tooling; this change adds **declarative** team/chain/pipeline definitions aligned with agent-pi rather than replacing cleave wholesale—**relationship** (complementary vs merge) is an implementation choice.

## Goals / Non-Goals

**Goals:**

- Deliver **teams**, **chains**, **pipelines**, **subagent widgets**, **toolkit commands**, and **UX** (`/agents-team`, theme cycle) as specified in the OpenSpec requirements, **reusing agent-pi** when license and peers permit.
- Keep **on-disk layout** compatible with agent-pi examples so users can copy **`agents/`** trees from upstream docs.

**Non-Goals:**

- Re-implementing the entire agent-pi repo from scratch without evaluating **install as extension** first.
- Guaranteeing feature parity with every future agent-pi commit (pin versions; document upgrade path).

## Decisions

1. **Integration strategy**  
   - **Choice (recommended v1)**: Add **agent-pi** as **`pi install`-style dependency**—i.e. **`npm`/`git` dependency** and **`pi.extensions`** entry pointing at `node_modules/.../agent-pi` **or** git URL—**after** verifying `package.json` / build output and peer alignment with devopet’s `@mariozechner/pi-coding-agent`.  
   - **Alternative**: Vendor a subtree into `extensions/agent-pi/` — higher merge cost.

2. **dispatch_agent**  
   - **Choice**: Use upstream pi **task/subagent** APIs as agent-pi does; if symbols differ across pi versions, **shim** in devopet only when necessary.

3. **Theme cycling (Ctrl+X)**  
   - **Choice**: If devopet or pi already binds **Ctrl+X**, **do not override** without migration note; if agent-pi adds a new binding, register only when **no conflict** or make binding **configurable**. **TBD** during implementation audit of `pi-tui` keymaps.

4. **Validation**  
   - **Choice**: Validate **`teams.yaml`**, **`agent-chain.yaml`**, **`pipeline-team.yaml`** at load with clear errors referencing file/line; reject unknown agent names that have no **`agents/<name>.md`**.

5. **Parallelism**  
   - **Choice**: **Pipeline-team** parallel segments follow agent-pi semantics; document happens-before vs true OS parallelism (likely async subagents).

## Risks / Trade-offs

- [Upstream drift] agent-pi moves fast → **Mitigation**: pin commit or semver; CI smoke test.
- [Peer mismatch] Extension fails on pi bump → **Mitigation**: same matrix as other bundled extensions.
- [UX overload] Too many slash commands → **Mitigation**: namespacing, docs.

## Migration Plan

1. Land extension wiring + minimal `agents/` samples in `examples/` or docs.
2. Release note: new commands and keybindings.
3. Rollback: remove extension entry and optional `agents/` examples only.

## Open Questions

- Is **agent-pi** published to **npm** or **git-only** install?
- Overlap with **cleave** “native dispatch”—document when to use **teams** vs **cleave**.
