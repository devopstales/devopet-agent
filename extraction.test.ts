import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { createTriggerState, shouldExtract } from "./extraction.js";
import { DEFAULT_CONFIG } from "./types.js";

const config = { ...DEFAULT_CONFIG };

describe("createTriggerState", () => {
  it("returns expected defaults", () => {
    const s = createTriggerState();
    assert.equal(s.lastExtractedTokens, 0);
    assert.equal(s.toolCallsSinceExtract, 0);
    assert.equal(s.manualStoresSinceExtract, 0);
    assert.equal(s.isInitialized, false);
    assert.equal(s.isRunning, false);
  });
});

describe("shouldExtract", () => {
  it("returns false when isRunning", () => {
    const s = createTriggerState();
    s.isRunning = true;
    assert.equal(shouldExtract(s, 100_000, config), false);
  });

  it("returns false when manual stores exceed threshold", () => {
    const s = createTriggerState();
    s.manualStoresSinceExtract = config.manualStoreThreshold;
    assert.equal(shouldExtract(s, 100_000, config), false);
  });

  describe("first extraction (not initialized)", () => {
    it("returns false below minimumTokensToInit", () => {
      const s = createTriggerState();
      assert.equal(shouldExtract(s, config.minimumTokensToInit - 1, config), false);
    });

    it("returns true at exactly minimumTokensToInit", () => {
      const s = createTriggerState();
      assert.equal(shouldExtract(s, config.minimumTokensToInit, config), true);
    });

    it("returns true above minimumTokensToInit", () => {
      const s = createTriggerState();
      assert.equal(shouldExtract(s, config.minimumTokensToInit + 1, config), true);
    });
  });

  describe("subsequent extractions (initialized)", () => {
    it("returns false when token delta is insufficient", () => {
      const s = createTriggerState();
      s.isInitialized = true;
      s.lastExtractedTokens = 10_000;
      s.toolCallsSinceExtract = config.toolCallsBetweenUpdates;
      assert.equal(shouldExtract(s, 10_000 + config.minimumTokensBetweenUpdate - 1, config), false);
    });

    it("returns false when tool calls are insufficient", () => {
      const s = createTriggerState();
      s.isInitialized = true;
      s.lastExtractedTokens = 10_000;
      s.toolCallsSinceExtract = config.toolCallsBetweenUpdates - 1;
      assert.equal(shouldExtract(s, 10_000 + config.minimumTokensBetweenUpdate, config), false);
    });

    it("returns true when both thresholds are met", () => {
      const s = createTriggerState();
      s.isInitialized = true;
      s.lastExtractedTokens = 10_000;
      s.toolCallsSinceExtract = config.toolCallsBetweenUpdates;
      assert.equal(shouldExtract(s, 10_000 + config.minimumTokensBetweenUpdate, config), true);
    });
  });
});
