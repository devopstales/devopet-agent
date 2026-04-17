# Free AI providers

## Purpose

Registers free and low-friction providers (Qwen, Kilo, NVIDIA, Ollama Cloud catalog, etc.) through devopet-owned extension(s). **[pi-free](https://www.npmjs.com/package/pi-free)** is a **behavioral reference**, not a mandatory bundled npm package.

## Requirements

### Requirement: Free-provider extension is loaded

The system SHALL include a **devopet-owned** extension that registers free/low-friction providers and slash commands **per** this spec, listed in **`package.json` `pi.extensions`** when the feature is enabled.

#### Scenario: Extension present in manifest

- **WHEN** devopet starts with default extension configuration for this change
- **THEN** the free-provider extension SHALL be listed among loaded extensions per the project manifest

### Requirement: Qwen OAuth

The system SHALL support **Qwen** models and OAuth device flow through documented commands **consistent with** the pi-free reference (e.g. login/logout patterns), implemented **in-tree**.

#### Scenario: User authenticates Qwen

- **WHEN** the user runs the documented Qwen login command
- **THEN** the interactive OAuth flow SHALL complete and Qwen-prefixed models SHALL become selectable when authorized

### Requirement: Kilo and NVIDIA providers

The system SHALL expose **Kilo** and **NVIDIA NIM** model families through **first-party** provider registration, subject to authentication and API keys **documented for devopet** (reference: pi-free).

#### Scenario: NVIDIA key configured

- **WHEN** the operator sets a valid NVIDIA API key via documented config or environment variables
- **THEN** NVIDIA-registered models SHALL appear in the model selection surface

#### Scenario: Kilo OAuth

- **WHEN** the user runs the documented Kilo login command
- **THEN** Kilo OAuth SHALL complete and additional Kilo models MAY become available per documented rules

### Requirement: Ollama Cloud (free catalog)

The system SHALL allow access to **Ollama Cloud** free-tier models **when** API keys and settings are configured **consistent with** the pi-free reference model, without devopet blocking registration **unless** overlap policy with the Ollama-first extension requires it (see **`ollama-flex-endpoints`** spec).

#### Scenario: Ollama Cloud key set

- **WHEN** `ollama_api_key` (or devopet-standard equivalent) is set per documentation
- **THEN** Ollama Cloud models exposed by this extension SHALL be selectable according to documented toggle rules

### Requirement: Documentation

User-facing documentation SHALL name the **devopet extension**, config file locations (prefer **`~/.devopet`** / **`.devopet/`** where **`devopet-config-folders`** applies), toggle commands, and link **pi-free** as **reference** for provider semantics and upstream issue history.

#### Scenario: Operator finds setup steps

- **WHEN** an operator reads devopet documentation for additional free providers
- **THEN** they SHALL find the first-party extension described and pointers to OAuth/API key setup
