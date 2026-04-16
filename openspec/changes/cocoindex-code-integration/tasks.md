## 1. Upstream verification

- [ ] 1.1 Clone or read [cocoindex-io/cocoindex-code](https://github.com/cocoindex-io/cocoindex-code) README to confirm CLI name (`ccc` vs `cocoindex-code`), exact MCP subcommand, and env vars for slim vs full installs.
- [ ] 1.2 Manually run `ccc mcp` (or documented command) and confirm stdio MCP handshake with devopet’s `@modelcontextprotocol/sdk` expectations.

## 2. MCP configuration

- [ ] 2.1 Add bundled example or default `mcp.json` entry under `extensions/mcp-bridge/` (or `config/`) **only if** missing-binary behavior is acceptable; otherwise ship **documentation + example JSON** only.
- [ ] 2.2 Validate merged config against existing `mcp-bridge` validation rules; ensure server id does not collide with common user names without documentation.

## 3. Documentation

- [ ] 3.1 Add a “CocoIndex Code (semantic code search)” section to root `README.md` or `extensions/mcp-bridge/README.md`: install, PATH check, MCP snippet, link to GitHub, note on `[full]` vs slim.
- [ ] 3.2 Document optional `npx skills add cocoindex-io/cocoindex-code` for skill-based agents.

## 4. Verification

- [ ] 4.1 Smoke-test: with `ccc` installed, `/mcp` or startup shows **search** tool from cocoindex-code server.
- [ ] 4.2 Run `npm run check` if TypeScript/tests touched; fix regressions.
