/**
 * Dashboard interactive overlay (Layer 2).
 *
 * TODO: Full implementation — interactive tree navigator, OpenSpec detail viewer,
 * and cleave run drill-down. For v1, this is a stub.
 *
 * The overlay is opened from raised mode via Ctrl+Shift+D (third press)
 * or a future dedicated shortcut. It steals keyboard focus and requires
 * Esc to dismiss.
 */

import type { ExtensionContext } from "@mariozechner/pi-coding-agent";

export async function showDashboardOverlay(_ctx: ExtensionContext): Promise<void> {
  // TODO: Implement Layer 2 interactive overlay
  // - Design tree navigator with fold/expand
  // - OpenSpec change detail viewer
  // - Cleave run drill-down with child logs
  // For now, the raised footer (Layer 1) provides all the detail.
}
