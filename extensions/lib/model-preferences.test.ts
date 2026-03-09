import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { loadPiConfig, readLastUsedModel, writeLastUsedModel } from "./model-preferences.ts";

function makeTmpDir(): string {
  return mkdtempSync(join(tmpdir(), "model-prefs-"));
}

describe("model preferences", () => {
  it("writes and reads last used model", () => {
    const tmp = makeTmpDir();
    try {
      writeLastUsedModel(tmp, { provider: "openai", modelId: "gpt-5.4" });
      assert.deepEqual(readLastUsedModel(tmp), { provider: "openai", modelId: "gpt-5.4" });
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("preserves unrelated config keys when persisting last used model", () => {
    const tmp = makeTmpDir();
    mkdirSync(join(tmp, ".pi"), { recursive: true });
    writeFileSync(join(tmp, ".pi", "config.json"), JSON.stringify({ editor: "vscode", effort: "Ruthless" }));

    try {
      writeLastUsedModel(tmp, { provider: "anthropic", modelId: "claude-sonnet-4-6" });
      const config = loadPiConfig(tmp);
      assert.equal(config.editor, "vscode");
      assert.equal(config.effort, "Ruthless");
      assert.deepEqual(config.lastUsedModel, {
        provider: "anthropic",
        modelId: "claude-sonnet-4-6",
      });
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("returns undefined for invalid lastUsedModel payloads", () => {
    const tmp = makeTmpDir();
    mkdirSync(join(tmp, ".pi"), { recursive: true });
    writeFileSync(join(tmp, ".pi", "config.json"), JSON.stringify({ lastUsedModel: { provider: "openai" } }));

    try {
      assert.equal(readLastUsedModel(tmp), undefined);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("returns empty config for invalid json", () => {
    const tmp = makeTmpDir();
    mkdirSync(join(tmp, ".pi"), { recursive: true });
    writeFileSync(join(tmp, ".pi", "config.json"), "not json{{{");

    try {
      assert.deepEqual(loadPiConfig(tmp), {});
      assert.equal(readLastUsedModel(tmp), undefined);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
