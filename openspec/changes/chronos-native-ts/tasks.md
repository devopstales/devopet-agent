# chronos-native-ts — Tasks

## 1. Implement chronos.ts — pure TS date functions
<!-- specs: chronos -->

- [ ] 1.1 Create `extensions/chronos/chronos.ts` with exported functions: `computeWeek(now)`, `computeMonth(now)`, `computeQuarter(now)`, `computeRelative(expression, now)`, `computeIso(now)`, `computeEpoch(now)`, `computeTz(now)`, `computeRange(from, to)`, `computeAll(now)`
- [ ] 1.2 Each function returns a string matching the existing output format (DATE_CONTEXT:, MONTH_CONTEXT:, etc.) so the tool output is backward-compatible
- [ ] 1.3 `resolveRelative` supports: N days/weeks/months ago, N days/weeks from now, yesterday, tomorrow, next/last {Monday-Sunday}
- [ ] 1.4 ISO week uses Thursday-based algorithm; business day counting iterates Mon-Fri
- [ ] 1.5 All functions accept an injectable `now?: Date` parameter defaulting to `new Date()`

## 2. Rewrite index.ts — replace shell-out with direct calls
<!-- specs: chronos -->

- [ ] 2.1 Remove `CHRONOS_SH` constant and all `existsSync` checks for the shell script
- [ ] 2.2 Import functions from `./chronos.ts` and call them directly in `execute()` and the `/chronos` command handler
- [ ] 2.3 Remove `pi.exec("bash", ...)` calls — tool no longer spawns a subprocess
- [ ] 2.4 Delete `extensions/chronos/chronos.sh`

## 3. Tests
<!-- specs: chronos -->

- [ ] 3.1 Create `extensions/chronos/chronos.test.ts` with deterministic tests using fixed dates
- [ ] 3.2 Test week boundaries (mid-week, Monday, Friday, weekend edge)
- [ ] 3.3 Test month boundaries including Feb (non-leap and leap year), Dec→Jan rollover
- [ ] 3.4 Test quarter + fiscal year for each calendar quarter
- [ ] 3.5 Test all relative expressions: days ago, weeks ago, months ago, yesterday, tomorrow, next/last each weekday
- [ ] 3.6 Test ISO week number, epoch seconds/millis, timezone output format
- [ ] 3.7 Test range: calendar days, business days, missing params error
- [ ] 3.8 Test "all" returns all section headers
- [ ] 3.9 Run `npm run typecheck` and `npm test` — all pass
