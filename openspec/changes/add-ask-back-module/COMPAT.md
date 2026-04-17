# Compatibility (`add-ask-back-module`)

## Pi stack (required)

Extensions introduced by this change **MUST** run on the repo’s pinned **`@mariozechner/pi-coding-agent`**, **`pi-tui`**, and related pi packages without unrecoverable peer conflicts.

## Reference implementations (behavioral baselines)

These npm packages **inform** UX and tool semantics; **this change does not require** them as long-term runtime dependencies once first-party implementations land.

| Reference | Role | Notes |
|-----------|------|--------|
| [pi-ask-user](https://www.npmjs.com/package/pi-ask-user) | **`ask_user`**, overlays, ask-user skill patterns | Implement in **`extensions/`** per spec |
| [@tintinweb/pi-tasks](https://www.npmjs.com/package/@tintinweb/pi-tasks) | **Task*** tools, **`/tasks`**, widget, **`PI_TASKS`** | Implement in **`extensions/`** per spec |
| [@tintinweb/pi-subagents](https://www.npmjs.com/package/@tintinweb/pi-subagents) | Optional **`TaskExecute`** cascade | v1 optional; clear error when absent |

Remove **`pi-ask-user`** / **`@tintinweb/pi-tasks`** from **`package.json` `dependencies`** only after in-tree code satisfies the delta specs and tests.
