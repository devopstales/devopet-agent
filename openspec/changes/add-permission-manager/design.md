## Context

- **Pi ecosystem**: **[pi-permission-system](https://www.npmjs.com/package/pi-permission-system)** upstream documents **`~/.pi/agent/pi-permissions.jsonc`**; **devopet** stores the same JSONC shape in **`~/.devopet/permissions.jsonc`** (global) and **`.devopet/permissions.jsonc`** (project) (`before_agent_start`, `tool_call`, skill input interception).
- **[pi-sandbox](https://www.npmjs.com/package/pi-sandbox)** layers **OS-level** sandboxing (e.g. bash subprocess wrapping) **and** **interactive prompts** when filesystem or network policy would block; it still **intercepts** read/write/edit-style tool calls in-process because those are not isolated by the shell sandbox. **Hooks remain mandatory** for unified permission policy; OS sandbox is **additive**, not a drop-in replacement for **`ExtensionAPI`** registration.
- **devopet today**: `extensions/security-engine/index.ts` wires the stack in a fixed order; see **Security (devopet stack)** below.

### Security (devopet stack)

Aligned with the pattern in **agent-pi** (pre-tool guard, integrity, project security sweep), devopet’s **`security-engine`** composes:

| Component | Role |
|-----------|------|
| **message-integrity-guard** | Prevents session-bricking from orphaned `tool_result` messages |
| **security-guard** | Pre-tool-hook: blocks destructive commands (e.g. `rm -rf`), `sudo`, credential theft, prompt injection |
| **permission-manager** | User-configurable **`permissions.jsonc`**: `allow` / `deny` / `ask` for tools, bash, MCP, skills, special; interactive elevation; **supersedes** npm **pi-permission-system** when this change lands |
| **secure** | `/secure` — full AI security sweep + protection installer for any project |

**Load order** in `security-engine`: integrity → guard → **permission layer** → `secure` (see `extensions/security-engine/index.ts`). **`permission-manager`** is the permission layer; it is **not** a substitute for **security-guard** (hard blocks / injection heuristics) or **message-integrity-guard** (protocol shape).

### Footer and YOLO

- **Footer**: Use Pi’s **`ctx.ui.setStatus(<key>, <text>)`** so entries appear in **`footerData.getExtensionStatuses()`** and the **dashboard** footer HUD (see **`extensions/dashboard/footer.ts`**, **`skills/pi-tui/SKILL.md`**). **`permission-manager`** publishes **`YOLO`** or **policy**; **`security-engine`** SHOULD publish short labels for **integrity**, **guard**, and **secure** (or one aggregated **`security-stack`** line) so the **Security** table above is **visible at a glance** without reading logs.
- **YOLO mode**: Absent both **`~/.devopet/permissions.jsonc`** and **`.devopet/permissions.jsonc`**, the permission layer does **not** enforce JSONC policy—**YOLO**. Other stack rows still apply.

## Goals / Non-Goals

**Goals:**

- Ship **`extensions/permission-manager`** as a **first-party** extension with **documented** registration order next to **`ai-provider-connect`** and **`security-engine`**.
- Load and validate a **main policy file** compatible with **pi-permission-system**’s documented JSONC shape (`defaultPolicy`, `tools`, `bash`, `mcp`, `skills`, `special`) so existing operator configs largely **copy-paste**.
- On enforcement paths that map to **`ask`** or **would-block**, present **pi-sandbox-like** UX: user can **abort**, **allow once**, **allow for session**, and where applicable **persist** an allow rule (exact semantics in spec—must avoid ambiguous double prompts with other extensions).
- Provide **`config/permissions.example.jsonc`** (or equivalent) and **automated tests** for parsing and critical hook paths.

**Non-goals:**

- Reimplement **full** pi-sandbox OS sandbox (`sandbox-exec`, bubblewrap) in this change—only **permission UX patterns** (prompt shape and persistence story), not kernel-level isolation.
- Treating **OS sandboxing alone** as sufficient for **permission-manager**: **in-process** tools and MCP/skills policy **must** use **`ExtensionAPI` hooks** per spec; optional bash OS sandbox does **not** remove hook registration for bash policy or prompts.
- Guarantee **byte-for-byte** compatibility with every future upstream **pi-permission-system** release—**compatibility** is **best-effort** with explicit gaps documented in **Open Questions** if discovered during implementation.

## Decisions

1. **Single enforcement path**  
   **Choice**: Implement **`permission-manager`** as the **canonical** permission extension inside devopet and **remove** the direct **`pi-permission-system`** import from **`security-engine`** once **`permission-manager`** reaches parity for devopet’s required surfaces—unless a short **transition** keeps both behind a flag (prefer **one** path for production).  
   **Rationale**: Avoid duplicate hooks, double prompts, and split audit logs.  
   **Alternative considered**: Keep npm **pi-permission-system** and add a thin “prompt shim” extension—rejected as harder to reason about and still couples to upstream release cadence for core behavior.

2. **Config location and precedence**  
   **Choice**: Global **`~/.devopet/permissions.jsonc`**; project **`.devopet/permissions.jsonc`** with **local-over-global** precedence.  
   **Rationale**: devopet-owned paths under **`.devopet/`** (see **`openspec/changes/devopet-config-folders`** / repo config docs); avoids colliding with generic **`~/.pi/agent/`** layout while keeping the same JSONC schema as **pi-permission-system**.

3. **Prompt API**  
   **Choice**: Use **`@mariozechner/pi-coding-agent` `ExtensionAPI`** surfaces already used by similar extensions (same patterns as upstream permission/sandbox integrations). Concrete API names are fixed at implementation time with references in code comments.  
   **Rationale**: Stay within supported Pi extension contracts.

4. **Ordering**  
   **Choice**: Register **`permission-manager`** so it runs in the **same relative order** as today’s permission enforcement (after **`ai-provider-connect`**, integrated with **`security-engine`** stack as designed—e.g. integrity/guard before permission decisions if those remain separate modules).  
   **Rationale**: Preserve existing security narrative; only the **permission module** swaps from npm to in-repo.

5. **Hooks vs OS sandbox**  
   **Choice**: Implement **all** policy enforcement and interactive elevation through **`ExtensionAPI` hooks** (same *class* of integration as **pi-permission-system**). Treat **pi-sandbox-style OS sandboxing** as an **optional complement** for bash subprocess isolation if ever integrated—**never** as the sole substitute for hooks on in-process tools or for evaluating **`permissions.jsonc`**.  
   **Rationale**: Agent tools run in Node; OS sandbox around bash does not gate them. Aligns with **`specs/permission-manager/spec.md`**.  
   **Alternative considered**: Rely on sandbox only—rejected: incomplete coverage and divergent UX.

6. **YOLO vs policy**  
   **Choice**: **No** `~/.devopet/permissions.jsonc` **and** no `.devopet/permissions.jsonc` → **YOLO** for the permission layer only (no `allow`/`deny`/`ask` from **`permissions.jsonc`**). After merge rules → enforce policy normally.  
   **Rationale**: Explicit operator signal in footer; avoids surprising defaults when users have no file yet.  
   **Alternative considered**: Default-deny or default-ask without a file—rejected as too disruptive for existing workflows.

7. **Footer aggregation**  
   **Choice**: **`permission-manager`** always sets **`setStatus("permission-manager", …)`** with **`YOLO`** or **policy**; implement **`security-engine`** (or **`dashboard`**) updates so **integrity / guard / secure** also appear in the same footer strip—either **one combined** string or **multiple `setStatus` keys** consumed by **`DashboardFooter`**.  
   **Rationale**: Matches operator request to “see” the full stack in the footer.

## Risks / Trade-offs

- **[Risk] Behavioral drift vs npm pi-permission-system** → **Mitigation**: Port or adapt tests; document deltas; start from upstream hook list in proposal/spec.
- **[Risk] Prompt duplication if another extension also asks** → **Mitigation**: Single loader; integration test that one user confirmation fires per gated action.
- **[Risk] Larger maintenance surface** (in-repo vs npm) → **Mitigation**: Clear module boundaries (`policy/`, `hooks/`, `prompts/`) and spec-scenario-driven tests.

## Migration Plan

1. Land **`permission-manager`** behind **feature-complete** checklist from **`tasks.md`**.
2. Update **`package.json`** extension list and **`security-engine`** to use **`permission-manager`** per **Decision 1**.
3. Operators with existing policy files: copy **`~/.pi/agent/pi-permissions.jsonc`** → **`~/.devopet/permissions.jsonc`** if migrating from upstream Pi (same JSONC body); **no format change** expected for v1 parity subset; document any unsupported keys.
4. **Rollback**: Revert extension registration and restore **`pi-permission-system`** import in **`security-engine`** (git revert or toggle—implementation may keep a short comment for emergency rollback).

## Open Questions

- Exact **persistence** format for “allow always” (append to JSONC vs separate `*.jsonl` audit file)—resolve during implementation with preference for **minimal surprise** (editable JSONC vs append-only log).
- Whether **subagent forwarding** from **pi-permission-system** is **required** in v1 or a follow-up—spec lists minimum; expand if product requires parity.
