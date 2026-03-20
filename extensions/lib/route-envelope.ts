/**
 * Route envelope — provider/model context ceiling + downgrade classification.
 *
 * A route envelope captures the concrete context capacity of a specific
 * provider+model combination. The harness compares these envelopes against
 * the session's required context floor to classify downgrade safety.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  classifyContextWindow,
  contextClassOrd,
  type ContextClass,
} from "./context-class.ts";
import type { ModelTier } from "./model-routing.ts";

// ─── Tier ordinal for "can this tier serve that request?" ────

const TIER_ORD: Record<string, number> = {
  local: 0,
  retribution: 1,
  victory: 2,
  gloriana: 3,
};

/** True when the candidate tier can serve the required tier (same or higher). */
function tierSatisfies(candidateTier: string, requiredTier: string): boolean {
  return (TIER_ORD[candidateTier] ?? -1) >= (TIER_ORD[requiredTier] ?? 999);
}

// ─── Types ───────────────────────────────────────────────────

export interface BreakpointZone {
  threshold: number;
  note: string;
}

export interface RouteEnvelope {
  provider: string;
  modelIdPattern: string;
  contextCeiling: number;
  contextClass: ContextClass;
  tier: ModelTier;
  breakpointZones: BreakpointZone[];
  note?: string;
}

export type DowngradeClassification =
  | "compatible"
  | "compatible-with-compaction"
  | "degrading"
  | "ineligible";

// ─── Raw matrix schema (matches route-matrix.json) ───────────

interface RawRouteEntry {
  provider: string;
  modelIdPattern: string;
  contextCeiling: number;
  tier: string;
  breakpointZones?: Array<{ threshold: number; note: string }>;
  note?: string;
}

interface RawRouteMatrix {
  lastReviewed: string;
  version: number;
  routes: RawRouteEntry[];
}

// ─── Load reviewed matrix ────────────────────────────────────

let cachedMatrix: RouteEnvelope[] | null = null;

/**
 * Load the checked-in route matrix from data/route-matrix.json.
 * Cached after first load. Returns typed RouteEnvelope[] with
 * contextClass derived from contextCeiling.
 */
export function loadRouteMatrix(): RouteEnvelope[] {
  if (cachedMatrix) return cachedMatrix;

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const matrixPath = join(__dirname, "..", "..", "data", "route-matrix.json");

  const raw: RawRouteMatrix = JSON.parse(readFileSync(matrixPath, "utf-8"));
  cachedMatrix = raw.routes.map((r) => ({
    provider: r.provider,
    modelIdPattern: r.modelIdPattern,
    contextCeiling: r.contextCeiling,
    contextClass: classifyContextWindow(r.contextCeiling),
    tier: r.tier as ModelTier,
    breakpointZones: r.breakpointZones ?? [],
    note: r.note,
  }));

  return cachedMatrix;
}

/** Clear the cached matrix (for testing). */
export function _clearMatrixCache(): void {
  cachedMatrix = null;
}

// ─── Dynamic matrix from registry ────────────────────────────

/**
 * Build a route envelope array from the model registry.
 * Uses known context ceilings from the reviewed matrix where available,
 * falling back to defaults per provider.
 */
export function buildRouteMatrixFromRegistry(
  models: Array<{ id: string; provider: string }>,
): RouteEnvelope[] {
  const reviewed = loadRouteMatrix();
  const envelopes: RouteEnvelope[] = [];

  for (const model of models) {
    // Find best matching reviewed entry
    const match = findReviewedMatch(model.id, model.provider, reviewed);
    if (match) {
      envelopes.push({
        ...match,
        modelIdPattern: model.id, // use exact model ID
      });
    }
    // Models without a reviewed entry are not included — we only
    // route against reviewed data per the design decision.
  }

  return envelopes;
}

/**
 * Match a concrete model ID against the reviewed matrix using glob-style patterns.
 * Supports trailing `*` wildcards.
 */
function findReviewedMatch(
  modelId: string,
  provider: string,
  matrix: RouteEnvelope[],
): RouteEnvelope | undefined {
  return matrix.find((entry) => {
    if (entry.provider !== provider) return false;
    const pattern = entry.modelIdPattern;
    if (pattern.endsWith("*")) {
      return modelId.startsWith(pattern.slice(0, -1));
    }
    return modelId === pattern;
  });
}

// ─── Downgrade classification ────────────────────────────────

/**
 * Classify a candidate route against the session's context requirements.
 *
 * @param envelope - The candidate route's envelope
 * @param requiredFloor - The session's required minimum context window (tokens)
 * @param requiredTier - The tier the session needs (optional)
 * @param currentClass - The session's current context class
 */
export function classifyRoute(
  envelope: RouteEnvelope,
  requiredFloor: number,
  requiredTier?: ModelTier,
  currentClass?: ContextClass,
): DowngradeClassification {
  // Tier mismatch = ineligible (can't use a retribution model for gloriana work,
  // but a gloriana model CAN serve victory work — higher satisfies lower)
  if (requiredTier && !tierSatisfies(envelope.tier, requiredTier)) {
    return "ineligible";
  }

  // Ceiling meets or exceeds floor → compatible
  if (envelope.contextCeiling >= requiredFloor) {
    return "compatible";
  }

  // Ceiling is below floor but compaction might help
  // Heuristic: if the gap is ≤ 50% of the ceiling, compaction could bridge it
  const gap = requiredFloor - envelope.contextCeiling;
  const compactionViable = gap <= envelope.contextCeiling * 0.5;

  if (compactionViable) {
    // But if it's a large class drop, it's degrading even with compaction
    if (currentClass) {
      const classDelta = contextClassOrd(currentClass) - contextClassOrd(envelope.contextClass);
      if (classDelta >= 2) return "degrading";
    }
    return "compatible-with-compaction";
  }

  return "degrading";
}

/**
 * Find a route envelope matching a specific model ID in a set of envelopes.
 */
export function findEnvelopeForModel(
  modelId: string,
  provider: string,
  envelopes: RouteEnvelope[],
): RouteEnvelope | undefined {
  return envelopes.find((e) => {
    if (e.provider !== provider) return false;
    if (e.modelIdPattern.endsWith("*")) {
      return modelId.startsWith(e.modelIdPattern.slice(0, -1));
    }
    return modelId === e.modelIdPattern;
  });
}
