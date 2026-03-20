/**
 * Downgrade policy — evaluates whether a model switch is safe.
 *
 * Decision flow:
 *   1. Find compatible routes (ceiling ≥ floor, correct tier)
 *      → auto-reroute to best compatible
 *   2. Find compatible-with-compaction routes (compaction bridges the gap)
 *      → auto-compact if no pinned floor crossed and policy allows
 *   3. Otherwise → operator-confirm (degrading switch)
 *
 * Large multi-class drops (delta ≥ 2) always require operator confirmation.
 * Pinned floors are never crossed without operator confirmation.
 */

import type { RoutingSessionState } from "./routing-state.ts";
import { contextClassDelta } from "./routing-state.ts";
import {
  classifyRoute,
  type RouteEnvelope,
} from "./route-envelope.ts";
import { contextClassOrd, type ContextClass } from "./context-class.ts";
import type { ProviderRoutingPolicy, ModelTier } from "./model-routing.ts";

// ─── Types ───────────────────────────────────────────────────

export type DowngradeRecommendation =
  | "auto-reroute"
  | "auto-compact"
  | "operator-confirm"
  | "no-viable-route";

export interface DowngradeEvaluation {
  recommendation: DowngradeRecommendation;
  targetRoute?: RouteEnvelope;
  compactionNeeded?: boolean;
  contextClassDelta?: number;
  reason: string;
}

// ─── Evaluation ──────────────────────────────────────────────

/**
 * Evaluate the best downgrade path given current state and available routes.
 *
 * @param state - Current routing session state
 * @param candidates - Available route envelopes (filtered to authenticated providers)
 * @param requiredTier - The tier the session requires
 * @param policy - Provider routing policy for preference ordering
 */
export function evaluateDowngrade(
  state: RoutingSessionState,
  candidates: RouteEnvelope[],
  requiredTier?: ModelTier,
  policy?: ProviderRoutingPolicy,
): DowngradeEvaluation {
  if (candidates.length === 0) {
    return {
      recommendation: "no-viable-route",
      reason: "No candidate routes available.",
    };
  }

  // Classify each candidate
  const classified = candidates.map((envelope) => ({
    envelope,
    classification: classifyRoute(
      envelope,
      state.requiredMinContextWindow,
      requiredTier,
      state.activeContextClass,
    ),
  }));

  // Apply provider preference ordering
  const ordered = policy
    ? sortByProviderPreference(classified, policy)
    : classified;

  // 1. Find best compatible route
  const compatible = ordered.filter((c) => c.classification === "compatible");
  if (compatible.length > 0) {
    const best = compatible[0];
    const delta = contextClassDelta(state.activeContextClass, best.envelope.contextClass);

    // Even compatible routes need confirmation if they're a large class drop
    if (delta >= 2) {
      return {
        recommendation: "operator-confirm",
        targetRoute: best.envelope,
        contextClassDelta: delta,
        reason: `Compatible route available but would drop ${delta} context class${delta > 1 ? "es" : ""} (${state.activeContextClass} → ${best.envelope.contextClass}). Operator confirmation required for large downgrades.`,
      };
    }

    return {
      recommendation: "auto-reroute",
      targetRoute: best.envelope,
      contextClassDelta: delta,
      reason: `Compatible route: ${best.envelope.provider}/${best.envelope.modelIdPattern} (${best.envelope.contextClass}).`,
    };
  }

  // 2. Find best compatible-with-compaction route
  const compactable = ordered.filter((c) => c.classification === "compatible-with-compaction");
  if (compactable.length > 0) {
    const best = compactable[0];
    const delta = contextClassDelta(state.activeContextClass, best.envelope.contextClass);

    // Pinned floor check — never compact below pinned floor
    if (state.pinnedFloor) {
      const pinnedOrd = contextClassOrd(state.pinnedFloor);
      const candidateOrd = contextClassOrd(best.envelope.contextClass);
      if (candidateOrd < pinnedOrd) {
        return {
          recommendation: "operator-confirm",
          targetRoute: best.envelope,
          compactionNeeded: true,
          contextClassDelta: delta,
          reason: `Compaction would drop below pinned floor (${state.pinnedFloor}). Candidate: ${best.envelope.contextClass}. Operator confirmation required.`,
        };
      }
    }

    // Large class drops need confirmation even with compaction
    if (delta >= 2) {
      return {
        recommendation: "operator-confirm",
        targetRoute: best.envelope,
        compactionNeeded: true,
        contextClassDelta: delta,
        reason: `Compaction needed with ${delta}-class drop (${state.activeContextClass} → ${best.envelope.contextClass}). Operator confirmation required.`,
      };
    }

    return {
      recommendation: "auto-compact",
      targetRoute: best.envelope,
      compactionNeeded: true,
      contextClassDelta: delta,
      reason: `Safe compaction available: ${best.envelope.provider}/${best.envelope.modelIdPattern} (${best.envelope.contextClass}).`,
    };
  }

  // 3. Find best degrading route (needs operator confirmation)
  const degrading = ordered.filter((c) => c.classification === "degrading");
  if (degrading.length > 0) {
    const best = degrading[0];
    const delta = contextClassDelta(state.activeContextClass, best.envelope.contextClass);
    return {
      recommendation: "operator-confirm",
      targetRoute: best.envelope,
      compactionNeeded: true,
      contextClassDelta: delta,
      reason: `No safe route available. Best candidate: ${best.envelope.provider}/${best.envelope.modelIdPattern} (${best.envelope.contextClass}), ${delta}-class drop from ${state.activeContextClass}. Operator confirmation required.`,
    };
  }

  // All routes ineligible
  return {
    recommendation: "no-viable-route",
    reason: `All ${candidates.length} candidate routes are ineligible (tier/thinking mismatch or other policy constraint).`,
  };
}

// ─── Helpers ─────────────────────────────────────────────────

function sortByProviderPreference<T extends { envelope: RouteEnvelope }>(
  items: T[],
  policy: ProviderRoutingPolicy,
): T[] {
  const providerRank = new Map(
    policy.providerOrder.map((p, i) => [p, i]),
  );
  return [...items].sort((a, b) => {
    const aRank = providerRank.get(a.envelope.provider) ?? Number.MAX_SAFE_INTEGER;
    const bRank = providerRank.get(b.envelope.provider) ?? Number.MAX_SAFE_INTEGER;
    if (aRank !== bRank) return aRank - bRank;
    // Within same provider, prefer larger context
    return b.envelope.contextCeiling - a.envelope.contextCeiling;
  });
}
