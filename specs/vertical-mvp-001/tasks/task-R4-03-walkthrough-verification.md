# Task R4-03: End-to-end walkthrough verification across all scoring paths and reduced motion

**Requirement:** R12 — Performance & Reliability, R13 — Accessibility, all acceptance criteria
**Status:** pending
**Priority:** P0
**Estimated Effort:** M
**Dependencies:** tasks/task-R0-01-scaffold-and-persistence.md, tasks/task-R1-01-map-layout-and-counters.md, tasks/task-R1-02-map-nodes-and-pulse.md, tasks/task-R2-01-lesson-frame.md, tasks/task-R2-02-lesson-question-and-answers.md, tasks/task-R2-03-hint-help-read-controls.md, tasks/task-R3-01-reward-render-and-anim.md, tasks/task-R4-01-scoring-and-persistence.md, tasks/task-R4-02-return-to-map-and-unlock.md
**Spec:** specs/vertical-mvp-001/

## Context

- **Why**: The slice is "done" only when the full map → lesson → reward → map loop works for all 4 scoring paths, persists across reloads, and respects `prefers-reduced-motion`. This task is the final integration scout that proves the slice meets every acceptance criterion in `mathquest_mvp_implementation_config.json`.
- **Current state**: All other tasks are merged. The slice is feature-complete but unverified.
- **Target outcome**: A verification receipt documenting that all 4 scoring paths produce the expected `{score, stars}`, the persistence reload works, the reduced-motion branch works, and the 6 acceptance criteria are satisfied.

## Constraints

- **MUST**: Verify on a real browser (Chrome DevTools at 390×844 iPhone 12 Pro viewport).
- **MUST**: Capture screenshots at each step (map, lesson, reward, post-reward map) for the evidence record.
- **MUST**: For each scoring path, start from a clean `localStorage` state to avoid drift.
- **MUST NOT**: Modify any source code in this task. If a regression is found, record it in the verification receipt and create a new task; do not patch inline.
- **SCOPE**: Walkthrough verification only. No new features, no refactors.

## Steps

- [ ] 1. Prepare the dev server and DevTools.
  - Business intent: consistent environment for every walkthrough run.
  - Code detail: `cd /Users/luutrungnghia/Desktop/game && python3 -m http.server 5173 --bind 127.0.0.1 &` in the background. Open `http://127.0.0.1:5173/index.html` in Chrome DevTools. Set the viewport to iPhone 12 Pro (390×844). Open the DevTools Console, Application → Local Storage panel, and the Rendering panel.
  - _Requirements: 12.1, 12.3_

- [ ] 2. Walkthrough Path 1 — First-try correct.
  - Business intent: prove the highest-tier scoring rule.
  - Code detail: `localStorage.removeItem('mathquest:v1:state')` → reload → tap node 26 → tap "436" (no hints, no wrong) → confirm reward screen shows 3 stars, +60 XP, banner drops, stars pop in sequence, XP counts up to 60 → tap "Continue Adventure" → confirm map re-renders with node 26 greyed, node 27 visible, counters updated. `localStorage.getItem('mathquest:v1:state')` should show `learner.stars === 155`, `learner.xp === 1900`, `learner.streak === 8`, `nodes[5].state === 'completed'`, `nodes[5].stars === 3`, `nodes[5].bestScore === 10`, `nodes[5].attempts === 1`, `nodes[6].state === 'available'`. Capture a screenshot of the reward screen and the post-reward map.
  - _Requirements: 8.1, 8.2, 8.6, 9.1–9.5, 10.1–10.5_

- [ ] 3. Walkthrough Path 2 — After hint.
  - Business intent: prove the hint scoring tier.
  - Code detail: clear localStorage → reload → tap node 26 → tap "Hint" → dismiss the tooltip → tap "436" → confirm reward screen shows 2 stars, +60 XP. `localStorage` should show `learner.stars === 154`, `learner.xp === 1900`, `learner.streak === 8`, `nodes[5].stars === 2`, `nodes[5].bestScore === 7`.
  - _Requirements: 6.2, 8.1, 8.3, 9.1–9.5_

- [ ] 4. Walkthrough Path 3 — After 1 wrong answer.
  - Business intent: prove the 1-wrong scoring tier.
  - Code detail: clear localStorage → reload → tap node 26 → tap "463" (shake) → tap "436" → confirm reward screen shows 2 stars, +60 XP. `localStorage` should show `learner.stars === 154`, `learner.xp === 1900`, `learner.streak === 8`, `nodes[5].stars === 2`, `nodes[5].bestScore === 5`.
  - _Requirements: 5.3, 5.4, 5.5, 8.1, 8.4, 9.1–9.5_

- [ ] 5. Walkthrough Path 4 — After multiple wrong answers.
  - Business intent: prove the multi-wrong scoring tier and the streak guard.
  - Code detail: clear localStorage → reload → tap node 26 → tap "463" → tap "406" → tap "436" → confirm reward screen shows 1 star, +60 XP. `localStorage` should show `learner.stars === 153`, `learner.xp === 1900`, `learner.streak === 7` (unchanged because wrongCount=2 > 1), `nodes[5].stars === 1`, `nodes[5].bestScore === 3`.
  - _Requirements: 5.5, 8.1, 8.5, 9.1–9.5_

- [ ] 6. Walkthrough Path 5 — Persistence reload.
  - Business intent: prove the persistence layer.
  - Code detail: after any of the above paths, do not tap "Continue Adventure" — instead, reload the page. Confirm the map re-renders with the updated counters and node 27 is available. The boot path reads the persisted state and the map renders without re-running the lesson.
  - _Requirements: 1.1, 9.1, 9.2, 10.3_

- [ ] 7. Walkthrough Path 6 — Reduced motion.
  - Business intent: prove the reduced-motion branch.
  - Code detail: clear localStorage → reload. In DevTools Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`. Reload. Confirm `<div id="app" data-reduced-motion="true">`. Tap node 26 → confirm node 26 has a static gold border (no scale animation). Tap "436" → confirm reward screen mounts with banner and stars visible immediately (no drop, no pop), XP reads "60" without a count-up. Tap "Continue Adventure" → confirm the map re-renders identically. Reset the emulation.
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ] 8. Acceptance criteria checklist.
  - Business intent: prove every AC from the config is met.
  - Code detail: for each of the 6 acceptance criteria in `mathquest_mvp_implementation_config.json`, mark it checked in the verification receipt with a one-line proof (the path that demonstrates it). The 6 ACs are:
    1. Map screen uses the approved polished asset direction. → Path 1.
    2. Learner can select node 26 and answer the Place Value question. → Path 1.
    3. Correct answer 436 triggers reward completion. → Path 1.
    4. Reward grants +60 XP and three stars. → Path 1 (3 stars) and Path 2/3 (2 stars) and Path 4 (1 star) confirm the 4-tier rule.
    5. Progress updates so node 27 can become available. → Path 1 (post-reward map).
    6. Hint, Help, and Read controls are present and accessible. → Path 2 (Hint used); keyboard tab through the lesson screen and confirm focus lands on Hint, Help, Read in order.
  - _Requirements: 14.1–14.5, 13.1, 13.2, 13.3_

- [ ] 9. Write the verification receipt.
  - Business intent: a single artifact that records the walkthrough and the AC checklist.
  - Code detail: write `specs/vertical-mvp-001/reports/walkthrough-verification.md` with the following sections: environment (browser, viewport, dev server URL), paths (1–6 with expected + observed values, screenshot paths, console output snippets), acceptance criteria checklist (6 items with ✓ and a one-line proof each), and a final verdict (PASS or FAIL with any caveats). Include a `console.error` count for each path; the count must be 0.
  - _Requirements: all_

## Requirements

- All 12 functional requirements (R1–R12), all 4 scoring tiers, persistence, reduced motion, accessibility, and art direction.

## Related Files

| Path | Action | Description |
|---|---|---|
| `specs/vertical-mvp-001/reports/walkthrough-verification.md` | Create | Verification receipt with paths, evidence, AC checklist |

## Completion Criteria

- [ ] All 4 scoring paths produce the expected `{score, stars}` and `localStorage` delta.
- [ ] Persistence reload restores the map state.
- [ ] Reduced-motion branch replaces every animation with an opacity or static state.
- [ ] All 6 acceptance criteria are met.
- [ ] Verification receipt is written to `specs/vertical-mvp-001/reports/walkthrough-verification.md`.
- [ ] No `console.error` in any path.

## Evidence

This section is both the task-level test plan and the proof checklist.

- [ ] Automated verification
  - Command(s): `node -e "const fs=require('fs');fs.accessSync('specs/vertical-mvp-001/reports/walkthrough-verification.md');console.log('PASS')"`
  - Expected proof: prints `PASS` and exits 0
- [ ] Artifact / runtime verification
  - Inspect: open `specs/vertical-mvp-001/reports/walkthrough-verification.md` and review the 6 walkthrough paths, the screenshots, and the AC checklist
  - Expect: every path has an expected value, an observed value, and a one-line proof; every AC is marked with a ✓
- [ ] Runtime reachability verification
  - Entrypoint/caller: `python3 -m http.server 5173` → browser → `http://127.0.0.1:5173/index.html` → walkthrough
  - Expect: every step of the walkthrough is reachable from the entrypoint
- [ ] Contract / negative-path verification
  - Check: simulate `prefers-reduced-motion: reduce` and complete a lesson
  - Expect: no GSAP animations; static state changes; XP reads "60" without a count-up
  - Check: corrupt `localStorage` (`setItem('mathquest:v1:state', '{corrupt')`) and reload
  - Expect: state falls back to `DEFAULT_STATE`, no crash, console warning logged

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Walkthrough reveals a regression in R0–R4 | Medium | The verification receipt records the regression; a follow-up task is created. No inline patches in R4-03. |
| Screenshot tool is not available in DevTools | Low | Use the DevTools "Capture full size screenshot" or the Chrome shortcut; the receipt can reference PNG paths or DevTools node selectors if screenshots are not feasible. |
| `localStorage` is shared across tabs and a parallel tab mutates it during the walkthrough | Low | Use a single tab; do not open the dev server in multiple tabs during verification. |

---

> **Parallel marker**: Not parallelizable; depends on every other task.
> **Test note**: This task IS the test surface for the slice. No automated test framework.
> **Requirement mapping**: Every sub-task MUST end with `_Requirements: X.X_`. No mapping = invalid task file.
> **Evidence rule**: No `## Evidence` section = invalid task file.
