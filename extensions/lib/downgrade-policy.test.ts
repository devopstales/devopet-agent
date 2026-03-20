import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { evaluateDowngrade } from "./downgrade-policy.ts";
import { initRoutingState, pinFloor } from "./routing-state.ts";
import type { RouteEnvelope } from "./route-envelope.ts";
import type { ProviderRoutingPolicy } from "./model-routing.ts";

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

const defaultPolicy: ProviderRoutingPolicy = {
  providerOrder: ["anthropic", "openai", "local"],
  avoidProviders: [],
  cheapCloudPreferredOverLocal: false,
  requirePreflightForLargeRuns: false,
};

describe("evaluateDowngrade", () => {
  it("auto-reroute when compatible route exists", () => {
    const state = initRoutingState(1_000_000); // Legion
    const candidates = [
      makeEnvelope({ contextCeiling: 400_000, contextClass: "Clan", tier: "gloriana" }),
    ];
    const result = evaluateDowngrade(state, candidates, "gloriana", defaultPolicy);
    assert.equal(result.recommendation, "auto-reroute");
    assert.ok(result.targetRoute);
    assert.equal(result.targetRoute.contextClass, "Clan");
  });

  it("operator-confirm for multi-class drop even if compatible", () => {
    const state = initRoutingState(1_000_000); // Legion
    // Only candidate is Squad — delta = 3
    const candidates = [
      makeEnvelope({ contextCeiling: 131_072, contextClass: "Squad", tier: "gloriana" }),
    ];
    const result = evaluateDowngrade(state, candidates, "gloriana", defaultPolicy);
    assert.equal(result.recommendation, "operator-confirm");
    assert.ok(result.contextClassDelta! >= 2);
  });

  it("auto-compact when compaction bridges the gap", () => {
    // Active: Maniple (272k), floor: Squad (131k)
    // Candidate: 200k ceiling (Maniple), floor 131k → compatible
    // Actually let's make floor 250k so compaction is needed
    let state = initRoutingState(278_528); // Maniple
    state = { ...state, requiredMinContextWindow: 250_000, requiredMinContextClass: "Maniple" };
    const candidates = [
      makeEnvelope({ contextCeiling: 200_000, contextClass: "Maniple", tier: "gloriana" }),
    ];
    const result = evaluateDowngrade(state, candidates, "gloriana", defaultPolicy);
    assert.equal(result.recommendation, "auto-compact");
    assert.equal(result.compactionNeeded, true);
  });

  it("operator-confirm when pinned floor would be violated", () => {
    let state = initRoutingState(1_000_000); // Legion
    state = pinFloor(state, "Clan"); // Pin at Clan (400k)
    // Candidate is Maniple (272k) — below pinned Clan
    // Gap from 409600 to 272000 is 137600, which is ~50% of 272000 (136000) — borderline
    // But even if compactable, pinned floor blocks it
    const candidates = [
      makeEnvelope({ contextCeiling: 278_528, contextClass: "Maniple", tier: "gloriana" }),
    ];
    const result = evaluateDowngrade(state, candidates, "gloriana", defaultPolicy);
    assert.equal(result.recommendation, "operator-confirm");
    assert.ok(result.reason.includes("pinned floor") || result.reason.includes("class"));
  });

  it("no-viable-route when no candidates", () => {
    const state = initRoutingState(1_000_000);
    const result = evaluateDowngrade(state, [], "gloriana", defaultPolicy);
    assert.equal(result.recommendation, "no-viable-route");
  });

  it("no-viable-route when all candidates are ineligible", () => {
    const state = initRoutingState(1_000_000);
    const candidates = [
      makeEnvelope({ tier: "retribution" }), // wrong tier
    ];
    const result = evaluateDowngrade(state, candidates, "gloriana", defaultPolicy);
    assert.equal(result.recommendation, "no-viable-route");
  });

  it("prefers provider order from policy", () => {
    const state = initRoutingState(1_000_000);
    const candidates = [
      makeEnvelope({ provider: "openai", contextCeiling: 1_000_000, contextClass: "Legion", tier: "gloriana", modelIdPattern: "gpt-5.4" }),
      makeEnvelope({ provider: "anthropic", contextCeiling: 1_000_000, contextClass: "Legion", tier: "gloriana", modelIdPattern: "claude-opus-*" }),
    ];
    const policy: ProviderRoutingPolicy = {
      ...defaultPolicy,
      providerOrder: ["anthropic", "openai"],
    };
    const result = evaluateDowngrade(state, candidates, "gloriana", policy);
    assert.equal(result.recommendation, "auto-reroute");
    assert.equal(result.targetRoute?.provider, "anthropic");
  });
});
