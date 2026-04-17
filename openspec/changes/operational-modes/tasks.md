## 1. Reference baseline (no mandatory vendoring)

- [ ] 1.1 Read [ruizrica/agent-pi](https://github.com/ruizrica/agent-pi) for mode names, cycler UX, and prompt ideas—record in **`COMPAT.md`** as **behavioral reference**, not as required **`npm`/git** dependency.
- [ ] 1.2 Audit devopet/**pi-tui** for **Shift+Tab** / **Tab** conflicts; document in design if remapping needed.

## 2. First-party extension

- [ ] 2.1 Create **`extensions/<name>/`** (e.g. **`operational-modes/`**) implementing the six-mode state machine, **Shift+Tab** (or configurable) mode cycle, and per-mode system prompt injection via **`ExtensionAPI`** hooks **per** delta specs.
- [ ] 2.2 Register in **`package.json` `pi.extensions`** with load order compatible with **dashboard** / **cleave** / **`multi-agent-orchestration`** (when present).
- [ ] 2.3 **Do not** add **agent-pi** as a permanent **`dependencies`** entry unless a **transitional** spike requires it—remove when in-tree satisfies specs.

## 3. Orchestration integration

- [ ] 3.1 When **`multi-agent-orchestration`** exists, connect **PIPELINE**, **TEAM**, **CHAIN** to orchestration entrypoints; otherwise prompt-only degradation + user-visible hint per **`mode-system-prompts`** spec.

## 4. Persistence and UX

- [ ] 4.1 Persist last mode in settings if approved; default **NORMAL**.
- [ ] 4.2 Optional: current mode in dashboard footer or **`setStatus`**.

## 5. Documentation and verification

- [ ] 5.1 README or **docs/**: mode table, **Shift+Tab**, cycle order—**agent-pi** cited as **reference** only.
- [ ] 5.2 **`npm run check`**; manual: full cycle ×2, PLAN/SPEC tone, TEAM/CHAIN/PIPELINE hooks or degradation.
