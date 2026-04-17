## ADDED Requirements

### Requirement: Pi-relative SYSTEM.md replaces default system prompt

The system SHALL support **`SYSTEM.md`** under the **pi** configuration roots such that when present its UTF-8 text **replaces** the built-in default system prompt for the session. Resolution SHALL use **project** **`.pi/SYSTEM.md`** when that file exists; otherwise **`~/.pi/agent/SYSTEM.md`** when that file exists; otherwise the built-in default SHALL remain.

#### Scenario: Project replace wins over global

- **WHEN** both `.pi/SYSTEM.md` (ancestor-discovered project root per pi rules) and `~/.pi/agent/SYSTEM.md` exist
- **THEN** the effective replace content SHALL come from the project file

#### Scenario: Global replace only

- **WHEN** no project `SYSTEM.md` exists but `~/.pi/agent/SYSTEM.md` exists
- **THEN** the effective replace content SHALL come from the global file

### Requirement: Pi-relative APPEND_SYSTEM.md augments without replacing the default alone

The system SHALL support **`APPEND_SYSTEM.md`** under **`~/.pi/agent/`** and **`.pi/`** such that its content **augments** the composed system prompt **without** being the sole source of the base prompt when no **`SYSTEM.md`** replace is in effect. When a **`SYSTEM.md`** replace **is** in effect, append files SHALL be applied **after** that replaced base per the documented append order.

#### Scenario: Append with no SYSTEM.md

- **WHEN** no `SYSTEM.md` replace file is present but `APPEND_SYSTEM.md` exists at one or both pi locations
- **THEN** the built-in default SHALL remain the base and append content SHALL be merged per documented order

### Requirement: Append ordering within the pi tree

The system SHALL concatenate **`APPEND_SYSTEM.md`** segments in this order unless a **BREAKING** change is documented: **`~/.pi/agent/APPEND_SYSTEM.md`** first, then **project** **`.pi/APPEND_SYSTEM.md`** (when both exist).

#### Scenario: Global then project append

- **WHEN** both global and project pi append files exist
- **THEN** the project segment SHALL appear after the global segment in the final prompt

### Requirement: Devopet-relative SYSTEM.md and APPEND_SYSTEM.md

The system SHALL support the same **replace** and **append** filenames under **`~/.devopet/`** and **`<project>/.devopet/`** (project directory discovered per `devopet-config-layout`), with **project** devopet files taking precedence over **global** devopet files for the **replace** slot when both exist.

#### Scenario: Devopet project overrides devopet global replace

- **WHEN** both `~/.devopet/SYSTEM.md` and `<project>/.devopet/SYSTEM.md` exist
- **THEN** the project file SHALL supply the devopet replace content

### Requirement: Unified replace precedence across pi and devopet

The system SHALL define a **single** winning **`SYSTEM.md`** replace for the session when multiple trees define replace files: **`<project>/.devopet/SYSTEM.md`** SHALL win over **`~/.devopet/SYSTEM.md`**, which SHALL win over **project** **`.pi/SYSTEM.md`**, which SHALL win over **`~/.pi/agent/SYSTEM.md`**, which SHALL win over the built-in default (first existing file in that order SHALL be used).

#### Scenario: Devopet project beats pi global

- **WHEN** `<project>/.devopet/SYSTEM.md` exists and `~/.pi/agent/SYSTEM.md` exists
- **THEN** the devopet project file SHALL be the replace source

### Requirement: Append composition across pi and devopet trees

The system SHALL apply **`APPEND_SYSTEM.md`** segments after the **effective replace base** (built-in or winning **`SYSTEM.md`**) in this order: **`~/.pi/agent/APPEND_SYSTEM.md`**, **`.pi/APPEND_SYSTEM.md`**, **`~/.devopet/APPEND_SYSTEM.md`**, **`<project>/.devopet/APPEND_SYSTEM.md`** (omit missing files).

#### Scenario: All four append files present

- **WHEN** all four append paths exist
- **THEN** the final system prompt SHALL include base plus append text in that exact concatenation order

### Requirement: Documentation of composition

User-facing documentation SHALL describe the replace chain, append chain, interaction with **`AGENTS.md`**, and reference upstream [pi settings](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/settings.md) where relevant.

#### Scenario: Operator finds precedence table

- **WHEN** an operator reads devopet documentation for system prompts
- **THEN** they SHALL find the unified precedence order and append order stated explicitly

## MODIFIED Requirements

*(none)*

## REMOVED Requirements

*(none)*
