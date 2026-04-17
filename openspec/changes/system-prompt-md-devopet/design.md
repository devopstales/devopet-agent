## Context

[pi-mono `coding-agent`](https://github.com/badlogic/pi-mono) documents JSON [settings](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/settings.md) with global `~/.pi/agent/settings.json` and project `.pi/settings.json`, with project overrides and nested merge. Operators want **Markdown files** to control the **system prompt**: a **full replace** via **`SYSTEM.md`** and **additive** content via **`APPEND_SYSTEM.md`**, matching common “prompt as file” workflows.

devopet already maintains **`~/.devopet`** / **`.devopet`** for product-scoped configuration (see `devopet-config-folders` / `devopet-config-layout` main spec) and deploys **`AGENTS.md`** via `extensions/defaults.ts`. System prompt files are **orthogonal** to **`AGENTS.md`** (context injection vs model system prompt), but should use the same **path discipline** so operators are not forced to store devopet-owned defaults only under **`~/.pi/agent`**.

Implementation will likely touch **upstream pi** (`@mariozechner/pi-coding-agent` or future pi-mono alignment), **devopet path resolution** (`getDevopetGlobalConfigDir`, project `.devopet` walk), and **defaults/bootstrap** for **`~/.devopet/SYSTEM.md`**.

## Goals / Non-Goals

**Goals:**

- Document and implement **replace** and **append** semantics for **`SYSTEM.md`** and **`APPEND_SYSTEM.md`** for **pi-relative** roots (`.pi/`, `~/.pi/agent/`) consistent with pi-mono intent.
- Provide **equivalent** files under **`~/.devopet`** and **`<project>/.devopet`** for devopet sessions, with **documented composition** versus the pi tree.
- **Bootstrap** a starter **`~/.devopet/SYSTEM.md`** on first use (when the global devopet directory is ensured), without overwriting user edits (marker/hash guard pattern like `AGENTS.md`).
- Place **devopet `settings.json`** under **`~/.devopet/settings.json`** and **`.devopet/settings.json`**, with merge behavior aligned with [settings.md](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/settings.md) (project over global; nested object merge) **within the devopet layer**, and a **documented** interaction with **`~/.pi/agent/settings.json`** / **`.pi/settings.json`**.

**Non-Goals:**

- Redefining **`AGENTS.md`** / **`CLAUDE.md`** discovery (unchanged unless upstream changes).
- Changing **model API** or **provider** behavior beyond system prompt assembly.
- Full migration of **all** `~/.pi/agent` state into `~/.devopet` in this change (only prompt-related files and settings locations in scope).

## Decisions

1. **Filename contract**  
   Use exactly **`SYSTEM.md`** and **`APPEND_SYSTEM.md`** in each root (pi and devopet). No alternate spellings in v1.

2. **Replace resolution (per tree)**  
   For a given root family (pi vs devopet), **project** `SYSTEM.md` **wins** over **global** `SYSTEM.md` when both exist: if `<project>/.pi/SYSTEM.md` exists, it replaces the default; else if `~/.pi/agent/SYSTEM.md` exists, it replaces; else built-in default. Same pattern for **`.devopet`** / **`~/.devopet`**.

3. **Append resolution**  
   **Append** files **do not** remove the built-in default. If a **replace** file exists, append segments apply **after** the replaced base (order documented in spec). **Global** append **then** **project** append for each tree unless a scenario requires project-only override—default stack: `global APPEND` + `project APPEND`.

4. **Cross-tree composition (pi vs devopet)**  
   **Default:** Apply **pi-relative** `SYSTEM.md` / `APPEND_SYSTEM.md` first (upstream semantics), then apply **devopet** `SYSTEM.md` as an **additional replace layer** only if devopet’s file exists—**avoid double replace conflict** by defining: devopet **`SYSTEM.md`** MAY **replace** the **effective** prompt **after** pi composition **or** be defined as “devopet overlay” that **replaces only** when pi has no `SYSTEM.md`—**Decision:** Prefer **single effective replace** per session: **if** devopet project/global `SYSTEM.md` exists, **documented precedence** chooses whether devopet or pi wins; **recommended:** **project `.devopet/SYSTEM.md` > `~/.devopet/SYSTEM.md` > project `.pi/SYSTEM.md` > `~/.pi/agent/SYSTEM.md` > built-in** for the **replace** slot, so one winning file. **Append** files from **both** trees concatenate in documented order (e.g. pi global append, pi project append, devopet global append, devopet project append).

5. **Bootstrap `~/.devopet/SYSTEM.md`**  
   When devopet ensures **`~/.devopet`** exists, if **`SYSTEM.md`** is missing, write a **minimal template** with `<!-- managed by devopet -->` (or equivalent) and hash guard; user removal of marker opts out of auto-updates.

6. **Settings paths**  
   Treat **`~/.devopet/settings.json`** and **`.devopet/settings.json`** as the devopet settings layer. Merge **with** pi settings using the same nested merge rules as [settings.md](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/settings.md): document **order** (e.g. pi project → pi global → devopet project → devopet global, or devopet overrides pi for same keys—pick one and stick to it). **Recommendation:** **Pi global < Pi project < devopet global < devopet project** for conflicting keys so repo-local `.devopet` wins for devopet-specific toggles.

## Risks / Trade-offs

- **[Risk] Upstream pi does not yet expose file-based system prompt hooks** → **Mitigation:** implement in devopet fork/extension with feature flag; or contribute upstream to pi-mono first.
- **[Risk] Two trees (pi + devopet) confuse operators** → **Mitigation:** one matrix table in docs; clear “winning file” for replace.
- **[Risk] Bootstrap writes unwanted content** → **Mitigation:** empty or comment-only template; hash guard; marker opt-out.

## Migration Plan

1. Ship docs + path resolution behind feature flag if needed.  
2. No forced migration of existing prompts; new files are opt-in.  
3. Rollback: ignore devopet `SYSTEM.md` if flag off.

## Open Questions

- Exact **public API** in `@mariozechner/pi-coding-agent` for injecting assembled system prompt (verify during implementation).
- Whether **pi-mono** lands **`SYSTEM.md`** before devopet—track upstream and reduce duplication.
