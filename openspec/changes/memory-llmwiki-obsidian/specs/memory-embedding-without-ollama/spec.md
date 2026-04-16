## ADDED Requirements

### Requirement: Ollama is not implied without opt-in

When no cloud or custom OpenAI-compatible embedding configuration is present, the system SHALL NOT select the Ollama embedding backend unless explicitly enabled by documented environment configuration or successful user-directed probe rules defined in implementation.

#### Scenario: No keys and Ollama disabled

- **WHEN** no `MEMORY_EMBEDDING_BASE_URL`, Voyage, or OpenAI embedding credentials are configured and Ollama opt-in is not active
- **THEN** the system SHALL NOT treat Ollama as the active embedding provider for new sessions

#### Scenario: Cloud embedding remains available

- **WHEN** a supported cloud or custom embedding configuration is present and passes health validation
- **THEN** the system SHALL use that provider for semantic memory features without requiring a local Ollama process

### Requirement: Graceful degradation to keyword search

When no embedding provider is available, the system SHALL operate project memory using full-text or keyword retrieval per existing FTS5 degradation behavior without crashing or requiring local Ollama.

#### Scenario: FTS5-only operation

- **WHEN** embedding healthcheck fails for all configured providers or no provider is configured
- **THEN** memory recall and related tools SHALL remain usable via non-embedding search paths documented for operators

### Requirement: Operator-visible mode

The system SHALL expose the effective embedding mode (semantic vs keyword-only) through documented channels such as logs, startup summary, or memory diagnostics so users can confirm that lack of Ollama is expected.

#### Scenario: User confirms configuration

- **WHEN** an operator inspects memory diagnostics or startup output
- **THEN** they SHALL be able to determine whether semantic embeddings are active and, if not, that keyword search is in use

## REMOVED Requirements

*(none)*

## MODIFIED Requirements

*(none)*
