## Why

devopet ships upstream pi with a fixed extension set; operators who want **additional model sources**—**Qwen OAuth**, **Kilo**, **NVIDIA NIM**, **Ollama Cloud**, a **non-local Ollama base URL**, and related **free-tier aggregators**—must discover and install pi extensions manually. Bundling or first-class wiring for proven community extensions reduces friction and keeps **peer versions aligned** with `@mariozechner/pi-coding-agent` / `pi-ai`.

## What Changes

- Add **[pi-free](https://www.npmjs.com/package/pi-free)** (`pi-free`) as a bundled or default-recommended extension: registers multiple **free / low-friction providers** (including **Kilo**, **NVIDIA**, **Ollama Cloud**, **Qwen** via `/login qwen`, Zen, OpenRouter, Cline, Mistral, Modal, etc.), `~/.pi/free.json` config, and slash commands such as `/kilo-toggle`, `/login qwen`.
- Add **[@0xkobold/pi-ollama](https://www.npmjs.com/package/@0xkobold/pi-ollama)** for **unified Ollama**: **local** daemon, **custom `baseUrl`** (remote or LAN Ollama), and **Ollama Cloud** with correct **`/v1`** routing and settings/env precedence documented upstream.
- **Resolve overlap** between pi-free’s Ollama Cloud registration and pi-ollama’s cloud/local providers (see design: avoid duplicate model entries or document which extension owns Ollama UX).
- Update **`package.json` `pi.extensions`** (and lockfile) with pinned versions; document env vars and `settings.json` keys for NVIDIA, Qwen, Kilo OAuth, `OLLAMA_HOST`, `OLLAMA_API_KEY`, etc.
- **Non-goals for v1**: Forking pi-free or pi-ollama; changing devopet’s default model.

## Capabilities

### New Capabilities

- `free-ai-providers`: Integration of the **pi-free** extension—free-tier model catalog, OAuth flows (Qwen, Kilo, Cline), `~/.pi/free.json`, toggle commands, and logging paths per upstream docs.
- `ollama-flex-endpoints`: Integration of **@0xkobold/pi-ollama**—local, **custom Ollama endpoint**, and **Ollama Cloud** with accurate `/api/show` metadata and configuration precedence.

### Modified Capabilities

- *(none in repository root `openspec/specs/`.)*

## Impact

- **`package.json`**: new `dependencies` / extension entries; possible bundle size and install time increase.
- **User config**: `~/.pi/free.json`, `~/.pi/agent/settings.json` / `.pi/settings.json` `ollama` block, environment variables (`NVIDIA_API_KEY`, `OLLAMA_API_KEY`, `OLLAMA_HOST`, etc.).
- **Support surface**: provider-specific auth and rate limits; document upstream issue trackers for pi-free and pi-ollama.
- **Risk of confusion** if both extensions register similar Ollama models—**mitigated in design**, not silent duplication.
