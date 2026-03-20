/**
 * Context class taxonomy — named context window categories.
 *
 * Three-axis model:
 *   - Capability tier: local / retribution / victory / gloriana
 *   - Thinking level: off / minimal / low / medium / high
 *   - Context class: Squad / Maniple / Clan / Legion  ← this module
 *
 * Context classes abstract provider-specific token ceilings into
 * operator-friendly categories. Internal routing still compares
 * exact token counts; these classes are the policy and UX abstraction.
 */

// ─── Context Class Enum ──────────────────────────────────────

export type ContextClass = "Squad" | "Maniple" | "Clan" | "Legion";

/** Ordinal values for comparison. Higher = larger context. */
const CLASS_ORD: Record<ContextClass, number> = {
  Squad: 0,
  Maniple: 1,
  Clan: 2,
  Legion: 3,
};

/**
 * Token ceiling thresholds defining the upper bound of each class.
 * A model with contextCeiling ≤ threshold belongs to that class.
 * Legion has no upper bound.
 */
export const CONTEXT_THRESHOLDS: Array<{ class: ContextClass; maxTokens: number }> = [
  { class: "Squad", maxTokens: 131_072 },    // 128k
  { class: "Maniple", maxTokens: 278_528 },  // ~272k
  { class: "Clan", maxTokens: 450_560 },     // ~440k (covers 400k models, not 512k)
  // Legion: everything above
];

/**
 * Nominal token count for each class — used for display and floor defaults.
 */
export const CONTEXT_CLASS_TOKENS: Record<ContextClass, number> = {
  Squad: 131_072,
  Maniple: 278_528,
  Clan: 409_600,
  Legion: 1_048_576,
};

// ─── Classification ──────────────────────────────────────────

/**
 * Classify a raw token count into a context class.
 * Uses ceiling thresholds — the token count is placed in the
 * smallest class whose ceiling it fits under.
 */
export function classifyContextWindow(tokenCount: number): ContextClass {
  // Defend against NaN/Infinity — unknown values default to smallest (safest) class
  if (!Number.isFinite(tokenCount) || tokenCount < 0) return "Squad";
  for (const { class: cls, maxTokens } of CONTEXT_THRESHOLDS) {
    if (tokenCount <= maxTokens) return cls;
  }
  return "Legion";
}

/**
 * Operator-facing label for a context class.
 */
/** Human-friendly token count display — matches operator mental model. */
const CONTEXT_CLASS_DISPLAY: Record<ContextClass, string> = {
  Squad: "128k",
  Maniple: "272k",
  Clan: "400k",
  Legion: "1M",
};

export function contextClassLabel(cls: ContextClass): string {
  return `${cls} (${CONTEXT_CLASS_DISPLAY[cls]})`;
}

/**
 * Ordinal for comparison. Squad < Maniple < Clan < Legion.
 */
export function contextClassOrd(cls: ContextClass): number {
  return CLASS_ORD[cls];
}

/**
 * Compare two context classes. Returns negative if a < b, 0 if equal, positive if a > b.
 */
export function compareContextClass(a: ContextClass, b: ContextClass): number {
  return CLASS_ORD[a] - CLASS_ORD[b];
}

/**
 * All context classes in ascending order.
 */
export const CONTEXT_CLASSES: readonly ContextClass[] = ["Squad", "Maniple", "Clan", "Legion"];

// ─── Thinking Level Display Names ────────────────────────────
// Internal values stay off/minimal/low/medium/high.
// Operator-facing display uses the Mechanicum cognition ladder.

export type ThinkingLevel = "off" | "minimal" | "low" | "medium" | "high";

const THINKING_DISPLAY: Record<ThinkingLevel, string> = {
  off: "Servitor",
  minimal: "Functionary",
  low: "Adept",
  medium: "Magos",
  high: "Archmagos",
};

/**
 * Operator-facing display label for a thinking level.
 * Maps internal values to the Mechanicum cognition ladder.
 */
export function thinkingLevelLabel(level: ThinkingLevel): string {
  return THINKING_DISPLAY[level] ?? level;
}
