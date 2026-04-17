# Operational mode core

## Purpose

Defines six operational modes (**NORMAL**, **PLAN**, **SPEC**, **PIPELINE**, **TEAM**, **CHAIN**) implemented as first-party **`extensions/`** behavior. **[agent-pi](https://github.com/ruizrica/agent-pi)** is a **behavioral reference**, not a mandatory dependency.

## Requirements

### Requirement: Six operational modes

The system SHALL support exactly these **operational modes**: **NORMAL**, **PLAN**, **SPEC**, **PIPELINE**, **TEAM**, and **CHAIN**, with semantics per the following table:

| Mode | Default? | Behavior (summary) |
|------|----------|---------------------|
| NORMAL | yes | Standard coding assistant behavior without orchestration-first constraints |
| PLAN | no | Plan-first workflow: analyze → plan → approve → implement → report |
| SPEC | no | Spec-driven development: shape → requirements → tasks → implement |
| PIPELINE | no | Five-phase hybrid orchestration with parallel dispatch where defined |
| TEAM | no | Dispatcher mode: primary delegates; specialists execute |
| CHAIN | no | Sequential pipeline: each step’s output feeds the next step |

#### Scenario: Default mode on new session

- **WHEN** a new interactive session starts and no persisted mode is set
- **THEN** the active operational mode SHALL be **NORMAL**

#### Scenario: Mode semantics preserved

- **WHEN** the user activates **PLAN** mode
- **THEN** the agent SHALL be guided to follow a plan-first workflow until the mode changes
