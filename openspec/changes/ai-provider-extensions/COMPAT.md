# Compatibility (ai-provider-extensions)

## Pi stack (required)

devopet extensions **MUST** run on the repo’s pinned **`@mariozechner/pi-coding-agent`**, **`pi-ai`**, and **`pi-tui`** versions. `npm ls` SHOULD show **no unmet peers** for those packages.

## Reference implementations (behavioral baselines)

These npm packages **inform** UX and provider semantics; **this change does not require** them as runtime dependencies once first-party implementations land.

| Reference | Role | Notes |
|-----------|------|--------|
| [pi-connect](https://www.npmjs.com/package/pi-connect) | `/connect` / `/disconnect` semantics | Previously loaded via `extensions/ai-provider-connect`; replace with in-tree per tasks |
| [pi-free](https://www.npmjs.com/package/pi-free) | Free-tier providers, `free.json` patterns | Implement in devopet-owned extension per spec |
| [@0xkobold/pi-ollama](https://www.npmjs.com/package/@0xkobold/pi-ollama) | Ollama local/cloud/custom URL | Implement in devopet-owned extension per spec |

When trimming **`package.json`**, remove **`pi-connect`** / **`pi-free`** / **`@0xkobold/pi-ollama`** only after in-tree code satisfies the delta specs and tests.
