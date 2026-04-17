## Context

- **[pi-connect](https://www.npmjs.com/package/pi-connect)** (MIT): Reference for unified **`/connect`** picker (OAuth + API keys). Historically loaded via explicit path from `node_modules`; **this change** treats that as **one possible bootstrap**, not the product definition.
- **[pi-free](https://www.npmjs.com/package/pi-free)** (MIT): Reference for **many free-model providers**, OAuth (Qwen, Kilo, Cline), **`~/.pi/free.json`**, toggles, **Ollama Cloud** catalog entries.
- **[@0xkobold/pi-ollama](https://www.npmjs.com/package/@0xkobold/pi-ollama)** (MIT): Reference for **Ollama**—local, **custom `baseUrl`**, cloud URL + **`/v1`**, **`/api/show`** metadata, status commands.

**devopet policy:** Ship **custom extensions** under **`extensions/`** that **implement** these capabilities using **`@mariozechner/pi-coding-agent` `ExtensionAPI`**, taking **behavioral cues** from the references (docs, UX, provider IDs) without **requiring** “always import npm package X” as the long-term architecture.

## Goals / Non-Goals

**Goals:**

- **Observable parity**: Operators get **`/connect`**, extended free providers, and Ollama flexibility **as specified** in delta specs; tests and manual checks compare against **reference docs**, not “did we call into npm.”
- **Repo ownership**: Logic lives where we can patch, audit, and align with **`add-permission-manager`**, **`devopet-config-folders`**, and security stack ordering.
- **Explicit overlap rules** for Ollama when both “free catalog” and “Ollama-first” surfaces exist—**one** coherent story in README.

**Non-Goals:**

- Pledging to **vendor-fork** upstream repos as separate products.
- Implementing **new** proprietary providers inside core unrelated to the references.

## Decisions

1. **`/connect` placement**  
   - **Choice**: **First-party** **`extensions/ai-provider-connect`** (name MAY evolve) registers **before** **`security-engine`** so auth surfaces exist before permission and guard hooks.  
   - **Implementation**: **In-tree** `ExtensionAPI` registration, commands, and auth store usage **consistent with** pi-connect **semantics**. Optional: retain a **thin loader** to upstream during migration; **remove** once in-tree path is complete.

2. **No “npm = product”**  
   - **Choice**: **Capabilities** are satisfied by **devopet code**; **[pi-connect](https://www.npmjs.com/package/pi-connect)** / **[pi-free](https://www.npmjs.com/package/pi-free)** / **[@0xkobold/pi-ollama](https://www.npmjs.com/package/@0xkobold/pi-ollama)** are **references** for behavior, CLI shape, and compatibility testing—not mandatory runtime entrypoints.  
   - **Rationale**: Matches **`add-permission-manager`** (first-party permission layer) and avoids peer-pin churn from multiple `pi-*` packages.

3. **Free providers extension**  
   - **Choice**: Dedicated **first-party** extension module (e.g. **`extensions/free-ai-providers/`** or merged behind a clear facade) implementing provider registration, OAuth flows, and config **per** **`specs/free-ai-providers/spec.md`**. Config paths **prefer** **`~/.devopet`** / **`.devopet/`** when **`devopet-config-folders`** applies; document migration from **`~/.pi/free.json`**.

4. **Ollama extension**  
   - **Choice**: **First-party** Ollama module **per** **`specs/ollama-flex-endpoints/spec.md`**; **pi-ollama** npm is **reference only** unless a thin adapter is temporarily retained.

5. **Ollama overlap**  
   - **Choice**: **Single** “owner” for **local + custom URL + `/api/show`** (Ollama-first extension); **free catalog** MAY register cloud-only paths **without** duplicating model IDs—**validated in implementation** with `hidden_models`-style escapes documented if needed.

6. **Qwen / Kilo / NVIDIA**  
   - **Choice**: Implemented **inside** the free-providers extension (or submodules), guided by **pi-free** docs as **reference**, not as a hard dependency.

## Risks / Trade-offs

- **[More code to maintain]** vs npm re-export → **Mitigation**: modular `extensions/` layout, spec scenarios, focused tests.
- **[Drift from upstream]** → **Mitigation**: link reference versions in **COMPAT.md** as **compatibility targets**; periodic diff against upstream changelogs.
- **[OAuth / API keys]** → **Mitigation**: document `.gitignore`; never log secrets.

## Migration Plan

1. Land first-party behaviors per tasks; keep or remove npm shims per rollout.
2. Document config path migration (**`~/.pi/...`** → **`~/.devopet/...`** where applicable).
3. Rollback: revert extension entries and restore previous loader if needed.

## Open Questions

- Whether **one** combined “ai providers” extension vs **three** top-level entries yields clearer load order.
- Minimum **pi-coding-agent** version for any new `ExtensionAPI` surfaces used by in-tree code.
