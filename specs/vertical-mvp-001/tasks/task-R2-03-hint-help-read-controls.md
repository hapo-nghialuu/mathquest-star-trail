# Task R2-03: Hint, Help, and Read support controls on lesson screen

**Requirement:** R6 — Hint, Help, and Read controls
**Status:** pending
**Priority:** P0
**Estimated Effort:** S
**Dependencies:** tasks/task-R2-02-lesson-question-and-answers.md
**Spec:** specs/vertical-mvp-001/

## Context

- **Why**: The lesson needs on-demand support so the learner is never stuck. Hint provides a reasoning nudge; Help shows a worked example; Read performs a visual highlight sweep. The Hint flag also influences scoring.
- **Current state**: R2-02 rendered the question and 4 answer tiles. A `<div id="lesson-controls"></div>` placeholder is reserved at the bottom of the question card area.
- **Target outcome**: Three bottom-anchored buttons (Hint, Help, Read) appear on the lesson screen. Hint shows an instant tooltip with the hint text and sets `usedHint = true`. Help shows an instant worked-example block. Read performs a visual sweep that moves a focus ring across the 4 answer tiles. All three are keyboard-focusable with descriptive `aria-label`s.

## Constraints

- **MUST**: Anchor the 3 buttons to the bottom of the viewport, above the safe-area inset.
- **MUST**: Read the hint and explanation text from `LESSON.hint` and `LESSON.explanation` in `src/state/config.js`. Do not hard-code.
- **MUST**: Setting `usedHint = true` persists into the lesson session state (kept in the closure in `lesson.js`) so R4-01 can read it when computing the reward. Do not persist to `localStorage` here.
- **MUST**: Read is visual-only (a focus ring sweep). No audio.
- **MUST NOT**: Implement scoring in this task. R4-01 reads `usedHint` and `wrongCount` from the lesson session.
- **SCOPE**: Only the 3 control buttons, the tooltip, the worked-example block, and the highlight sweep. No scoring, no persistence, no reward screen.

## Steps

- [ ] 1. Update `src/screens/lesson.js` to render Hint, Help, and Read buttons.
  - Business intent: add the 3 support controls into the reserved `<div id="lesson-controls">` placeholder.
  - Code detail: import `LESSON` from `../state/config.js`. Inside `render`, mount 3 `<button class="btn" aria-label="...">` elements (Hint, Help, Read) into the controls placeholder. Position the row at `bottom: 4%; left: 4%; right: 4%; display: flex; gap: 12px; justify-content: center; z-index: 2;`. Each button has a `data-action` attribute (`"hint" | "help" | "read"`) and a click handler.
  - _Requirements: 6.1, 6.5_

- [ ] 2. Implement Hint.
  - Business intent: show a reasoning nudge and mark the lesson as hint-used in the closure (no global state).
  - Code detail: on Hint click, append a `<div class="tooltip" role="tooltip">` to the question card with text `LESSON.hint`. Set a closure-level `usedHint = true` (this is the same closure-level `usedHint` already maintained by R2-02 step 2; R2-03's Hint handler is the second writer). The tooltip uses a static fade-in (CSS transition, 200ms) — no GSAP needed. The tooltip auto-dismisses when the learner taps anywhere else or after 6 seconds, whichever comes first. No `setLessonSession` is needed: the lesson screen's closure is the single source of truth, and R2-02's `CORRECT` dispatch payload `{ session: { usedHint, wrongCount } }` carries the value to the App Shell.
  - _Requirements: 6.2_

- [ ] 3. Implement Help.
  - Business intent: show a worked example that walks through the place-value decomposition.
  - Code detail: on Help click, append a `<div class="worked-example" role="region" aria-label="Worked example">` to the question card. The example is a 3-row block: row 1 = "4 hundreds → 400", row 2 = "3 tens → 30", row 3 = "6 ones → 6", followed by "400 + 30 + 6 = 436". Use the existing `.card` class. No GSAP. Auto-dismisses on tap outside or after 8 seconds.
  - _Requirements: 6.3_

- [ ] 4. Implement Read.
  - Business intent: highlight the question and the 4 answer tiles in sequence so the learner can follow along.
  - Code detail: on Read click, perform a focus sweep: in sequence, call `tileEl.focus({ preventScroll:false })` on each answer tile with a 700ms delay between them. Use `await new Promise(r => setTimeout(r, 700))` in an async IIFE. While the sweep is running, set `busy = true` so the learner cannot trigger a tile answer tap. After the 4th tile (≈2.8s), reset `busy` and clear focus. Add a `data-read-active` attribute on the root so CSS can add a glow ring to the focused tile. Use a static outline under reduced motion (no GSAP). If the learner taps Read again during a sweep, ignore the click.
  - _Requirements: 6.4_

- [ ] 5. Verification implementation.
  - Run the dev server at 390×844 viewport. Tap node 26 → lesson screen → confirm Hint/Help/Read appear at the bottom; tap Hint → tooltip appears with "Think about the hundreds, tens and ones." and `usedHint` is set in the lesson session closure (verify by tapping "436" and observing R4-01 compute `{score: 7, stars: 2}` in the reward screen via the `session` payload). Tap Help → worked-example block appears. Tap Read → focus sweeps across the 4 tiles. Tab through and confirm focus lands on Hint, Help, Read in DOM order. Under reduced motion, verify Hint and Help still appear (no animation, but visible).
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

## Requirements

- 6.1 — Hint/Help/Read buttons anchored bottom
- 6.2 — Hint → tooltip with LESSON.hint text and `usedHint = true`
- 6.3 — Help → worked-example block
- 6.4 — Read → visual highlight sweep across the 4 answer tiles
- 6.5 — All 3 buttons keyboard-focusable with descriptive `aria-label`s

## Related Files

| Path | Action | Description |
|---|---|---|
| `src/screens/lesson.js` | Modify | Render Hint/Help/Read buttons, tooltip, worked example, focus sweep |

## Completion Criteria

- [ ] Hint, Help, Read buttons are visible at the bottom of the viewport on the lesson screen.
- [ ] Tapping Hint shows a tooltip with the text from `LESSON.hint` and sets `usedHint = true` in the lesson session.
- [ ] Tapping Help shows a worked-example block with the 3-row place-value decomposition.
- [ ] Tapping Read moves focus across the 4 answer tiles in sequence (~700ms per tile) and does not play audio.
- [ ] All 3 buttons have `aria-label` attributes ("Show hint", "Show worked example", "Read question and answers").
- [ ] All 3 buttons are keyboard-focusable and reachable in DOM order.
- [ ] `busy` flag is set during the Read sweep so tile taps are ignored.
- [ ] No console errors; no memory leaks on tooltip/worked-example open and close.
- [ ] No scoring logic in this task.

## Evidence

This section is both the task-level test plan and the proof checklist.

- [ ] Automated verification
  - Command(s): `node -e "const fs=require('fs');fs.accessSync('src/screens/lesson.js');console.log('PASS')"`
  - Expected proof: prints `PASS` and exits 0
- [ ] Artifact / runtime verification
  - Inspect: tap node 26 in DevTools at 390×844 → lesson screen
  - Expect: 3 buttons (Hint, Help, Read) at the bottom of the viewport; tap Hint → tooltip with "Think about the hundreds, tens and ones."; tap Help → worked example block; tap Read → focus ring moves across the 4 tiles
- [ ] Runtime reachability verification
  - Entrypoint/caller: tap Hint button → `usedHint = true` in the lesson closure → on `CORRECT` dispatch, R4-01 will read `usedHint` and apply the 7/2 scoring tier
  - Expect: when R4-01 is merged, the reward screen shows 2 stars and "+7 score" instead of 3 stars and "+10 score" if Hint was tapped
- [ ] Contract / negative-path verification
  - Check: tap Read twice in quick succession
  - Expect: the first sweep runs; the second tap is ignored (busy flag)
  - Check: tap Hint, dismiss the tooltip, then tap an answer tile
  - Expect: `usedHint` is still `true` for the duration of the lesson session (verified in the next scoring call)

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Tooltip overlaps the answer tiles on small viewports | Low | Position tooltip above the question card with `position: absolute; bottom: 100%; margin-bottom: 8px;`. |
| Read sweep is too fast or too slow | Low | 700ms per tile is a comfortable pace; configurable constant in `lesson.js`. |
| `usedHint` does not reach R4-01 | Medium | The lesson session is a single closure in `lesson.js`; on `CORRECT` dispatch, pass `{ wrongCount, usedHint }` in the payload. R4-01 reads the payload and forwards to `computeReward`. |

---

> **Parallel marker**: Not parallelizable; depends on R2-02.
> **Test note**: No automated test framework; manual walkthrough in DevTools.
> **Requirement mapping**: Every sub-task MUST end with `_Requirements: X.X_`. No mapping = invalid task file.
> **Evidence rule**: No `## Evidence` section = invalid task file.
