## Context

- devopet already composes system prompts in **`extensions/lib/system-prompt-md.ts`** (`composeMarkdownSystemPrompt` → `buildSystemPrompt` with `customPrompt`, `appendSystemPrompt`, `skills`, `contextFiles`).
- **Project-memory** (`extensions/project-memory`) persists **facts, episodes, and graph** under **`.devopet/memory/`**; it is optimised for retrieval and lifecycle, not for a **continuous “earn instincts from behaviour”** loop.
- **[pi-continuous-learning](https://www.npmjs.com/package/pi-continuous-learning)** demonstrates: **observations (JSONL) → analyzer (LLM) → instincts (scored) → prompt injection → feedback**; devopet should adopt the **ideas** (tiers, scrubbing, budgets) while owning **storage and integration** under **`~/.devopet`** / **`<project>/.devopet`**.

## Goals / Non-Goals

**Goals:**

- **Separate extension** with a clear boundary from project-memory: **instincts** are *behavioural conventions and workflows* distilled from sessions, not the canonical fact store.
- **Artifacts** the operator can inspect and version optionally:
  - **`~/.devopet/INSTINCT.md`** (global) and **`<project>/.devopet/INSTINCT.md`** (project).
  - **`~/.devopet/skills/`** for **graduated** or hand-maintained skills (same format as repo `skills/` where possible).
  - **Observations** in devopet-scoped paths (exact names in implementation; prefer **`.devopet/instinct/`** subtree to avoid cluttering the `.devopet` root).
- **System prompt**: **merge `INSTINCT.md` content** into the final prompt in a **fixed, documented order** (see Decisions).
- **Safety**: **secret scrubbing** on observation append; **best-effort** analyzer; **no hard dependency** on network for core path.
- **Composability**: Works when `INSTINCT.md` is empty; degrades if analyzer unavailable.

**Non-Goals (v1):**

- Parity feature-for-feature with pi-continuous-learning npm package (no requirement to bundle it).
- Replacing project-memory or merging instinct DB into `facts.db`.
- Guaranteed real-time analysis on every tool call (batch / end-of-turn / session hooks are acceptable per tasks).

## Decisions

1. **Extension name & location** — New directory **`extensions/instinct/`** (or `extensions/continuous-learning/`; pick one in implementation; proposal uses “instinct” as the user-facing term). Single `index.ts` default export registering hooks, commands, and optional tools.

2. **Path layout (canonical)**  
   - **Global config root**: `getDevopetGlobalConfigDir()` (already honours `DEVOPET_CONFIG_HOME`).  
   - **Project config root**: `findDevopetProjectConfigDir(cwd) ?? join(cwd, ".devopet")` (consistent with project-memory).  
   - **Suggested tree**:
     - `~/.devopet/INSTINCT.md` — rendered markdown for prompt merge.  
     - `~/.devopet/skills/` — skill files for loader.  
     - `<project>/.devopet/INSTINCT.md` — optional override / augmentation file.  
     - `<project>/.devopet/instinct/observations.jsonl` (or split global vs project; **default: project-scoped observations** so multi-repo isolation is preserved).  
   - **Machine-readable instinct store** (JSON/SQLite) is **optional in v1**; if the first milestone only maintains `INSTINCT.md`, state that in tasks; otherwise a small `instincts.jsonl` under the same subtree is preferred over scattering files in `~/.devopet` root.

3. **System prompt merge order** — Extend **`composeMarkdownSystemPrompt`** so that **after** existing `appendSegments` from `collectAppendSegments(cwd)` are joined, the composer **appends one or two instinct sections** in this order:
   1. Global `INSTINCT.md` (if non-empty).  
   2. Project `INSTINCT.md` (if non-empty).  
   Use a visible heading in the injected text, e.g. `## Instincts (learned behaviours)`, so models distinguish it from operator `APPEND_SYSTEM.md`.  
   **Update `needsCustomSystemPromptComposition`** to return `true` when either instinct file exists (even if other markdown layers are absent—avoid falling back to pi-only composition and dropping instincts).

4. **Skill loading** — Ensure **`~/.devopet/skills/`** is included in the skill discovery path used for `loadSkillsForSession` / pi resource loading:
   - **Preferred**: extend **`loadSkillsForSession`** in `system-prompt-md.ts` (or shared helper) to append `join(getDevopetGlobalConfigDir(), "skills")` when that directory exists, keeping **bundled `skills/`** and **`includeDefaults: true`** unchanged.  
   - **Alternative**: document `pi.skills` extra path in `package.json`—less ideal because it is static, not user-home aware without merge layer.

5. **Analyzer & LLM** — **v1** MAY use **existing devopet model-routing / cheapest tier** for a **bounded** “distill observations → update `INSTINCT.md`” job; **no new npm dependency** unless a later task proves we need pi-continuous-learning internals. Run analyzer **off the critical path** (session end, `/instinct refresh`, or debounced background).

6. **Relation to project-memory** — **No cross-write in v1.** Optional future hook: emit a **memory_store** candidate when an instinct graduates with high confidence (out of scope unless a task explicitly adds it).

## Risks / Trade-offs

- **[Risk] Prompt bloat** → Mitigation: token **budget** for instinct injection (truncate by section or confidence ordering in later iteration); start with “full file under N chars” guard.  
- **[Risk] PII / secrets in observations** → Mitigation: scrub patterns (reuse ideas from pi-continuous-learning); never log raw env; tests with synthetic secrets.  
- **[Risk] Conflicting instructions** → Mitigation: explicit heading; document precedence (**project `INSTINCT.md` after global**); operators edit markdown directly.  
- **[Risk] Duplicate learning vs memory** → Mitigation: docs position instincts as **procedural**; memory as **factual / episodic**.

## Migration Plan

- **Greenfield**: extension creates dirs on first run; empty `INSTINCT.md` optional (don’t force).  
- **Existing users**: no breaking change to project-memory paths; instinct subtree is additive.  
- **Rollback**: disable extension in `package.json` or env flag; remove instinct files if undesired.

## Open Questions

- Exact **observation schema** and which **pi extension events** to subscribe to (`tool_result`, `message_end`, etc.)—resolve during implementation with a minimal v1 set.  
- Whether v1 ships **confidence scores** only in machine file or also inline in `INSTINCT.md` (markdown tables vs prose).  
- Whether to add a **delta** to `openspec/specs/devopet-config-layout` listing `INSTINCT.md` and `instinct/` as reserved—can be a fast follow after this change lands.
