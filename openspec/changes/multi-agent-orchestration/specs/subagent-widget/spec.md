## ADDED Requirements

### Requirement: Background subagent visibility

The system SHALL provide **background subagent management** with **live status** surfaced in the TUI (widgets or equivalent), so operators can see running or completed subagent work without blocking the primary session unnecessarily.

#### Scenario: Widget shows status

- **WHEN** one or more subagents are active or recently completed
- **THEN** the UI SHALL display status information sufficient to distinguish agents and progress states per integrated extension behavior

### Requirement: Non-blocking orchestration

Subagent operations orchestrated through this feature SHALL NOT require the primary UI to stall indefinitely; long-running work SHALL be observable and cancellable per pi-tui capabilities where available.

#### Scenario: User continues primary work

- **WHEN** subagents run in the background
- **THEN** the primary agent session SHALL remain usable according to upstream pi constraints

## REMOVED Requirements

*(none)*

## MODIFIED Requirements

*(none)*
