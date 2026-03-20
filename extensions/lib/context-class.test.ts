import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  classifyContextWindow,
  contextClassLabel,
  contextClassOrd,
  compareContextClass,
  CONTEXT_CLASSES,
  thinkingLevelLabel,
  type ContextClass,
} from "./context-class.ts";

describe("classifyContextWindow", () => {
  const cases: Array<[number, ContextClass]> = [
    [50_000, "Squad"],
    [100_000, "Squad"],
    [131_072, "Squad"],       // exactly 128k
    [131_073, "Maniple"],     // just above Squad ceiling
    [200_000, "Maniple"],
    [272_000, "Maniple"],
    [278_528, "Maniple"],     // exactly Maniple ceiling
    [278_529, "Clan"],        // just above
    [400_000, "Clan"],
    [409_600, "Clan"],
    [450_560, "Clan"],        // Clan ceiling
    [450_561, "Legion"],      // just above
    [1_000_000, "Legion"],
    [1_048_576, "Legion"],
    [2_000_000, "Legion"],
  ];

  for (const [tokens, expected] of cases) {
    it(`classifies ${tokens.toLocaleString()} tokens as ${expected}`, () => {
      assert.equal(classifyContextWindow(tokens), expected);
    });
  }

  it("classifies 0 tokens as Squad", () => {
    assert.equal(classifyContextWindow(0), "Squad");
  });
});

describe("contextClassLabel", () => {
  it("formats Squad", () => {
    assert.equal(contextClassLabel("Squad"), "Squad (128k)");
  });

  it("formats Legion", () => {
    assert.equal(contextClassLabel("Legion"), "Legion (1M)");
  });
});

describe("contextClassOrd", () => {
  it("Squad < Maniple < Clan < Legion", () => {
    assert.ok(contextClassOrd("Squad") < contextClassOrd("Maniple"));
    assert.ok(contextClassOrd("Maniple") < contextClassOrd("Clan"));
    assert.ok(contextClassOrd("Clan") < contextClassOrd("Legion"));
  });
});

describe("compareContextClass", () => {
  it("same class returns 0", () => {
    assert.equal(compareContextClass("Clan", "Clan"), 0);
  });

  it("smaller < larger returns negative", () => {
    assert.ok(compareContextClass("Squad", "Legion") < 0);
  });

  it("larger > smaller returns positive", () => {
    assert.ok(compareContextClass("Legion", "Squad") > 0);
  });
});

describe("CONTEXT_CLASSES", () => {
  it("has 4 entries in ascending order", () => {
    assert.deepEqual([...CONTEXT_CLASSES], ["Squad", "Maniple", "Clan", "Legion"]);
  });
});

describe("classifyContextWindow edge cases", () => {
  it("NaN returns Squad (fail-closed)", () => {
    assert.equal(classifyContextWindow(NaN), "Squad");
  });

  it("Infinity returns Squad (fail-closed)", () => {
    assert.equal(classifyContextWindow(Infinity), "Squad");
  });

  it("negative returns Squad (fail-closed)", () => {
    assert.equal(classifyContextWindow(-1), "Squad");
  });
});

describe("thinkingLevelLabel", () => {
  it("maps off to Servitor", () => {
    assert.equal(thinkingLevelLabel("off"), "Servitor");
  });

  it("maps minimal to Functionary", () => {
    assert.equal(thinkingLevelLabel("minimal"), "Functionary");
  });

  it("maps low to Adept", () => {
    assert.equal(thinkingLevelLabel("low"), "Adept");
  });

  it("maps medium to Magos", () => {
    assert.equal(thinkingLevelLabel("medium"), "Magos");
  });

  it("maps high to Archmagos", () => {
    assert.equal(thinkingLevelLabel("high"), "Archmagos");
  });
});
