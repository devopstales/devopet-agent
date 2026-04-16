## 1. Embedding resolution

- [ ] 1.1 Implement explicit Ollama opt-in / changed default per `design.md`; update `resolveEmbeddingProvider()` and related healthchecks in `extensions/project-memory/embeddings.ts`.
- [ ] 1.2 Add or extend unit tests covering: no env → no Ollama selection; opt-in → Ollama; cloud key → cloud provider; failure → FTS5 path unchanged.
- [ ] 1.3 Update `extensions/project-memory/README.md` and any bootstrap copy that implies Ollama is required for memory.

## 2. Diagnostics

- [ ] 2.1 Surface effective embedding mode (semantic vs keyword-only) via existing diagnostics or memory startup path per spec.

## 3. Obsidian / LLM Wiki export

- [ ] 3.1 Add configuration key + env var for vault export root; implement export of facts (and optionally episodes) to Markdown under a documented subdirectory layout.
- [ ] 3.2 Add user documentation: Obsidian vault usage, `[[wikilinks]]` conventions, and how this relates to community **LLM Wiki** / `olw` workflows with or without local Ollama.

## 4. Verification

- [ ] 4.1 Run `npm run check` (or project test suite) and fix regressions.
- [ ] 4.2 Manual smoke: memory tools with FTS-only; export to a temp vault and open in Obsidian.
