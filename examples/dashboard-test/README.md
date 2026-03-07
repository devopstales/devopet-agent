# Dashboard Test Fixture

A self-contained test harness for the unified dashboard extension. Populates
`sharedState` with realistic seed data and renders the `DashboardFooter` at
multiple widths and in both modes (compact / raised), printing ANSI output
to stdout.

## Usage

```bash
# From pi-kit root:
npx tsx examples/dashboard-test/render.ts

# With specific width:
COLUMNS=80 npx tsx examples/dashboard-test/render.ts

# Compact only:
npx tsx examples/dashboard-test/render.ts compact

# Raised only:
npx tsx examples/dashboard-test/render.ts raised
```

## What it exercises

- **Design Tree state**: 7 nodes across all statuses (decided, exploring,
  implementing, implemented, blocked), focused node with open questions,
  implementing nodes with branch associations.
- **OpenSpec state**: 4 changes at different lifecycle stages (active with
  partial progress, complete, spec-only, archived).
- **Cleave state**: cycles through idle → assessing → dispatching (with
  children in mixed states) → done → failed.
- **Context gauge**: simulated token stats and memory estimate.
- **Width breakpoints**: renders at 80, 120, and 160 columns to hit narrow,
  wide, and ultra-wide code paths.
