# Ollama flexible endpoints

## Purpose

First-party Ollama extension for local/remote discovery, **`/api/show`**, and Ollama Cloud routing. **[@0xkobold/pi-ollama](https://www.npmjs.com/package/@0xkobold/pi-ollama)** is a **behavioral reference**, not a mandatory npm dependency.

## Requirements

### Requirement: Ollama extension is loaded

The system SHALL include a **devopet-owned** Ollama extension that provides model discovery and configuration **per** this spec, listed in **`package.json` `pi.extensions`** when enabled.

#### Scenario: Extension present in manifest

- **WHEN** devopet starts with default extension configuration for this change
- **THEN** the Ollama extension SHALL be listed among loaded extensions per the project manifest

### Requirement: Local and custom Ollama base URL

The system SHALL support **local Ollama** and a **custom Ollama HTTP base URL** (non-localhost) through settings and environment variables, with precedence **documented for devopet** and **consistent with** the pi-ollama reference (global `~/.pi/agent/settings.json` / project `.pi/settings.json` / `OLLAMA_HOST` **or** devopet-standard paths if migrated).

#### Scenario: Remote Ollama host

- **WHEN** the user configures `ollama.baseUrl` or `OLLAMA_HOST` to point to a reachable non-local Ollama server
- **THEN** model listing and chat SHALL use that endpoint per documented behavior

### Requirement: Ollama Cloud endpoint correctness

The system SHALL route **Ollama Cloud** chat and discovery to the **HTTPS `/v1` API** (not the HTML homepage), consistent with the pi-ollama reference fixes for `cloudUrl` and API key usage.

#### Scenario: Cloud chat uses v1

- **WHEN** Ollama Cloud is configured with `cloudUrl` and API key
- **THEN** completion requests SHALL target the documented `/v1` chat-compatible path without trailing-slash duplication errors

### Requirement: Model metadata from api/show

The system SHALL use **`/api/show`** integration where applicable so context length and capability hints reflect server-reported metadata for local and compatible endpoints.

#### Scenario: Context length displayed

- **WHEN** the user inspects Ollama model details via documented commands
- **THEN** context length and capability hints SHALL reflect `/api/show` data when the endpoint returns it

### Requirement: Documentation

User-facing documentation SHALL describe `ollama` settings keys, `OLLAMA_HOST`, `OLLAMA_HOST_CLOUD`, `OLLAMA_API_KEY`, and **overlap avoidance** with the free-provider extension’s Ollama Cloud catalog when both are enabled.

#### Scenario: Operator configures Ollama

- **WHEN** an operator reads devopet documentation for Ollama
- **THEN** they SHALL find the first-party extension described, configuration precedence, and reference link to pi-ollama for comparison
