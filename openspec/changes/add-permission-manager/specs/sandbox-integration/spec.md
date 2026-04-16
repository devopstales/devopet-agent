## ADDED Requirements

### Requirement: Sandbox configuration

The system SHALL support sandbox configuration via global `~/.pi/agent/sandbox.json` and project-local `.pi/sandbox.json`, where local configuration overrides global when both exist, following pi-sandbox precedence semantics.

#### Scenario: Local overrides global

- **WHEN** both global and project sandbox configuration files exist
- **THEN** the effective configuration SHALL match project-local values for overlapping keys and SHALL document merge rules for list fields (e.g. allow/deny paths)

### Requirement: Bash sandbox execution

When the sandbox extension is enabled, bash (and equivalent subprocess) invocations SHALL be wrapped with the platform-appropriate sandbox mechanism (e.g. sandbox-exec on macOS, bubblewrap on Linux) subject to network and filesystem policy, as implemented by pi-sandbox.

#### Scenario: Blocked bash surfaces prompt or hard block

- **WHEN** a bash command violates network or filesystem policy
- **THEN** the user SHALL receive a prompt with documented options (e.g. abort, allow session, allow project, allow global) OR a hard block when rules mark the action as non-overridable

### Requirement: Tool-level filesystem checks

The system SHALL intercept read/write/edit tool operations against the same filesystem policy used for sandbox decisions where pi-sandbox applies, since those operations occur in-process.

#### Scenario: Write to denied path

- **WHEN** a write or edit targets a path in `denyWrite`
- **THEN** the operation SHALL be blocked without prompt, and the user SHALL be informed which configuration entries apply

### Requirement: Session and persistent allowances

Session-only allowances SHALL remain in memory until restart; persistent allowances SHALL be written only to the documented config files and SHALL NOT be readable or writable by the agent process beyond normal user file permissions.

#### Scenario: Session reset

- **WHEN** the extension reloads or the agent restarts
- **THEN** session-scoped allowances SHALL be cleared

### Requirement: Disable and inspect

The system SHALL provide a documented way to disable sandboxing for a session (e.g. `--no-sandbox` or equivalent) and a command or UI affordance to show current sandbox configuration and active session allowances.

#### Scenario: User inspects sandbox state

- **WHEN** the user invokes the documented inspect command during an interactive session
- **THEN** the system SHALL present the effective configuration source (global vs project) and relevant active rules at a high level

## REMOVED Requirements

*(none)*

## MODIFIED Requirements

*(none)*
