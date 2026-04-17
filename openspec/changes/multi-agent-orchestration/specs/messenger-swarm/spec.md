> **OpenSpec change:** `multi-agent-orchestration`.  
> **Implementation:** optional **first-party** extension (or feature) under **`extensions/`**. **[pi-messenger-swarm](https://www.npmjs.com/package/pi-messenger-swarm)** is a **behavioral reference**, not a mandatory npm dependency.

## ADDED Requirements

### Requirement: Optional swarm messaging (devopet-owned)

The system SHALL provide **optional** **swarm-first** multi-agent messaging—file-backed coordination, channels, tasks, spawn, and **`/messenger`** overlay—through a **first-party** devopet extension **when enabled**, with **observable behavior consistent with** **[pi-messenger-swarm](https://www.npmjs.com/package/pi-messenger-swarm)** documentation. This feature SHALL **not** be required for users who only use **`agents/`** YAML orchestration or **cleave**.

#### Scenario: Operator enables swarm feature

- **WHEN** the operator enables the swarm messaging feature per devopet documentation
- **THEN** they SHALL be able to use channel messaging, tasks, and **`/messenger`** overlay per the reference model

### Requirement: Coexistence with other orchestration modes

The documentation SHALL state that **swarm messaging** is **complementary** to **YAML teams/chains/pipelines** and to **cleave**: swarm addresses **cross-session channel messaging and task boards**; declarative **`agents/`** orchestration addresses **team/chain/pipeline** flows; cleave addresses **child worktrees and dispatch**—none SHALL be documented as a mandatory replacement for the others.

#### Scenario: User combines swarm with teams

- **WHEN** a project uses both **`agents/teams.yaml`** (or equivalent) and swarm messaging
- **THEN** documentation SHALL clarify boundaries so operators know which mechanism applies to which workflow

### Requirement: Storage and environment overrides

The system SHALL implement **storage layout** and env behavior **consistent with** the reference: default **project-scoped** **`.pi/messenger/`**, **`PI_MESSENGER_DIR`**, **`PI_MESSENGER_GLOBAL`**—or document **devopet** equivalents (e.g. **`.devopet/`**) with an explicit migration note if paths differ.

#### Scenario: Operator sets PI_MESSENGER_DIR

- **WHEN** the operator sets **`PI_MESSENGER_DIR`** per documented behavior
- **THEN** resolution order SHALL match documentation and SHALL NOT silently contradict the reference contract without a migration change

## REMOVED Requirements

*(none)*

## MODIFIED Requirements

*(none)*
