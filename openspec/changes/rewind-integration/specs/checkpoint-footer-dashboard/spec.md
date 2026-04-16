## ADDED Requirements

### Requirement: Single footer surface

The system SHALL NOT present a **second independent footer** that competes with **`DashboardFooter`**; checkpoint status SHALL be integrated into the **dashboard** footer implementation or an equivalent **single** `setFooter` component.

#### Scenario: One footer component

- **WHEN** dashboard extension registers `setFooter`
- **THEN** pi-rewind SHALL not replace that registration with a separate full-width footer factory without merging behavior

### Requirement: Checkpoint visibility

The **dashboard** footer SHALL display **checkpoint count or status** (e.g. **`◆ N checkpoints`** or a documented abbreviated form) when pi-rewind has active checkpoint data, readable on typical terminal widths.

#### Scenario: User sees checkpoint indicator

- **WHEN** at least one checkpoint exists for the session
- **THEN** the dashboard footer HUD SHALL include a line or badge reflecting checkpoint availability per merged design

### Requirement: Documentation

User documentation SHALL explain how checkpoint status appears in the **unified dashboard footer** and SHALL distinguish **pi-rewind checkpoints** from **cleave preflight “checkpoint”** commits.

#### Scenario: Operator reads docs

- **WHEN** an operator reads devopet docs for rewind
- **THEN** they SHALL find the footer integration described and the cleave terminology disambiguated

## REMOVED Requirements

*(none)*

## MODIFIED Requirements

*(none)*
