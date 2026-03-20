/**
 * Routing session state — tracks the session's context capacity and requirements.
 *
 * The routing state captures both what the current model offers (active)
 * and what the session minimally needs (required floor). This dual tracking
 * lets the downgrade policy detect unsafe switches before they happen.
 */

import {
  classifyContextWindow,
  contextClassOrd,
  CONTEXT_CLASS_TOKENS,
  type ContextClass,
} from "./context-class.ts";

// ─── Types ───────────────────────────────────────────────────

export interface RoutingSessionState {
  /** Token capacity of the currently active model. */
  activeContextWindow: number;
  /** Context class of the currently active model. */
  activeContextClass: ContextClass;

  /** Minimum token count the session can safely tolerate. */
  requiredMinContextWindow: number;
  /** Context class corresponding to the required minimum. */
  requiredMinContextClass: ContextClass;

  /** Operator-pinned floor (optional, overrides auto-calculated minimum). */
  pinnedFloor?: ContextClass;

  /** Last observed prompt token usage. */
  observedUsage?: number;
  /** Remaining capacity: activeContextWindow - observedUsage. */
  headroom?: number;

  /** Whether the downgrade safety arm is engaged (default: true). */
  downgradeSafetyArmed: boolean;
}

// ─── Initialization ──────────────────────────────────────────

/**
 * Initialize routing state from a resolved model and its route envelope.
 *
 * The required minimum defaults to Squad — the smallest class.
 * The operator can pin a higher floor later.
 */
export function initRoutingState(
  contextCeiling: number,
): RoutingSessionState {
  return {
    activeContextWindow: contextCeiling,
    activeContextClass: classifyContextWindow(contextCeiling),
    requiredMinContextWindow: CONTEXT_CLASS_TOKENS.Squad,
    requiredMinContextClass: "Squad",
    downgradeSafetyArmed: true,
  };
}

// ─── Mutations (pure — return new state) ─────────────────────

/**
 * Update observed token usage and recalculate headroom.
 */
export function updateUsage(
  state: RoutingSessionState,
  observedTokens: number,
): RoutingSessionState {
  return {
    ...state,
    observedUsage: observedTokens,
    headroom: Math.max(0, state.activeContextWindow - observedTokens),
  };
}

/**
 * Pin the context floor to a minimum class.
 * This prevents automatic downgrade below the pinned class.
 */
export function pinFloor(
  state: RoutingSessionState,
  minClass: ContextClass,
): RoutingSessionState {
  const minTokens = CONTEXT_CLASS_TOKENS[minClass];
  const effectiveMin = Math.max(state.requiredMinContextWindow, minTokens);
  return {
    ...state,
    pinnedFloor: minClass,
    requiredMinContextWindow: effectiveMin,
    requiredMinContextClass: classifyContextWindow(effectiveMin),
  };
}

/**
 * Update state when switching to a new model.
 */
export function switchModel(
  state: RoutingSessionState,
  newContextCeiling: number,
): RoutingSessionState {
  return {
    ...state,
    activeContextWindow: newContextCeiling,
    activeContextClass: classifyContextWindow(newContextCeiling),
    // Reset usage/headroom — new model, new session context
    observedUsage: undefined,
    headroom: undefined,
  };
}

/**
 * Raise the required minimum based on observed usage.
 * Called when the session accumulates enough context that
 * downgrading would lose critical information.
 */
export function raiseFloorFromUsage(
  state: RoutingSessionState,
  usageTokens: number,
): RoutingSessionState {
  // Only raise, never lower
  if (usageTokens <= state.requiredMinContextWindow) return state;

  // Don't raise above the active window
  const newMin = Math.min(usageTokens, state.activeContextWindow);
  return {
    ...state,
    requiredMinContextWindow: newMin,
    requiredMinContextClass: classifyContextWindow(newMin),
  };
}

/**
 * Context class delta between current and a candidate.
 * Positive = downgrade (current is larger), negative = upgrade.
 */
export function contextClassDelta(
  current: ContextClass,
  candidate: ContextClass,
): number {
  return contextClassOrd(current) - contextClassOrd(candidate);
}
