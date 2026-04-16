## Context

- **cocoindex-code** ([GitHub](https://github.com/cocoindex-io/cocoindex-code)): Python project (`pyproject.toml`), CLI **`ccc`**, MCP via **`ccc mcp`** exposing a **`search`** tool (natural language / code snippet query, limits, language/path filters, optional index refresh). Install: `pipx install 'cocoindex-code[full]'` (local embeddings) or slim + LiteLLM API.
- **devopet** already ships **`extensions/mcp-bridge`**, which merges `mcp.json` from project → user → extension-bundled and supports **stdio** servers (`command`, `args`, `env`).

## Goals / Non-Goals

**Goals:**

- Provide a **first-class, documented** path to run cocoindex-code as an **MCP stdio server** alongside devopet.
- Use **merge-friendly** config: bundled **example** server entry (lowest priority) that users can override in `~/.pi/agent/mcp.json` or `.pi/mcp.json`.
- Document **PATH** and **embedding mode** choices (`[full]` vs API-backed slim).

**Non-Goals:**

- Shipping Python wheels or bundling `ccc` inside `devopet-agent` npm package.
- Patching cocoindex-code upstream unless a blocking bug appears.

## Decisions

1. **Integration mechanism**  
   - **Choice**: **MCP stdio** only for the devopet-bundled default—`command`/`args` spawning `ccc` with subcommand `mcp`, subject to verifying the exact executable name on PATH after `pipx`/`uv tool install`.  
   - **Alternative**: HTTP MCP — not default; cocoindex-code docs emphasize stdio `ccc mcp`.

2. **Bundled config location**  
   - **Choice**: Add or extend **`extensions/mcp-bridge/mcp.json`** (lowest merge priority per bridge README) with a **`cocoindex-code`** (or `ccc`) server block **commented or opt-in** if empty servers are invalid—implementation must follow bridge validation rules. If unconditional registration is undesirable (spawn failures when `ccc` missing), use **documentation-only v1** plus optional example JSON in `config/` — **TBD in tasks** after testing bridge behavior when binary absent.

3. **Skills**  
   - **Choice**: **Document** `npx skills add cocoindex-io/cocoindex-code` in devopet docs; do not duplicate skill content in-repo unless license permits and maintenance is accepted.

4. **Environment**  
   - **Choice**: Pass through **`env`** only when needed (e.g. API keys for slim + LiteLLM); document common vars referencing upstream README.

## Risks / Trade-offs

- [Missing binary] MCP server fails to start if `ccc` not installed → **Mitigation**: clear docs; optional lazy registration only if bridge supports it—otherwise validate in troubleshooting.
- [Resource use] `[full]` pulls heavy ML deps → **Mitigation**: document slim + cloud embedding path.
- [Platform] Windows path to `ccc` may differ → **Mitigation**: document `pipx` / `uv` on PATH.

## Migration Plan

1. Land docs + optional bundled MCP fragment; minor release note.
2. No migration of user data; users opt in by installing `ccc`.

## Open Questions

- Exact **executable name** on each OS after install (`ccc` vs `cocoindex-code`).
- Whether to add a **smoke test** that skips if `ccc` is absent.
