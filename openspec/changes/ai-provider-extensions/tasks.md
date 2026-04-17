## 1. Connect command (first-party `ai-provider-connect`)

- [x] 1.1 Delta spec: **`specs/connect-command-integration/spec.md`** under this change.
- [x] 1.2 Register **`./extensions/ai-provider-connect/index.ts`** under **`pi.extensions`** immediately **after** `./extensions/01-auth` and **before** `./extensions/security-engine/index.ts`.
- [ ] 1.3 Replace **npm-delegate** implementation with **in-tree** `/connect` / `/disconnect` behavior per spec (reference: pi-connect); remove or isolate any temporary **`node_modules/pi-connect`** loader; update **COMPAT.md** accordingly.
- [ ] 1.4 Tests: `/connect` picker and `/disconnect` flows against **spec scenarios** (mock or integration as appropriate).

## 2. Free AI providers (first-party module)

- [ ] 2.1 Scaffold **`extensions/<name>/`** (e.g. `free-ai-providers`) with `ExtensionAPI` entry; register in **`package.json`** after connect, before or per load-order design.
- [ ] 2.2 Implement provider registration, OAuth/key flows, and commands **per** **`specs/free-ai-providers/spec.md`** (reference: pi-free); prefer **`~/.devopet`** / **`.devopet/`** config paths per **devopet-config-folders** where specified.
- [ ] 2.3 Document migration from **`~/.pi/free.json`** if devopet uses a different path.
- [ ] 2.4 Tests covering at least one OAuth path and one key-based provider per spec.

## 3. Ollama flex endpoints (first-party module)

- [ ] 3.1 Scaffold Ollama-focused extension **per** **`specs/ollama-flex-endpoints/spec.md`** (reference: @0xkobold/pi-ollama).
- [ ] 3.2 Implement local, custom `baseUrl`, and Ollama Cloud **`/v1`** routing + **`/api/show`** metadata per spec.
- [ ] 3.3 Resolve overlap with free-provider Ollama catalog per **design §5**; document in README.
- [ ] 3.4 Tests for host precedence and at least one cloud/local scenario.

## 4. Dependencies and compatibility

- [ ] 4.1 Trim **`package.json`** `dependencies`: drop **`pi-connect`** (and other `pi-*`) **when** in-tree paths replace them; keep only what in-tree code still needs.
- [ ] 4.2 Refresh **COMPAT.md**: peer targets for **`@mariozechner/pi-coding-agent`**; reference package versions as **compatibility baselines**, not required runtime deps.

## 5. Documentation

- [ ] 5.1 **README** / **docs/**: “Additional providers” describes **devopet extensions**, env vars, config paths, and **reference** upstream docs for semantics.
- [ ] 5.2 Security: never commit API keys; `.gitignore` for local devopet overlays.

## 6. Verification

- [ ] 6.1 `npm run check` (typecheck + tests).
- [ ] 6.2 Manual: `/connect`, one free-tier path, one Ollama path (local or cloud) per design.
