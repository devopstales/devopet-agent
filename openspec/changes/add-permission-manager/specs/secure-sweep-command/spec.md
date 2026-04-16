## ADDED Requirements

### Requirement: /secure command

The system SHALL provide the **`/secure`** slash command from **[agent-pi](https://github.com/ruizrica/agent-pi)** **secure** extension behavior: a **comprehensive AI security sweep** runnable on **any project**, with optional installation of **portable protections** as upstream implements.

#### Scenario: User runs security sweep

- **WHEN** the user invokes `/secure` in an interactive session
- **THEN** the system SHALL run the sweep workflow and surface findings or next steps per upstream **secure** extension

### Requirement: Documentation

User documentation SHALL describe what **`/secure`** scans, any **interactive** prompts, and whether it **writes files** into the project (e.g. config or stubs).

#### Scenario: Operator reads docs

- **WHEN** an operator reads devopet security documentation
- **THEN** they SHALL find **`/secure`** described alongside **security-guard** and **pi-permission-system**

## REMOVED Requirements

*(none)*

## MODIFIED Requirements

*(none)*
