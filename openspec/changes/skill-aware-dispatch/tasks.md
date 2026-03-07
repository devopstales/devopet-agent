# Tasks: Skill-Aware Child Dispatch

## 1. Skill Matching & Annotation Parsing
<!-- specs: cleave -->
<!-- skills: typescript -->

- [ ] 1.1 Create `extensions/cleave/skills.ts` with `SkillMapping` interface, `DEFAULT_MAPPINGS` array, `matchSkillsToChild()` function
- [ ] 1.2 Add `resolveSkillPaths()` to resolve skill names to absolute SKILL.md paths
- [ ] 1.3 Extend `parseTasksFile` in `openspec.ts` to parse `<!-- skills: ... -->` annotations into `TaskGroup.skills`
- [ ] 1.4 Add `skills: string[]` field to `ChildPlan` in `types.ts`
- [ ] 1.5 Wire `skills` through `taskGroupsToChildPlans` and `mergeSmallGroups` in `openspec.ts`
- [ ] 1.6 Add tests for skill matching (glob patterns, annotation override, no-match, multi-skill)
- [ ] 1.7 Add tests for skill annotation parsing in `openspec.test.ts`

## 2. Prompt Injection & Model Routing
<!-- specs: cleave -->
<!-- skills: typescript -->

- [ ] 2.1 Modify `buildChildPrompt` in `dispatcher.ts` to accept and render skill directives section
- [ ] 2.2 Modify `generateTaskFile` in `workspace.ts` to include "Specialist Skills" section with skill paths
- [ ] 2.3 Add `executeModel` field to `ChildPlan` in `types.ts` with type `"local" | "haiku" | "sonnet" | "opus"`
- [ ] 2.4 Implement model resolution logic: annotation tier > skill `preferredTier` > default sonnet
- [ ] 2.5 Modify `spawnChild` in `dispatcher.ts` to pass resolved model ID via `--model` flag
- [ ] 2.6 Wire skill matching into `initWorkspace` call in `index.ts` (resolve skills before task file generation)
- [ ] 2.7 Add tests for prompt injection (skill section rendered, paths correct)
- [ ] 2.8 Add tests for model resolution (tier precedence, local override)

## 3. Review Loop & Severity Gating
<!-- specs: cleave -->
<!-- skills: typescript -->

Depends on: 2. Prompt Injection & Model Routing

- [ ] 3.1 Create `extensions/cleave/review.ts` with `ReviewVerdict`, `ReviewIssue`, `ReviewConfig` types
- [ ] 3.2 Implement `buildReviewPrompt()` — adversarial prompt with task context, git diff, spec scenarios
- [ ] 3.3 Implement `parseReviewResult()` — extract verdict (PASS/FAIL), categorized issues (C/W/N), spec results
- [ ] 3.4 Implement `buildFixPrompt()` — feed review issues to fix agent
- [ ] 3.5 Implement `severityGate()` — determine action from issue severities (pass/fix/escalate)
- [ ] 3.6 Implement `detectChurn()` — hash-based issue comparison between rounds, Jaccard similarity
- [ ] 3.7 Implement `executeWithReview()` — the full loop: execute → review → [fix → review] with severity gating and churn detection
- [ ] 3.8 Add `reviewIterations`, `reviewHistory` fields to `ChildState` in `types.ts`
- [ ] 3.9 Modify `dispatchSingleChild` in `dispatcher.ts` to call `executeWithReview` when review is enabled
- [ ] 3.10 Add `review` config option to `cleave_run` tool params in `index.ts` (default: true)
- [ ] 3.11 Add tests for review prompt construction
- [ ] 3.12 Add tests for review result parsing (PASS, FAIL with issues, malformed output)
- [ ] 3.13 Add tests for severity gating (nit-only pass, warning→1 fix, critical→2 fix, security→escalate)
- [ ] 3.14 Add tests for churn detection (>50% reappearance bails, genuine progress continues)
- [ ] 3.15 Add tests for `executeWithReview` full loop (mock spawnChild)
- [ ] 3.16 Update `skills/cleave/SKILL.md` with review loop documentation
