## ADDED Requirements

### Requirement: Orphan tool_result protection

The system SHALL load **[agent-pi](https://github.com/ruizrica/agent-pi)** **message-integrity-guard** behavior so that **orphaned `tool_result`** messages (or equivalent malformed sequences) do not **brick** the interactive session.

#### Scenario: Session recovers from bad tool sequence

- **WHEN** the message stream contains an orphaned or inconsistent tool result per upstream detection rules
- **THEN** the guard SHALL prevent permanent session failure modes described by agent-pi (e.g. blocking progression or offering repair) per upstream implementation

### Requirement: Non-destructive default

Integrity fixes SHALL favor **preserving user data** and **clear error surfaces** over silent data loss unless upstream explicitly requires deletion.

#### Scenario: User-visible failure mode

- **WHEN** integrity cannot be restored automatically
- **THEN** the user SHALL receive an actionable message rather than a hung TUI

## REMOVED Requirements

*(none)*

## MODIFIED Requirements

*(none)*
