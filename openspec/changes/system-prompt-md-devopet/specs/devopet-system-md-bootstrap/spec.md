## ADDED Requirements

### Requirement: Ensure global devopet directory before bootstrap

The system SHALL ensure the **global devopet configuration directory** exists when devopet runs bootstrap logic that also deploys other global files (e.g. theme / `AGENTS.md`), consistent with `devopet-config-layout`.

#### Scenario: Directory exists

- **WHEN** bootstrap runs on a fresh install
- **THEN** the resolved global devopet directory SHALL exist on disk before writing `SYSTEM.md`

### Requirement: Create starter SYSTEM.md when absent

The system SHALL create **`~/.devopet/SYSTEM.md`** on first bootstrap **when** that path does not exist, using a **shipped template** that is valid UTF-8 Markdown and documents that the operator may edit the file.

#### Scenario: File created once

- **WHEN** global devopet bootstrap runs and `~/.devopet/SYSTEM.md` is missing
- **THEN** the system SHALL write the template file and SHALL NOT treat the missing file as an error

### Requirement: Managed marker and non-destructive updates

The template SHALL embed a **devopet-managed marker** (e.g. HTML comment) analogous to `AGENTS.md` deployment. The system SHALL **NOT** overwrite `~/.devopet/SYSTEM.md` when the marker is absent or when a **content hash** indicates user modification, except when a documented **template update** path applies and the marker confirms devopet ownership.

#### Scenario: User-owned file preserved

- **WHEN** the operator removes the managed marker or edits the file such that the hash guard detects drift
- **THEN** subsequent devopet updates SHALL NOT replace the file silently

### Requirement: Idempotent sessions

Repeated session starts SHALL NOT create duplicate files or fail if **`~/.devopet/SYSTEM.md`** already exists.

#### Scenario: Second run

- **WHEN** a second session starts after `SYSTEM.md` was created
- **THEN** bootstrap SHALL leave the existing file in place without error

## MODIFIED Requirements

*(none)*

## REMOVED Requirements

*(none)*
