import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  classifyRoute,
  loadRouteMatrix,
  buildRouteMatrixFromRegistry,
  findEnvelopeForModel,
  _clearMatrixCache,
  type RouteEnvelope,
} from "./route-envelope.ts";

function makeEnvelope(overrides: Partial<RouteEnvelope> = {}): RouteEnvelope {
  return {
    provider: "anthropic",
    modelIdPattern: "claude-opus-*",
    contextCeiling: 1_000_000,
    contextClass: "Legion",
    tier: "gloriana",
    breakpointZones: [],
    ...overrides,
  };
}

describe("classifyRoute", () => {
  it("compatible when ceiling meets floor", () => {
    const envelope = makeEnvelope({ contextCeiling: 1_000_000, contextClass: "Legion" });
    assert.equal(classifyRoute(envelope, 200_000), "compatible");
  });

  it("compatible when ceiling exactly equals floor", () => {
    const envelope = makeEnvelope({ contextCeiling: 200_000, contextClass: "Maniple" });
    assert.equal(classifyRoute(envelope, 200_000), "compatible");
  });

  it("degrading when ceiling far below floor", () => {
    const envelope = makeEnvelope({ contextCeiling: 131_072, contextClass: "Squad" });
    assert.equal(classifyRoute(envelope, 400_000, undefined, "Clan"), "degrading");
  });

  it("ineligible when candidate tier is lower than required", () => {
    const envelope = makeEnvelope({ tier: "retribution" });
    assert.equal(classifyRoute(envelope, 100_000, "gloriana"), "ineligible");
  });

  it("compatible when candidate tier is higher than required (gloriana serves victory)", () => {
    const envelope = makeEnvelope({ tier: "gloriana", contextCeiling: 1_000_000, contextClass: "Legion" });
    assert.equal(classifyRoute(envelope, 200_000, "victory"), "compatible");
  });

  it("compatible when candidate tier equals required", () => {
    const envelope = makeEnvelope({ tier: "victory", contextCeiling: 1_000_000, contextClass: "Legion" });
    assert.equal(classifyRoute(envelope, 200_000, "victory"), "compatible");
  });

  it("compatible-with-compaction when gap is bridgeable", () => {
    // Ceiling 200k, floor 250k — gap 50k is ≤ 50% of 200k
    const envelope = makeEnvelope({ contextCeiling: 200_000, contextClass: "Maniple" });
    assert.equal(classifyRoute(envelope, 250_000, undefined, "Maniple"), "compatible-with-compaction");
  });

  it("degrading when class delta >= 2 even with bridgeable gap", () => {
    // Ceiling 200k, floor 250k — but current is Legion (delta=2)
    const envelope = makeEnvelope({ contextCeiling: 200_000, contextClass: "Maniple" });
    assert.equal(classifyRoute(envelope, 250_000, undefined, "Legion"), "degrading");
  });
});

describe("loadRouteMatrix", () => {
  beforeEach(() => _clearMatrixCache());

  it("loads reviewed matrix with correct types", () => {
    const matrix = loadRouteMatrix();
    assert.ok(matrix.length > 0, "should have entries");
    for (const entry of matrix) {
      assert.ok(typeof entry.provider === "string");
      assert.ok(typeof entry.contextCeiling === "number");
      assert.ok(["Squad", "Maniple", "Clan", "Legion"].includes(entry.contextClass));
    }
  });

  it("includes Anthropic and OpenAI entries", () => {
    const matrix = loadRouteMatrix();
    const providers = new Set(matrix.map((e) => e.provider));
    assert.ok(providers.has("anthropic"));
    assert.ok(providers.has("openai"));
  });

  it("Anthropic opus is Legion class", () => {
    const matrix = loadRouteMatrix();
    const opus = matrix.find((e) => e.modelIdPattern.includes("opus"));
    assert.ok(opus);
    assert.equal(opus.contextClass, "Legion");
    assert.equal(opus.contextCeiling, 1_000_000);
  });
});

describe("buildRouteMatrixFromRegistry", () => {
  beforeEach(() => _clearMatrixCache());

  it("builds envelopes for known models", () => {
    const models = [
      { id: "claude-opus-4-6", provider: "anthropic" },
      { id: "gpt-5.4", provider: "openai" },
    ];
    const envelopes = buildRouteMatrixFromRegistry(models);
    assert.ok(envelopes.length >= 2);
    assert.ok(envelopes.some((e) => e.provider === "anthropic"));
    assert.ok(envelopes.some((e) => e.provider === "openai"));
  });

  it("excludes models without reviewed entries", () => {
    const models = [
      { id: "totally-unknown-model", provider: "mystery-provider" },
    ];
    const envelopes = buildRouteMatrixFromRegistry(models);
    assert.equal(envelopes.length, 0);
  });
});

describe("findEnvelopeForModel", () => {
  it("finds exact match", () => {
    const envelopes = [makeEnvelope({ modelIdPattern: "gpt-5.4", provider: "openai" })];
    const found = findEnvelopeForModel("gpt-5.4", "openai", envelopes);
    assert.ok(found);
    assert.equal(found.modelIdPattern, "gpt-5.4");
  });

  it("finds wildcard match", () => {
    const envelopes = [makeEnvelope({ modelIdPattern: "claude-opus-*" })];
    const found = findEnvelopeForModel("claude-opus-4-6", "anthropic", envelopes);
    assert.ok(found);
  });

  it("returns undefined for no match", () => {
    const envelopes = [makeEnvelope({ modelIdPattern: "claude-opus-*" })];
    const found = findEnvelopeForModel("gpt-5.4", "openai", envelopes);
    assert.equal(found, undefined);
  });
});
