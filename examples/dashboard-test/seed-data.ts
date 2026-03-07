/**
 * Seed data generators for dashboard testing.
 *
 * Each function returns a typed state object that can be written
 * directly into sharedState to populate the dashboard.
 */

import type {
  DesignTreeDashboardState,
  OpenSpecDashboardState,
  CleaveState,
} from "../../extensions/dashboard/types.ts";

// ── Design Tree Seeds ────────────────────────────────────────

/** Rich design tree: mixed statuses, focused node, implementing nodes */
export function designTreeFull(): DesignTreeDashboardState {
  return {
    nodeCount: 7,
    decidedCount: 3,
    exploringCount: 1,
    implementingCount: 2,
    implementedCount: 0,
    blockedCount: 1,
    openQuestionCount: 4,
    focusedNode: {
      id: "auth-flow",
      title: "Authentication Flow Redesign",
      status: "exploring",
      questions: [
        "Should we support SAML in addition to OIDC?",
        "Token refresh strategy: sliding window vs fixed expiry?",
        "How to handle offline token validation?",
        "Rate limiting on token endpoint?",
      ],
      branch: "design/auth-flow",
      branchCount: 2,
    },
    implementingNodes: [
      { id: "rbac-model", title: "RBAC Permission Model", branch: "feature/rbac-model" },
      { id: "session-store", title: "Session Store Migration", branch: "feature/session-store" },
    ],
  };
}

/** Minimal design tree: all decided, no focus */
export function designTreeAllDecided(): DesignTreeDashboardState {
  return {
    nodeCount: 4,
    decidedCount: 4,
    exploringCount: 0,
    implementingCount: 0,
    implementedCount: 0,
    blockedCount: 0,
    openQuestionCount: 0,
    focusedNode: null,
  };
}

/** Empty design tree */
export function designTreeEmpty(): DesignTreeDashboardState {
  return {
    nodeCount: 0,
    decidedCount: 0,
    exploringCount: 0,
    implementingCount: 0,
    implementedCount: 0,
    blockedCount: 0,
    openQuestionCount: 0,
    focusedNode: null,
  };
}

// ── OpenSpec Seeds ───────────────────────────────────────────

/** Multiple changes at different lifecycle stages */
export function openspecMixed(): OpenSpecDashboardState {
  return {
    changes: [
      { name: "auth-migration", stage: "tasks", tasksDone: 12, tasksTotal: 18 },
      { name: "rbac-gating", stage: "tasks", tasksDone: 8, tasksTotal: 8 },
      { name: "session-cleanup", stage: "specs", tasksDone: 0, tasksTotal: 0 },
      { name: "legacy-removal", stage: "archived", tasksDone: 5, tasksTotal: 5 },
      { name: "api-v2-endpoints", stage: "tasks", tasksDone: 3, tasksTotal: 14 },
    ],
  };
}

/** Single active change, partially done */
export function openspecSingle(): OpenSpecDashboardState {
  return {
    changes: [
      { name: "unified-dashboard", stage: "tasks", tasksDone: 22, tasksTotal: 30 },
    ],
  };
}

/** No changes */
export function openspecEmpty(): OpenSpecDashboardState {
  return { changes: [] };
}

// ── Cleave Seeds ─────────────────────────────────────────────

export function cleaveIdle(): CleaveState {
  return { status: "idle" };
}

export function cleaveDispatching(): CleaveState {
  return {
    status: "dispatching",
    runId: "run-2026-03-07-a1b2c3",
    children: [
      { label: "skill-matching", status: "done", elapsed: 12400 },
      { label: "prompt-routing", status: "running", elapsed: 8200 },
      { label: "review-loop", status: "running", elapsed: 6100 },
      { label: "dispatcher-update", status: "pending" },
      { label: "integration-tests", status: "pending" },
    ],
  };
}

export function cleaveDone(): CleaveState {
  return {
    status: "done",
    runId: "run-2026-03-07-d4e5f6",
    children: [
      { label: "skill-matching", status: "done", elapsed: 14200 },
      { label: "prompt-routing", status: "done", elapsed: 11800 },
      { label: "review-loop", status: "done", elapsed: 18300 },
    ],
  };
}

export function cleaveFailed(): CleaveState {
  return {
    status: "failed",
    runId: "run-2026-03-07-g7h8i9",
    children: [
      { label: "schema-migration", status: "done", elapsed: 9800 },
      { label: "api-handlers", status: "failed", elapsed: 22100 },
      { label: "frontend-views", status: "pending" },
    ],
  };
}

export function cleaveAssessing(): CleaveState {
  return { status: "assessing" };
}

export function cleaveMerging(): CleaveState {
  return {
    status: "merging",
    runId: "run-2026-03-07-j0k1l2",
    children: [
      { label: "child-a", status: "done", elapsed: 15000 },
      { label: "child-b", status: "done", elapsed: 12000 },
    ],
  };
}
