# Task R2-01: Lesson screen frame, progress bar, and hearts indicator

**Requirement:** R4 — Lesson screen frame and progress
**Status:** pending
**Priority:** P0
**Estimated Effort:** S
**Dependencies:** tasks/task-R0-01-scaffold-and-persistence.md
**Spec:** specs/vertical-mvp-001/

## Context

- **Why**: The lesson screen needs a stable frame — background, close button, progress bar, and hearts — before question content and answer tiles can be layered on. This task establishes the chrome and a placeholder question area for R2-02.
- **Current state**: `src/main.js` mounts a placeholder card when the state machine enters `lesson_question`. R1-02 dispatches `NODE_26_SELECTED` and the App Shell calls `mountScreen('lesson_question')`.
- **Target outcome**: When the learner reaches the lesson screen, they see the polished full-screen background, a top progress bar reading "4 / 10", 2 filled + 1 empty hearts, a close button (top-left), and an empty question area that R2-02 will fill.

## Constraints

- **MUST**: Use `assets/screens/02_lesson_question_screen.png` as the fixed background.
- **MUST**: Use the `LESSON` constant from `src/state/config.js` for progress label, hearts, question text, etc. — do not hard-code.
- **MUST**: Use percentage-based positioning for the close button, progress bar, and hearts row.
- **MUST**: The close button is keyboard-focusable with `aria-label="Close lesson"` and returns the learner to the map on click (dispatches `dispatch(STATES.LESSON_QUESTION, 'CLOSE', null)`; the state machine routes to `return_to_map`).
- **MUST NOT**: Render the question text or answer tiles in this task (R2-02).
- **MUST NOT**: Render Hint/Help/Read buttons in this task (R2-03).
- **SCOPE**: Only the lesson frame chrome and a placeholder question card. Do not implement answer handling or scoring.

## Steps

- [ ] 1. Create `src/components/progress.js`.
  - Business intent: a reusable progress bar used by the lesson screen.
  - Code detail: `Progress({ current, total, label })` returns a `<div class="progress" role="progressbar" aria-valuenow="${current}" aria-valuemin="0" aria-valuemax="${total}" aria-label="${label}">` containing a filled inner bar at `${(current/total)*100}%` width and a label span reading `"${current} / ${total}"`. Inline `<style>` for the bar fill (uses `var(--c-success)`).
  - _Requirements: 4.2_

- [ ] 2. Create `src/components/hearts.js`.
  - Business intent: a hearts row used by the lesson screen.
  - Code detail: `Hearts({ filled, empty })` returns a `<div class="hearts" aria-label="${filled} hearts remaining">` containing `${filled}` filled hearts and `${empty}` empty hearts, each as a `<span class="heart heart--filled">♥</span>` or `<span class="heart heart--empty">♡</span>`. Inline `<style>` for `.heart` (font-size 22px, color `var(--c-fox)` filled, `var(--c-navy)` opacity 0.3 empty).
  - _Requirements: 4.3_

- [ ] 3. Create `src/screens/lesson.js` with `render(rootEl, state, dispatch)` and the frame chrome.
  - Business intent: the lesson screen render entry; replaces the placeholder.
  - Code detail: import `assets/screens/02_lesson_question_screen.png`, render the background `<img class="bg">`, a close button `<button class="btn" aria-label="Close lesson">×</button>` at top-left (`top: 4%; left: 4%`), a progress bar `Progress({...LESSON.progress})` at `top: 4%; left: 50%; transform: translateX(-50%)`, a hearts row `Hearts(LESSON.hearts)` at `top: 11%; right: 4%`, and a `<div id="lesson-question" class="card" role="region" aria-label="Question"></div>` placeholder at the center of the viewport where R2-02 will mount the question text and answer tiles. Below the question placeholder, reserve a `<div id="lesson-controls"></div>` placeholder for R2-03 (Hint/Help/Read). Wire the close button: `dispatch(STATES.LESSON_QUESTION, 'CLOSE', null)`. Add a CSS `.lesson-frame` wrapper with `position: fixed; inset: 0; z-index: 1; pointer-events: none;` and re-enable pointer-events on individual interactive children.
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 14.3, 14.5_

- [ ] 4. Wire `src/main.js` to import the lesson screen.
  - Business intent: route `lesson_question` state to the real screen.
  - Code detail: in `src/main.js`, import `render as renderLesson, unmount as unmountLesson` from `./screens/lesson.js`. Update the `mountScreen` switch: `'lesson_question' → renderLesson(root, state, dispatch)`. Add `'return_to_map'` handling that calls `mountScreen('adventure_map')` (the map re-renders with the persisted state). Export a `disposeLesson()` helper if needed.
  - _Requirements: 1.3, 10.1, 10.3, 12.3_

- [ ] 5. Verification implementation.
  - Run the dev server at 390×844 viewport. Confirm: tapping node 26 (from R1-02) routes to the lesson screen; background PNG fills viewport; close button is visible top-left and clickable (returns to map); progress bar shows "4 / 10"; hearts row shows 2 filled + 1 empty; question and controls areas are empty placeholders. Tab through and confirm focus lands on the close button first.
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

## Requirements

- 4.1 — Lesson renders 02_lesson_question_screen.png as fixed background
- 4.2 — Progress bar 4/10
- 4.3 — 2 filled + 1 empty hearts
- 4.4 — Close button keyboard accessible with `aria-label="Close lesson"`
- 14.3, 14.5 — Art direction NFR (background, no foreign text)

## Related Files

| Path | Action | Description |
|---|---|---|
| `src/components/progress.js` | Create | Progress bar component |
| `src/components/hearts.js` | Create | Hearts row component |
| `src/screens/lesson.js` | Create | Lesson screen render + unmount |
| `src/main.js` | Modify | Import lesson screen and route `lesson_question` / `return_to_map` |

## Completion Criteria

- [ ] `src/screens/lesson.js` exists and exports `render(rootEl, state, dispatch) → { unmount() }`.
- [ ] Reloading the page and tapping node 26 renders the lesson background, close button, progress bar, and hearts row.
- [ ] Progress bar reads "4 / 10" and has `aria-valuenow=4`, `aria-valuemax=10`.
- [ ] Hearts row shows 2 filled + 1 empty hearts and has `aria-label="2 hearts remaining"`.
- [ ] Close button is keyboard-focusable, has `aria-label="Close lesson"`, and clicking it returns to the map screen.
- [ ] Question and controls areas are empty placeholders (R2-02 / R2-03 will fill them).
- [ ] No answer tiles, no Hint/Help/Read buttons in this task.
- [ ] `unmount()` removes every DOM element created by `render`.

## Evidence

This section is both the task-level test plan and the proof checklist.

- [ ] Automated verification
  - Command(s): `node -e "const fs=require('fs');['src/screens/lesson.js','src/components/progress.js','src/components/hearts.js'].forEach(p=>fs.accessSync(p));console.log('PASS')"`
  - Expected proof: prints `PASS` and exits 0
- [ ] Artifact / runtime verification
  - Inspect: tap node 26 in DevTools at 390×844 → lesson screen appears
  - Expect: background PNG, close button (top-left), progress bar (top-center, "4 / 10"), hearts (top-right, 2 filled + 1 empty), empty question area, empty controls area
- [ ] Runtime reachability verification
  - Entrypoint/caller: `R1-02` tap → `mountScreen('lesson_question')` → `renderLesson(root, state, dispatch)`
  - Expect: lesson screen mounts; close button → `mountScreen('adventure_map')` returns the learner to the map
- [ ] Contract / negative-path verification
  - Check: tap the close button on the lesson screen
  - Expect: lesson screen unmounts cleanly, map screen remounts, no console errors
  - Check: keyboard `Tab` from URL bar
  - Expect: focus lands on the close button (it is the first focusable element)

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Close button overlaps the progress bar on small viewports | Low | Position with `%` and verify on 375×812. |
| Hearts row emoji does not render on some browsers | Low | Use inline SVG heart shapes instead of unicode `♥`/`♡` if a regression is observed. |
| `pointer-events: none` on the frame wrapper breaks child interactions | Low | Re-enable on individual buttons and the question/controls placeholders. |

---

> **Parallel marker**: This task is parallelizable with R1-01 (both depend only on R0-01, touch different files). Mark as `(P)`.
> **Test note**: No automated test framework; manual viewport verification in DevTools.
> **Requirement mapping**: Every sub-task MUST end with `_Requirements: X.X_`. No mapping = invalid task file.
> **Evidence rule**: No `## Evidence` section = invalid task file.
