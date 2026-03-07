---
status: exploring
tags: [cleave, skills, dispatch, agent-specialization]
dependencies: [scenario-first-task-generation]
open_questions:
  - Q1: Should skill matching be automatic (scope heuristic) or explicit (annotation)?
  - Q2: Should the child prompt inject skill content inline, or instruct the child to read it?
  - Q3: Can a child request additional skills mid-execution (self-select)?
  - Q4: Should skills be composable (child gets multiple skills) or singular?
  - Q5: How do project-local skills vs pi-kit skills interact?
  - Q6: Should skill matching extend to model tier selection (e.g., TUI tasks → opus)?
---

# Skill-Aware Child Dispatch

## Problem

Cleave child processes are spawned as `pi -p --no-session` with a task prompt piped via stdin. Each child runs a full pi agent with all extensions and skills available in the `<available_skills>` system prompt block. However:

1. **Children don't know which skills matter.** The task file says "implement RBAC middleware" but doesn't say "load the python skill" or "load the rust skill." The child must self-discover relevance from the skill descriptions — an unreliable heuristic, especially for local models.

2. **No domain-specialist behavior.** A TUI implementation task gets the same generic agent as a database migration task. A child working on Kubernetes manifests doesn't know to load the k8s-operations skill proactively.

3. **Wasted context.** Children see all ~20 skills in their system prompt but typically need 1–3. Irrelevant skill descriptions consume context tokens without benefit — especially painful for local models with smaller windows.

4. **No skill-to-model routing.** Some skills imply complexity (architecture, TUI layout) that benefits from opus-tier reasoning. Others (boilerplate, config files) are fine with haiku. The dispatcher treats all children identically.

## Current Architecture

```
Orchestrator (cleave/index.ts)
  ├─ Plan: SplitPlan with ChildPlan[] (label, description, scope, specDomains, dependsOn)
  ├─ Workspace: generates {n}-task.md per child
  ├─ Dispatcher: spawns `pi -p --no-session` per child
  │   └─ buildChildPrompt(taskContent, directive, workspacePath) → flat text
  └─ Each child gets: contract + root directive + task markdown
      └─ System prompt includes <available_skills> (all skills, unfiltered)
```

The child's only signal about *what kind of work* it's doing comes from the task description and scope. The system relies on the child agent's general intelligence to figure out domain relevance.

## Design Space

### Approach A: Annotation-Driven Skill Injection

Extend the `<!-- specs: domain -->` annotation pattern to include skills:

```markdown
## 1. RBAC Middleware
<!-- specs: relay/rbac -->
<!-- skills: python, k8s-operations -->
- [ ] 1.1 Implement capability check decorator
```

**Pros:** Explicit, deterministic, no heuristic failures.
**Cons:** Requires the task author (LLM or human) to know which skills exist. Adds friction to task generation.

### Approach B: Scope-Based Skill Matching

Map file extensions and path patterns to skills automatically:

```
*.py, *.pyi, pyproject.toml    → python
*.rs, Cargo.toml               → rust
Containerfile, Dockerfile      → oci
*.yaml + k8s path patterns     → k8s-operations
extensions/*/index.ts          → (pi extension patterns)
```

**Pros:** Zero annotation overhead. Works with existing task files.
**Cons:** Ambiguous for mixed-language scopes. Can't infer conceptual skills (style, architecture).

### Approach C: Hybrid — Auto-Match + Override

Auto-match from scope (Approach B) as default, with `<!-- skills: ... -->` annotation to override or augment.

**Pros:** Best of both. Automatic for common cases, explicit for edge cases.
**Cons:** Two code paths to maintain. Precedence rules needed.

### Approach D: Skill Injection vs. Skill Directive

Two sub-strategies for *how* the child receives skill knowledge:

**D1: Inline injection** — Read the SKILL.md content at dispatch time, embed it in the child prompt.
- Pro: Child has knowledge immediately, no tool call needed
- Con: Bloats the prompt, especially with multiple skills
- Con: Stale if skill files change between dispatch and execution (unlikely in practice)

**D2: Directive to read** — Add a line to the child prompt: "Before starting, read these skill files: `skills/python/SKILL.md`, `skills/oci/SKILL.md`"
- Pro: Lightweight prompt, child can skip if irrelevant
- Con: Costs tool calls (one `read` per skill)
- Con: Local models may not reliably follow the instruction

### Approach E: Model Tier Routing

Extend skill metadata with a `complexity` hint:

```yaml
---
name: python
description: ...
complexity: standard    # haiku/sonnet sufficient
---
```

```yaml
---
name: style
description: ...
complexity: elevated    # prefer opus for visual reasoning
---
```

The dispatcher uses matched skills to influence `child.backend` (local vs cloud) and potentially model tier.

**Pros:** Cost optimization — simple tasks get cheaper models.
**Cons:** Complexity hints are subjective. Task difficulty ≠ skill difficulty.

## Key Constraints

1. **Child processes are `pi -p --no-session`** — they get the same `package.json` extensions and skills as the parent. We can't selectively load skills per child at the pi-agent level; we can only influence the *prompt*.

2. **Skills are lazy-loaded by convention** — the system prompt lists skills with descriptions and paths, but content is only loaded when the agent reads the file. This is a pi-core design choice we can't change.

3. **`buildChildPrompt` is the injection point** — this is where we control what the child sees beyond the system prompt.

4. **Local models are less reliable at self-selection** — they may not read skill files without explicit instruction.

## Decisions

### D1: Hybrid matching (Approach C)

Use scope-based auto-matching with `<!-- skills: ... -->` annotation override. Rationale:
- Automatic matching handles 80% of cases (file extension → skill is reliable)
- Annotations handle conceptual skills (style, architecture) and edge cases
- Consistent with the `<!-- specs: ... -->` annotation pattern already established

**Status:** proposed

### D2: Directive to read, not inline injection (Approach D2)

Add skill file paths to the child prompt as explicit read instructions, not inline content. Rationale:
- Skills can be 200+ lines — inlining 3 skills would consume 600+ tokens of prompt
- The child agent already has `read` tool access
- If the child ignores the directive, the skill descriptions in `<available_skills>` still provide a fallback signal

**Exception:** For local model children, consider a brief inline summary (first 10 lines of each skill) since they're less reliable at following multi-step instructions.

**Status:** proposed

### D3: Scope-to-skill mapping is extensible

The mapping lives in a data structure (not hardcoded if/else), so projects can add custom mappings:

```typescript
interface SkillMapping {
  /** Glob patterns that trigger this skill */
  patterns: string[];
  /** Skill name (must match a SKILL.md name) */
  skill: string;
  /** Optional: model tier hint */
  preferredTier?: "haiku" | "sonnet" | "opus";
}

const DEFAULT_MAPPINGS: SkillMapping[] = [
  { patterns: ["*.py", "*.pyi", "pyproject.toml", "Pipfile"], skill: "python" },
  { patterns: ["*.rs", "Cargo.toml", "Cargo.lock"], skill: "rust" },
  { patterns: ["*.ts", "*.tsx", "*.js", "*.jsx", "package.json"], skill: "typescript" },
  { patterns: ["Containerfile", "Dockerfile", "*.dockerfile"], skill: "oci" },
  { patterns: ["*.yaml", "*.yml"], skill: "k8s-operations", preferredTier: "sonnet" },
  // Conceptual skills can't be auto-matched — annotation only
];
```

**Status:** proposed

### D4: Defer model tier routing (Approach E)

Model tier routing is interesting but orthogonal. The `preferredTier` hint in the mapping exists as a future hook, but the dispatcher won't act on it yet. Current backend selection (local vs cloud) remains based on `prefer_local` flag.

**Status:** deferred

## Implementation Sketch

### New type: `ChildPlan.skills`

```typescript
interface ChildPlan {
  label: string;
  description: string;
  scope: string[];
  dependsOn: string[];
  specDomains: string[];
  skills: string[];       // ← NEW: matched skill names
}
```

### New function: `matchSkillsToChild`

In `workspace.ts` or a new `skills.ts`:

```typescript
function matchSkillsToChild(child: ChildPlan, availableSkills: SkillInfo[]): string[] {
  // 1. Check annotation: child.skills already set from <!-- skills: ... -->
  if (child.skills.length > 0) return child.skills;

  // 2. Auto-match from scope
  const matched = new Set<string>();
  for (const scopeEntry of child.scope) {
    for (const mapping of DEFAULT_MAPPINGS) {
      if (mapping.patterns.some(p => minimatch(scopeEntry, p))) {
        matched.add(mapping.skill);
      }
    }
  }

  // 3. Filter to actually-available skills
  return [...matched].filter(s => availableSkills.some(a => a.name === s));
}
```

### Modified: `buildChildPrompt`

```typescript
function buildChildPrompt(
  taskFileContent: string,
  rootDirective: string,
  workspacePath: string,
  skillPaths: { name: string; path: string }[],  // ← NEW
): string {
  // ... existing contract ...

  let skillDirective = "";
  if (skillPaths.length > 0) {
    skillDirective = `## Specialist Skills\n\n` +
      `Before starting, read these skill files for domain-specific guidance:\n\n` +
      skillPaths.map(s => `- \`${s.path}\` (${s.name})`).join("\n") +
      `\n\nThese contain conventions, patterns, and constraints relevant to your task.\n`;
  }

  return [contract, skillDirective, taskContent, reminder].join("\n");
}
```

### Modified: `parseTasksFile` annotation

Extend the existing annotation parser to recognize `<!-- skills: ... -->`:

```typescript
// Already parses: <!-- specs: relay/rbac -->
// Add:            <!-- skills: python, k8s-operations -->
const skillMatch = line.match(/<!--\s*skills:\s*(.+?)\s*-->/);
if (skillMatch) {
  currentGroup.skills = skillMatch[1].split(",").map(s => s.trim());
}
```

## What This Does NOT Do

- **Does not create new agent profiles** — children are still generic pi agents
- **Does not restrict skills** — children can still read any skill file they want
- **Does not change pi-core** — works entirely within the extension layer
- **Does not guarantee skill usage** — the child may ignore the directive

## Open Threads

- Should `matchSkillsToChild` also scan the task *description* for skill signals? ("Set up pytest fixtures" → python skill even if scope is empty)
- How to handle skills that are project-local vs pi-kit-global? The skill paths differ.
- Should the orchestrator report which skills were matched per child in the progress output?
</content>
</invoke>