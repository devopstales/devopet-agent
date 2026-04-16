## 1. Dependency and spike

- [ ] 1.1 Add `pi-rewind` to `package.json` `dependencies`; run `npm install`; record peer warnings.
- [ ] 1.2 Read pi-rewind `src/ui.ts`, `src/index.ts`, `src/state.ts`: determine how checkpoint count is tracked and whether **events**, **exports**, or **git refs** can drive **`DashboardFooter`** without forking `core.ts`.

## 2. Bundling

- [ ] 2.1 Register pi-rewind in `pi.extensions` with load order **before** `./extensions/dashboard` (or as required after spike).
- [ ] 2.2 Smoke-test: `/rewind`, create a checkpoint after a mutating tool, verify git refs under upstream layout.

## 3. Footer merge (option B)

- [ ] 3.1 Implement **shared-state bridge** or **thin wrapper** so **`DashboardFooter`** receives checkpoint count; add rendering in `extensions/dashboard/footer.ts` (e.g. system card or dedicated line).
- [ ] 3.2 Ensure pi-rewind’s **`ui.ts`** does not call **`setFooter`** in a way that overrides dashboard—or **disable** that path via upstream-supported option, patch, or wrapper **only if** necessary (document choice).

## 4. Keybindings and docs

- [ ] 4.1 Test **Esc+Esc**; resolve conflicts with pi-tui/dashboard.
- [ ] 4.2 README: install, `/rewind`, footer, cleave vs pi-rewind checkpoint wording; link [pi-rewind](https://github.com/arpagon/pi-rewind) and [site](https://arpagon.github.io/pi-rewind/).

## 5. Verification

- [ ] 5.1 `npm run check` if TS touched.
- [ ] 5.2 Manual: footer shows ◆ or equivalent after checkpoints; rewind + redo smoke on a small repo.
