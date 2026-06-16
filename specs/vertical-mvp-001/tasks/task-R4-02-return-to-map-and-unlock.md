# Task R4-02: Return to map, node 27 unlock, and updated counter re-render

**Requirement:** R10 — Return to map and node 27 unlock
**Status:** pending
**Priority:** P0
**Estimated Effort:** S
**Dependencies:** tasks/task-R3-01-reward-render-and-anim.md, tasks/task-R4-01-scoring-and-persistence.md
**Spec:** specs/vertical-mvp-001/

## Context

- **Why**: After the reward, the learner must be returned to the Adventure Map with the updated counters and the next node (27) unlocked. This closes the loop and sets up the next lesson.
- **Current state**: R4-01 persists the new state on `CONTINUE` and transitions the state machine to `return_to_map`. R3-01's reward screen dispatches `CONTINUE` but the App Shell does not yet route the transition back to the map.
- **Target outcome**: Tapping "Continue Adventure" on the reward screen unmounts the reward screen, remounts the Adventure Map with the persisted state, and shows node 26 as completed (no pulse) and node 27 as available (visible, non-locked). The 3 counter pills reflect the new stars/streak/xp.

## Constraints

- **MUST**: Unmount the reward screen before mounting the map, killing any active GSAP timelines.
- **MUST**: Pass the persisted `currentState` (from R4-01) to the map render call.
- **MUST**: The map renders node 26 as `completed` (no pulse) and node 27 as `available` (no lock styling).
- **MUST NOT**: Add a "Continue Adventure → start node 27 immediately" shortcut. The learner must explicitly tap node 27.
- **SCOPE**: Only the `return_to_map` transition and the map re-render with updated state. Do not implement node 27 lesson content; that is a future slice.

## Steps

- [ ] 1. Update `src/main.js` to route `return_to_map` and `BACK_TO_MAP`.
  - Business intent: complete the state machine loop.
  - Code detail: in `src/main.js` (already wired in R0-01 step 11), the `BACK_TO_MAP` and `CLOSE` events both call `mountScreen('adventure_map')` (the `return_to_map` state is implicit — the App Shell transitions `reward_completion → return_to_map → adventure_map` in a single `mountScreen` call). `BACK_TO_MAP` does NOT persist (the state was already saved on `CONTINUE`). `CLOSE` does NOT persist (the learner left the lesson without answering). Both handlers must `currentUnmount()` before mounting the map.
  - _Requirements: 1.3, 10.1, 10.3, 12.3_

- [ ] 2. Confirm `src/screens/map.js` reads the latest state for the active node and node 27 is the next active.
  - Business intent: node 26 should not pulse after completion; node 27 should be the new active node and pulse.
  - Code detail: in `src/screens/map.js`, the existing logic reads `state.nodes` and `state.learner.activeNodeId`. Confirm that:
    - When `state.nodes.find(n => n.id === state.learner.activeNodeId).state === 'active'`, the pulse timeline is created (this is the new active node after `mergeLessonResult` updates `activeNodeId` to 27).
    - When `state.nodes.find(n => n.id === 26).state === 'completed'`, no pulse timeline is created for it and a static `box-shadow: 0 0 0 4px var(--c-success)` is applied via CSS.
    - The `mergeLessonResult` step (R0-01) updates `learner.activeNodeId` to the next node's id (27) when the active node transitions to `completed`, so node 27 becomes the new active node and pulses.
  - _Requirements: 10.4, 10.5_

- [ ] 3. Update the top counter pills to reflect the persisted values.
  - Business intent: confirm the post-reward map shows the new counters.
  - Code detail: the existing R1-01 / R1-02 `Counter` components already read from `state.learner`. After R4-01 persists the new state, `currentState` is updated, and the next `renderMap(root, currentState, dispatch)` call renders the new values automatically. Confirm by visual inspection.
  - _Requirements: 2.2, 10.3_

- [ ] 4. Verification implementation.
  - Run the dev server at 390×844 viewport. Walk through: tap node 26 → tap "436" → reward screen → tap "Continue Adventure" → map screen remounts → node 26 is greyed (completed, no pulse) and node 27 is visible (non-locked). DevTools `localStorage.getItem('mathquest:v1:state')` shows the updated values. Reload the page → the map still shows the updated counters and node 27 is available. Tap node 27 → no-op (no lesson content for this slice); the tap handler is still present but the state machine has no transition for it. Under reduced motion, the post-reward map renders identically to the pre-reward map.
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

## Requirements

- 10.1 — Continue Adventure → return_to_map
- 10.2 — Unlock node 27 on completion
- 10.3 — Unmount reward, remount map with updated state
- 10.4 — No pulse on completed node 26
- 10.5 — Node 27 visible, non-locked

## Related Files

| Path | Action | Description |
|---|---|---|
| `src/main.js` | Modify | Route `return_to_map` and `BACK_TO_MAP` to `mountScreen('adventure_map')` |
| `src/screens/map.js` | Modify (verify) | No pulse on completed node 26; node 27 visible and tappable |

## Completion Criteria

- [ ] Tapping "Continue Adventure" on the reward screen unmounts the reward and remounts the Adventure Map.
- [ ] The remounted map shows the updated counters (stars, streak, xp).
- [ ] Node 26 is rendered as completed (no pulse, no tap handler).
- [ ] Node 27 is rendered as available (visible, non-locked, with a tap handler that dispatches `NODE_27_SELECTED` — currently a no-op).
- [ ] Tapping "Back to Map" on the reward screen also remounts the map without persisting (the state was already persisted on `CONTINUE`).
- [ ] Unmounting the reward screen kills the active timeline (no orphaned tweens).
- [ ] No console errors; the state machine loop is closed.

## Evidence

This section is both the task-level test plan and the proof checklist.

- [ ] Automated verification
  - Command(s): `node -e "const fs=require('fs');fs.accessSync('src/main.js');console.log('PASS')"`
  - Expected proof: prints `PASS` and exits 0
- [ ] Artifact / runtime verification
  - Inspect: complete one lesson, tap "Continue Adventure"
  - Expect: map screen with updated counters, node 26 greyed, node 27 visible
- [ ] Runtime reachability verification
  - Entrypoint/caller: `reward.js` tap "Continue Adventure" → `dispatch('CONTINUE', payload)` → `main.js` `mergeLessonResult` → `dispatch('CONTINUE')` → `mountScreen('adventure_map')` → `renderMap(root, currentState, dispatch)`
  - Expect: every link in the chain is reached
- [ ] Contract / negative-path verification
  - Check: tap "Back to Map" instead of "Continue Adventure"
  - Expect: map screen remounts with the persisted state (same as if "Continue Adventure" was tapped)
  - Check: reload the page after completion
  - Expect: map screen still shows the updated counters and node 27 is available

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Reward screen timeline leaks if `unmount()` is not called | Medium | `main.js::mountScreen` always calls `currentUnmount()` before mounting the next screen. |
| Node 27 tap handler dispatches a state that the machine does not handle | Low | The dispatch is a no-op (the machine throws or stays put); a future slice will add the transition. |
| `currentState` is stale after persistence | Medium | `mergeLessonResult` returns a new state object; `main.js` reassigns `currentState = newState` before remounting. |

---

> **Parallel marker**: Not parallelizable; depends on R3-01 and R4-01.
> **Test note**: No automated test framework; manual walkthrough in DevTools.
> **Requirement mapping**: Every sub-task MUST end with `_Requirements: X.X_`. No mapping = invalid task file.
> **Evidence rule**: No `## Evidence` section = invalid task file.
