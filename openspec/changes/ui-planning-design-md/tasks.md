## 1. Licensing and upstream review

- [ ] 1.1 Confirm **agent-pi** / **nano-banana** license for vendoring `skills/nano-banana/`; add **NOTICE** or header if required.
- [ ] 1.2 Read **nano-banana** `SKILL.md` and scripts; list env vars and Node version assumptions.

## 2. Skills layout

- [ ] 2.1 Add **nano-banana** under `skills/nano-banana/` (copy or submodule) **or** document `npx skills add`/equivalent; register in `package.json` `pi.skills` if not auto-discovered.
- [ ] 2.2 Add **`skills/stitch-design-md/SKILL.md`** (thin) **or** document official Stitch skill install when available; link [Stitch design-md overview](https://stitch.withgoogle.com/docs/design-md/overview).

## 3. DESIGN.md documentation and examples

- [ ] 3.1 Add README section (or `docs/ui-planning.md`): **DESIGN.md** convention, **AGENTS.md** vs **DESIGN.md**, links to Stitch + [awesome-design-md](https://github.com/VoltAgent/awesome-design-md).
- [ ] 3.2 Optional: `examples/ui-planning/DESIGN.md` minimal stub (or pointer-only) under repo license.

## 4. Verification

- [ ] 4.1 Run devopet with skills path; confirm nano-banana loads; run `npm run check` if any TS/JS in skills is exercised by tests.
- [ ] 4.2 Smoke-test one nano-banana workflow if API keys available; otherwise document skip.
