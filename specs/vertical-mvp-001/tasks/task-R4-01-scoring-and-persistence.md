# Task R4-01: Scoring computation and localStorage persistence on save_progress

**Requirement:** R8 — Scoring computation, R9 — Persistence and save_progress
**Status:** pending
**Priority:** P0
**Estimated Effort:** S
**Dependencies:** tasks/task-R2-02-lesson-question-and-answers.md
**Spec:** specs/vertical-mvp-001/

## Context

- **Why**: The reward screen needs a real reward payload (score, stars, xpBonus) computed from the learner's attempt, and the persistence layer must write the updated state to `localStorage` so the next time the learner opens the app, the map reflects what they completed.
- **Current state**: R3-01 uses a hard-coded payload `{ score: 10, stars: 3, xpBonus: 60, wrongCount: 0, usedHint: false }`. The real payload is not yet computed from the lesson session.
- **Target outcome**: When the lesson screen dispatches `CORRECT`, the App Shell computes the real reward by reading `usedHint` and `wrongCount` from the lesson session, calls `computeReward()`, and passes the result as the reward payload. When the reward screen dispatches `CONTINUE`, `mergeLessonResult` updates the active node to `completed`, unlocks the next node (27), bumps the learner counters, and writes the snapshot to `localStorage` under `mathquest:v1:state`.

## Constraints

- **MUST**: Use `computeReward({ usedHint, wrongCount })` from `src/state/scoring.js`. Do not duplicate the scoring rules in the lesson or reward screens.
- **MUST**: Persist on `CONTINUE` (not on `CORRECT`), so the learner sees the reward before the state is finalized.
- **MUST**: Wrap the `localStorage.setItem` call in try/catch and never throw.
- **MUST NOT**: Mutate the in-memory state in place; `mergeLessonResult` returns a new state object and `save()` writes the new value.
- **SCOPE**: Compute reward from lesson session; persist on `CONTINUE`; route the persisted state into the App Shell. Do not implement the `return_to_map` transition (R4-02 wires that).

## Steps

- [ ] 1. Capture the lesson session in `src/screens/lesson.js`.
  - Business intent: the lesson session lives in the lesson screen's closure; the App Shell reads it from the `CORRECT` dispatch payload (Red Team 2026-06-15).
  - Code detail: this task requires no edits to `src/main.js`. The lesson screen (R2-02 step 2 + R2-03 step 2) maintains `let wrongCount = 0; let usedHint = false; let busy = false;` in its closure. On `EVENTS.CORRECT`, it dispatches `dispatch(EVENTS.CORRECT, { session: { usedHint, wrongCount } })`. The App Shell's `CORRECT` handler reads `payload.session` to compute the reward. There is **no `lessonSession` global variable in `main.js`**. There is **no `setLessonSession`/`getLessonSession` export**. The lesson session is closed over by `lesson.js` and dies with the screen unmount.
  - _Requirements: 8.1_

- [ ] 2. Compute the reward in `src/main.js` on `CORRECT` dispatch.
  - Business intent: replace the hard-coded payload with the real computed reward, sourced from the lesson session's dispatch payload.
  - Code detail: in `src/main.js`, import `computeReward` from `./state/scoring.js`. In the dispatch handler for `EVENTS.CORRECT`, before routing to `mountScreen('reward_completion', payload)`, call `const session = payload.session; const reward = computeReward({ usedHint: session.usedHint, wrongCount: session.wrongCount }); const rewardPayload = { ...reward, wrongCount: session.wrongCount, usedHint: session.usedHint };` and pass `rewardPayload` to the reward screen. R3-01's reward screen receives this payload and renders the awarded number of stars and the score-based XP count-up.
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 3. Persist on `CONTINUE` dispatch.
  - Business intent: write the updated learner snapshot to `localStorage` and unlock node 27, using the pure `mergeLessonResult(state, result)` contract (Red Team 2026-06-15 — no internal `load()` call).
  - Code detail: in `src/main.js`, import `mergeLessonResult, load` from `./state/store.js`. In the dispatch handler for `EVENTS.CONTINUE` from `reward_completion`, call `const result = mergeLessonResult(appState.currentState, payload)`. If `result.persisted.ok === true`, set `appState.currentState = result.nextState`; otherwise log `console.warn('[main] save failed:', result.persisted.error)` and **leave `appState.currentState` at its pre-merge value** (the in-memory state remains the in-flight state until the next successful save). Then call `mountScreen('return_to_map')` (R4-02 wires the route back to the map).
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 10.2_

- [ ] 4. Update `src/main.js` to use `appState.currentState` everywhere.
  - Business intent: subsequent screen mounts (e.g., the post-persistence map) read the updated counters.
  - Code detail: `appState.currentState` is the single in-memory state. It is initialized in `boot()` from `loadState()` and replaced in the `CONTINUE` handler after a successful `mergeLessonResult` (per step 3). All `render(root, appState.currentState, dispatch)` calls use this single reference. No `state` variable exists in `main.js` other than the one inside `appState`.
  - _Requirements: 10.3_

- [ ] 5. Verification implementation.
  - Run the dev server at 390×844 viewport. Tap node 26 → tap "436" (no hints, no wrong) → reward screen → confirm 3 stars, +60 XP, "Continue Adventure". Tap "Continue Adventure" → DevTools → `localStorage.getItem('mathquest:v1:state')` → confirm `nodes[5]` (id 26) is `state:'completed', stars:3, bestScore:10, attempts:1`, `nodes[6]` (id 27) is `state:'available'`, `learner.stars === 155`, `learner.xp === 1900`, `learner.streak === 8`, `learner.activeNodeId` is unchanged. Reload the page → confirm the map re-renders with the updated counters and node 27 is no longer locked.
  - _Requirements: 8.1, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 10.2_

## Requirements

- 8.1, 8.2, 8.3, 8.4, 8.5, 8.6 — Scoring 4 tiers + 60 XP bonus
- 9.1, 9.2, 9.3, 9.4, 9.5, 9.6 — Persistence v1 shape, atomic write, try/catch
- 10.2 — Unlock node 27
- 10.3 — Remount map with updated state
- 12.2 — Store never throws

## Related Files

| Path | Action | Description |
|---|---|---|
| `src/main.js` | Modify | Add lesson session capture, compute reward, persist on CONTINUE, use `currentState` everywhere |
| `src/state/scoring.js` | (no change) | Consumed by R4-01 |
| `src/state/store.js` | (no change) | Consumed by R4-01 |

## Completion Criteria

- [ ] `computeReward({ usedHint, wrongCount })` is called on `CORRECT` dispatch; the reward screen receives a real payload.
- [ ] The reward screen renders the awarded number of stars (1, 2, or 3) based on the payload.
- [ ] On `CONTINUE` dispatch, `mergeLessonResult` is called and the new state is written to `localStorage` under `mathquest:v1:state`.
- [ ] The persisted snapshot has the correct shape: `schemaVersion: 1`, `learner {level, stars, streak, xp, activeNodeId}`, 7 nodes, `currentWorld: "Star Trail"`.
- [ ] Node 26 is `completed` with the awarded `stars` and `bestScore`, and `attempts` is incremented by 1.
- [ ] Node 27 transitions from `locked` to `available`.
- [ ] `learner.stars` is increased by the awarded stars; `learner.xp` is increased by 60 (the completion XP bonus).
- [ ] `learner.streak` is incremented by 1 if `wrongCount ≤ 1`, unchanged otherwise.
- [ ] `localStorage.setItem` is wrapped in try/catch; corruption or quota errors do not crash the app.
- [ ] The lesson session is reset on entering a new lesson.
- [ ] No console errors; the persistence path is the only writer to `localStorage` for lesson completion.

## Evidence

This section is both the task-level test plan and the proof checklist.

- [ ] Automated verification
  - Command(s): `node -e "const fs=require('fs');['src/main.js','src/state/scoring.js','src/state/store.js'].forEach(p=>fs.accessSync(p));console.log('PASS')"`
  - Expected proof: prints `PASS` and exits 0
- [ ] Artifact / runtime verification
  - Inspect: tap node 26 → tap "436" → reward screen → DevTools `localStorage.getItem('mathquest:v1:state')`
  - Expect: JSON with `nodes[5].state='completed'`, `nodes[5].stars=3`, `nodes[5].bestScore=10`, `nodes[5].attempts=1`, `nodes[6].state='available'`, `learner.stars=155`, `learner.xp=1900`, `learner.streak=8`
- [ ] Runtime reachability verification
  - Entrypoint/caller: `lesson.js` tap "436" → `dispatch('CORRECT', payload)` → `main.js` `computeReward(...)` → `mountScreen('reward_completion', payload)` → `reward.js` renders the awarded stars/XP → tap "Continue Adventure" → `dispatch('CONTINUE', payload)` → `main.js` `mergeLessonResult(...)` → `localStorage.setItem(...)`
  - Expect: every link in the chain is reached and verified
- [ ] Contract / negative-path verification
  - Check: simulate localStorage quota error by running `localStorage.setItem('mathquest:v1:state', 'x'.repeat(6e6))` before completing a lesson, then complete the lesson
  - Expect: console warning logged, in-memory state is still updated, app does not crash
  - Check: tap "436" after tapping Hint and one wrong answer
  - Expect: reward screen shows 2 stars (not 3), `learner.stars += 2`, `learner.xp += 60`, `learner.streak += 1` (still ≤1 wrong)

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Lesson session is not reset on re-entry | Low | `setLessonSession({ usedHint:false, wrongCount:0 })` at the start of every `mountScreen('lesson_question')`. |
| `mergeLessonResult` mutates the input state | Medium | The function builds a new state object via spread / map; never mutates the input. |
| Race between `load()` and `mergeLessonResult()` if the user opens two tabs | Low | Out of scope for this slice. A future slice can use the `storage` event for cross-tab sync. |
| Reward screen still uses hard-coded payload | Medium | R3-01 will be updated to read the payload prop; the hard-coded fallback in `main.js` is only for the boot test path. |

---

> **Parallel marker**: Not parallelizable; depends on R2-02 (for the lesson session contract) and is consumed by R4-02.
> **Test note**: No automated test framework; manual walkthrough in DevTools. `computeReward` and `mergeLessonResult` are pure functions and testable in isolation; a future slice can add Vitest.
> **Requirement mapping**: Every sub-task MUST end with `_Requirements: X.X_`. No mapping = invalid task file.
> **Evidence rule**: No `## Evidence` section = invalid task file.
