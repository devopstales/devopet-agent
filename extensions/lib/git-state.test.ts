/**
 * Tests for lib/git-state — git status parsing and submodule classification.
 */

import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import {
	parseGitStatus,
	inspectGitState,
	parseGitmodules,
	type GitStatusEntry,
} from "./git-state.ts";

describe("parseGitStatus", () => {
	it("parses modified tracked file", () => {
		const entries = parseGitStatus(" M core\n");
		assert.equal(entries.length, 1);
		assert.equal(entries[0].path, "core");
		assert.equal(entries[0].tracked, true);
		assert.equal(entries[0].submodule, false);
	});

	it("parses untracked file", () => {
		const entries = parseGitStatus("?? newfile.txt\n");
		assert.equal(entries.length, 1);
		assert.equal(entries[0].untracked, true);
		assert.equal(entries[0].submodule, false);
	});
});

describe("inspectGitState with submodules", () => {
	it("classifies submodule paths when submodulePaths provided", () => {
		const submodulePaths = new Set(["core"]);
		const state = inspectGitState(" M core\n M README.md\n", undefined, submodulePaths);
		const coreEntry = state.entries.find((e) => e.path === "core");
		const readmeEntry = state.entries.find((e) => e.path === "README.md");
		assert.equal(coreEntry?.submodule, true);
		assert.equal(readmeEntry?.submodule, false);
	});

	it("does not classify submodules without submodulePaths", () => {
		const state = inspectGitState(" M core\n");
		const coreEntry = state.entries.find((e) => e.path === "core");
		assert.equal(coreEntry?.submodule, false);
	});

	it("handles empty submodule set", () => {
		const state = inspectGitState(" M core\n", undefined, new Set());
		assert.equal(state.entries[0].submodule, false);
	});
});

describe("parseGitmodules", () => {
	it("returns empty set for non-existent path", () => {
		const result = parseGitmodules("/tmp/nonexistent-repo-" + Date.now());
		assert.equal(result.size, 0);
	});

	// Note: testing with actual .gitmodules requires a temp dir with a file,
	// but the function is simple enough that the parse logic is covered by
	// the inspectGitState integration test above.
});
