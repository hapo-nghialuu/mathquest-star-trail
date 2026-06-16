# Task R1-02: Adventure Map nodes, bottom nav, and node 26 pulse animation

**Requirement:** R3 — Active node 26 pulse and tap, R10 — Return to map and node 27 unlock
**Status:** pending
**Priority:** P0
**Estimated Effort:** M
**Dependencies:** tasks/task-R1-01-map-layout-and-counters.md
**Spec:** specs/vertical-mvp-001/

## Context

- **Why**: The 7 trail nodes (21–27) are the learner's progress markers. The active node 26 must be visually dominant so the learner knows where to start. Tapping node 26 is the entry to the lesson.
- **Current state**: R1-01 renders the background, banner, counters, and bottom nav. A `<div id="map-nodes">` placeholder is reserved for the node layer.
- **Target outcome**: All 7 nodes render at their trail positions with state-appropriate styling (completed = green ring; active = current-26 marker, pulsing; locked = grey). Tapping node 26 plays a scale-up animation and dispatches a `node_26_selected` event that the state machine consumes. Tapping other nodes is a no-op. Under reduced motion, node 26 is static with a gold border.

## Constraints

- **MUST**: Position nodes with percentage-based coordinates so they track the background across viewports.
- **MUST**: Use `assets/screen_crops/map_node_current_26.png` as the active marker for node 26.
- **MUST**: Use `assets/screen_crops/bottom_nav_quests_practice_shop.png` for the bottom nav (also referenced by R1-01; reuse the same render).
- **MUST**: Use `gsap` (loaded via import map) for the pulse and tap animations; fall back to a static gold border under reduced motion.
- **MUST**: Call `gsap.killTweensOf` and `timeline.kill()` on screen unmount.
- **MUST NOT**: Add routing for the bottom nav items (Quests / Practice / Shop); they are visual placeholders.
- **MUST NOT**: Animate completed or locked nodes; only the active node pulses.
- **SCOPE**: Only the node layer and the bottom nav (move from R1-01 if needed). No scoring, no persistence, no lesson screen.

## Steps

- [ ] 1. Create `src/motion/pulse.js`.
  - Business intent: a reusable GSAP timeline factory for the active-node pulse, with a `kill()` that re-applies the green ring for completed nodes (Red Team 2026-06-15).
  - Code detail: `import { gsap } from 'gsap'; import { isReducedMotion } from './reduced.js'; export function createPulseTimeline(nodeEl, { isCompleted = false } = {}) { const reduced = isReducedMotion(); if (reduced) { nodeEl.style.border = '2px solid var(--c-gold)'; nodeEl.style.boxShadow = 'none'; return { play(){}, kill(){}, isReduced:true }; } const tl = gsap.timeline({ repeat:-1, yoyo:true, defaults:{ ease:'sine.inOut', duration:0.8 } }); tl.to(nodeEl, { scale:1.08, boxShadow:'0 0 0 8px rgba(255,216,74,0.45)' }, 0).to(nodeEl, { scale:1.0, boxShadow:'0 0 0 0 rgba(255,216,74,0)' }, 0.8); return { play:()=>tl.play(0), kill:()=>{ tl.kill(); gsap.killTweensOf(nodeEl); if (isCompleted) { nodeEl.style.transform=''; nodeEl.style.boxShadow='0 0 0 4px var(--c-success)'; } else { nodeEl.style.transform=''; nodeEl.style.boxShadow=''; } }, isReduced:false }; }`. The 1.6s loop is achieved by the 0.8s segment + 0.8s yoyo return. `kill()` re-applies the green ring when called for a completed node so the visual cue survives the timeline teardown.
  - _Requirements: 3.2, 11.2_

- [ ] 2. Create `src/components/node.js`.
  - Business intent: a reusable map node component that renders state-appropriate visuals.
  - Code detail: `Node({ id, x, y, state, onTap, pulseTimeline })` returns a `<button>` (so it is keyboard-focusable) with `class="map-node map-node--${state}"`, absolute positioning at `${x}%` from left, `${y}%` from top, `aria-label` "Node ${id}, ${state}", and click + `keydown` (Enter/Space) handlers that call `onTap(id)`. Visual states: completed = green ring + 3 small star dots inside; active = current-26 marker image; locked = greyed out + `aria-disabled="true"` and no tap handler.
  - _Requirements: 3.1, 3.4, 10.4, 10.5_

- [ ] 3. Create `src/state/config.js` node coordinates (or a sibling `src/state/nodes.js`).
  - Business intent: declarative position table for the 7 nodes.
  - Code detail: export `NODE_POSITIONS` as `{ 21:{x:18,y:55}, 22:{x:32,y:50}, 23:{x:42,y:55}, 24:{x:54,y:48}, 25:{x:62,y:53}, 26:{x:50,y:42}, 27:{x:38,y:38} }` (percentages tuned by visual inspection of `01_adventure_map_screen.png`; revise after the first walkthrough). Export from `src/state/config.js` so `map.js` can import a single source.
  - _Requirements: 2.1, 3.1, 10.5_

- [ ] 4. Update `src/screens/map.js` to render the node layer.
  - Business intent: wire the node component into the existing map screen.
  - Code detail: import `Node`, `NODE_POSITIONS`, and `createPulseTimeline`. Replace the `<div id="map-nodes">` placeholder with a loop that builds a `Node` per entry in `state.nodes`, attaching the tap handler that dispatches `EVENTS.NODE_26_SELECTED` (via `dispatch` from `main.js`) when id is 26, and a no-op otherwise. On mount, find the active node (`state.nodes.find(n => n.id === state.learner.activeNodeId && n.state === 'active')`) and call `createPulseTimeline(activeNodeEl, { isCompleted: false }).play()`. Track the returned timeline in a closure variable so `unmount()` can call `pulseTimeline.kill({ isCompleted: true })` — the `isCompleted: true` flag tells `kill()` to re-apply the green ring instead of clearing the boxShadow. For completed nodes, set a static `box-shadow: 0 0 0 4px var(--c-success)` directly via CSS (no timeline). The bottom nav strip stays as it was in R1-01.
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 10.4, 10.5, 14.1, 14.2_

- [ ] 5. Wire the state machine for `NODE_26_SELECTED`.
  - Business intent: ensure the App Shell routes the tap event to the lesson screen.
  - Code detail: confirm `src/state/machine.js::TRANSITIONS.adventure_map.NODE_26_SELECTED === 'lesson_question'` (declared in R0-01). In `src/main.js` (already wired in R0-01), `dispatch(EVENTS.NODE_26_SELECTED)` calls `mountScreen('lesson_question')`. R0-01 also handles the lesson screen's `CLOSE` event by calling `mountScreen('return_to_map')` (which remounts the map with the persisted state). The active-node tap scale-up animation is run inline: `gsap.fromTo(nodeEl, {scale:1.0}, {scale:1.15, duration:0.15, yoyo:true, repeat:1, ease:'power1.out'})`.
  - _Requirements: 1.3, 3.3, 10.1_

- [ ] 6. Verification implementation.
  - Run the dev server at 390×844 viewport. Confirm: 7 nodes render at their positions; node 26 is highlighted with the current-26 marker and pulses softly; tapping node 26 plays a brief scale-up and routes to the lesson placeholder; under reduced motion, node 26 has a static gold border with no scale animation. Click completed nodes (21–25) and confirm no scale or state change.
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 11.2_

## Requirements

- 3.1 — Render map_node_current_26.png on node 26
- 3.2 — Node 26 pulse 1.6s yoyo
- 3.3 — Tap node 26 → scale-up + transition
- 3.4 — Node 26 keyboard accessible
- 10.4 — No pulse on completed node 26
- 10.5 — Node 27 visible, non-locked after completion
- 11.2 — Node 26 static gold border under reduced motion
- 14.1, 14.2, 14.5 — Art direction NFR (active marker crop, no foreign text)

## Related Files

| Path | Action | Description |
|---|---|---|
| `src/motion/pulse.js` | Create | Pulse timeline factory with reduced fallback |
| `src/components/node.js` | Create | Map node component (button, state visuals, tap handler) |
| `src/state/config.js` | Modify | Add `NODE_POSITIONS` export |
| `src/screens/map.js` | Modify | Render node layer, attach pulse, wire tap dispatch |
| `src/main.js` | Modify | Route `node_26_selected` → `mountScreen('lesson_question')`; mount a placeholder until R2-01 lands |

## Completion Criteria

- [ ] 7 nodes render at their positions with correct state styling (completed/active/locked).
- [ ] Node 26 element pulses on a 1.6s yoyo loop with the specified scale and box-shadow range.
- [ ] Tapping node 26 plays a 300ms scale-up (`1.0 → 1.15 → 1.0`) and dispatches `NODE_26_SELECTED` to the state machine.
- [ ] Tapping a non-active node (21–25 completed, 27 locked) is a no-op visually and state-wise.
- [ ] Node 26 element has `tabindex=0` (default on `<button>`) and an `aria-label` of "Node 26, active".
- [ ] Under `prefers-reduced-motion: reduce`, node 26 has a 2px gold border and no scale animation.
- [ ] Unmounting the screen (e.g., navigating to the lesson) kills the active timeline and removes the node DOM.
- [ ] No console errors, no memory leaks (verify by navigating back and forth 5 times in DevTools).
- [ ] The bottom nav strip remains visible and unaffected by this task.

## Evidence

This section is both the task-level test plan and the proof checklist. Keep it short, exact, and executable.

- [ ] Automated verification (unit/component/integration/E2E as applicable)
  - Command(s): `node -e "const fs=require('fs');['src/motion/pulse.js','src/components/node.js','src/screens/map.js'].forEach(p=>fs.accessSync(p));console.log('PASS')"`
  - Expected proof: prints `PASS` and exits 0
- [ ] Artifact / runtime verification
  - Inspect: open `http://127.0.0.1:5173/index.html` in DevTools at 390×844
  - Expect: 7 nodes visible; node 26 has the current-26 marker and is animating; bottom nav strip is unchanged
- [ ] Runtime reachability verification
  - Entrypoint/caller: tap on node 26 DOM element → click handler in `Node` component → `dispatch('NODE_26_SELECTED')` → `transition()` → `mountScreen('lesson_question')` (placeholder until R2-01)
  - Expect: a brief scale-up animation on node 26, then the lesson placeholder card replaces the map screen
- [ ] Contract / negative-path verification
  - Check: tap a locked node (id 27) → no scale animation, no state transition
  - Expect: map screen remains, no console errors
  - Check: simulate `prefers-reduced-motion: reduce` in DevTools Rendering, reload, tap node 26
  - Expect: static gold border on node 26, no scale animation, state still transitions to lesson placeholder

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Hard-coded node coordinates drift on viewports | Medium | Use `%` positioning; verify on 375×812 and 414×896 in addition to 390×844. |
| Pulse animation continues after screen unmount (memory leak) | Medium | `unmount()` calls `pulseTimeline.kill()` and `gsap.killTweensOf(nodeEl)`. |
| Click on a completed node accidentally triggers a transition | Low | Completed nodes render as `<button disabled>` so the click handler is not invoked. |
| GSAP import fails offline | Low | R0-01 documents the local fallback; R1-02 imports GSAP only when the user opens the page (lazy). |

---

> **Parallel marker**: Not parallelizable with R1-01 (depends on it). Independent of R2-*, R3-01, R4-* tasks.
> **Test note**: No automated test framework; manual viewport verification in DevTools.
> **Requirement mapping**: Every sub-task MUST end with `_Requirements: X.X_`. No mapping = invalid task file.
> **Evidence rule**: No `## Evidence` section = invalid task file.
