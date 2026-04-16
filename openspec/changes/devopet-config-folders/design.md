## Context

devopet’s Node shim sets `PI_CODING_AGENT_DIR` to `~/.pi/agent` by default so upstream pi stores `auth.json`, `settings.json`, `sessions/`, and extension-discovered assets there. Third-party extensions (e.g. pi-permission-system) document policy files under that same tree. This change introduces **first-class devopet config directories** so product-specific files can live under **`~/.devopet`** and **`./.devopet`** without overloading the pi namespace or surprising users who share a machine with plain `pi`.

## Goals / Non-Goals

**Goals:**

- Establish **stable path constants** for devopet configuration: user-global `~/.devopet` and project-local `.devopet` (at the repository / working-project root).
- Define **precedence**: project `.devopet` overrides or merges with `~/.devopet` for the same logical config keys (exact merge rules per file type in implementation tasks).
- Provide an **environment override** for the global devopet config root (e.g. `DEVOPET_CONFIG_HOME` or documented equivalent) for containers and tests.
- Document how this relates to **`PI_CODING_AGENT_DIR`**: either unchanged for core pi state, or a phased migration—decision recorded below.

**Non-Goals:**

- Renaming the npm package or CLI binary.
- Changing upstream pi’s internal layout inside `PI_CODING_AGENT_DIR` unless explicitly required for a later migration phase.

## Decisions

1. **Default global path**  
   - **Choice**: `~/.devopet` (expand `~` / use OS home like existing agent dir code).  
   - **Alternatives**: `~/.config/devopet` (XDG) — friendlier for Linux conventions but less visible to users expecting a single top-level folder; defer XDG as optional enhancement.

2. **Default project path**  
   - **Choice**: `.devopet/` resolved from **current working directory upward** (walk parents) until a directory named `.devopet` exists or filesystem root; if none, project overlay is empty.  
   - **Alternatives**: Git root only — simpler but wrong for monorepo subpackages; walking from cwd matches “project local” intuition.

3. **Relationship to `PI_CODING_AGENT_DIR`**  
   - **Choice (recommended v1)**: Keep **`PI_CODING_AGENT_DIR` defaulting to `~/.pi/agent`** for pi core state; place **devopet-specific config files** (permissions, sandbox, profiles not owned by pi) under `~/.devopet` and `.devopet`, with adapters/extensions reading those paths.  
   - **Alternative (breaking)**: Set default `PI_CODING_AGENT_DIR` to `~/.devopet` so all pi state moves — requires migration from `~/.pi/agent` and coordinated extension updates; only if product explicitly wants single tree.

4. **Extension bridge**  
   - **Choice**: For extensions that expect `~/.pi/agent/foo.json`, provide **thin shims or documented symlinks** from devopet paths, or configure extensions via their supported env/manifest hooks where available—exact mechanism per extension in implementation.

5. **Windows**  
   - **Choice**: `%USERPROFILE%\.devopet` as the global equivalent; same walk semantics for `.devopet` folders.

## Risks / Trade-offs

- [Duplicate truth] Config in both `~/.pi/agent` and `~/.devopet` → **Mitigation**: document single source of truth per concern; migrate files in one direction over time.
- [Extension incompatibility] Upstream extension hardcodes `~/.pi/agent` → **Mitigation**: wrappers, forks, or upstream contribution; feature-flag devopet paths.
- [Discovery] Users miss `.devopet` in repos → **Mitigation**: document in README and `devopet --where` JSON if extended.

## Migration Plan

1. Ship read path: prefer `.devopet` / `~/.devopet` for new devopet-managed files; keep reading legacy locations if present (copy-on-write or fallback order in tasks).
2. Optional migration script or first-run prompt to copy known files from `~/.pi/agent` into `~/.devopet` when safe.
3. Rollback: stop resolving new paths; legacy paths remain valid if dual-read was implemented.

## Open Questions

- Exact **filenames** reserved under `~/.devopet` (flat vs `config/` subtree).
- Whether **`--where`** (or similar) should emit `devopetConfigHome` and `devopetProjectConfigDir` for debugging.
- Whether to align with **`add-permission-manager`** implementation order (config folders first vs extensions first).
