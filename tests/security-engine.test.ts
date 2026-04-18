import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const securityEngineIndex = join(root, "extensions/security-engine/index.ts");
const bin = join(root, "bin/devopet-agent.mjs");

describe("security-engine bundle (add-permission-manager)", () => {
	it("lists a single security-engine entry in package.json pi.extensions", () => {
		const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
			pi?: { extensions?: string[] };
		};
		const exts = pkg.pi?.extensions ?? [];
		const security = exts.filter((p) => p.includes("security-engine"));
		assert.equal(security.length, 1, "expected exactly one security-engine manifest entry");
		assert.ok(
			exts.includes("./extensions/security-engine/index.ts"),
			"expected ./extensions/security-engine/index.ts",
		);
		assert.ok(
			exts.includes("./extensions/permission-manager/index.ts"),
			"expected ./extensions/permission-manager/index.ts",
		);
		const pm = exts.indexOf("./extensions/permission-manager/index.ts");
		const se = exts.indexOf("./extensions/security-engine/index.ts");
		assert.ok(pm >= 0 && se >= 0 && se < pm, "security-engine (guard) should load before permission-manager");
	});

	it("resolves pi-permission-system under node_modules (permission-manager vendor)", () => {
		const entry = join(root, "node_modules/pi-permission-system/index.ts");
		assert.ok(existsSync(entry), `missing pi-permission-system — run npm install`);
	});

	it("does not load the pi-connect package (owned by ai-provider-connect)", () => {
		const src = readFileSync(securityEngineIndex, "utf8");
		assert.ok(
			!src.includes("node_modules/pi-connect"),
			"security-engine must not import pi-connect",
		);
	});

	it("does not import npm pi-permission-system (permission-manager owns policy)", () => {
		const src = readFileSync(securityEngineIndex, "utf8");
		assert.ok(
			!src.includes("pi-permission-system"),
			"security-engine must not load pi-permission-system",
		);
	});

	it("composes vendored guards and /secure in a fixed order (policy is permission-manager extension)", () => {
		const src = readFileSync(securityEngineIndex, "utf8");
		const integrity = src.indexOf("messageIntegrityGuard(pi)");
		const guard = src.indexOf("securityGuard(pi)");
		const secure = src.indexOf("secure(pi)");
		assert.ok(integrity >= 0 && guard >= 0 && secure >= 0);
		assert.ok(integrity < guard, "integrity before guard");
		assert.ok(guard < secure, "guard before /secure");
	});

	it("documents rm -rf-class blocking in security-engine lib (regression anchor)", () => {
		const lib = join(root, "extensions/security-engine/lib/security-engine.ts");
		const text = readFileSync(lib, "utf8");
		assert.match(text, /rm\s*-rf/);
	});

	it("supports deny write in policy JSON (operator copies example)", () => {
		const policy = JSON.parse(
			`{"defaultPolicy":{"tools":"ask"},"tools":{"write":"deny"},"bash":{},"mcp":{},"skills":{},"special":{}}`,
		);
		assert.equal(policy.tools.write, "deny");
	});

	it("loadPolicy reads project .devopet/security-policy.yaml before .pi", async () => {
		const { loadPolicy } = await import(
			pathToFileURL(join(root, "extensions/security-engine/lib/security-engine.ts")).href
		);
		const tmp = mkdtempSync(join(tmpdir(), "devopet-guard-pol-"));
		try {
			mkdirSync(join(tmp, ".devopet"), { recursive: true });
			mkdirSync(join(tmp, ".pi"), { recursive: true });
			writeFileSync(
				join(tmp, ".devopet", "security-policy.yaml"),
				[
					"blocked_commands: []",
					"exfiltration_patterns: []",
					"protected_paths: []",
					"prompt_injection_patterns: []",
					"allowlist:",
					"  commands: []",
					"  paths: []",
					"settings:",
					"  enabled: false",
					"  audit_log_max_bytes: 1048576",
					"  strip_injections: true",
					"  verbose_blocks: true",
					"",
				].join("\n"),
				"utf8",
			);
			writeFileSync(
				join(tmp, ".pi", "security-policy.yaml"),
				[
					"blocked_commands: []",
					"exfiltration_patterns: []",
					"protected_paths: []",
					"prompt_injection_patterns: []",
					"allowlist:",
					"  commands: []",
					"  paths: []",
					"settings:",
					"  enabled: true",
					"  audit_log_max_bytes: 1048576",
					"  strip_injections: true",
					"  verbose_blocks: true",
					"",
				].join("\n"),
				"utf8",
			);
			const p = loadPolicy(tmp);
			assert.equal(p.settings.enabled, false, "expected .devopet policy to win over .pi");
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("smoke: devopet --where exits 0 (no interactive session)", () => {
		const emptyCwd = mkdtempSync(join(tmpdir(), "devopet-se-"));
		try {
			const result = spawnSync(process.execPath, [bin, "--where"], {
				cwd: emptyCwd,
				encoding: "utf8",
				env: { ...process.env, PI_CODING_AGENT_DIR: undefined },
			});
			assert.equal(result.status, 0, result.stderr);
			const data = JSON.parse(result.stdout) as { devopetRoot: string };
			assert.equal(resolve(data.devopetRoot), resolve(root));
		} finally {
			rmSync(emptyCwd, { recursive: true, force: true });
		}
	});
});
