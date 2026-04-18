import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const connectIndex = join(root, "extensions/ai-provider-connect/index.ts");

describe("ai-provider-connect (/connect — reference: pi-connect)", () => {
	it("is listed in package.json immediately after 01-auth (before downstream extensions)", () => {
		const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
			pi?: { extensions?: string[] };
		};
		const exts = pkg.pi?.extensions ?? [];
		const iAuth = exts.indexOf("./extensions/01-auth");
		const iConnect = exts.indexOf("./extensions/ai-provider-connect/index.ts");
		assert.ok(iAuth >= 0 && iConnect >= 0);
		assert.ok(iAuth < iConnect, "expected 01-auth < ai-provider-connect (connect before most of the stack)");
	});

	it("resolves pi-connect entry under node_modules when npm bootstrap is used", () => {
		const entry = join(root, "node_modules/pi-connect/index.ts");
		assert.ok(existsSync(entry), `missing pi-connect — run npm install (transitional loader per ai-provider-extensions tasks)`);
	});

	it("connect extension does not import permission-system", () => {
		const src = readFileSync(connectIndex, "utf8");
		assert.match(src, /connect/i);
		assert.ok(!src.includes("pi-permission-system"), "ai-provider-connect must not load pi-permission-system");
	});
});
