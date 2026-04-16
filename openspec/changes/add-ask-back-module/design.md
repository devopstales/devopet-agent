## Context

- **[pi-ask-user](https://www.npmjs.com/package/pi-ask-user)** ([repo](https://github.com/edlsh/pi-ask-user)): MIT; registers tool **`ask_user`**; peers: `@mariozechner/pi-coding-agent`, `@mariozechner/pi-tui`, `@sinclair/typebox`; ships **`skills/ask-user/SKILL.md`** for decision-gating flows.
- **[@tintinweb/pi-tasks](https://www.npmjs.com/package/@tintinweb/pi-tasks)** ([repo](https://github.com/tintinweb/pi-tasks)): MIT; seven **Task*** tools, **`/tasks`**, persistent widget, file-backed store under **`.pi/tasks/`**, config **`tasks-config.json`**; **`TaskExecute`** optionally integrates with **`@tintinweb/pi-subagents`** via pi eventbus RPC.
- **devopet** already loads many extensions (dashboard, cleave, web-ui, …); new UI surfaces must not assume exclusive footer or single overlay.

## Goals / Non-Goals

**Goals:**

- Ship **pi-ask-user** and **@tintinweb/pi-tasks** as **first-class optional bundled extensions** with **pinned** versions tested against devopet’s pi stack.
- Document **install**, **load order rationale**, **env** (`PI_TASKS`, `PI_TASKS_DEBUG`), and **when to use** ask vs tasks vs both.
- Preserve upstream **standalone-mode** behavior when subagents are absent (**TaskExecute** error path).

**Non-Goals:**

- Forking either upstream package into `extensions/` for v1.
- Implementing a custom “ask-back” runtime beyond wiring and docs—**behavior** stays upstream.
- Guaranteeing **pi-subagents** in the same change unless explicitly added later.

## Decisions

1. **Dependency pinning**  
   - **Choice**: Add both packages to **`dependencies`** with versions resolved after **`npm install`** against devopet’s current **`@mariozechner/pi-coding-agent`** / **`pi-tui`**. If `@tintinweb/pi-tasks` declares **`^0.62.x`** while devopet is **`0.61.x`**, **spike** compatibility (patch range, upstream issue, or temporary docs-only install)—record outcome in tasks.  
   - **Alternative**: Git pin for pi-tasks only—higher maintenance.

2. **Extension order**  
   - **Choice**: Place **`pi-ask-user`** and **`pi-tasks`** after **core/bootstrap/auth** and **before or after dashboard** based on spike: **dashboard** should remain authoritative for **`setFooter`** if conflicts appear; task widget is **above editor** per upstream—usually orthogonal to dashboard footer.  
   - **TBD**: exact index in `pi.extensions` array after smoke.

3. **pi-subagents**  
   - **Choice (v1)**: **Do not** add **`@tintinweb/pi-subagents`** unless **`TaskExecute`** is required for a documented devopet workflow; document that **`TaskExecute`** errors without it.  
   - **Follow-up change** if users need full cascade execution.

4. **Skills/prompts**  
   - **Choice**: Rely on **upstream bundled ask-user skill** inside **`pi-ask-user`**; devopet may **duplicate a pointer** in README only—no copy unless license/loading requires.

## Risks / Trade-offs

- [Peer mismatch] Upstream requires newer pi than devopet → **Mitigation**: version spike; defer bundling one package if blocked.
- [UI clutter] Widget + overlay + dashboard → **Mitigation**: docs; optional env to disable tasks (`PI_TASKS=off`).
- [Maintenance] Two third-party extensions → **Mitigation**: semver pins; changelog watch.

## Migration Plan

1. Land dependencies + manifest entries + README section.
2. Release note: new tools and `/tasks`.
3. Rollback: remove extension entries and dependencies (users lose bundled path; can still `pi install` manually).

## Open Questions

- Exact **semver** for `@tintinweb/pi-tasks` given devopet’s **0.61.x** pi packages.
- Whether **cleave** or **dashboard** events need explicit integration hooks (likely none for v1).
