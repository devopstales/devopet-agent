## ADDED Requirements

### Requirement: Three-hook security model

The system SHALL implement the **[agent-pi security-guard](https://github.com/ruizrica/agent-pi/blob/main/extensions/security-guard.ts)** three-layer model:

1. **`tool_call` hook** — Pre-execution gate that blocks dangerous commands before they run (e.g. destructive **rm**, **sudo**, credential dumping patterns, exfiltration patterns, unsafe **curl|bash**-style usage) per upstream **scanCommand** / policy semantics.
2. **`context` hook** — Content scanner that mitigates **prompt injection** and sensitive leakage in **tool results** (e.g. **stripInjections**, truncation, secret scans as implemented upstream).
3. **`before_agent_start` hook** — System prompt hardening so the agent receives **security rule reminders** at session start.

#### Scenario: Destructive bash blocked

- **WHEN** a tool invocation matches an upstream-defined blocked pattern (e.g. **`rm -rf`**-class commands)
- **THEN** execution SHALL be blocked before the subprocess runs and the operator SHALL receive a clear block reason

#### Scenario: Tool result scanned

- **WHEN** tool output contains patterns classified as prompt injection or policy violations by the context scanner
- **THEN** the content SHALL be sanitized, truncated, or rejected per upstream **security-guard** behavior

### Requirement: Security policy file

The system SHALL support tuning via **`.pi/security-policy.yaml`** (or equivalent path documented with devopet) for block lists, protected paths, and related rules, consistent with the upstream extension’s **loadPolicy** design.

#### Scenario: Operator tunes policy

- **WHEN** `.pi/security-policy.yaml` exists and is valid
- **THEN** blocked-command and scan behavior SHALL reflect the merged policy per upstream rules

### Requirement: Security slash command

The system SHALL expose **`/security`** with **status**, **log**, **policy**, and **reload** (or equivalent) subcommands as provided by agent-pi **security-guard**, documented in devopet README.

#### Scenario: Operator checks status

- **WHEN** the user runs `/security status` (or documented variant)
- **THEN** the system SHALL present current security-guard state per upstream behavior

### Requirement: Audit logging

Security events SHALL be append-logged to a documented path (e.g. **`.pi/security-audit.log`** per upstream) with rotation or size limits as implemented in **security-guard**.

#### Scenario: Block is auditable

- **WHEN** a command is blocked
- **THEN** an audit entry SHALL be written when audit logging is enabled

## REMOVED Requirements

*(none)*

## MODIFIED Requirements

*(none)*
