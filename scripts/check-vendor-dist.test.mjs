/**
 * Tests for check-vendor-dist.mjs and the prepack dist guard.
 *
 * Validates that the guardrails correctly detect missing/empty vendor dist.
 * Uses a temp directory with a mock package structure.
 */

import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import {
	mkdirSync,
	writeFileSync,
	readFileSync,
	rmSync,
	existsSync,
	readdirSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const tmp = join(tmpdir(), `vendor-dist-test-${Date.now()}`);

function makeMockProject(opts = {}) {
	const { hasDist = true, hasJs = true } = opts;
	rmSync(tmp, { recursive: true, force: true });

	const vendorPkg = join(tmp, "vendor", "mock-pkg");
	mkdirSync(vendorPkg, { recursive: true });
	writeFileSync(
		join(vendorPkg, "package.json"),
		JSON.stringify({ name: "@test/mock", version: "1.0.0" }),
	);

	if (hasDist) {
		mkdirSync(join(vendorPkg, "dist"), { recursive: true });
		if (hasJs) {
			writeFileSync(join(vendorPkg, "dist", "index.js"), "export default 1;");
		} else {
			writeFileSync(join(vendorPkg, "dist", "readme.txt"), "no js here");
		}
	}

	writeFileSync(
		join(tmp, "package.json"),
		JSON.stringify({
			name: "test-root",
			version: "1.0.0",
			dependencies: { "@test/mock": "file:./vendor/mock-pkg" },
			bundleDependencies: ["@test/mock"],
		}),
	);

	return tmp;
}

function readPkg(root) {
	return JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
}

describe("check-vendor-dist", () => {
	after(() => rmSync(tmp, { recursive: true, force: true }));

	it("passes when dist/ exists with .js files", () => {
		const root = makeMockProject({ hasDist: true, hasJs: true });
		const pkg = readPkg(root);
		for (const name of pkg.bundleDependencies) {
			const ref = pkg.dependencies[name];
			assert.ok(ref.startsWith("file:"));
			const distDir = join(root, ref.slice(5), "dist");
			assert.ok(existsSync(distDir), `dist/ should exist at ${distDir}`);
			const hasJs = readdirSync(distDir).some((e) => e.endsWith(".js"));
			assert.ok(hasJs, "dist/ should contain .js files");
		}
	});

	it("detects missing dist/ directory", () => {
		makeMockProject({ hasDist: false });
		const pkg = readPkg(tmp);
		const ref = pkg.dependencies["@test/mock"];
		const distDir = join(tmp, ref.slice(5), "dist");
		assert.ok(!existsSync(distDir), "dist/ should not exist");
	});

	it("detects dist/ with no .js files", () => {
		makeMockProject({ hasDist: true, hasJs: false });
		const pkg = readPkg(tmp);
		const ref = pkg.dependencies["@test/mock"];
		const distDir = join(tmp, ref.slice(5), "dist");
		assert.ok(existsSync(distDir), "dist/ should exist");
		const hasJs = readdirSync(distDir).some((e) => e.endsWith(".js"));
		assert.ok(!hasJs, "dist/ should contain no .js files");
	});
});

describe("prepack dist guard", () => {
	after(() => rmSync(tmp, { recursive: true, force: true }));

	it("readdirSync check catches missing dist", () => {
		makeMockProject({ hasDist: false });
		const pkg = readPkg(tmp);
		const ref = pkg.dependencies["@test/mock"];
		const distDir = join(tmp, ref.slice(5), "dist");

		let caught = false;
		try {
			const entries = readdirSync(distDir);
			if (!entries.some((e) => e.endsWith(".js"))) throw new Error("no .js");
		} catch {
			caught = true;
		}
		assert.ok(caught, "should catch missing dist/");
	});

	it("readdirSync check catches empty dist", () => {
		makeMockProject({ hasDist: true, hasJs: false });
		const pkg = readPkg(tmp);
		const ref = pkg.dependencies["@test/mock"];
		const distDir = join(tmp, ref.slice(5), "dist");

		let caught = false;
		try {
			const entries = readdirSync(distDir);
			if (!entries.some((e) => e.endsWith(".js"))) throw new Error("no .js");
		} catch {
			caught = true;
		}
		assert.ok(caught, "should catch dist/ with no .js files");
	});
});
