## 1. Verify upstream behavior

- [x] 1.1 Trace **Ctrl+C** / SIGINT handling in `@mariozechner/pi-coding-agent` and **pi-tui** (streaming abort, session continuity).
- [x] 1.2 Confirm how **new user messages** interact with in-flight turns (**steeringMode** / **followUpMode**); capture version notes for **COMPAT.md** if needed.
- [x] 1.3 Check whether **`/stop`** (or alias) exists; if yes, document exact behavior; if no, confirm intended workaround path.

## 2. Documentation

- [x] 2.1 Add an **Interrupt & stop** subsection (or table: Ctrl+C | new message | /stop) to **README** or **`docs/`**, linking [pi settings.md](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/settings.md) for steering/follow-up modes.
- [x] 2.2 Align wording with **`session-interrupt-semantics`** scenarios; avoid promising hard-kill where upstream is best-effort.

## 3. Optional devopet glue

- [x] 3.1 If cancel API exists but **no** `/stop` command, add a thin **`/stop`** (or document why not) in an appropriate extension; register in **`package.json`** if implemented.
- [x] 3.2 Add or extend tests only where devopet-owned code owns the cancel path.
