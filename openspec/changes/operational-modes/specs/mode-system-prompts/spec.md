## ADDED Requirements

### Requirement: Tailored system prompt per mode

Each operational mode SHALL **inject** a **tailored system prompt** (or equivalent system-level instruction) so the model’s behavior matches that mode; **NORMAL** SHALL use the standard assistant baseline without extra orchestration constraints.

#### Scenario: Mode switch updates instructions

- **WHEN** the user switches from **NORMAL** to **PLAN**
- **THEN** subsequent turns SHALL include PLAN-specific system instructions until the mode changes again

### Requirement: PLAN mode workflow

**PLAN** mode SHALL enforce a **plan-first** workflow at the instruction layer: **analyze → plan → approve → implement → report** (wording MAY match devopet docs but phases SHALL remain distinguishable).

#### Scenario: Plan-first guidance

- **WHEN** **PLAN** mode is active
- **THEN** the system prompt SHALL direct the agent to produce and seek approval for a plan before substantive implementation unless the user explicitly overrides in natural language

### Requirement: SPEC mode workflow

**SPEC** mode SHALL drive **spec-driven development** at the instruction layer: **shape → requirements → tasks → implement**, aligned with devopet OpenSpec terminology where practical.

#### Scenario: SDD-oriented guidance

- **WHEN** **SPEC** mode is active
- **THEN** the system prompt SHALL emphasize requirements and task breakdown before unconstrained coding

### Requirement: Orchestration modes activate backends

**PIPELINE**, **TEAM**, and **CHAIN** modes SHALL **activate** the corresponding orchestration systems (**pipeline-team**, **agent-team**, **agent-chain**) when those subsystems are present in the devopet build; when not present, the system SHALL still inject prompts describing the intended orchestration behavior and MAY surface a clear degraded-state message.

#### Scenario: TEAM with orchestration extension loaded

- **WHEN** **TEAM** mode is active and team orchestration is available
- **THEN** dispatcher-style delegation behavior SHALL be usable per `multi-agent-orchestration` capabilities

#### Scenario: CHAIN without backend

- **WHEN** **CHAIN** mode is active and chain orchestration is not yet installed
- **THEN** the user SHALL still receive CHAIN-oriented system instructions and documentation SHALL explain how to enable full chain execution

## REMOVED Requirements

*(none)*

## MODIFIED Requirements

*(none)*
