## ADDED Requirements

### Requirement: Devopet settings.json paths

The system SHALL support **`settings.json`** at **`~/.devopet/settings.json`** (global devopet scope) and at **`<project>/.devopet/settings.json`** (project devopet scope), with keys and merge semantics **aligned with** [pi-mono settings documentation](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/settings.md) for nested object merge and project-over-global precedence **within the devopet layer**.

#### Scenario: Project devopet overrides global devopet

- **WHEN** both `~/.devopet/settings.json` and `<project>/.devopet/settings.json` define the same top-level key
- **THEN** the project value SHALL win for that key after devopet-layer merge

### Requirement: Path resolution for resource arrays

For settings keys that reference **relative paths** (such as **`extensions`**, **`skills`**, **`prompts`**, **`themes`**, **`packages`** per [settings.md](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/settings.md)), paths listed in **`~/.devopet/settings.json`** SHALL resolve relative to **`~/.devopet/`**, and paths in **`<project>/.devopet/settings.json`** SHALL resolve relative to **`<project>/.devopet/`**, with **`~`** and absolute paths supported as in pi.

#### Scenario: Relative extension path under devopet global

- **WHEN** `~/.devopet/settings.json` contains a relative `extensions` entry
- **THEN** resolution SHALL interpret it against `~/.devopet/`

### Requirement: Merge order with pi settings

The system SHALL merge **pi** settings (`~/.pi/agent/settings.json` and `.pi/settings.json`) with **devopet** settings such that **conflicting keys** resolve with **documented** ordering; the documentation SHALL state that **`<project>/.devopet/settings.json`** is the highest-precedence layer for devopet-owned configuration unless **BREAKING** notes say otherwise.

#### Scenario: Documented merge order

- **WHEN** an operator reads devopet settings documentation
- **THEN** they SHALL find the full ordering among pi global, pi project, devopet global, and devopet project layers

### Requirement: Documentation references

User-facing documentation SHALL link to [pi-mono settings.md](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/settings.md) and SHALL explain which keys are **shared** with pi and which are **devopet-specific** (if any).

#### Scenario: Operator cross-checks upstream docs

- **WHEN** an operator configures devopet from `~/.devopet`
- **THEN** they SHALL be able to map pi setting names to devopet behavior using the project docs

## MODIFIED Requirements

*(none)*

## REMOVED Requirements

*(none)*
