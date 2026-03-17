---
id: cleave-process-tree
title: Cleave Process Tree — bidirectional parent↔child coordination
status: exploring
related: [multi-instance-coordination, cleave-child-observability]
tags: [architecture, cleave, subprocess, ipc, coordination, strategic]
open_questions:
  - "How does the child agent (an LLM) actually use the coordination channel? It would need a tool (e.g., cleave_coordinate) registered in the child process that sends/receives messages over the socket. Is this a pi extension loaded in children, or injected by the parent?"
  - Should input_request block the child (wait for parent response) or should the child continue working and receive the response asynchronously? Blocking is simpler but wastes child compute time. Async is complex but more efficient.
  - How does sibling_update actually change child behavior? The child LLM would need to see the update in its context. Does the parent inject it as a follow-up message, or does the child tool poll for updates?
  - "What's the minimum viable version? Just structured progress + explicit status (replacing stdout scraping and exit-code reconciliation) without mid-task negotiation — would that alone justify the complexity?"
issue_type: feature
priority: 2
---

# Cleave Process Tree — bidirectional parent↔child coordination

## Overview

Replace cleave's current fire-and-forget task-file protocol with bidirectional parent↔child communication. Children are trusted subprocesses spawned by Omegon — no discovery, no auth, no HTTP overhead. The goal is enabling mid-task negotiation (child asks parent for input), sibling awareness (children know what others have done), structured progress (richer than stdout line scraping), and coordinated resource access (shared file locks, interface contracts).

## Research

### Current cleave child communication model

**Today's protocol is entirely file-based and unidirectional:**

1. Parent writes `N-task.md` with contract, scope, and directive
2. Parent spawns child `pi -p --no-session` with prompt on stdin
3. Child executes in isolated git worktree
4. Parent scrapes child stdout line-by-line for dashboard status (debounced, heuristic filtering via `isChildStatusLine`)
5. Child writes results back to `N-task.md` (Status, Summary, Artifacts, Decisions, Interfaces)
6. Parent reads task file post-exit to determine `SUCCESS/PARTIAL/FAILED/NEEDS_DECOMPOSITION`
7. Parent merges child's branch back to base

**What works:** Isolation (worktrees), parallelism (wave dispatch), result harvesting (task files), review loop (re-run in same worktree).

**What doesn't work:**
- **No mid-task input:** Child gets stuck → fails. No way to ask parent "which approach should I take?" or "this file conflicts with sibling, what do I do?"
- **No sibling awareness:** Children don't know what other children are doing. Two children modifying the same interface can't coordinate at execution time — conflicts are detected only at merge.
- **Stdout scraping is lossy:** `isChildStatusLine` is a heuristic filter. Structured progress (% complete, files touched, decisions made) requires parsing free-text output.
- **No partial result streaming:** Parent only sees the final task file. A child producing useful intermediate artifacts (e.g., an interface definition that another child needs) can't share them until it's done.
- **Exit code is unreliable:** Child might exit 0 but write FAILED in the task file, or exit non-zero but have completed useful work. The status determination logic in `dispatchSingleChild` has multiple fallback paths to reconcile this.

### IPC mechanism candidates

All candidates must work with `spawn()` detached child processes on macOS and Linux.

**1. Structured stdin/stdout JSON lines (JSONL over stdio)**
- Parent writes JSON messages to child stdin, child writes JSON messages to stdout
- Zero infrastructure — uses existing process pipes
- Requires a framing protocol: each line is a complete JSON object with `type` field
- Challenge: pi's `-p` mode currently reads the full prompt from stdin then closes it. Would need a mode where stdin stays open for ongoing messages.
- Challenge: child stdout is currently consumed for "the LLM response". Structured messages would need to be multiplexed with or replace the free-text output.

**2. Unix domain socket per child**
- Parent creates a socket, passes path to child via env var
- Bidirectional, reliable, well-understood
- Works across worktree boundaries (socket lives in `/tmp` or `~/.pi/cleave/`)
- Slightly more setup than stdio but cleaner separation of control channel from output
- Node.js `net.createServer` / `net.connect` — no dependencies

**3. Named pipe (FIFO)**
- One pipe per direction (parent→child, child→parent)
- Simpler than sockets but less flexible (no multiplexing)
- macOS/Linux compatible

**4. Shared file with inotify/fswatch**
- Children write to a shared coordination file, parent watches
- Fragile, platform-dependent, race-prone
- Not recommended

**5. Localhost HTTP**
- Parent runs HTTP server, children POST to it
- Works but adds HTTP overhead for co-located processes
- This is what A2A does — already rejected for this use case

**Recommendation: Option 2 (Unix domain socket) for the control channel.** Stdio stays for prompt delivery (one-shot) and output capture (for review). The socket is a separate bidirectional channel for structured coordination messages independent of the LLM I/O.

### Message types for parent↔child protocol

A minimal message set that solves the identified gaps:

**Parent → Child:**
- `sibling_update {childId, label, event: "completed"|"published_interface"|"decision", data}` — Inform child about sibling progress. Enables reactive coordination.
- `input_response {requestId, content}` — Reply to a child's input request.
- `abort {reason}` — Tell child to stop (replaces SIGTERM for graceful shutdown).

**Child → Parent:**
- `progress {percent?, phase?, filesModified?, message}` — Structured progress replacing stdout scraping.
- `input_request {requestId, question, context, options?}` — Ask parent for guidance. Parent can auto-resolve, delegate to operator, or escalate.
- `publish {type: "interface"|"decision"|"artifact", name, content}` — Announce an intermediate result that siblings might need.
- `status {status: "working"|"blocked"|"completed"|"failed", summary?}` — Explicit lifecycle state changes (replaces exit-code + task-file reconciliation).

**Key design principle:** Messages are advisory, not blocking. A child that never connects to the socket still works exactly as today — the protocol is an enhancement layer, not a requirement. This preserves backward compatibility with the current fire-and-forget model.

## Open Questions

- How does the child agent (an LLM) actually use the coordination channel? It would need a tool (e.g., cleave_coordinate) registered in the child process that sends/receives messages over the socket. Is this a pi extension loaded in children, or injected by the parent?
- Should input_request block the child (wait for parent response) or should the child continue working and receive the response asynchronously? Blocking is simpler but wastes child compute time. Async is complex but more efficient.
- How does sibling_update actually change child behavior? The child LLM would need to see the update in its context. Does the parent inject it as a follow-up message, or does the child tool poll for updates?
- What's the minimum viable version? Just structured progress + explicit status (replacing stdout scraping and exit-code reconciliation) without mid-task negotiation — would that alone justify the complexity?
