## Context

- **[pi-ask-user](https://www.npmjs.com/package/pi-ask-user)** ([repo](https://github.com/edlsh/pi-ask-user)): Reference for **`ask_user`**, searchable split-pane UI, overlay mode, **ask-user** skill patterns; peers on **`@mariozechner/pi-coding-agent`**, **`pi-tui`**.
- **[@tintinweb/pi-tasks](https://www.npmjs.com/package/@tintinweb/pi-tasks)** ([repo](https://github.com/tintinweb/pi-tasks)): Reference for **Task*** tools, **`/tasks`**, widget, **`.pi/tasks/`**-style storage, **`tasks-config.json`**, **`PI_TASKS`**; **`TaskExecute`** optionally uses **`@tintinweb/pi-subagents`**.
- **devopet** already loads many extensions (dashboard, cleave, web-ui, …); new UI surfaces must not assume exclusive footer or single overlay.

**Policy:** Implement **ask-back** as **first-party `ExtensionAPI` modules** under **`extensions/`**, using the references for **behavior, CLI shape, and test baselines**—not as mandatory **`import` from `node_modules`** in the long term. A **thin loader** to upstream packages MAY exist **only during migration**.

## Goals / Non-Goals

**Goals:**

- **Observable parity** with reference docs: **`ask_user`**, task tools, **`/tasks`**, widget, env vars, **`TaskExecute`** error path without subagents.
- **Repo ownership**: patchable codepaths; clear ordering next to **dashboard** / **cleave**.
- **Documentation** that names **devopet extensions** and links references for deep dives.

**Non-Goals:**

- Treating **npm install pi-ask-user** as the **product definition** once in-tree paths land.
- Implementing a **different** “ask-back” product unrelated to the reference semantics without a new change.

## Decisions

1. **Implementation strategy**  
   - **Choice**: **Capabilities** are satisfied by **devopet code**; **[pi-ask-user](https://www.npmjs.com/package/pi-ask-user)** and **[@tintinweb/pi-tasks](https://www.npmjs.com/package/@tintinweb/pi-tasks)** are **references** for behavior and compatibility testing.  
   - **Optional**: retain **transitional** dynamic import from **`node_modules`** until in-tree implementations pass spec scenarios; **remove** shims when done.

2. **Extension order**  
   - **Choice**: Register **after** core/bootstrap/auth; order **ask** vs **tasks** vs **dashboard** by smoke: **dashboard** remains authoritative for **`setFooter`** if conflicts appear; task widget **above editor** (reference model) should stay **orthogonal** to dashboard footer where possible.  
   - **TBD**: exact indices after implementation.

3. **pi-subagents**  
   - **Choice (v1)**: **Do not** require **`@tintinweb/pi-subagents`**; **`TaskExecute`** SHALL surface the same **clear unavailable** semantics as the reference when subagents are absent—implemented **in-tree**, not only by delegating to npm.

4. **Skills**  
   - **Choice**: Ship or document an **ask-user** skill **consistent with** the reference **ask-user** skill (path MAY live under **`skills/`** or extension-bundled); **pi-ask-user** package skill is **reference** for content shape.

5. **Config paths**  
   - **Choice**: Prefer **`~/.devopet`** / **`.devopet/`** for devopet-specific file layout when **`devopet-config-folders`** applies; document equivalence to **`.pi/tasks/`** for operators migrating from reference installs.

## Risks / Trade-offs

- **[More code vs npm re-export]** → **Mitigation**: modular **`extensions/`**, spec scenarios, focused tests.
- **[UI clutter]** Widget + overlay + dashboard → **Mitigation**: docs; **`PI_TASKS=off`**-style disable per reference.
- **[Drift from reference]** → **Mitigation**: periodic diff against upstream changelogs; version notes in a small **COMPAT.md** if added.

## Migration Plan

1. Land first-party behaviors per tasks; remove npm shims when specs pass.
2. Release note: new tools and **`/tasks`** entrypoints from devopet extensions.
3. Rollback: revert extension entries (and deps if any).

## Open Questions

- **One** combined **`extensions/ask-back/`** facade vs **two** top-level extensions (`ask-user`, `tasks`).
- Exact **semver** alignment for **`@mariozechner/pi-coding-agent`** surfaces used by in-tree code vs reference peer ranges.
