## Why

Complex agent work benefits from two complementary patterns: **structured human-in-the-loop decisions** (when requirements are ambiguous or high-impact) and **Claude Code–style task tracking** (multi-step plans, dependencies, visible progress). **[pi-ask-user](https://www.npmjs.com/package/pi-ask-user)** and **[@tintinweb/pi-tasks](https://www.npmjs.com/package/@tintinweb/pi-tasks)** are **reference implementations** for **`ask_user`**, searchable prompts, bundled **ask-user** skill patterns, **Task*** tools, **`/tasks`**, widgets, and file-backed storage.

This change delivers an **“ask-back”** workflow as **devopet-owned extensions**—behavior and UX **aligned with** those references—**not** “add npm packages and delegate” as the defining architecture. That keeps upgrades, peers, and UI coexistence **under repo control**, consistent with **`ai-provider-extensions`** and **`add-permission-manager`**.

## What Changes

- **First-party extension(s)** under **`extensions/`** implementing **`ask_user`** (and related UI): **observable behavior** **consistent with** [pi-ask-user](https://github.com/edlsh/pi-ask-user) docs (split-pane/searchable UI, overlay mode, non-interactive fallback semantics). Register in **`package.json` `pi.extensions`** with **documented load order** relative to dashboard/cleave and other UI-heavy extensions.
- **First-party extension(s)** implementing **Task*** tools, **`/tasks`**, persistent widget, and storage: **consistent with** [@tintinweb/pi-tasks](https://github.com/tintinweb/pi-tasks) docs (tool names, **`PI_TASKS`** / **`PI_TASKS_DEBUG`**, **`TaskExecute`** behavior without subagents). Paths MAY follow **`~/.devopet`** / **`.devopet/`** where **`devopet-config-folders`** standardizes them; otherwise document mapping from **`.pi/tasks/`**-style layouts.
- **Document** how operators combine **ask** + **tasks** (confirm a choice, then create/update tasks). **Optional follow-up**: **[@tintinweb/pi-subagents](https://github.com/tintinweb/pi-subagents)** for **`TaskExecute`**—same as reference: graceful degradation when absent.
- **Documentation**: devopet extension entrypoints, links to reference repos for semantics, widget/TUI coexistence notes.
- **Non-goals for v1**: Pledging **direct** long-term reliance on **`pi-ask-user`** / **`@tintinweb/pi-tasks`** npm packages as the only implementation; forking upstream as a **separate** product line; guaranteeing **pi-subagents** in the same change.

## Capabilities

### New Capabilities

- `pi-ask-user-bundling`: First-party **`ask_user`** integration; behavior SHALL match **`specs/pi-ask-user-bundling/spec.md`** (reference: pi-ask-user).
- `pi-tasks-bundling`: First-party **tasks** integration (**Task*** tools, **`/tasks`**, widget, storage); behavior SHALL match **`specs/pi-tasks-bundling/spec.md`** (reference: @tintinweb/pi-tasks).

### Modified Capabilities

- *(none in repository root `openspec/specs/`.)*

## Impact

- **`package.json`**: extension entries for devopet-owned modules; **optional** removal of **`pi-ask-user`** / **`@tintinweb/pi-tasks`** from **`dependencies`** once in-tree code satisfies specs—exact deps decided in **design/tasks**.
- **TUI**: task widget and ask overlays must **coexist** with **dashboard** and other extensions—mitigate with load order and docs.
- **Maintenance**: More in-repo code than npm wiring—offset by fewer third-party peer skew surprises.
