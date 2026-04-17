## ADDED Requirements

### Requirement: Documented interrupt and steering matrix

The system SHALL document, in primary user-facing documentation, how operators can **interrupt ongoing work** or **steer** the session using: **Ctrl+C** (terminal interrupt), **sending a new user message** while output is streaming, and **`/stop`** or the **documented equivalent** command when available.

#### Scenario: Operator finds the matrix

- **WHEN** an operator reads devopet documentation for stopping or interrupting the agent
- **THEN** they SHALL find an explicit description of Ctrl+C, new-message behavior, and /stop (or equivalent), including references to upstream pi settings where steering/follow-up modes apply

### Requirement: Ctrl+C abort semantics

The system SHALL handle terminal **Ctrl+C** (SIGINT) during an active agent turn without leaving the session in an undefined corrupt state. In-flight LLM streaming and cancellable work SHALL honor **best-effort** cancellation via the runtime’s **abort** mechanism where exposed.

#### Scenario: Interrupt during streaming

- **WHEN** the user presses Ctrl+C while the model is streaming a response
- **THEN** streaming SHALL stop and the session SHALL remain usable for further input without requiring a full process restart, subject to upstream pi limitations

### Requirement: New message during in-flight work

When the operator sends a **new user message** while a turn is in progress, behavior SHALL conform to the configured **`steeringMode`** and **`followUpMode`** (or upstream successors) as documented in [pi settings](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/settings.md). User-facing documentation SHALL name these settings and their effect on interrupt vs queue behavior.

#### Scenario: Documentation references steering settings

- **WHEN** an operator needs to know whether a new message cancels, replaces, or queues behind the current turn
- **THEN** devopet documentation SHALL point to the relevant settings keys and summarize **one-at-a-time** vs **all** semantics

### Requirement: Stop command when supported

If the agent runtime exposes a **stop** or **cancel** command suitable for operators (e.g. **`/stop`**), the system SHALL document it alongside Ctrl+C and new-message steering. If no first-class command exists, documentation SHALL state the **supported alternatives** explicitly.

#### Scenario: No silent omission of /stop

- **WHEN** `/stop` is not available in the running build
- **THEN** documentation SHALL not imply it exists; it SHALL list working alternatives

### Requirement: Tool and subprocess cancellation best-effort

Cancellation triggered by interrupt paths SHALL propagate to **in-process** tool calls where **`AbortSignal`** (or equivalent) is wired. External subprocesses or non-cancellable operations SHALL be documented as **best-effort** with any known limitations.

#### Scenario: Long-running tool

- **WHEN** the user interrupts during a tool execution that supports abort
- **THEN** the tool SHALL receive cancellation where the pi tool contract provides for it

## MODIFIED Requirements

*(none)*

## REMOVED Requirements

*(none)*
