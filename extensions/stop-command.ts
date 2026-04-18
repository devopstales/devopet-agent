/**
 * Registers /stop — best-effort abort of the in-flight turn via the same extension
 * cancel path as Esc (ctx.abort → AgentSession.abort).
 */

import type { ExtensionAPI, ExtensionCommandContext } from "@mariozechner/pi-coding-agent";

export default function stopCommandExtension(pi: ExtensionAPI): void {
	pi.registerCommand("stop", {
		description: "Best-effort stop of the current model turn (streaming and cancellable tools)",
		handler: async (_args, ctx: ExtensionCommandContext) => {
			ctx.abort();
			await ctx.waitForIdle();
			if (ctx.hasUI) {
				ctx.ui.notify("Stop requested (best-effort).", "info");
			}
		},
	});
}
