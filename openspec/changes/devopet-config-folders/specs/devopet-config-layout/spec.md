## ADDED Requirements

### Requirement: Global devopet config directory

The system SHALL resolve a user-global devopet configuration directory defaulting to `~/.devopet` on Unix-like systems and to the equivalent user-profile subdirectory on Windows (`%USERPROFILE%\.devopet`).

#### Scenario: Default global path

- **WHEN** no environment override for the devopet global config root is set
- **THEN** the resolved path SHALL be the home-derived `.devopet` directory for the current user

#### Scenario: Environment override

- **WHEN** a documented environment variable overrides the devopet global config root
- **THEN** the system SHALL use that directory in place of the default and SHALL document the variable in user-facing docs

### Requirement: Project devopet config directory

The system SHALL resolve an optional project-level directory named `.devopet` by searching upward from the process current working directory until the first existing `.devopet` directory is found or the filesystem root is reached.

#### Scenario: Project config present

- **WHEN** a parent directory of the current working directory contains a `.devopet` directory
- **THEN** the nearest such directory (closest to the cwd) SHALL be used as the project devopet config root

#### Scenario: No project config

- **WHEN** no `.devopet` directory exists in any ancestor of the cwd
- **THEN** project-level devopet configuration SHALL be treated as absent without error

### Requirement: Precedence between global and project config

For configuration keys or files that exist in both the global devopet directory and the project `.devopet` directory, the system SHALL apply documented precedence such that project values override global values for the same logical key unless a specific file type requires a different merge rule (documented per feature).

#### Scenario: Project overrides global

- **WHEN** the same logical configuration file or key is defined in both `~/.devopet` and `<project>/.devopet`
- **THEN** the project-level definition SHALL take precedence for that key or file

### Requirement: Documentation and stability

The system SHALL document the global and project devopet paths, the environment override for the global root, and precedence rules in the primary user documentation. Path resolution behavior for devopet-managed configuration SHALL remain consistent across minor releases unless called out as **BREAKING** in release notes.

#### Scenario: User can find path documentation

- **WHEN** a user reads the documented configuration section for devopet
- **THEN** they SHALL find the default global path, project `.devopet` discovery rules, and override variable name

## REMOVED Requirements

*(none)*

## MODIFIED Requirements

*(none)*
