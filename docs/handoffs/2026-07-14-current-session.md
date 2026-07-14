# Rike session handoff — 2026-07-14

## Current state

- Worktree is clean after `ce017a2 feat: refine period and daily guidance`.
- Recent commits:
  - `ce017a2` — period-limited navigation/statistics, explicit paper-spin button, daily guidance dataset and heart treatment.
  - `2376333` — local system-period configuration.
  - `350ca73` — Lucky Canvas wheel, favourites, visual exemption treatment, and prior related work.
- No tests, type checks, lint, build, preview, or browser checks were run. Repository rule: do not run or modify tests unless the user explicitly authorizes a specific verification activity; see `AGENTS.md`.

## Module correspondence

| Concern | Main module(s) | Relationship |
| --- | --- | --- |
| App root | `src/app/App.tsx` → `src/pages/daily-plan-page.tsx` | `App` renders the single workspace page. |
| Global period | `src/features/system-config/index.ts` | Persists `rike-system-config`; default period is `2026-07-13` through `2026-08-29`. Exports `readSystemConfig`, `isDateInPeriod`, and `clampDateToPeriod`. No settings UI exists. |
| Date state | `src/features/plans/store/index.ts` | Zustand + localforage persisted plan state (`rike-plan-state`). Clamps selected dates and date/range navigation to the global period. |
| Page shell / routing | `src/pages/daily-plan-page.tsx` | Owns calendar, week summary, statistics, favourites, and fishing-wheel workspace states. Supplies period-aware navigation to calendar pages and statistics. |
| Calendar transitions | `src/features/calendar/components/page-turn.tsx` | `PageTurn` now accepts `canTurn`; edge turns are blocked before gesture/animation begins. |
| Day/week/month views | `src/features/calendar/components/{month-view,week-view}.tsx`, `src/features/plans/components/date-navigator.tsx` | Read the system period, disable out-of-period cells/buttons, and only show in-period week spans. |
| Statistics | `src/features/plans/statistics/index.ts`, `src/features/calendar/components/statistics-page.tsx`, `src/features/plans/components/sunday-summary.tsx` | Statistics functions accept an optional `SystemPeriod`; all UI callers pass it so out-of-period records are ignored. |
| Daily guidance | `src/features/daily-guidance/{model,sample,index}.ts` | `sample.ts` holds 48 unique learning-related records for the full period and exports `getDailyGuidance(systemDate)`. Values outside the period fall back to the nearest endpoint record. |
| Daily guidance UI / favourites | `src/pages/daily-plan-page.tsx` | Gift text is keyed to the actual system date (midnight timer), never the selected calendar date. Clicking text copies it; right-side heart toggles local favourites (`rike-daily-guidance-favorites`) and active state is red with a small pop. |
| Favourites page | `src/pages/daily-plan-page.tsx` | Opened through the upper-left toolbar. Favourites are sorted ascending by gift date. |
| Fishing wheel | `src/features/fishing-wheel/{fishing-wheel-page,store}.ts[x]` | Available from the upper-left toolbar. Uses `@lucky-canvas/react`; spin records persist as `rike-fishing-wheel`. Daily base spin refreshes at midnight within the period. |
| Paper reward spins | `src/features/fishing-wheel/store.ts`, `fishing-wheel-page.tsx` | The “写完一张试卷 +1 并抽奖” button increments the locally persisted `paperRewardCount` up to 3 for the configured period and immediately starts a paper-reward spin. It no longer infers rewards from task text. |
| Prize application | `src/features/plans/store/index.ts` | `applyWheelExemptions` marks targets completed, including future plan records. `PlanItemRow` plus `src/app/styles.css` render exempted items with a colourful flowing strike. |
| Toolbar | `src/features/calendar/components/workspace-toolbar.tsx` | Upper-left menu exposes day/week/month, summaries/statistics, daily-guidance favourites, and fishing wheel. |
| Future page-turn direction | `docs/requirements/2026-07-14-rike-requirements-log.md` | Future replacement/rework of page turning should use `react-pageflip`; do not expand the current native WebGL turn implementation. |

## Important behavior details

- The global period is enforced on navigation, page-turn gestures, week/month cell activation, and all statistics. Out-of-period dates may appear only as disabled calendar padding.
- Wheel “daily” attempts reset at midnight. The three paper-reward attempts are a separate persisted limit and do not reset daily.
- A blank sixth weekday task changes only the task-six prize handling as implemented in `fishing-wheel-page.tsx`; pending exemptions can be applied later from wheel history.
- Existing legacy favourites can remain in `localStorage`; new favourites use the system-date guidance ID and are deduplicated by `date:guidanceId`.

## Suggested skills

- `ponytail` for any code change: preserve the smallest viable extension and avoid new abstraction layers.
- `frontend-design` for any further visual interaction or page reshaping.
- `caveman-commit` when the user asks for a commit message or commit workflow.
- `handoff` again if the next session ends with unresolved work.

## References

- Repository behavior and verification constraints: `AGENTS.md`.
- Earlier architectural artifacts: `docs/handoffs/README.md`, `docs/requirements/2026-07-14-rike-requirements-log.md`.
