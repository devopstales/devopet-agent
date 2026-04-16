## ADDED Requirements

### Requirement: npm package bundled

The system SHALL declare **`pi-rewind`** as a **dependency** in `package.json` with a **pinned or semver-bounded** version compatible with devopet’s **`@mariozechner/pi-coding-agent`** and **`pi-tui`** peers.

#### Scenario: Install succeeds

- **WHEN** an operator runs `npm install` in the devopet repo
- **THEN** `pi-rewind` SHALL resolve without peer dependency failures or SHALL document required pi version bumps

### Requirement: Extension registration

The system SHALL register **pi-rewind** in **`package.json` `pi.extensions`** using the correct entry path to the extension’s main module after install.

#### Scenario: Extension loads

- **WHEN** devopet starts in a git project
- **THEN** pi-rewind hooks SHALL run per upstream behavior (e.g. `session_start`, `turn_end` checkpoint scheduling) without crashing

### Requirement: User-facing commands

The system SHALL expose **`/rewind`** and **Esc+Esc** (double Escape) behavior as implemented by pi-rewind, subject to keybinding conflict resolution documented for devopet.

#### Scenario: Rewind command exists

- **WHEN** the user types `/rewind` in an interactive session
- **THEN** the checkpoint browser / restore flow SHALL be available per [pi-rewind](https://github.com/arpagon/pi-rewind)

## REMOVED Requirements

*(none)*

## MODIFIED Requirements

*(none)*
