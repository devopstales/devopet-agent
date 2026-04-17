> **OpenSpec change:** `rewind-integration`.  
> **Implementation:** first-party extension(s) under **`extensions/`**. **[pi-rewind](https://github.com/arpagon/pi-rewind)** is a **behavioral reference**, not a mandatory npm dependency.

## ADDED Requirements

### Requirement: Rewind capability via devopet-owned extension

The system SHALL provide **turn-based git checkpoints**, **`/rewind`**, **diff preview**, **redo**, and **safe restore** through a **first-party** extension registered in **`package.json` `pi.extensions`**. **Observable behavior** SHALL be **consistent with** **[pi-rewind](https://github.com/arpagon/pi-rewind)** documentation (hooks, git refs, commands), unless this spec explicitly narrows scope.

#### Scenario: Package builds and extension loads

- **WHEN** the devopet package is built and started in a git project with the extension enabled
- **THEN** rewind hooks SHALL run (e.g. session / turn-end checkpoint scheduling) **without crash** and **consistent with** the reference model

#### Scenario: User-facing commands

- **WHEN** the user types **`/rewind`** or uses **Esc+Esc** (double Escape) per documented behavior
- **THEN** the checkpoint browser / quick rewind / restore flows SHALL be available **consistent with** [pi-rewind](https://github.com/arpagon/pi-rewind), subject to devopet keybinding conflict documentation

### Requirement: No mandatory pi-rewind npm package

The **long-term** architecture **SHALL NOT** require **`pi-rewind`** as a **runtime npm dependency** once the first-party implementation satisfies the scenarios above; a **transitional** dependency MAY exist **only** during migration and **SHALL** be removed when superseded (document in **COMPAT.md**).

#### Scenario: Dependency hygiene

- **WHEN** in-tree rewind code is complete and tested
- **THEN** **`package.json`** **SHOULD NOT** list **`pi-rewind`** unless a documented exception remains

## REMOVED Requirements

*(none)*

## MODIFIED Requirements

*(none)*
