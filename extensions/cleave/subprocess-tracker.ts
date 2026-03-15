/**
 * cleave/subprocess-tracker — Process registry for cleave subprocesses.
 *
 * Mirrors the extraction-v2 pattern: all spawned child processes are tracked
 * in a Set, killed by process group (SIGTERM to -pid), and cleaned up on
 * session_shutdown. Prevents orphaned `pi` processes when assessments time
 * out or sessions exit mid-dispatch.
 */

import type { ChildProcess } from "node:child_process";

const allCleaveProcs = new Set<ChildProcess>();

/** Kill a single subprocess by process group, with fallback to direct kill. */
export function killCleaveProc(proc: ChildProcess): void {
	try {
		if (proc.pid) process.kill(-proc.pid, "SIGTERM");
	} catch {
		try { proc.kill("SIGTERM"); } catch { /* already dead */ }
	}
}

/** Add a subprocess to the tracked set. */
export function registerCleaveProc(proc: ChildProcess): void {
	allCleaveProcs.add(proc);
}

/** Remove a subprocess from the tracked set. */
export function deregisterCleaveProc(proc: ChildProcess): void {
	allCleaveProcs.delete(proc);
}

/**
 * Force-kill a single subprocess (SIGKILL) by process group, with fallback.
 * Used for escalation when SIGTERM is ignored.
 */
function forceKillCleaveProc(proc: ChildProcess): void {
	try {
		if (proc.pid) process.kill(-proc.pid, "SIGKILL");
	} catch {
		try { proc.kill("SIGKILL"); } catch { /* already dead */ }
	}
}

/**
 * Kill all tracked cleave subprocesses and clear the registry.
 * Sends SIGTERM immediately, then SIGKILL after 5 seconds to any survivors.
 * Because cleave subprocesses are spawned with `detached: true`, they will
 * NOT receive SIGHUP when the parent exits — SIGKILL escalation is required.
 */
export function killAllCleaveSubprocesses(): void {
	const snapshot = [...allCleaveProcs];
	for (const proc of snapshot) {
		killCleaveProc(proc);
	}
	// Escalate: SIGKILL after 5s for any process that ignored SIGTERM.
	// The timer is unref'd so it does not keep the Node.js event loop alive.
	if (snapshot.length > 0) {
		const escalation = setTimeout(() => {
			for (const proc of snapshot) {
				if (!proc.killed) forceKillCleaveProc(proc);
			}
		}, 5_000);
		escalation.unref();
	}
	allCleaveProcs.clear();
}

/** Number of currently tracked subprocesses (for diagnostics). */
export function cleaveTrackedProcCount(): number {
	return allCleaveProcs.size;
}
