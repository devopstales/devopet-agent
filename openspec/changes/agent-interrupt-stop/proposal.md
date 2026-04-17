## Why

Operators need a **predictable, documented** way to **stop or steer** the agent mid-turn: terminal **Ctrl+C**, sending a **new message** while the model is still working, or an explicit **`/stop`** (or equivalent) command. Without a shared spec, behavior differs across pi-tui versions, terminals, and user mental models—leading to duplicated work, unclear cancellation, or confusion about whether a tool call or stream was aborted.

## What Changes

- Define **normative session-interrupt semantics** for devopet (aligned with upstream **pi** / **pi-tui** where applicable): what **Ctrl+C** does, how a **new user message** interacts with in-flight generation (**steering** vs queue), and what **`/stop`** (or the supported equivalent) guarantees.
- **Document** the matrix in user-facing docs (README or `docs/`) and, where gaps exist versus upstream, track **implementation tasks** in devopet extensions or fork notes (**COMPAT.md**).
- Optionally **register** a **`/stop`** command if the core agent exposes a cancel API but does not surface a command—design will confirm.

## Capabilities

### New Capabilities

- `session-interrupt-semantics`: Requirements for interrupting or steering ongoing agent work (Ctrl+C, new message, `/stop`), including observable outcomes (stream stopped, tool cancellation best-effort), and documentation obligations.

### Modified Capabilities

- *(none — no existing `openspec/specs/` baseline for this topic.)*

## Impact

- **Upstream**: `@mariozechner/pi-coding-agent`, **pi-tui** input handling, signal handling.
- **devopet**: documentation, possible thin extension for **`/stop`** or status messaging; **README** operator expectations.
- **Tests**: where cancel/abort hooks exist, add or extend integration tests (may be upstream-only).
