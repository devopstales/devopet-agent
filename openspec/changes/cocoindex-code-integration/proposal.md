## Why

[CocoIndex Code](https://github.com/cocoindex-io/cocoindex-code) is a lightweight **AST-based semantic code search** CLI built on CocoIndex, advertised as saving tokens and improving speed for coding agents. devopet operators should be able to use it **without ad-hoc setup**—consistent with how other tools integrate via **MCP** (upstream documents `ccc mcp`) and optional **Agent Skills** (`npx skills add cocoindex-io/cocoindex-code`). Formalizing integration documents prerequisites, wires a **default MCP stdio server** entry where appropriate, and points users to the upstream **search** tool contract.

## What Changes

- **MCP integration**: Register **[cocoindex-code](https://github.com/cocoindex-io/cocoindex-code)** as a **stdio MCP server** invoking `ccc mcp` (or the documented backward-compatible entrypoint), using devopet’s existing **`mcp-bridge`** extension and bundled or documented `mcp.json` patterns (`command` + `args`).
- **Prerequisites**: Document **Python install** paths (`pipx install 'cocoindex-code[full]'` vs slim + cloud embeddings) so `ccc` is on `PATH` when the agent starts MCP.
- **Optional skills path**: Document installing the upstream **`ccc` skill** (`skills/ccc` in repo) via `npx skills add cocoindex-io/cocoindex-code` for agents that use skills, complementary to MCP.
- **Non-goals for v1**: Vendoring the Python/Rust stack inside the npm package; reimplementing semantic search in TypeScript.

## Capabilities

### New Capabilities

- `cocoindex-code-integration`: MCP registration, configuration precedence with existing `mcp.json` merge rules, documented install and troubleshooting, and alignment with upstream tool surface (`search`, parameters).

### Modified Capabilities

- *(none in repository root `openspec/specs/`.)*

## Impact

- **`extensions/mcp-bridge/`**: optional bundled `mcp.json` fragment or README update; no breaking change to bridge protocol.
- **User environment**: requires **`ccc`** (or equivalent) available for stdio spawn; disk for local embeddings when using `[full]`.
- **Documentation**: README or `docs/` section linking [cocoindex-io/cocoindex-code](https://github.com/cocoindex-io/cocoindex-code), PyPI/uv install, and MCP tool reference.
