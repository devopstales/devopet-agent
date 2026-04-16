## Context

- **[pi-free](https://www.npmjs.com/package/pi-free)** (MIT, `apmantza/pi-free`): Pi extension registering **many free-model providers**, OAuth for **Qwen**, **Kilo**, **Cline**, API keys in **`~/.pi/free.json`**, toggles like `/zen-toggle`, `/nvidia-toggle`, `/ollama-toggle`, and includes **Ollama Cloud** models when `ollama_api_key` is set.
- **[@0xkobold/pi-ollama](https://www.npmjs.com/package/@0xkobold/pi-ollama)** (MIT): Focused **Ollama** integration—**local** (`OLLAMA_HOST`), **cloud** (`OLLAMA_HOST_CLOUD` / `cloudUrl`), **`baseUrl` override** for custom servers, **`/api/show`** for context length and capabilities, commands `/ollama-status`, `/ollama-models`, `/ollama-info`. Peer: `pi-coding-agent >= 0.65.2`.

devopet currently pins specific `pi-*` versions in `package.json`; both packages declare peers on `pi-ai` / `pi-coding-agent` / `pi-tui` that **must match** the monorepo versions devopet ships.

## Goals / Non-Goals

**Goals:**

- Ship a **clear combination**: pi-free for breadth (Qwen OAuth, Kilo, NVIDIA, etc.) + pi-ollama for **accurate Ollama UX** and **custom remote endpoints**.
- **Version-verify** both packages against devopet’s pi stack before merging.
- **Document** overlap and recommended settings so users are not flooded with duplicate Ollama cloud entries—or explicitly accept duplicates with naming distinction.

**Non-Goals:**

- Implementing new providers inside devopet core.
- Guaranteeing availability or SLAs of third-party free tiers.

## Decisions

1. **Bundling strategy**  
   - **Choice**: Add both **`pi-free`** and **`@0xkobold/pi-ollama`** as **npm dependencies** and list them in **`pi.extensions`** in dependency order (pi-ollama before or after pi-free per load-order testing—**TBD in implementation**).  
   - **Alternative**: Document-only install — rejected for “devopet includes more providers” product goal.

2. **Ollama overlap**  
   - **Choice**: Prefer **pi-ollama** as the **source of truth** for **local + custom URL + `/api/show`**; use pi-free for **Ollama Cloud free catalog** only if non-duplicative, **or** disable pi-free’s Ollama provider via upstream config if available, **or** document “duplicate model names” and let users hide models via `hidden_models` in `free.json`. Exact approach **validated during implementation** against actual model registration IDs.

3. **Qwen / Kilo / NVIDIA**  
   - **Choice**: Rely on **pi-free** implementations; devopet only ensures extension loads and links to [pi-free README](https://github.com/apmantza/pi-free) for `/login qwen`, `/login kilo`, and NVIDIA key setup.

4. **Config paths**  
   - **Choice**: Follow upstream: `~/.pi/free.json`, global `~/.pi/agent/settings.json` for pi-ollama `ollama` block; note **`devopet-config-folders`** change if future `~/.devopet` redirects apply.

## Risks / Trade-offs

- [Peer mismatch] Extension breaks on pi upgrade → **Mitigation**: pin versions, run smoke test (model picker lists providers).
- [Duplicate Ollama entries] Confusing UX → **Mitigation**: decision §2 + docs.
- [OAuth / API keys] Users may commit secrets → **Mitigation**: document `.gitignore` for local config; never log keys.

## Migration Plan

1. Add deps + extension entries; release minor version with CHANGELOG.
2. No data migration; existing `settings.json` gains optional `ollama` key.
3. Rollback: remove deps and manifest lines.

## Open Questions

- Minimum **pi-coding-agent** version bump required for `@0xkobold/pi-ollama` peers vs devopet’s current pin.
- Whether to expose **feature flags** in devopet to enable only pi-free **or** only pi-ollama for minimal installs.
