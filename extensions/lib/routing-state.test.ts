import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  initRoutingState,
  updateUsage,
  pinFloor,
  switchModel,
  raiseFloorFromUsage,
  contextClassDelta,
} from "./routing-state.ts";

describe("initRoutingState", () => {
  it("initializes with correct active class for 1M model", () => {
    const state = initRoutingState(1_000_000);
    assert.equal(state.activeContextClass, "Legion");
    assert.equal(state.activeContextWindow, 1_000_000);
  });

  it("defaults required floor to Squad", () => {
    const state = initRoutingState(1_000_000);
    assert.equal(state.requiredMinContextClass, "Squad");
    assert.equal(state.downgradeSafetyArmed, true);
  });

  it("classifies 272k model as Maniple", () => {
    const state = initRoutingState(272_000);
    assert.equal(state.activeContextClass, "Maniple");
  });
});

describe("updateUsage", () => {
  it("calculates headroom correctly", () => {
    const state = initRoutingState(1_000_000);
    const updated = updateUsage(state, 600_000);
    assert.equal(updated.observedUsage, 600_000);
    assert.equal(updated.headroom, 400_000);
  });

  it("headroom never goes negative", () => {
    const state = initRoutingState(100_000);
    const updated = updateUsage(state, 200_000);
    assert.equal(updated.headroom, 0);
  });
});

describe("pinFloor", () => {
  it("raises required minimum to pinned class", () => {
    const state = initRoutingState(1_000_000);
    const pinned = pinFloor(state, "Clan");
    assert.equal(pinned.pinnedFloor, "Clan");
    assert.ok(pinned.requiredMinContextWindow >= 409_600);
    assert.equal(pinned.requiredMinContextClass, "Clan");
  });

  it("does not lower existing higher floor", () => {
    let state = initRoutingState(1_000_000);
    state = { ...state, requiredMinContextWindow: 500_000, requiredMinContextClass: "Clan" };
    const pinned = pinFloor(state, "Maniple"); // Maniple < Clan
    assert.ok(pinned.requiredMinContextWindow >= 500_000);
  });
});

describe("switchModel", () => {
  it("updates active window and class", () => {
    const state = initRoutingState(1_000_000);
    const switched = switchModel(state, 272_000);
    assert.equal(switched.activeContextWindow, 272_000);
    assert.equal(switched.activeContextClass, "Maniple");
  });

  it("resets usage and headroom", () => {
    let state = initRoutingState(1_000_000);
    state = updateUsage(state, 500_000);
    const switched = switchModel(state, 272_000);
    assert.equal(switched.observedUsage, undefined);
    assert.equal(switched.headroom, undefined);
  });
});

describe("raiseFloorFromUsage", () => {
  it("raises floor when usage exceeds current minimum", () => {
    const state = initRoutingState(1_000_000);
    const raised = raiseFloorFromUsage(state, 300_000);
    assert.equal(raised.requiredMinContextWindow, 300_000);
    assert.equal(raised.requiredMinContextClass, "Clan");
  });

  it("does not lower floor", () => {
    let state = initRoutingState(1_000_000);
    state = { ...state, requiredMinContextWindow: 500_000, requiredMinContextClass: "Clan" };
    const same = raiseFloorFromUsage(state, 100_000);
    assert.equal(same.requiredMinContextWindow, 500_000);
  });
});

describe("contextClassDelta", () => {
  it("Legion→Squad = 3", () => {
    assert.equal(contextClassDelta("Legion", "Squad"), 3);
  });

  it("same class = 0", () => {
    assert.equal(contextClassDelta("Clan", "Clan"), 0);
  });

  it("upgrade is negative", () => {
    assert.ok(contextClassDelta("Squad", "Legion") < 0);
  });
});
