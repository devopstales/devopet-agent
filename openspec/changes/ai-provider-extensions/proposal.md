## Why

devopet ships upstream pi with a fixed extension set; operators **need** **additional model sources**—**Qwen OAuth**, **Kilo**, **NVIDIA NIM**, **Ollama Cloud**, a **non-local Ollama base URL**, and related **free-tier aggregators**—without having to discover and wire npm extensions by hand. **First-class, devopet-owned extensions** reduce friction and keep behavior **aligned with `@mariozechner/pi-coding-agent` / `pi-ai`** while remaining **versioned and reviewable in this repo**.

**Provider authentication** is part of the same story: a unified **`/connect`** / **`/disconnect`** surface for OAuth and API keys. That work is **not** part of `add-permission-manager`; it lives here with other provider-related work.

Reference implementations (**[pi-connect](https://www.npmjs.com/package/pi-connect)**, **[pi-free](https://www.npmjs.com/package/pi-free)**, **[@0xkobold/pi-ollama](https://www.npmjs.com/package/@0xkobold/pi-ollama)**) inform **behavior and UX**; this change targets **custom extensions** that implement those capabilities **in devopet**—**not** “load upstream npm and delegate” as the defining architecture.

## What Changes

- **`extensions/ai-provider-connect`** (or equivalent name): **first-party** module implementing **`/connect`** / **`/disconnect`** and provider picker semantics **consistent with** pi-connect’s documented behavior (see **`specs/connect-command-integration/spec.md`**). Register **before** `security-engine` in **`pi.extensions`**.
- **`free-ai-providers`** capability: **first-party** extension (e.g. under **`extensions/`**) that registers **free / low-friction providers** (Kilo, NVIDIA, Ollama Cloud, Qwen flows, Zen, OpenRouter, Cline, Mistral, Modal, etc.), config and slash commands **aligned with** pi-free’s **documented** model—paths and filenames MAY follow **`openspec/changes/devopet-config-folders`** (e.g. **`~/.devopet`** / **`.devopet/`**) where devopet standardizes them.
- **`ollama-flex-endpoints`** capability: **first-party** extension for **unified Ollama**—local daemon, **custom `baseUrl`**, **Ollama Cloud** with correct **`/v1`** routing and settings/env precedence **consistent with** @0xkobold/pi-ollama **documented** behavior.
- **Resolve overlap** between free-provider Ollama Cloud registration and the Ollama-focused extension (see design: single source of truth for Ollama UX, no silent duplicate model floods).
- Update **`package.json` `pi.extensions`**; **dependencies** are whatever the implementation needs (may be **fewer** upstream `pi-*` packages if logic lives in-repo). Document env vars and `settings.json` keys for NVIDIA, Qwen, Kilo OAuth, `OLLAMA_HOST`, `OLLAMA_API_KEY`, etc.
- **Non-goals for v1**: Obligating a **direct** runtime dependency on every upstream npm package; forking upstream repos as standalone products; changing devopet’s default model.

## Capabilities

### New Capabilities

- `connect-command-integration`: First-party **`/connect`** / **`/disconnect`** integration; behavior SHALL match **`specs/connect-command-integration/spec.md`** (reference: pi-connect).
- `free-ai-providers`: First-party free-tier provider catalog and commands; behavior SHALL match **`specs/free-ai-providers/spec.md`** (reference: pi-free).
- `ollama-flex-endpoints`: First-party Ollama local/cloud/custom URL; behavior SHALL match **`specs/ollama-flex-endpoints/spec.md`** (reference: @0xkobold/pi-ollama).

### Modified Capabilities

- *(none in repository root `openspec/specs/`.)*

## Impact

- **`package.json`**: extension entries for devopet-owned modules; **optional** slimming of `pi-connect` / `pi-free` / `@0xkobold/pi-ollama` **if** implementations move in-tree—**exact deps decided in design/tasks**.
- **User config**: operator-facing paths MAY use **`~/.devopet`** / **`.devopet/`** per devopet config conventions; document mapping from legacy **`~/.pi/free.json`**-style layouts if applicable.
- **Support surface**: provider-specific auth and rate limits; reference upstream docs for **semantics**; **issues** for devopet-specific bugs land in **this** repo’s tracker unless delegated.
- **Maintenance**: More code in-repo than “re-export npm”—offset by clearer upgrades and fewer peer-version surprises from transitive `pi-*` pins.
