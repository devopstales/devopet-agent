# Cleave Process Tree — bidirectional parent↔child coordination — Design Tasks

## 1. Open Questions

- [ ] 1.1 How does the child agent (an LLM) actually use the coordination channel? It would need a tool (e.g., cleave_coordinate) registered in the child process that sends/receives messages over the socket. Is this a pi extension loaded in children, or injected by the parent?
- [ ] 1.2 Should input_request block the child (wait for parent response) or should the child continue working and receive the response asynchronously? Blocking is simpler but wastes child compute time. Async is complex but more efficient.
- [ ] 1.3 How does sibling_update actually change child behavior? The child LLM would need to see the update in its context. Does the parent inject it as a follow-up message, or does the child tool poll for updates?
- [ ] 1.4 What's the minimum viable version? Just structured progress + explicit status (replacing stdout scraping and exit-code reconciliation) without mid-task negotiation — would that alone justify the complexity?
