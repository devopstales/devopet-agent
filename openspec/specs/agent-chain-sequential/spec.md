# Agent chain (sequential)

## Purpose

YAML-defined sequential agent chains with **`$INPUT`** / **`$ORIGINAL`** templates. **[agent-pi](https://github.com/ruizrica/agent-pi) agent-chain** is a **behavioral reference**, not a mandatory dependency.

## Requirements

### Requirement: Chain definition file

The system SHALL support **`agents/agent-chain.yaml`** defining **named chains**; each chain SHALL have a **description** and an ordered list of **steps**, each step specifying an **agent** and a **prompt template**.

#### Scenario: Chain structure

- **WHEN** a chain `plan-build-review` is defined with multiple steps
- **THEN** each step SHALL reference a resolvable agent and a prompt string used for that step

### Requirement: Template variables

Prompt templates SHALL support at least **`$INPUT`** (previous step’s output) and **`$ORIGINAL`** (the user’s original prompt), with substitution behavior matching [agent-pi](https://github.com/ruizrica/agent-pi) chain semantics.

#### Scenario: Sequential handoff

- **WHEN** the first step completes and the second step runs
- **THEN** the second step’s prompt SHALL resolve `$INPUT` to the first step’s output and `$ORIGINAL` to the initial user prompt
