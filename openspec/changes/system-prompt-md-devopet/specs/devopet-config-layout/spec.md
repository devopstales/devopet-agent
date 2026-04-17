## ADDED Requirements

### Requirement: Reserved filenames for system prompt and settings

The system SHALL treat **`SYSTEM.md`**, **`APPEND_SYSTEM.md`**, and **`settings.json`** as **supported logical filenames** at the **root** of the resolved **global** devopet directory and **project** **`.devopet`** directory for system prompt assembly and JSON settings integration. Detailed loading, precedence, and merge rules SHALL be specified in **`system-prompt-md-resolution`**, **`devopet-system-md-bootstrap`**, and **`devopet-settings-json-locations`**.

#### Scenario: Documentation lists reserved names

- **WHEN** a user reads the devopet configuration layout documentation
- **THEN** they SHALL find these three names listed as part of the devopet root layout conventions

## MODIFIED Requirements

*(none)*

## REMOVED Requirements

*(none)*
