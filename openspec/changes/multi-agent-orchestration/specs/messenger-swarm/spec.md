## ADDED Requirements

### Requirement: Optional pi-messenger-swarm messaging backend

The system SHALL document and (when implementation chooses bundling) enable **[pi-messenger-swarm](https://www.npmjs.com/package/pi-messenger-swarm)** as an **optional** Pi extension for **swarm-first** multi-agent messaging—file-backed coordination, channels, tasks, spawn, and **`/messenger`** overlay—without requiring it for users who only use agent-pi-style **`agents/`** orchestration or cleave.

#### Scenario: Operator installs swarm via documented npm path

- **WHEN** the operator follows devopet documentation to add **pi-messenger-swarm** (for example `pi install npm:pi-messenger-swarm` or an equivalent bundled `pi.extensions` entry)
- **THEN** they SHALL be able to use the extension’s documented **`pi_messenger`** actions and **`/messenger`** overlay per upstream behavior

### Requirement: Coexistence with other orchestration modes

The documentation SHALL state that **pi-messenger-swarm** is **complementary** to **agent-pi** teams/chains/pipelines and to **cleave**: swarm addresses **cross-session channel messaging and task boards**; YAML orchestration addresses **declarative team/chain/pipeline** flows; cleave addresses **child worktrees and dispatch**—none SHALL be documented as a mandatory replacement for the others.

#### Scenario: User combines swarm with teams

- **WHEN** a project uses both **`agents/teams.yaml`** (or future integrated agent-pi wiring) and **pi-messenger-swarm**
- **THEN** documentation SHALL clarify boundaries so operators know which mechanism applies to which workflow

### Requirement: Storage and environment overrides

When **pi-messenger-swarm** is used, the system SHALL document upstream **storage layout** (default **project-scoped** **`.pi/messenger/`**) and environment variables **`PI_MESSENGER_DIR`** and **`PI_MESSENGER_GLOBAL`** as defined by the extension, without silently changing those semantics in v1.

#### Scenario: Operator sets PI_MESSENGER_DIR

- **WHEN** the operator sets **`PI_MESSENGER_DIR`** to a custom path per upstream docs
- **THEN** devopet documentation SHALL point to that behavior and SHALL NOT contradict the extension’s stated resolution order without an explicit migration change

## REMOVED Requirements

*(none)*

## MODIFIED Requirements

*(none)*
