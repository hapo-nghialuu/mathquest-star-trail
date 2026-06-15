# Task R2-02: Lesson question card, four answer tiles, and correct/incorrect feedback

**Requirement:** R5 — Lesson question and answer feedback
**Status:** pending
**Priority:** P0
**Estimated Effort:** M
**Dependencies:** tasks/task-R2-01-lesson-frame.md
**Spec:** specs/vertical-mvp-001/

## Context

- **Why**: The question and 4 answer tiles are the core of the lesson. The correct answer (436) must be reachable in one tap; incorrect answers must give supportive feedback that does not block retry.
- **Current state**: R2-01 rendered the lesson frame with a placeholder question area. The placeholder must be replaced with the real question text and 4 answer tiles.
- **Target outcome**: The learner sees the question "Which number is 400 + 30 + 6?" centered, with 4 large glossy answer tiles (436, 463, 406, 346) in a 2×2 grid. Tapping the correct tile (436) plays a 600ms green-glow animation and dispatches a `correct` event that the state machine consumes (R3-01 / R4-01 will react to it). Tapping any other tile plays a 350ms horizontal shake, leaves the state on `lesson_question`, and increments an internal `wrongCount`.

## Constraints

- **MUST**: Read the question text and answer choices from `LESSON` in `src/state/config.js`. Do not hard-code "436" or "400 + 30 + 6" anywhere in the screen.
- **MUST**: Each answer tile has a minimum tap target of 88×88 CSS pixels and `role="button"`, `aria-label="Answer ${label}"`.
- **MUST**: Tap handler ignores re-clicks while the shake/glow animation is playing (so the user cannot double-trigger a transition or stack wrong-counts).
- **MUST**: Use `motion/shake.js` (created in step 1) for the feedback animation; fall back to a red tint under reduced motion.
- **MUST NOT**: Implement Hint/Help/Read in this task (R2-03).
- **MUST NOT**: Trigger the state-machine transition to `reward_completion` from this task; only dispatch the event so the App Shell (or R4-01) can route it.
- **SCOPE**: Question text, 4 answer tiles, and the correct/incorrect feedback. No scoring, no persistence, no reward screen.

## Steps

- [ ] 1. Create `src/motion/shake.js`.
  - Business intent: a GSAP timeline factory for both correct (green glow) and incorrect (horizontal shake) feedback, with reduced-motion fallback that uses an instant boxShadow tint and a `setTimeout(200)` to clear `busy` (Red Team 2026-06-15).
  - Code detail: `import { gsap } from 'gsap'; import { isReducedMotion } from './reduced.js'; export function createShakeTimeline(tileEl, { isCorrect, onComplete }) { const reduced = isReducedMotion(); if (reduced) { if (isCorrect) { tileEl.style.boxShadow = '0 0 0 4px var(--c-success)'; tileEl.style.opacity = '1'; } else { tileEl.style.boxShadow = '0 0 0 4px var(--c-red)'; tileEl.style.opacity = '1'; } setTimeout(() => { tileEl.style.boxShadow = ''; tileEl.style.opacity = ''; onComplete && onComplete(); }, 200); return { play(){}, kill(){ tileEl.style.boxShadow=''; tileEl.style.opacity=''; }, isReduced:true, isCorrect }; } const tl = gsap.timeline({ defaults:{ ease:'power2.out' }, onComplete:() => onComplete && onComplete() }); if (isCorrect) { tl.to(tileEl, { boxShadow:'0 0 24px 8px var(--c-success)', duration:0.3 }).to(tileEl, { boxShadow:'0 0 0 0 rgba(0,0,0,0)', duration:0.3 }); } else { tl.to(tileEl, { x:-8, duration:0.07 }).to(tileEl, { x:8, duration:0.07 }).to(tileEl, { x:-6, duration:0.07 }).to(tileEl, { x:6, duration:0.07 }).to(tileEl, { x:0, duration:0.07 }); } return { play:()=>tl.play(0), kill:()=>{ tl.kill(); gsap.killTweensOf(tileEl); tileEl.style.boxShadow=''; tileEl.style.transform=''; }, isReduced:false, isCorrect }; }`. The `onComplete` callback is invoked from the GSAP timeline's `onComplete` (full motion) or from `setTimeout(200)` (reduced branch) — `lesson.js` uses this to clear the `busy` flag.
  - _Requirements: 5.3, 5.4, 11.4_

- [ ] 2. Update `src/screens/lesson.js` to render the question text and 4 answer tiles.
  - Business intent: replace the question placeholder with real content. The lesson screen **owns the session** in its closure; the session travels in the `CORRECT` dispatch payload (Red Team 2026-06-15).
  - Code detail: import `LESSON` from `../state/config.js`, `EVENTS` from `../state/machine.js`, and `createShakeTimeline` from `../motion/shake.js`. In the `render` function, mount into the `<div id="lesson-question">` placeholder: render a question card with `<h1>` reading `LESSON.question` and a 2×2 CSS grid (using `display: grid; grid-template-columns: 1fr 1fr; gap: 12px;`) of 4 `<button class="answer-tile" role="button" aria-label="Answer ${choice.label}">` elements, one per `LESSON.choices` entry. Each tile has a minimum size of 88×88 CSS pixels (use `min-width: 88px; min-height: 88px;` plus `width: 100%; aspect-ratio: 1 / 1;`). Maintain an internal `wrongCount` and `usedHint` and a `busy` flag (initially false) inside the closure created by `render`. On tile click: if `busy`, ignore; set `busy = true` synchronously BEFORE yielding to GSAP (Red Team multi-touch guard); look up the choice by id; call `createShakeTimeline(tileEl, { isCorrect: choice.correct, onComplete: () => { busy = false; } })`; if incorrect, increment `wrongCount` BEFORE the timeline starts; on the timeline's `onComplete`, the `busy` flag is reset and the closure dispatches `dispatch(EVENTS.CORRECT, { session: { usedHint, wrongCount } })` (for correct) or `dispatch(EVENTS.INCORRECT, {})` (for incorrect, no payload needed). The App Shell's `CORRECT` handler computes the reward from `payload.session`. The lesson screen never reads or writes a global `lessonSession`.
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 14.3, 14.5_

- [ ] 3. Wire the state machine for the `CORRECT` and `INCORRECT` events.
  - Business intent: confirm the transitions and the App Shell routing.
  - Code detail: confirm `src/state/machine.js::TRANSITIONS.lesson_question.CORRECT === 'reward_completion'`, `TRANSITIONS.lesson_question.INCORRECT === 'lesson_question'`, `TRANSITIONS.lesson_question.CLOSE === 'return_to_map'` (declared in R0-01 as part of the 6-state simplification). `src/main.js` (R0-01) handles `EVENTS.CORRECT` by computing the reward from `payload.session` and calling `mountScreen('reward_completion', rewardPayload)`, and `EVENTS.INCORRECT` by leaving the lesson screen mounted (the lesson screen handles its own shake/visual feedback; no remount is required, which keeps the lesson closure alive and avoids losing `wrongCount`/`usedHint`).
  - _Requirements: 1.3, 10.1, 10.3_

- [ ] 4. Add a fox mascot overlay.
  - Business intent: support the art direction requirement of a friendly fox in the lesson.
  - Code detail: import `assets/screen_crops/fox_mascot_cheer.png` and render it as `<img class="mascot" src="..." alt="">` at `top: 18%; right: 4%; width: 22vw; z-index: 1; pointer-events: none;`. No animation in this task.
  - _Requirements: 14.3_

- [ ] 5. Verification implementation.
  - Run the dev server at 390×844 viewport. Tap node 26 → lesson screen → confirm the question text and 4 tiles render; tap "436" → green glow → routes to reward placeholder; tap "463" → shake → stays on lesson; tap "436" after a wrong answer → green glow → routes to reward. Under reduced motion, verify the shake becomes an instant red tint and the green glow becomes an instant green ring. Tab through and confirm focus lands on each answer tile in DOM order.
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

## Requirements

- 5.1 — Question text "Which number is 400 + 30 + 6?"
- 5.2 — 4 answer tiles in 2×2 grid, ≥88×88 CSS pixels
- 5.3 — Correct tap → 600ms green glow + transition
- 5.4 — Wrong tap → 350ms horizontal shake, stay on lesson
- 5.5 — Increment `wrongCount`, clear shake before next tap
- 11.4 — Reduced motion: instant red tint + retry prompt
- 14.3, 14.5 — Art direction NFR (fox overlay, no foreign text)

## Related Files

| Path | Action | Description |
|---|---|---|
| `src/motion/shake.js` | Create | Correct/incorrect feedback timeline factory |
| `src/screens/lesson.js` | Modify | Render question, 4 tiles, fox overlay; wire feedback |
| `src/main.js` | Modify | Route `CORRECT` → `mountScreen('reward_completion')` (placeholder), `INCORRECT` → re-mount lesson |

## Completion Criteria

- [ ] `src/motion/shake.js` exists and exports `createShakeTimeline(tileEl, { isCorrect }) → { play, kill, isReduced, isCorrect }`.
- [ ] `src/screens/lesson.js` renders the question text and 4 answer tiles in a 2×2 grid.
- [ ] Each answer tile has `role="button"`, `aria-label="Answer ${label}"`, and minimum 88×88 CSS pixels.
- [ ] Tapping the "436" tile plays a 600ms green-glow animation and dispatches a `CORRECT` event.
- [ ] Tapping any other tile plays a 350ms horizontal shake, increments `wrongCount`, and remains on the lesson.
- [ ] The `busy` flag prevents double-tap triggers during the animation.
- [ ] Under reduced motion, the shake is replaced with a static red tint and an instant transition.
- [ ] The fox mascot PNG overlay is visible in the upper-right of the question area.
- [ ] No Hint/Help/Read buttons in this task (R2-03).
- [ ] No console errors, no memory leaks on remount.

## Evidence

This section is both the task-level test plan and the proof checklist.

- [ ] Automated verification
  - Command(s): `node -e "const fs=require('fs');['src/motion/shake.js','src/screens/lesson.js'].forEach(p=>fs.accessSync(p));console.log('PASS')"`
  - Expected proof: prints `PASS` and exits 0
- [ ] Artifact / runtime verification
  - Inspect: tap node 26 in DevTools at 390×844 → lesson screen → 4 tiles visible
  - Expect: question card "Which number is 400 + 30 + 6?", 4 tiles reading 436, 463, 406, 346, fox mascot in upper-right
- [ ] Runtime reachability verification
  - Entrypoint/caller: tap answer tile in `lesson.js` → click handler → `createShakeTimeline().play()` → `dispatch('CORRECT' | 'INCORRECT', ...)` → `mountScreen('reward_completion' | 'lesson_question')` in `src/main.js`
  - Expect: correct path routes to reward placeholder; incorrect path stays on lesson with the tile ready for another tap
- [ ] Contract / negative-path verification
  - Check: tap "463" twice in quick succession
  - Expect: only the first tap triggers a shake and increments `wrongCount`; the second tap is ignored (busy flag)
  - Check: tap "463" then "406" then "436"
  - Expect: 2 shakes, then 1 green glow, then routes to reward placeholder
  - Check: simulate reduced motion and tap "463"
  - Expect: instant red tint on the tile, no shake animation, lesson remains

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| 2×2 grid breaks on narrow viewports | Low | Use `min(45vw, 200px)` for tile size to cap the width. |
| Fox mascot PNG overlaps answer tiles on small viewports | Low | Position fox at `top: 18%; right: 4%;` and cap width to 22vw. |
| Double-tap on a tile triggers two transitions | Medium | `busy` flag in the closure; only reset on timeline `onComplete`. |
| Answer tile text is too small to read | Low | Use a font size of 32px minimum for the answer numerals. |

---

> **Parallel marker**: Not parallelizable; depends on R2-01.
> **Test note**: No automated test framework; manual walkthrough in DevTools.
> **Requirement mapping**: Every sub-task MUST end with `_Requirements: X.X_`. No mapping = invalid task file.
> **Evidence rule**: No `## Evidence` section = invalid task file.
