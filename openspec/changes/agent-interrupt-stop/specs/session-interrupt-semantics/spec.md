## ADDED Requirements

### Requirement: Documented interrupt and steering matrix

The system SHALL document, in primary user-facing documentation, how operators can **interrupt ongoing work** or **steer** the session using: the **default interrupt chord** (**Escape** / `app.interrupt`, configurable), **Ctrl+C** (default: clear editor / double-press exit — not the primary stream abort), **sending a new user message** while output is streaming, and **`/stop`** (devopet-registered) or the **documented equivalent** when applicable.

#### Scenario: Operator finds the matrix

- **WHEN** an operator reads devopet documentation for stopping or interrupting the agent
- **THEN** they SHALL find an explicit description of Escape (interrupt), Ctrl+C (clear/exit defaults), new-message behavior, and `/stop`, including references to upstream pi settings where steering/follow-up modes apply

### Requirement: Interrupt during an active agent turn

The system SHALL support **best-effort** cancellation of an active model turn (streaming and cancellable in-process work) without leaving the session in an undefined corrupt state, using the same abort mechanism the runtime exposes (e.g. `AgentSession.abort` / extension `abort()`). External subprocesses and non-cancellable operations remain **best-effort** only.

#### Scenario: Interrupt during streaming

- **WHEN** the user triggers the **interrupt** action (default **Escape** while the UI indicates an active turn, per upstream keybindings)
- **THEN** streaming SHALL stop in a best-effort manner and the session SHALL remain usable for further input without requiring a full process restart, subject to upstream pi limitations

### Requirement: New message during in-flight work

When the operator sends a **new user message** while a turn is in progress, behavior SHALL conform to the configured **`steeringMode`** and **`followUpMode`** (or upstream successors) as documented in [pi settings](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/settings.md). User-facing documentation SHALL name these settings and their effect on interrupt vs queue behavior.

#### Scenario: Documentation references steering settings

- **WHEN** an operator needs to know whether a new message cancels, replaces, or queues behind the current turn
- **THEN** devopet documentation SHALL point to the relevant settings keys and summarize **one-at-a-time** vs **all** semantics

### Requirement: Stop command when supported

The system SHALL expose a **`/stop`** slash command that invokes the extension **abort** path (best-effort), and SHALL document it alongside Escape, Ctrl+C defaults, and new-message steering. Documentation SHALL NOT imply **`/stop`** exists in stock pi alone.

#### Scenario: No silent omission of /stop

- **WHEN** an operator relies on devopet documentation
- **THEN** **`/stop`** SHALL be listed as a devopet-provided command with best-effort semantics, and stock-pi-only installs SHALL be distinguished if mentioned

### Requirement: Tool and subprocess cancellation best-effort

Cancellation triggered by interrupt paths SHALL propagate to **in-process** tool calls where **`AbortSignal`** (or equivalent) is wired. External subprocesses or non-cancellable operations SHALL be documented as **best-effort** with any known limitations.

#### Scenario: Long-running tool

- **WHEN** the user interrupts during a tool execution that supports abort
- **THEN** the tool SHALL receive cancellation where the pi tool contract provides for it

## MODIFIED Requirements

*(none)*

## REMOVED Requirements

*(none)*
