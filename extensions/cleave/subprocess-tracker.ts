/**
 * cleave/subprocess-tracker — Process registry for cleave subprocesses.
 *
 * All spawned child processes are tracked in a Set and killed on:
 *   1. Explicit call to killAllCleaveSubprocesses() (from session_shutdown)
 *   2. process.on('exit') safety net (catches crashes, SIGTERM, SIGINT,
 *      uncaught exceptions — anything session_shutdown misses)
 *   3. PID file scan on startup (catches SIGKILL to parent, machine reboot
 *      with processes still running)
 *
 * Children are spawned with `detached: true` so we can kill their entire
 * process group via `kill(-pid)`. The downside: detached children survive
 * parent death by default. The exit handler and PID file compensate for this.
 */

import type { ChildProcess } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, unlinkSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const allCleaveProcs = new Set<ChildProcess>();

// ── PID file ────────────────────────────────────────────────────────────────
// Each parent process writes its tracked child PIDs to a temp file.
// On startup, cleanupOrphanedProcesses() scans for files whose parent PID
// is dead and kills the orphaned children.

const PID_FILE_PREFIX = "devopet-cleave-";
const PID_FILE_SUFFIX = ".pids";

function pidFilePath(): string {
	return join(tmpdir(), `${PID_FILE_PREFIX}${process.pid}${PID_FILE_SUFFIX}`);
}

/** Write current tracked PIDs to the PID file. */
function syncPidFile(): void {
	const pids = [...allCleaveProcs]
		.map(p => p.pid)
		.filter((pid): pid is number => pid !== undefined && pid > 0);
	if (pids.length === 0) {
		// No tracked children — remove the file
		try { unlinkSync(pidFilePath()); } catch { /* ok */ }
		return;
	}
	try {
		writeFileSync(pidFilePath(), JSON.stringify({ parentPid: process.pid, childPids: pids }));
	} catch { /* best effort */ }
}

/**
 * Scan for PID files from dead parents and kill their orphaned children.
 * Call this during extension initialization (before any new spawns).
 * Returns the number of orphaned processes killed.
 */
export function cleanupOrphanedProcesses(): number {
	let killed = 0;
	try {
		const dir = tmpdir();
		const files = readdirSync(dir).filter(
			f => f.startsWith(PID_FILE_PREFIX) && f.endsWith(PID_FILE_SUFFIX),
		);
		for (const file of files) {
			const filepath = join(dir, file);
			try {
				const data = JSON.parse(readFileSync(filepath, "utf-8"));
				const parentPid = data?.parentPid;

				// Check if the parent that wrote this file is still alive
				if (parentPid && parentPid !== process.pid) {
					try {
						process.kill(parentPid, 0); // signal 0 = existence check
						continue; // Parent alive — not orphans, skip
					} catch {
						// Parent dead — these are orphans, kill them
					}
				} else if (parentPid === process.pid) {
					// Our own file from a previous lifecycle (shouldn't happen), clean up
					try { unlinkSync(filepath); } catch { /* ok */ }
					continue;
				}

				const childPids = data?.childPids;
				if (Array.isArray(childPids)) {
					for (const pid of childPids) {
						if (typeof pid !== "number" || pid <= 0) continue;
						try {
							// Kill the process group (detached children have their own group)
							process.kill(-pid, "SIGKILL");
							killed++;
						} catch {
							try {
								process.kill(pid, "SIGKILL");
								killed++;
							} catch { /* already dead */ }
						}
					}
				}
				// Remove the stale PID file
				try { unlinkSync(filepath); } catch { /* ok */ }
			} catch {
				// Malformed file — remove it
				try { unlinkSync(filepath); } catch { /* ok */ }
			}
		}
	} catch { /* best effort — tmpdir unreadable is non-fatal */ }
	return killed;
}

// ── Core tracking ───────────────────────────────────────────────────────────

/** Kill a single subprocess by process group, with fallback to direct kill. */
export function killCleaveProc(proc: ChildProcess): void {
	try {
		if (proc.pid) process.kill(-proc.pid, "SIGTERM");
	} catch {
		try { proc.kill("SIGTERM"); } catch { /* already dead */ }
	}
}

/** Add a subprocess to the tracked set and update the PID file. */
export function registerCleaveProc(proc: ChildProcess): void {
	allCleaveProcs.add(proc);
	syncPidFile();
}

/** Remove a subprocess from the tracked set and update the PID file. */
export function deregisterCleaveProc(proc: ChildProcess): void {
	allCleaveProcs.delete(proc);
	syncPidFile();
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
 * Sends SIGTERM immediately, then SIGKILL after 2 seconds to any survivors.
 * Because cleave subprocesses are spawned with `detached: true`, they will
 * NOT receive SIGHUP when the parent exits — SIGKILL escalation is required.
 */
export function killAllCleaveSubprocesses(): void {
	const snapshot = [...allCleaveProcs];
	for (const proc of snapshot) {
		killCleaveProc(proc);
	}
	// Escalate: SIGKILL after 2s for any process that ignored SIGTERM.
	// NOT unref'd — we MUST keep the event loop alive long enough for this
	// to fire, otherwise children may survive. 2s (not 5s) because at shutdown
	// speed matters more than grace.
	if (snapshot.length > 0) {
		const escalation = setTimeout(() => {
			for (const proc of snapshot) {
				if (!proc.killed) forceKillCleaveProc(proc);
			}
		}, 2_000);
		// Do NOT unref — this timer must fire even during shutdown.
		// The previous implementation used .unref() which allowed the process
		// to exit before SIGKILL was sent, leaving orphaned children alive.
		void escalation;
	}
	allCleaveProcs.clear();
	syncPidFile();
}

/** Number of currently tracked subprocesses (for diagnostics). */
export function cleaveTrackedProcCount(): number {
	return allCleaveProcs.size;
}

// ── Process exit safety net ─────────────────────────────────────────────────
//
// This is the critical fix for orphaned `pi` processes.
//
// `process.on('exit')` fires synchronously when the parent exits for ANY
// reason: normal exit, uncaught exception, SIGTERM, SIGINT. It does NOT
// fire on SIGKILL (which is why we also have the PID file mechanism).
//
// `process.kill()` is synchronous — safe to call inside an exit handler.
// We send SIGKILL (not SIGTERM) because at this point the parent is dying
// and we can't wait for graceful shutdown.
//
// This handler fires AFTER session_shutdown (which sends SIGTERM).
// If children are already dead from SIGTERM, the SIGKILL throws ESRCH
// and we catch it — no harm done.

process.on("exit", () => {
	for (const proc of allCleaveProcs) {
		try {
			if (proc.pid) process.kill(-proc.pid, "SIGKILL");
		} catch {
			try { proc.kill("SIGKILL"); } catch { /* already dead */ }
		}
	}
	// Clean up PID file — no orphans to track if we killed everything
	try { unlinkSync(pidFilePath()); } catch { /* ok */ }
});
