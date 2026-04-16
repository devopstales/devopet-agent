## Why

Project memory today **prefers semantic retrieval** powered by embeddings. Implementation docs still emphasize **local Ollama** (`extensions/project-memory/README.md`), and `resolveEmbeddingProvider()` always selects the **Ollama** backend when no cloud or custom embedding keys are set—even though **`isEmbeddingAvailable()`** is supposed to fall back to **FTS5** when the daemon is down. Operators who **do not run Ollama** should get a **clear, first-class path**: cloud or OpenAI-compatible embeddings when configured, and **keyword search** otherwise—without implying Ollama is required.

Separately, the **LLM Wiki** pattern (Karpathy-style personal knowledge bases) pairs well with **Obsidian** vaults (`raw/`, `wiki/`, `[[wikilinks]]`). Users want **devopet memory** to **feed or sync** with that workflow so facts and narratives can be **reviewed and linked in Obsidian**, optionally using community tooling such as **obsidian-llm-wiki** / **`olw`** pipelines—**without requiring local Ollama** if cloud models are used for embeddings or compilation.

*(You wrote “opsidian”; this change assumes **Obsidian**.)*

## What Changes

- **Embedding provider resolution**: Treat **local Ollama** as **optional**, not the implicit default when no API keys exist—e.g. require explicit opt-in and/or successful healthcheck before selecting `ollama`; otherwise resolve to **FTS5-only** mode without failed startup noise.
- **Documentation**: Update project-memory README and operator docs so **“no Ollama”** is a supported configuration; document env vars (`MEMORY_EMBEDDING_*`, `VOYAGE_API_KEY`, `OPENAI_API_KEY`, custom base URL) as the primary semantic path.
- **Obsidian / LLM Wiki bridge** (initial scope): Define an **export or sync** path from devopet facts/episodes to a **vault directory structure** compatible with LLM Wiki / Obsidian conventions (Markdown, optional `raw/` drops, metadata for `[[wikilinks]]`), and document how to run external **`olw`** / Obsidian workflows **with or without** local Ollama.
- **Non-goals for v1** (unless expanded in design): Full bidirectional sync, running Python `olw` from inside devopet, or replacing SQLite factstore.

## Capabilities

### New Capabilities

- `memory-embedding-without-ollama`: Normative behavior for embedding provider selection, healthchecks, and FTS5 degradation when local Ollama is absent or disabled.
- `obsidian-llm-wiki-bridge`: Export or scheduled sync of memory artifacts to an Obsidian-compatible vault layout; configuration surface (path, scope, format).

### Modified Capabilities

- *(none in `openspec/specs/` — no formal baseline specs in repo root.)*

## Impact

- **`extensions/project-memory/embeddings.ts`**, **`index.ts`**, startup messages, tests for provider resolution.
- **User-facing docs**: `extensions/project-memory/README.md`, possibly root `README.md`.
- **Optional new extension or subcommands** for export/sync; `.gitignore` for vault paths if examples are added.
