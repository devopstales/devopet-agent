## Context

- **[Stitch DESIGN.md](https://stitch.withgoogle.com/docs/design-md/overview)** — Google’s docs for a **Markdown design system** file consumed by design agents.
- **[awesome-design-md](https://github.com/VoltAgent/awesome-design-md)** — Curated **DESIGN.md** files + previews; MIT license; “drop into project root.”
- **[nano-banana](https://github.com/ruizrica/agent-pi/tree/main/skills/nano-banana)** — Skill under **agent-pi** with `SKILL.md` and Node helpers (`generate-image.js`, `inspect-response.js`, `test-runner.js`); intended for agent-driven image/UI workflows.

devopet already has **`pi.skills`** in `package.json` pointing at `./skills`; **render** and **web-ui** extensions exist for visualization—this change is about **planning** artifacts and **skills**, not replacing the render stack.

## Goals / Non-Goals

**Goals:**

- **Single convention**: `DESIGN.md` at repo root (or documented alternative) for web/app UI projects using devopet.
- **Skills discoverable**: **nano-banana** available without manual path hacks when bundled or documented.
- **Citable docs**: Link Stitch + awesome-design-md from first-party README.

**Non-Goals:**

- Full **Stitch** product integration (cloud); **local** DESIGN.md + agent skills only unless upstream provides a drop-in skill package.

## Decisions

1. **nano-banana packaging**  
   - **Choice**: **Vendor** `skills/nano-banana/` subtree from agent-pi (preserve LICENSE attribution) **or** `git submodule` / documented `npx skills add` from URL—**prefer vendored copy** under `skills/nano-banana/` for reproducible installs if license allows. **Verify** Apache-2.0 vs MIT on agent-pi before copy.  
   - **Alternative**: Document-only pointer to GitHub (weaker UX).

2. **Stitch skill**  
   - **Choice**: If Google publishes an **npm/git skill** for Stitch, add to docs; otherwise add **`skills/stitch-design-md/`** stub **SKILL.md** that instructs agents to read **`DESIGN.md`** per Stitch overview and awesome-design-md—**no false claim** of official Google package.

3. **Example DESIGN.md**  
   - **Choice**: Add **minimal** `examples/ui-planning/DESIGN.md` or link-only—avoid bloating repo; optional **one** template from awesome-design-md **with license header**.

4. **AGENTS.md**  
   - **Choice**: If devopet deploys **AGENTS.md** via defaults, add **one paragraph** in docs: “For UI-heavy work, add **DESIGN.md** per Stitch.”

## Risks / Trade-offs

- [License] Copying from agent-pi or VoltAgent → **Mitigation**: SPDX headers, CONTRIBUTING note.
- [Skill drift] nano-banana updates upstream → **Mitigation**: pin commit in tasks; periodic bump.

## Migration Plan

1. Land docs + optional skills + example.
2. No breaking change to runtime.

## Open Questions

- **agent-pi** license file for nano-banana reuse.
- Whether **image generation** in nano-banana requires API keys—document env vars in skill README excerpt.
