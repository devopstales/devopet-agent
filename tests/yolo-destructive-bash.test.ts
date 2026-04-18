import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("isYoloDestructiveBash", () => {
	it("flags plain rm with path", async () => {
		const { isYoloDestructiveBash } = await import(
			pathToFileURL(join(root, "extensions/permission-manager/yolo-destructive-bash.ts")).href
		);
		assert.equal(isYoloDestructiveBash("rm /tmp/test.txt"), true);
	});

	it("flags chained rm after semicolon", async () => {
		const { isYoloDestructiveBash } = await import(
			pathToFileURL(join(root, "extensions/permission-manager/yolo-destructive-bash.ts")).href
		);
		assert.equal(isYoloDestructiveBash("cd /tmp; rm ./foo"), true);
	});

	it("does not flag git rm", async () => {
		const { isYoloDestructiveBash } = await import(
			pathToFileURL(join(root, "extensions/permission-manager/yolo-destructive-bash.ts")).href
		);
		assert.equal(isYoloDestructiveBash("git rm --cached x"), false);
	});

	it("does not flag harmless bash", async () => {
		const { isYoloDestructiveBash } = await import(
			pathToFileURL(join(root, "extensions/permission-manager/yolo-destructive-bash.ts")).href
		);
		assert.equal(isYoloDestructiveBash("ls -la /tmp"), false);
	});
});
