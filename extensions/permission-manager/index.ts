/**
 * **Permission policy** for devopet (`~/.devopet/permissions.jsonc`, `.devopet/permissions.jsonc`).
 *
 * **Load order (see `package.json` `pi.extensions`):**
 * - Runs **after** `extensions/ai-provider-connect` (auth) and **`extensions/security-engine`** (integrity + guard
 *   hooks must run before policy `tool_call` handlers in the extension runner).
 * - **`security-engine`** does not load npm `pi-permission-system`; this extension is the sole policy layer.
 *
 * **OS subprocess sandboxing** (e.g. pi-sandbox-style bubblewrap) is **complementary** only: in-process tools
 * (read/write/edit, MCP, skills) are **not** isolated by a shell sandbox and **must** be gated via these hooks.
 *
 * Implementation: vendored upstream `pi-permission-system` runtime (`vendor/pi-permission-extension.ts`) with
 * devopet path resolution. **Missing config files** → built-in default **ask** for all categories. **`yolo: true`**
 * in JSONC opts out (explicit only).
 */
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { ensureEffectivePolicyFileIfMissing } from "./policy.ts";
import devopetPermissionExtension from "./vendor/pi-permission-extension.ts";
import { registerYoloCommand } from "./yolo-command.ts";

export default function permissionManager(pi: ExtensionAPI): void {
	ensureEffectivePolicyFileIfMissing();
	devopetPermissionExtension(pi);
	registerYoloCommand(pi);
}
