# Compatibility notes — agent-interrupt-stop

Verified against **`@mariozechner/pi-coding-agent` `0.61.1`** (bundled with devopet-agent at time of this change).

**devopet paths:** session log is **`<project>/.devopet/memory/.session_log`** (migrated from **`<project>/.devopet/session_log`** or repo-root `.session_log` when present). Nearest **`.devopet`** is found by walking up from `cwd`, else **`cwd/.devopet`** is used.

## Interactive TUI defaults

| Topic | Behavior |
|-------|----------|
| **Interrupt streaming / agent work** | Default chord is **Escape** (`app.interrupt` in `dist/core/keybindings.js`), not Ctrl+C. On Esc during a turn, the UI calls `agent.abort()` (see `interactive-mode.js` `restoreQueuedMessagesToEditor({ abort: true })` when the loading animation is active). |
| **Ctrl+C** | Bound to **`app.clear`** — first press clears the editor; two presses within ~500 ms call `shutdown()` and exit. It does **not** match “SIGINT kills the Node process” while raw mode owns the terminal. |
| **New message while streaming** | `interactive-mode.js` submits with `streamingBehavior: "steer"`. **`steeringMode`** / **`followUpMode`** (`"one-at-a-time"` vs `"all"`) still govern how queued steering and follow-up messages are delivered; see [settings.md](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/settings.md). **Alt+Enter** queues a follow-up (`app.message.followUp`). |
| **Upstream `/stop`** | No built-in `/stop` slash command in core command dispatch; devopet adds **`/stop`** via `extensions/stop-command.ts`, calling `ExtensionCommandContext.abort()` then `waitForIdle()`. |

## Extension cancel API

`ExtensionCommandContext` includes **`abort()`** and **`waitForIdle()`** (`dist/core/extensions/types.d.ts`). Interactive mode wires `abort` to `session.abort()` (fire-and-forget from the shortcut helper; `/stop` awaits idle after abort).
