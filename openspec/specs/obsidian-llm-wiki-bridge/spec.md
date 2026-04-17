# Obsidian / LLM Wiki bridge

## Purpose

Export memory artifacts as Markdown for Obsidian vaults and optional external LLM Wiki tooling, with configurable roots and linking conventions.

## Requirements

### Requirement: Configurable vault export root

The system SHALL support a documented configuration mechanism (environment variable and/or settings key) pointing to a filesystem directory that serves as the root for Markdown exports intended for Obsidian vaults.

#### Scenario: Path is set

- **WHEN** the operator configures a valid vault export root path
- **THEN** export operations SHALL write under that directory using a stable subdirectory layout documented for devopet memory artifacts

### Requirement: Markdown artifact format

Exported facts and episodes SHALL be written as UTF-8 Markdown files with YAML frontmatter containing at minimum identifiers and timestamps sufficient to correlate with internal fact/episode records, and bodies suitable for human review in Obsidian.

#### Scenario: Fact export

- **WHEN** a fact is exported
- **THEN** the file SHALL include frontmatter fields and body text that preserve section and content semantics from the factstore

### Requirement: Obsidian linking conventions

Where multiple exported files reference each other, the system SHOULD use `[[wikilink]]`-compatible link text or paths consistent with Obsidian linking, without breaking plain-text readability.

#### Scenario: Cross-reference between exports

- **WHEN** an export batch includes related facts or episodes
- **THEN** the generated Markdown SHOULD include navigable links between artifacts per documented conventions

### Requirement: External LLM Wiki tooling

User documentation SHALL describe how exported Markdown can be consumed by Obsidian and optional **LLM Wiki**-style tooling (e.g. community `olw` pipelines), including that **local Ollama is optional** when users configure cloud or non-local compilers for those tools.

#### Scenario: Operator follows documentation

- **WHEN** an operator reads the devopet documentation for Obsidian integration
- **THEN** they SHALL find steps that work without a local Ollama daemon for devopet’s own memory pipeline, and guidance for optional external tooling
