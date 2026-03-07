# unified-dashboard — Tasks

## 1. Shared State Types & Emitter Infrastructure

- [ ] 1.1 Extend SharedState interface in extensions/shared-state.ts with designTree?, openspec?, cleave? properties and their type definitions
- [ ] 1.2 Add DashboardEvent type and "dashboard:update" channel constant

## 2. Design Tree Emitter

- [ ] 2.1 Add emitDashboardState() function to design-tree/index.ts that writes sharedState.designTree with node counts, focused node, and open questions
- [ ] 2.2 Call emitDashboardState() at every point where updateWidget() was previously called (tool_execution_end, focus/unfocus, status changes)
- [ ] 2.3 Remove all setWidget("design-tree", ...) calls from design-tree/index.ts
- [ ] 2.4 Remove the /design widget toggle command (widget subcommand) — dashboard subsumes this
- [ ] 2.5 Fire pi.events.emit("dashboard:update") after each sharedState write

## 3. OpenSpec Emitter

- [ ] 3.1 Add emitDashboardState() function to openspec/index.ts that writes sharedState.openspec with change names, stages, and task progress
- [ ] 3.2 Call emitDashboardState() after session_start scan and after any change mutation (propose, add_spec, fast_forward, archive)
- [ ] 3.3 Fire pi.events.emit("dashboard:update") after each sharedState write

## 4. Cleave Emitter

- [ ] 4.1 Add emitDashboardState() function to cleave/index.ts that writes sharedState.cleave with status, runId, and children array
- [ ] 4.2 Emit idle state on session_start
- [ ] 4.3 Emit state transitions: assessing → planning → dispatching → merging → done/failed
- [ ] 4.4 In dispatcher.ts, update sharedState.cleave.children[n] in spawn start/exit callbacks with status and elapsed time
- [ ] 4.5 Fire pi.events.emit("dashboard:update") on each transition and child status change

## 5. Dashboard Footer Component

- [ ] 5.1 Create extensions/dashboard/types.ts with DashboardMode enum, FooterRenderState, and section interfaces
- [ ] 5.2 Create extensions/dashboard/footer.ts with DashboardFooter Component class implementing render(width): string[]
- [ ] 5.3 Implement compact mode (Layer 0): single dashboard summary line with ◈ D:x/y ◎ OS:n ⚡ status + context gauge
- [ ] 5.4 Implement raised mode (Layer 1): design tree section, openspec section, cleave section (5-8 lines)
- [ ] 5.5 Reimplement built-in footer data: pwd (~), git branch, session name, input/output/cache tokens, cost, context%, model name, thinking level, extension statuses
- [ ] 5.6 Support invalidate() for theme changes — rebuild all themed strings

## 6. Dashboard Extension Entry Point

- [ ] 6.1 Create extensions/dashboard/index.ts with extension registration, setFooter(), and pi.events subscription
- [ ] 6.2 Register Ctrl+Shift+D shortcut via pi.registerShortcut to toggle raised/lowered and call tui.requestRender()
- [ ] 6.3 Implement /dashboard slash command for toggle and status info
- [ ] 6.4 Persist raised/lowered state via pi.appendEntry("dashboard-state") and restore on session_start
- [ ] 6.5 Subscribe to "dashboard:update" events and re-render footer
- [ ] 6.6 Track turn count via turn_end events (absorbing status-bar logic)
- [ ] 6.7 Read sharedState.memoryTokenEstimate for context gauge (absorbing status-bar logic)
- [ ] 6.8 Unsubscribe from pi.events on session_shutdown

## 7. Cleanup & Wiring

- [ ] 7.1 Delete extensions/status-bar.ts
- [ ] 7.2 Update package.json: remove status-bar.ts from pi.extensions, add extensions/dashboard/index.ts after design-tree
- [ ] 7.3 Verify extension load order: cleave → openspec → design-tree → dashboard
- [ ] 7.4 Smoke test: start pi session, verify compact footer renders with all three sections
