import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";

import { DashboardFooter } from "./footer.ts";
import { sharedState } from "../lib/shared-state.ts";
import type { DashboardState } from "./types.ts";

function makeTheme() {
  return {
    fg: (_color: string, text: string) => text,
    bold: (text: string) => text,
  };
}

function makeFooterData(providerCount = 2) {
  return {
    getAvailableProviderCount: () => providerCount,
    getGitBranch: () => "main",
    getExtensionStatuses: () => new Map<string, string>(),
  };
}

function makeContext() {
  return {
    cwd: "/Users/cwilson/workspace/ai/omegon",
    model: {
      provider: "openai-codex",
      id: "gpt-5.4",
      reasoning: true,
    },
    getContextUsage: () => ({ percent: 31, contextWindow: 272000 }),
    sessionManager: {
      getEntries: () => [],
      getSessionName: () => undefined,
    },
  };
}

function hasSectionLabel(lines: string[], label: string): boolean {
  return lines.some((line) => line.includes(label));
}

describe("DashboardFooter compact mode", () => {
  beforeEach(() => {
    (sharedState as any).designTree = {
      nodeCount: 4,
      decidedCount: 4,
      exploringCount: 0,
      implementingCount: 0,
      implementedCount: 15,
      blockedCount: 0,
      openQuestionCount: 0,
      focusedNode: null,
      implementingNodes: [],
    };
    (sharedState as any).openspec = {
      changes: [{ name: "x", stage: "implementing", tasksDone: 0, tasksTotal: 7 }],
    };
    (sharedState as any).cleave = { status: "idle", children: [] };
    (sharedState as any).lastMemoryInjection = {
      mode: "semantic",
      projectFactCount: 30,
      edgeCount: 0,
      workingMemoryFactCount: 4,
      semanticHitCount: 12,
      episodeCount: 3,
      globalFactCount: 15,
      payloadChars: 4800,
      estimatedTokens: 1200,
    };
  });

  it("renders the persistent four-part runtime HUD in compact mode", () => {
    const footer = new DashboardFooter(
      {} as any,
      makeTheme() as any,
      makeFooterData() as any,
      { mode: "compact", turns: 0 } satisfies DashboardState,
    );
    footer.setContext(makeContext() as any);

    const lines = footer.render(160);
    assert.ok(hasSectionLabel(lines, "context"), lines.join("\n"));
    assert.ok(hasSectionLabel(lines, "models"), lines.join("\n"));
    assert.ok(hasSectionLabel(lines, "memory"), lines.join("\n"));
    assert.ok(hasSectionLabel(lines, "system"), lines.join("\n"));
  });

  it("shows provider-aware model info in the compact models card", () => {
    const footer = new DashboardFooter(
      {} as any,
      makeTheme() as any,
      makeFooterData() as any,
      { mode: "compact", turns: 0 } satisfies DashboardState,
    );
    footer.setContext(makeContext() as any);

    const lines = footer.render(160);
    assert.ok(lines.some((line) => line.includes("gpt-5.4")), lines.join("\n"));
  });

  it("renders compact mode hints on the base row instead of inside the system card", () => {
    const footer = new DashboardFooter(
      {} as any,
      makeTheme() as any,
      makeFooterData() as any,
      { mode: "compact", turns: 0 } satisfies DashboardState,
    );
    footer.setContext(makeContext() as any);

    const lines = footer.render(160);
    const joined = lines.join("\n");
    const systemLine = lines.find((line) => line.includes("⌂"));
    assert.ok(systemLine, joined);
    assert.ok(!systemLine!.includes("/dash to expand"), joined);
    assert.ok(!systemLine!.includes("/dashboard"), joined);
    assert.ok(lines.at(-1)?.includes("/dash to expand"), joined);
    assert.ok(lines.at(-1)?.includes("/dashboard modal"), joined);
  });

  it("preserves primary dashboard summaries before truncating low-priority metadata", () => {
    (sharedState as any).designTree = {
      nodeCount: 4,
      decidedCount: 4,
      exploringCount: 0,
      implementingCount: 0,
      implementedCount: 15,
      blockedCount: 0,
      openQuestionCount: 0,
      focusedNode: {
        id: "very-long-node",
        title: "Extremely Long Focused Design Node Title That Should Not Displace Core Summaries",
        status: "decided",
        questions: [],
      },
      implementingNodes: [],
    };

    const footer = new DashboardFooter(
      {} as any,
      makeTheme() as any,
      makeFooterData() as any,
      { mode: "compact", turns: 0 } satisfies DashboardState,
    );
    footer.setContext({
      ...makeContext(),
      model: {
        provider: "provider-with-a-very-long-name",
        id: "model-with-a-very-long-identifier-that-should-be-truncated-last",
        reasoning: true,
      },
    } as any);

    const lines = footer.render(95);
    const joined = lines.join("\n");
    assert.ok(hasSectionLabel(lines, "context"), joined);
    assert.ok(hasSectionLabel(lines, "models"), joined);
    assert.ok(
      joined.includes("D model-with-a-very-long-identifier") || joined.includes("Driver model-with-a-very-long-identifier"),
      joined,
    );
    assert.ok(!joined.includes("◈"), joined);
    assert.ok(!joined.includes("◎"), joined);
    assert.ok(!joined.includes("⚡ idle"), joined);
  });
});
