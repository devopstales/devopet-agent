## Context

devopet inherits interactive behavior from **pi** (terminal UI, streaming LLM responses, tool execution). Users routinely need to **abort** a long generation, **cancel** a mistaken tool run, or **inject** a correction via a new message. **Ctrl+C** is the universal terminal interrupt; **pi** settings reference **steering** vs **follow-up** delivery modes ([settings.md](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/settings.md) — `steeringMode`, `followUpMode`). A dedicated **`/stop`** command may or may not exist in a given pi version.

## Goals / Non-Goals

**Goals:**

- Align **documented** behavior with **actual** pi/devopet behavior after verification in code.
- Specify **minimum guarantees** (e.g. Ctrl+C does not corrupt session state; new message behavior matches configured steering mode).
- Provide a **single operator-facing table** (proposal/spec) mapping action → outcome.

**Non-Goals:**

- Redesign pi-tui’s entire input model in this change.
- Guarantee hard-kill of arbitrary OS subprocesses beyond what pi already implements.

## Decisions

1. **Specification-first** — Capture requirements in `session-interrupt-semantics`; implementation tasks verify or close gaps against `@mariozechner/pi-coding-agent` and pi-tui.

2. **Ctrl+C** — Treat as **SIGINT** to the running process: should abort current streaming/tool loop where the runtime supports `AbortSignal`; document **best-effort** for external processes.

3. **New message during generation** — Behavior SHALL match **`steeringMode`** / **`followUpMode`** as documented upstream; devopet docs SHALL link to [settings.md](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/settings.md) for **“one-at-a-time”** vs **“all”**.

4. **`/stop`** — If upstream provides **`registerCommand("stop", …)`** or equivalent, devopet SHALL document it. If not, either **add a thin wrapper** in an extension that calls the same cancel path as Ctrl+C, or document **“use Ctrl+C or send a new message”** as the supported path.

5. **COMPAT.md** — Record pi version matrix when behavior differs across releases.

## Risks / Trade-offs

- **[Risk] Behavior is mostly upstream** → **Mitigation:** Spec describes observable outcomes; devopet changes are docs + thin glue only.
- **[Risk] SIGINT handling varies by OS/terminal** → **Mitigation:** Document “typical” behavior; defer edge cases to upstream issues.

## Migration Plan

Documentation-only path: ship spec + README table; no migration. If `/stop` is added, announce in CHANGELOG.

## Open Questions

- Exact **public API** for cancel (`AbortSignal` propagation to tools) — confirm during task **1.1**.
- Whether **double-escape** or other chords conflict with “stop” semantics — document only; do not remap without a separate UX change.
