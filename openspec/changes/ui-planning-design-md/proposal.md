## Why

Building or refactoring **application UI** with coding agents works best when **design intent** is expressed in a format models read well—**Markdown design contracts**—and when **skills** teach repeatable workflows (reference imagery, iteration, inspection). **[Google Stitch’s DESIGN.md](https://stitch.withgoogle.com/docs/design-md/overview)** defines a **plain-text design system** format for design agents; **[awesome-design-md](https://github.com/VoltAgent/awesome-design-md)** curates ready-made **DESIGN.md** templates inspired by real products. **[agent-pi](https://github.com/ruizrica/agent-pi)** ships **[nano-banana](https://github.com/ruizrica/agent-pi/tree/main/skills/nano-banana)**—a skill with scripts for **image generation and response inspection** aligned with UI planning loops. devopet should **document and wire** these pieces so operators can run **UI planning functions** consistently: optional **DESIGN.md** in the repo, **skills** on the manifest path, and clear links to Stitch + community templates.

## What Changes

- **DESIGN.md contract**: Document and optionally scaffold **`DESIGN.md`** at the project root (or documented path) following **[Stitch DESIGN.md](https://stitch.withgoogle.com/docs/design-md/overview)** structure—visual theme, palette, typography, components, layout, elevation, guardrails, responsive behavior, and agent prompt guidance—so UI work aligns with **design-md** expectations. Point to **[VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)** for **copy-paste templates** and `preview.html` companions where useful.
- **Parallel to AGENTS.md**: Clarify the same mental model as awesome-design-md: **AGENTS.md** for *how to build*, **DESIGN.md** for *how it should look and feel*.
- **nano-banana skill**: Integrate or document installation of **[nano-banana](https://github.com/ruizrica/agent-pi/tree/main/skills/nano-banana)** from agent-pi (`SKILL.md`, `generate-image.js`, `inspect-response.js`, etc.) so devopet sessions can invoke **UI-oriented image generation / inspection** workflows per that skill.
- **Stitch-oriented skill**: Add or document a **Stitch / design-md** skill path—either an upstream **`npx skills add`–style** install from Google Stitch docs or a thin devopet skill that points agents at **design-md** workflows (exact package TBD in design).
- **Non-goals for v1**: Owning Stitch cloud product UI; re-hosting all of awesome-design-md inside this repo (prefer links + optional example file under `config/` or `examples/`).

## Capabilities

### New Capabilities

- `design-md-contract`: **DESIGN.md** location, Stitch-aligned sections, relationship to **AGENTS.md**, references to awesome-design-md templates.
- `ui-planning-skills`: **nano-banana** skill availability on devopet’s skills path; **Stitch design-md** skill documentation/install; verification that skills do not break `npm run check` when vendored.

### Modified Capabilities

- *(none in repository root `openspec/specs/`.)*

## Impact

- **`skills/`** directory (or `package.json` `pi.skills`), optional **`DESIGN.md`** example under `examples/` or `config/`.
- **README** / docs: UI planning section with external links.
- **Risk**: Skill scripts may assume Node paths or APIs—**pin** and test.
