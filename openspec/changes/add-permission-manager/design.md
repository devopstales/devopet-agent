## Context

devopet is a pi distribution: the Node shim injects bundled `extensions/*` and upstream `@mariozechner/pi-coding-agent`. **pi-permission-system** provides **policy** (allow/deny/ask). **[agent-pi](https://github.com/ruizrica/agent-pi)** **security-guard** ([source](https://github.com/ruizrica/agent-pi/blob/main/extensions/security-guard.ts)) adds **deterministic blocking** of known-bad **bash** patterns, **content redaction** for injections in tool outputs, and **prompt hardening**—overlapping but not identical to permission policy (guard = **always block** certain classes unless policy file relaxes; pi-permission = **user policy**).

**pi-connect** remains the **`/connect`** UX. **secure** and **message-integrity-guard** are separate agent-pi extensions in the same security story.

## Goals / Non-Goals

**Goals:**

- Ship **security-guard**, **secure**, and **message-integrity-guard** behaviors as in agent-pi (via **vendor** or **submodule**), adapted only for devopet paths if needed.
- Document **ordering**: **security-guard tool_call** typically runs **before** tool execution; **pi-permission-system** may **ask**—define **precedence** (block wins over ask for same tool call if both fire—**TBD** exact order in implementation).
- Preserve **backward compatibility**: security extensions **opt-in** or **soft defaults** if upstream uses permissive defaults.

**Non-Goals:**

- Rewriting **security-engine** from scratch without reading upstream.
- Guaranteeing zero false positives on all legitimate developer workflows.

## Decisions

1. **Primary integration — pi-permission-system** — *unchanged.*

2. **pi-connect** — *unchanged.*

3. **Sandbox — pi-sandbox** — *unchanged.*

4. **agent-pi security packaging**  
   - **Choice**: **Vendor** `extensions/security-guard.ts`, **`extensions/secure`** (or single file), **`extensions/message-integrity-guard`** plus **`extensions/lib/security-engine.ts`** (and any imports) from **agent-pi** at a **pinned commit**, with **LICENSE** attribution and **NOTICE** file if required.  
   - **Alternative**: **Git submodule** `third_party/agent-pi` and TypeScript path aliases—higher complexity.

5. **Hook ordering**  
   - **Choice**: Load **message-integrity-guard** early if it repairs session state; **security-guard** on **tool_call** before subprocess; **pi-permission-system** hooks per upstream—document final order after integration test.

6. **Configuration**  
   - **Choice**: Support **`.pi/security-policy.yaml`** as in security-guard header comment; merge with **pi-permissions.jsonc** only at documentation level (**two files**, distinct purposes).

7. **Version alignment**  
   - **Choice**: Pin **pi-connect**, **pi-permission-system**, optional **pi-sandbox**, and **agent-pi** vendored snapshot to compatible **`pi-coding-agent` / `pi-tui`** peers.

## Risks / Trade-offs

- [Dual systems] Users confused by **permission** vs **guard** → **Mitigation**: README matrix: “Policy = your rules; Guard = baseline hard blocks.”
- [Merge pain] Upstream agent-pi updates → **Mitigation**: document cherry-pick process.
- [Slash flood] `/security`, `/secure`, `/connect` → **Mitigation**: single security section in docs.

## Migration Plan

1. Vendor security files; wire `pi.extensions`; run smoke tests: blocked `rm -rf`, `/secure` dry run, session with tool results.
2. Release note: new files under `.pi/`, security vs permissions.

## Open Questions

- Whether **secure** extension depends on **npm packages** beyond pi—audit **package.json** in agent-pi root.
- Exact **interaction** when **pi-permission-system** says **allow** but **security-guard** says **block**—spec: **block wins** for safety unless policy explicitly disables guard category.
