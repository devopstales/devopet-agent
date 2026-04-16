## Why

Complex agent work benefits from two complementary patterns: **structured human-in-the-loop decisions** (when requirements are ambiguous or high-impact) and **Claude Code–style task tracking** (multi-step plans, dependencies, visible progress). **[pi-ask-user](https://www.npmjs.com/package/pi-ask-user)** adds an interactive **`ask_user`** tool with a searchable split-pane UI, overlay mode, and a bundled **ask-user** skill for decision handshakes. **[@tintinweb/pi-tasks](https://www.npmjs.com/package/@tintinweb/pi-tasks)** adds **Task*** tools, a persistent task widget, `/tasks`, file-backed storage, and optional **TaskExecute** integration with **[@tintinweb/pi-subagents](https://github.com/tintinweb/pi-subagents)**. Bundling both into devopet as an **“ask-back”** workflow module (ask the user, then drive work forward with visible tasks) reduces ad-hoc installs and aligns peers with devopet’s pi stack.

## What Changes

- Add **`pi-ask-user`** as an **`npm` dependency** with a **pinned or semver-bounded** version compatible with devopet’s **`@mariozechner/pi-coding-agent`** / **`pi-tui`**; register in **`package.json` `pi.extensions`** (path to published entry after install).
- Add **`@tintinweb/pi-tasks`** as an **`npm` dependency** with the same peer alignment; register in **`pi.extensions`** with **documented load order** relative to dashboard/cleave and other UI-heavy extensions.
- **Document** the bundled **ask-user** skill location and how operators can rely on **`ask_user`** + **task tools** together (e.g. confirm a choice, then create/update tasks).
- **Optional follow-up** (non-blocking for v1): document or bundle **`@tintinweb/pi-subagents`** if **`TaskExecute`** is a goal—otherwise **`TaskExecute`** remains gracefully degraded per upstream.
- **Documentation**: install paths (`pi install npm:…`), links to [pi-ask-user](https://github.com/edlsh/pi-ask-user) and [pi-tasks](https://github.com/tintinweb/pi-tasks), **`PI_TASKS`** env overrides, widget/TUI coexistence notes.

## Capabilities

### New Capabilities

- `pi-ask-user-bundling`: npm dependency, `pi.extensions` entry, smoke expectations for **`ask_user`** tool and bundled **ask-user** skill; graceful non-interactive fallback behavior unchanged from upstream.
- `pi-tasks-bundling`: npm dependency, `pi.extensions` entry, **`/tasks`** command and task widget; file-backed **`/.pi/tasks`** layout per upstream; **optional** subagents note for **`TaskExecute`**.

### Modified Capabilities

- *(none in repository root `openspec/specs/`.)*

## Impact

- **`package.json`**: two new dependencies + two extension entries; possible **peer/version alignment** work if upstream pins differ from devopet’s pi versions.
- **TUI**: task widget (above editor) and **pi-ask-user** overlays must **coexist** with devopet **dashboard** and other extensions—mitigate with load order and docs.
- **Risk**: **version skew** between `pi-ask-user`, `@tintinweb/pi-tasks`, and devopet’s pi packages—mitigate with pins, `npm run check`, and manual smoke.
