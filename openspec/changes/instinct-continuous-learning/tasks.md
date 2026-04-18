## 1. Scaffolding

- [ ] 1.1 Add **`extensions/instinct/`** with `index.ts`, README stub, and export default extension factory; register in **`package.json`** `pi.extensions` after **`system-prompt-md`** (or immediately before if hook ordering requires instincts to see final prompt—verify in2.x).
- [ ] 1.2 Define **`lib/instinct-paths.ts`** (or colocated helpers) wrapping `getDevopetGlobalConfigDir`, `findDevopetProjectConfigDir` for `INSTINCT.md`, `instinct/` subtree, and global **`skills/`** path.

## 2. System prompt merge

- [ ] 2.1 Extend **`extensions/lib/system-prompt-md.ts`** (`needsCustomSystemPromptComposition`, `composeMarkdownSystemPrompt`) to append merged **global + project `INSTINCT.md`** with a fixed `## Instincts…` heading after **`collectAppendSegments`** output.
- [ ] 2.2 Add **unit tests** for merge order, empty files, and “instinct-only” composition (prompt rebuild must run when only `INSTINCT.md` exists).

## 3. Skill loading

- [ ] 3.1 Include **`join(getDevopetGlobalConfigDir(), "skills")`** in **`loadSkillsForSession`** when the directory exists; test with a minimal fixture skill.

## 4. Observation + scrub + storage

- [ ] 4.1 Implement **append-only observations** under **`<project>/.devopet/instinct/`** with rotation/size guard (document limits).
- [ ] 4.2 Implement **secret scrubbing** helper + tests (synthetic API key / bearer token cases).
- [ ] 4.3 Subscribe to minimal **pi extension events** sufficient for v1 (document list in code comments).

## 5. Analyzer (off critical path)

- [ ] 5.1 Implement **refresh** pipeline: read new observations → call model (reuse devopet routing) → **update `INSTINCT.md`** idempotently with a bounded section format.
- [ ] 5.2 Wire **session_shutdown** and **`/instinct refresh`** to trigger refresh; guard with **debounce** + **mutex** so concurrent runs do not corrupt files.
- [ ] 5.3 On failure, **log + notify once**; never throw from lifecycle hooks.

## 6. Operator UX + docs

- [ ] 6.1 Implement **`/instinct`** (`status`, `refresh`, `on`/`off` or env-based disable) using `pi.registerCommand`.
- [ ] 6.2 Update **`docs/devopet-config.md`** reserved table + link to a short **`docs/instinct.md`** (purpose, paths, privacy, relation to project-memory).
- [ ] 6.3 Run **`npx tsc --noEmit`** and targeted **`npm test`** slices for new tests.

## 7. Optional follow-ups (explicitly defer if out of time)

- [ ] 7.1 **Confidence scores** + feedback loop updating machine-readable store.
- [ ] 7.2 **Graduation** path from instinct lines → **`~/.devopet/skills/<name>/SKILL.md`** templates.
- [ ] 7.3 Delta spec for **`devopet-config-layout`** listing reserved instinct paths.
