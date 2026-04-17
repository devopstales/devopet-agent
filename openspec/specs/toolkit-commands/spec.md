# Toolkit commands (Markdown slash commands)

## Purpose

Dynamic slash commands from Markdown definitions. **[agent-pi](https://github.com/ruizrica/agent-pi) toolkit-commands** is a **behavioral reference**, not a mandatory dependency.

## Requirements

### Requirement: Markdown-defined slash commands

The system SHALL support **dynamic slash commands** loaded from **Markdown** source files (**toolkit-commands** pattern), registering command names and behavior per the devopet extension schema **consistent with** the agent-pi reference.

#### Scenario: Command discovered

- **WHEN** a valid Markdown toolkit definition is present in the configured path
- **THEN** the corresponding slash command SHALL be registered for interactive sessions

### Requirement: Documentation link

User documentation SHALL describe where to place Markdown files, naming conventions, and how commands appear in the slash command list.

#### Scenario: Author adds command

- **WHEN** an operator follows devopet documentation to add a toolkit Markdown file
- **THEN** they SHALL be able to invoke the new slash command after reload or restart as documented
