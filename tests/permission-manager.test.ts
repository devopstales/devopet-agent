import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("permission-manager policy", () => {
	it("rejects invalid permission token with path in error", async () => {
		const { parsePolicyFile } = await import(
			pathToFileURL(join(root, "extensions/permission-manager/policy.ts")).href
		);
		assert.throws(
			() => parsePolicyFile("/tmp/bad.jsonc", '{"defaultPolicy":{"tools":"allow","bash":"allow","mcp":"allow","skills":"allow","special":"allow"},"tools":{"nope":"maybe"}}'),
			/allow\|deny\|ask/,
		);
	});

	it("merge precedence: project wins on conflicting tool key", async () => {
		const { mergePolicies, parsePolicyFile } = await import(
			pathToFileURL(join(root, "extensions/permission-manager/policy.ts")).href
		);
		const g = parsePolicyFile(
			"g.jsonc",
			`{"defaultPolicy":{"tools":"ask","bash":"ask","mcp":"ask","skills":"ask","special":"ask"},"tools":{"write":"deny","read":"allow"}}`,
		);
		const p = parsePolicyFile(
			"p.jsonc",
			`{"defaultPolicy":{"tools":"allow","bash":"ask","mcp":"ask","skills":"ask","special":"ask"},"tools":{"write":"allow"}}`,
		);
		const m = mergePolicies(g, p);
		assert.equal(m.tools.write, "allow");
		assert.equal(m.tools.read, "allow");
	});

	it("merge precedence: project toolPaths override global per glob key", async () => {
		const { mergePolicies, parsePolicyFile } = await import(
			pathToFileURL(join(root, "extensions/permission-manager/policy.ts")).href
		);
		const base = `{"defaultPolicy":{"tools":"ask","bash":"ask","mcp":"ask","skills":"ask","special":"ask"},"tools":{},"bash":{},"mcp":{},"skills":{},"special":{}`;
		const g = parsePolicyFile("g.jsonc", `${base},"toolPaths":{"write":{"/tmp/*":"deny","/other/*":"ask"}}}`);
		const p = parsePolicyFile("p.jsonc", `${base},"toolPaths":{"write":{"/tmp/*":"allow"}}}`);
		const m = mergePolicies(g, p);
		assert.equal(m.toolPaths?.write?.["/tmp/*"], "allow");
		assert.equal(m.toolPaths?.write?.["/other/*"], "ask");
	});

	it("tool path: suggestPathGlob and matchToolPathPermission", async () => {
		const { suggestPathGlob, matchToolPathPermission } = await import(
			pathToFileURL(join(root, "extensions/permission-manager/tool-path-policy.ts")).href
		);
		assert.equal(suggestPathGlob("/tmp/test.txt"), "/tmp/*.txt");
		assert.equal(suggestPathGlob("/tmp/noext"), "/tmp/*");
		const tp = { write: { "/tmp/*.txt": "allow" as const } };
		assert.equal(matchToolPathPermission(tp, "write", "/tmp/test.txt"), "allow");
		assert.equal(matchToolPathPermission(tp, "write", "/tmp/other.md"), null);
	});

	it("appendToolPathRule writes project file", async () => {
		const { appendToolPathRule, parsePolicyDocument } = await import(
			pathToFileURL(join(root, "extensions/permission-manager/policy.ts")).href
		);
		const tmp = join(root, ".tmp-perm-append-path");
		const devopet = join(tmp, ".devopet");
		mkdirSync(devopet, { recursive: true });
		const prev = process.env.HOME;
		process.env.HOME = tmp;
		try {
			appendToolPathRule("project", tmp, "write", "/tmp/*.txt", "allow");
			const raw = readFileSync(join(devopet, "permissions.jsonc"), "utf8");
			const doc = parsePolicyDocument(join(devopet, "permissions.jsonc"), raw);
			assert.equal(doc.config.toolPaths?.write?.["/tmp/*.txt"], "allow");
		} finally {
			process.env.HOME = prev;
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("no config files → default-ask policy (not YOLO)", async () => {
		const { resolveDevopetPermissionPolicy } = await import(
			pathToFileURL(join(root, "extensions/permission-manager/policy.ts")).href
		);
		const tmp = join(root, ".tmp-perm-test-default-ask");
		mkdirSync(tmp, { recursive: true });
		try {
			const prev = process.env.HOME;
			process.env.HOME = tmp;
			const r = resolveDevopetPermissionPolicy(tmp);
			assert.equal(r.kind, "policy");
			if (r.kind === "policy") {
				assert.equal(r.source, "default-ask");
				assert.equal(r.yolo, false);
			}
			process.env.HOME = prev;
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("yolo: true in file enables YOLO flag", async () => {
		const { resolveDevopetPermissionPolicy } = await import(
			pathToFileURL(join(root, "extensions/permission-manager/policy.ts")).href
		);
		const fakeHome = join(root, ".tmp-perm-yolo-flag");
		const devopet = join(fakeHome, ".devopet");
		mkdirSync(devopet, { recursive: true });
		writeFileSync(
			join(devopet, "permissions.jsonc"),
			`{ "yolo": true, "defaultPolicy": { "tools": "allow", "bash": "allow", "mcp": "allow", "skills": "allow", "special": "allow" } }\n`,
			"utf8",
		);
		const prev = process.env.HOME;
		process.env.HOME = fakeHome;
		try {
			const r = resolveDevopetPermissionPolicy(fakeHome);
			assert.equal(r.kind, "policy");
			if (r.kind === "policy") {
				assert.equal(r.yolo, true);
			}
		} finally {
			process.env.HOME = prev;
			rmSync(fakeHome, { recursive: true, force: true });
		}
	});

	it("ensureEffectivePolicyFileIfMissing seeds default-ask when absent", async () => {
		const { ensureEffectivePolicyFileIfMissing, effectivePolicyPathForTests, DEFAULT_ASK_POLICY } =
			await import(pathToFileURL(join(root, "extensions/permission-manager/policy.ts")).href);
		const tmp = join(root, ".tmp-perm-ensure-effective");
		mkdirSync(tmp, { recursive: true });
		const prev = process.env.HOME;
		process.env.HOME = tmp;
		try {
			ensureEffectivePolicyFileIfMissing();
			const eff = effectivePolicyPathForTests();
			assert.ok(existsSync(eff), `expected ${eff}`);
			const body = JSON.parse(readFileSync(eff, "utf8"));
			assert.deepEqual(body.defaultPolicy, DEFAULT_ASK_POLICY.defaultPolicy);
			ensureEffectivePolicyFileIfMissing();
			const st = readFileSync(eff, "utf8");
			assert.ok(st.length > 0, "second call must not clear file");
		} finally {
			process.env.HOME = prev;
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("policy: writes effective file when global exists", async () => {
		const { resolveDevopetPermissionPolicy, effectivePolicyPathForTests } = await import(
			pathToFileURL(join(root, "extensions/permission-manager/policy.ts")).href
		);
		const fakeHome = join(root, ".tmp-perm-test-policy");
		const devopet = join(fakeHome, ".devopet");
		mkdirSync(devopet, { recursive: true });
		const policyPath = join(devopet, "permissions.jsonc");
		writeFileSync(
			policyPath,
			`{
  "defaultPolicy": { "tools": "allow", "bash": "allow", "mcp": "allow", "skills": "allow", "special": "allow" },
  "tools": {}, "bash": {}, "mcp": {}, "skills": {}, "special": {}
}\n`,
			"utf8",
		);
		const prev = process.env.HOME;
		process.env.HOME = fakeHome;
		try {
			const r = resolveDevopetPermissionPolicy(fakeHome);
			assert.equal(r.kind, "policy");
			const eff = effectivePolicyPathForTests();
			assert.ok(existsSync(eff), `expected ${eff}`);
			const body = readFileSync(eff, "utf8");
			assert.match(body, /"tools":\s*"allow"/);
		} finally {
			process.env.HOME = prev;
			rmSync(fakeHome, { recursive: true, force: true });
		}
	});
});

describe("permission-manager extension entry", () => {
	it("exports default ExtensionAPI function", async () => {
		const mod = await import(pathToFileURL(join(root, "extensions/permission-manager/index.ts")).href);
		assert.equal(typeof mod.default, "function");
	});

	it("vendor skips repeat ask after session allow (sessionElevationKeys)", () => {
		const src = readFileSync(join(root, "extensions/permission-manager/vendor/pi-permission-extension.ts"), "utf8");
		assert.ok(
			src.includes("sessionElevationKeys.has(elevationKey)"),
			"expected session-scoped allow cache before ask prompt",
		);
	});
});
