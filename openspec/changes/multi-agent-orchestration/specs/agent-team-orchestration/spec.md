> **OpenSpec change:** `multi-agent-orchestration`.  
> **Implementation:** first-party extension(s) under **`extensions/`**. **[agent-pi](https://github.com/ruizrica/agent-pi) agent-team** is a **behavioral reference**, not a mandatory dependency.

## ADDED Requirements

### Requirement: Team definition file

The system SHALL support a **`agents/teams.yaml`** (or equivalent path documented for devopet) file in which each **named team** is defined as an ordered list of **agent names** that reference **`agents/<name>.md`** definitions.

#### Scenario: Team lists agents

- **WHEN** `teams.yaml` contains a team such as `plan-build` with agents `planner`, `builder`, `reviewer`
- **THEN** the system SHALL resolve each name to a defined agent file and SHALL reject or warn on unknown agents per documented validation rules

### Requirement: Dispatch-only orchestration

The **primary agent** in team mode SHALL act as a **dispatch-only orchestrator**, delegating work to specialist agents via **`dispatch_agent`** (or the pi-supported equivalent implemented by the devopet extension), without silently bypassing the team ordering semantics **consistent with** the agent-pi reference.

#### Scenario: Delegation to specialist

- **WHEN** a team workflow runs and a step requires a specialist agent
- **THEN** the orchestrator SHALL delegate using the documented dispatch mechanism and the specialist SHALL execute in that role

## REMOVED Requirements

*(none)*

## MODIFIED Requirements

*(none)*
