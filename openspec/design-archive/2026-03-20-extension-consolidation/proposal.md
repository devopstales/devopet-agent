# Extension Consolidation

## Intent

With the Rust rewrite branched away, the 31 TypeScript extensions have accumulated structural debt — functional overlap, micro-extensions that don't justify separate files, and cross-extension coupling that the extension boundary doesn't serve. This node explores consolidation to reduce the extension count, clarify ownership boundaries, and simplify the codebase for maintenance.

See [design doc](../../../docs/extension-consolidation.md).
