import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";

function buildFakePi() {
	const commands = new Map<
		string,
		{ handler: (args: string, ctx: ExtensionCommandContext) => Promise<void> }
	>();
	return {
		registerCommand(
			name: string,
			config: { handler: (args: string, ctx: ExtensionCommandContext) => Promise<void> },
		) {
			commands.set(name, config);
		},
		_commands: commands,
	};
}

let register: (pi: ReturnType<typeof buildFakePi>) => void;

before(async () => {
	const mod = await import("./stop-command.ts");
	register = mod.default as unknown as typeof register;
});

describe("stop-command extension", () => {
	it("registers /stop and runs abort + waitForIdle", async () => {
		const api = buildFakePi();
		register(api as never);

		const cmd = api._commands.get("stop");
		assert.ok(cmd, "/stop should be registered");

		let aborted = false;
		let waited = false;
		const ctx = {
			hasUI: true,
			abort() {
				aborted = true;
			},
			async waitForIdle() {
				waited = true;
			},
			ui: { notify: (_m: string, _t?: string) => {} },
		} as unknown as ExtensionCommandContext;

		await cmd.handler("", ctx);
		assert.equal(aborted, true);
		assert.equal(waited, true);
	});
});
