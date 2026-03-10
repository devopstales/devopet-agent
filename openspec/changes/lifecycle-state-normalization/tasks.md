# Lifecycle state normalization — Tasks

## 1. Define the canonical lifecycle resolver
<!-- specs: lifecycle/resolver -->

- [ ] 1.1 Define a normalized lifecycle summary shape with stage, verification substate, archive readiness, binding status, task counts, and assessment freshness
- [ ] 1.2 Implement the canonical resolver in shared OpenSpec lifecycle logic
- [ ] 1.3 Add regression tests for canonical lifecycle summary computation

## 2. Move OpenSpec status/archive surfaces onto the resolver
<!-- specs: lifecycle/resolver -->

- [ ] 2.1 Refactor OpenSpec status and get-detail reporting to consume the canonical lifecycle resolver
- [ ] 2.2 Refactor archive-readiness/gating paths to consume the same resolver outcome
- [ ] 2.3 Add regression tests proving status/detail/archive surfaces agree on lifecycle truth

## 3. Align dashboard and design-tree lifecycle truth incrementally
<!-- specs: lifecycle/resolver -->

- [ ] 3.1 Update dashboard-facing OpenSpec lifecycle publication to use the canonical resolver output
- [ ] 3.2 Normalize design-tree bound-to-OpenSpec lifecycle metadata against the same resolver/binding rule set
- [ ] 3.3 Add regression tests for dashboard/design-tree lifecycle agreement where shared fields overlap

## 4. Validate the lifecycle normalization slice
<!-- specs: lifecycle/resolver -->

- [ ] 4.1 Run targeted OpenSpec and design-tree tests covering lifecycle normalization
- [ ] 4.2 Run `npm run typecheck`
