/**
 * Security stack: **message-integrity-guard** → **security-guard** → **`/secure`**.
 *
 * Policy (`allow` / `deny` / `ask`) lives in **`extensions/permission-manager`** (devopet `permissions.jsonc`).
 * **`pi-connect`** / **`ai-provider-connect`** loads before this stack (see `ai-provider-extensions` OpenSpec).
 *
 * Footer keys: **`message-integrity`**, **`security`** (guard), **`permission-manager`** (permission extension), **`secure`**.
 */
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import messageIntegrityGuard from "./message-integrity-guard.ts";
import securityGuard from "./security-guard.ts";
import secure from "./secure.ts";

export default function securityEngine(pi: ExtensionAPI): void {
	messageIntegrityGuard(pi);
	securityGuard(pi);
	secure(pi);

	pi.on("session_start", (_event, ctx) => {
		if (!ctx.hasUI) {
			return;
		}
		ctx.ui.setStatus("message-integrity", "ok");
		ctx.ui.setStatus("secure", "ready");
	});
}
