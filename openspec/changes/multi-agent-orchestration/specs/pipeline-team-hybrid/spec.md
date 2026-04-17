> **OpenSpec change:** `multi-agent-orchestration`.  
> **Implementation:** first-party extension(s) under **`extensions/`**. **[agent-pi](https://github.com/ruizrica/agent-pi) pipeline-team** is a **behavioral reference**, not a mandatory dependency.

## ADDED Requirements

### Requirement: Pipeline definition file

The system SHALL support **`agents/pipeline-team.yaml`** defining **pipelines** that combine **sequential phases** with **parallel agent dispatch** where specified, following the **UNDERSTAND → GATHER → PLAN → EXECUTE → REVIEW** phase model from the agent-pi **pipeline-team** pattern.

#### Scenario: Pipeline loads

- **WHEN** `pipeline-team.yaml` exists and is valid
- **THEN** the system SHALL parse pipeline definitions and SHALL surface errors for invalid structure before execution begins

### Requirement: Phase ordering

The system SHALL execute pipeline phases in the documented order (**UNDERSTAND**, **GATHER**, **PLAN**, **EXECUTE**, **REVIEW**) unless a specific pipeline definition explicitly varies structure; any deviation SHALL be documented in user-facing docs.

#### Scenario: End-to-end pipeline run

- **WHEN** the user starts a hybrid pipeline run
- **THEN** each phase SHALL complete before dependent later phases except where parallel segments are explicitly defined

## REMOVED Requirements

*(none)*

## MODIFIED Requirements

*(none)*
