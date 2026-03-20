/**
 * Tests for omegon-subprocess — native agent binary resolution.
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import * as assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { resolveOmegonSubprocess, resolveNativeAgent, _clearNativeAgentCache } from "./omegon-subprocess.ts";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..");

describe("resolveOmegonSubprocess", () => {
	it("resolves to node + bin/omegon-pi.mjs", () => {
		const spec = resolveOmegonSubprocess();
		assert.ok(spec.command, "command should be set");
		assert.ok(spec.omegonEntry.endsWith("bin/omegon-pi.mjs"), `expected omegon-pi.mjs, got: ${spec.omegonEntry}`);
		assert.ok(spec.argvPrefix.length > 0, "argvPrefix should have at least one entry");
	});
});

describe("resolveNativeAgent", () => {
	beforeEach(() => {
		_clearNativeAgentCache();
	});

	afterEach(() => {
		_clearNativeAgentCache();
		delete process.env.OMEGON_AGENT_BINARY;
	});

	it("returns correct shape when binary found", () => {
		const result = resolveNativeAgent();
		// Can't assert null because the dev build or PATH might exist
		if (result) {
			assert.ok(result.binaryPath, "binaryPath should be set");
			assert.ok(result.bridgePath, "bridgePath should be set");
			assert.ok(existsSync(result.binaryPath), "binary should exist");
			assert.ok(result.bridgePath.endsWith("llm-bridge.mjs"), "bridge should be llm-bridge.mjs");
			assert.equal(typeof result.hasNativeProviders, "boolean", "hasNativeProviders should be boolean");
		}
	});

	it("respects OMEGON_AGENT_BINARY env var", () => {
		// Try both binary names (omegon and omegon-agent)
		for (const name of ["omegon", "omegon-agent"]) {
			const devBinary = join(repoRoot, "core", "target", "release", name);
			if (existsSync(devBinary)) {
				process.env.OMEGON_AGENT_BINARY = devBinary;
				_clearNativeAgentCache();

				const result = resolveNativeAgent();
				assert.ok(result, "should resolve when env var points to existing binary");
				assert.equal(result!.binaryPath, devBinary);
				assert.ok(result!.bridgePath.includes("llm-bridge.mjs"));
				return;
			}
		}
		// No binary built — skip
	});

	it("finds local development build with omegon name", () => {
		const devBinary = join(repoRoot, "core", "target", "release", "omegon");
		if (!existsSync(devBinary)) return;

		const result = resolveNativeAgent();
		assert.ok(result, "should find the dev build");
		assert.equal(result!.binaryPath, devBinary);
	});

	it("falls back to omegon-agent name", () => {
		const newName = join(repoRoot, "core", "target", "release", "omegon");
		const legacyName = join(repoRoot, "core", "target", "release", "omegon-agent");
		// If only legacy name exists, it should still be found
		if (!existsSync(legacyName) || existsSync(newName)) return;

		const result = resolveNativeAgent();
		assert.ok(result, "should find legacy name");
		assert.equal(result!.binaryPath, legacyName);
	});

	it("caches the result", () => {
		const first = resolveNativeAgent();
		const second = resolveNativeAgent();
		assert.equal(first, second, "should return the same cached object");
	});

	it("bridge path points to core/bridge/llm-bridge.mjs", () => {
		const result = resolveNativeAgent();
		if (!result) return;

		const expectedBridge = join(repoRoot, "core", "bridge", "llm-bridge.mjs");
		assert.equal(result!.bridgePath, expectedBridge);
	});

	it("hasNativeProviders is true for resolved binaries", () => {
		const result = resolveNativeAgent();
		if (!result) return;
		assert.ok(result.hasNativeProviders, "modern binaries should have native providers");
	});
});
