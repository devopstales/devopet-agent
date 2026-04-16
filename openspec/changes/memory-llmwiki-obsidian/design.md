## Context

- **Embeddings** (`extensions/project-memory/embeddings.ts`): Resolution order already lists custom URL → Voyage → OpenAI → **Ollama** → FTS5. The gap is **psychological and defaulting**: with **no keys**, code still returns `{ provider: "ollama", ... }`, so every install **attempts** Ollama until healthcheck fails—confusing for users who never intend to run it.
- **LLM Wiki + Obsidian**: Ecosystem tools (e.g. [obsidian-llm-wiki](https://pypi.org/project/obsidian-llm-wiki/) / `olw`, [obsidian-llm-wiki-local](https://github.com/kytmanov/obsidian-llm-wiki-local)) typically expect a **vault** with `raw/`, `wiki/`, and optional **Ollama** for local-only pipelines. devopet can still **integrate** by emitting **Markdown artifacts** into a vault path so users run **`olw ingest` / `compile`** themselves—or use cloud APIs if their tooling supports it.

## Goals / Non-Goals

**Goals:**

- **Explicit Ollama opt-in** for embeddings when no cloud credentials exist (env flag or documented default change after consensus).
- **Clean FTS5-only mode**: no spurious errors; status line or `--where`-style diagnostics optional.
- **Vault export**: configurable path (e.g. `DEVOPET_WIKI_VAULT` or settings) writing **facts/episodes** as `.md` with stable frontmatter and links suitable for Obsidian.
- **Documentation** linking devopet memory to **Obsidian + LLM Wiki** workflows.

**Non-Goals:**

- Shipping Python/`olw` inside the npm package.
- Full two-way merge from Obsidian back into SQLite (conflict-prone); consider later.

## Decisions

1. **Ollama default**  
   - **Choice**: When no `MEMORY_EMBEDDING_BASE_URL`, Voyage, or OpenAI keys are set, **do not** select `ollama` unless **`MEMORY_EMBEDDING_USE_OLLAMA=1`** (name TBD) **or** `OLLAMA_HOST` is set **and** probe succeeds—exact predicate in implementation.  
   - **Alternative**: Always try localhost Ollama (current behavior)—rejected for “no Ollama” clarity.

2. **Semantic vs FTS**  
   - **Choice**: If no embedding provider is available after resolution, **`isEmbeddingAvailable()`** returns false and store uses **FTS5**; UI/docs state “semantic search disabled.”

3. **Vault layout**  
   - **Choice v1**: Under chosen vault root, write e.g. `devopet-export/facts/<id>.md` and `devopet-export/episodes/<id>.md` with YAML frontmatter (`title`, `section`, `confidence`, `updated`) and body text; optional index `devopet-export/index.md` with `[[wikilinks]]` to fact pages. Users may **`olw init --existing`** on parent or copy `devopet-export/raw` per LLM Wiki docs.  
   - **Alternative**: Dump only into `raw/` for external compiler—may collide with user notes; use subdirectory.

4. **Obsidian vs “Opsidian”**  
   - **Choice**: Document **Obsidian** only; treat “opsidian” as typo in user comms.

## Risks / Trade-offs

- [Behavior change] Users relying on **implicit** Ollama embeddings without env vars lose semantic search until they set **`MEMORY_EMBEDDING_USE_OLLAMA=1`** or add API keys → **Mitigation**: release note + one-time warning on upgrade.
- [Vault size] Large exports → **Mitigation**: caps, incremental export, `--since` flag in follow-up.

## Migration Plan

1. Implement resolver + tests; ship minor release with **CHANGELOG** entry.
2. Add export command or extension hook; document Obsidian steps.
3. Rollback: revert env gate and restore previous default order.

## Open Questions

- Exact **env var name** for Ollama opt-in (`MEMORY_EMBEDDING_USE_OLLAMA` vs inverting default with `MEMORY_SKIP_OLLAMA=1`).
- Whether **bootstrap** should show embedding mode (FTS vs semantic) on first run.
- Integration with **`devopet-config-folders`** (`~/.devopet`) for vault path defaults.
