## 1. Ask-user capability (first-party)

- [ ] 1.1 Scaffold **`extensions/<name>/`** (e.g. `ask-user` or under a combined `ask-back` module) implementing **`ask_user`** and UI **per** **`specs/pi-ask-user-bundling/spec.md`** (reference: **pi-ask-user**).
- [ ] 1.2 Register in **`package.json` `pi.extensions`**; validate load order vs **dashboard** / **cleave** (no footer/overlay fights).
- [ ] 1.3 Provide **ask-user** skill or **`skills/`** pointer **consistent with** reference **ask-user** skill semantics.
- [ ] 1.4 Replace any **transitional** `node_modules/pi-ask-user` loader with in-tree code; drop **`pi-ask-user`** from **`dependencies`** when spec + tests pass.
- [ ] 1.5 Tests: tool registration, one interactive round-trip (or mocked UI), headless fallback per spec.

## 2. Tasks capability (first-party)

- [ ] 2.1 Scaffold **`extensions/<name>/`** implementing **Task*** tools, **`/tasks`**, widget, storage **per** **`specs/pi-tasks-bundling/spec.md`** (reference: **@tintinweb/pi-tasks**).
- [ ] 2.2 Implement **`PI_TASKS`** / **`PI_TASKS_DEBUG`** and storage modes; prefer **`.devopet`** paths where **`devopet-config-folders`** applies—document mapping from **`.pi/tasks/`** if needed.
- [ ] 2.3 **`TaskExecute`**: clear error when subagents unavailable—**in-tree** behavior matching reference, not only npm delegation.
- [ ] 2.4 Replace transitional **`@tintinweb/pi-tasks`** loader; drop npm dep when done.
- [ ] 2.5 Tests: **`/tasks`**, at least one Task tool, **`TaskExecute`** without subagents path.

## 3. Version spike (only if shims remain temporarily)

- [ ] 3.1 If npm packages are used **only** as bootstrap, record compatible pins in a **`COMPAT.md`** (optional) and remove when shims go away.

## 4. Documentation

- [ ] 4.1 README (or **docs/**): **ask-back** overview—**devopet extension names**, **`ask_user`** + **tasks** together, **`PI_TASKS`**, links to **pi-ask-user** / **pi-tasks** repos as **references**.
- [ ] 4.2 Document optional **`@tintinweb/pi-subagents`** for full **`TaskExecute`** cascade.

## 5. Verification

- [ ] 5.1 **`npm run check`**.
- [ ] 5.2 Manual: **`ask_user`** round-trip; task create/list/update; **`PI_TASKS=off`** if documented.
