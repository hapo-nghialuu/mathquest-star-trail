# Task R1-01: Adventure Map layout and top counter pills

**Requirement:** R2 — Adventure Map screen rendering, R14 — Art direction conformance
**Status:** pending
**Priority:** P0
**Estimated Effort:** S
**Dependencies:** tasks/task-R0-01-scaffold-and-persistence.md
**Spec:** specs/vertical-mvp-001/

## Context

- **Why**: The Adventure Map is the first screen the learner sees and the home base they return to after every reward. This task renders the polished full-screen background, the world banner, the three top counter pills, and the bottom nav strip, so the learner can see at a glance where they are in the journey.
- **Current state**: `src/main.js` mounts a placeholder card; the real map screen does not exist yet.
- **Target outcome**: When `mountScreen('adventure_map')` is called, the full-screen PNG `assets/screens/01_adventure_map_screen.png` is rendered as the background; the top of the viewport shows three pill counters (Level 12, Stars 152, Streak 7) and the "Star Trail" world banner; the bottom of the viewport shows the bottom nav strip. The map is keyboard-focusable at the root so screen readers can land on it.

## Constraints

- **MUST**: Use `assets/screens/01_adventure_map_screen.png` as the fixed background. No screenshot of the source-of-truth video; the polished art package is the only source.
- **MUST**: Use `assets/screen_crops/bottom_nav_quests_practice_shop.png` for the bottom nav.
- **MUST**: Place all overlays using percentage-based positioning (`%` or `vw`/`vh` only); no absolute pixel offsets that drift across viewports.
- **MUST**: Read counters from the persisted state in `src/state/store.js`, not from the config defaults.
- **SHOULD**: Use the existing `.pill` and `.card` utility classes from `src/styles/main.css`.
- **MUST NOT**: Add animations in this task; the pulse lives in R1-02.
- **MUST NOT**: Render the map nodes (21–27); that belongs to R1-02.
- **SCOPE**: Implement the background, banner, top counters, and bottom nav only. Do not implement node tap or pulse; do not implement Practice/Quests/Shop routing.

## Steps

- [ ] 1. Create `src/components/counter.js`.
  - Business intent: a reusable pill counter that the Adventure Map (R1-01) and the post-reward map (R4-02) both render.
  - Code detail: export `Counter({ icon, label, value })` that returns a `<span class="pill" role="status" aria-label="${label} ${value}">` containing an inline icon (simple emoji or inline SVG), the label, and the value. Inline `<style>` is fine for the icon. No state; pure function of props.
  - _Requirements: 2.2, 14.1–14.5_

- [ ] 2. Create `src/screens/map.js` with `render(rootEl, state, dispatch)`.
  - Business intent: the real Adventure Map screen that replaces the R0-01 placeholder.
  - Code detail: import `assets/screens/01_adventure_map_screen.png` as the background image, render an `<img class="bg" src="..." alt="Star Trail adventure map">`, a top counter row (3 pills) bound to `state.learner.level`, `state.learner.stars`, `state.learner.streak`, a world banner reading "Star Trail", and a bottom nav strip using `assets/screen_crops/bottom_nav_quests_practice_shop.png`. Wrap everything in `<div class="map-root" role="region" aria-label="Adventure Map">` so keyboard focus lands on a labelled region. Node rendering is added by R1-02 — for now, leave a `<div id="map-nodes"></div>` placeholder at the right z-index so R1-02 has a clear mount point.
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 13.1, 14.1, 14.2, 14.5_

- [ ] 3. Wire `src/main.js` to import the new screen.
  - Business intent: replace the R0-01 placeholder with the real map screen.
  - Code detail: in `src/main.js`, replace the placeholder code with `import { render as renderMap } from './screens/map.js';` and call `renderMap(root, state, dispatch)` inside `mountScreen('adventure_map')`. Keep `currentUnmount = renderMap(...).unmount`. Update the boot to call `mountScreen('adventure_map')` after the state-machine transition. Export the screen module's `render` and `unmount` (the latter is returned by `render`).
  - _Requirements: 1.3, 10.1, 10.3, 12.3_

- [ ] 4. Sanity-check responsive layout.
  - Business intent: counters and banner do not collide on common iPhone/Android viewports.
  - Code detail: position the top counter row at `top: 4%; left: 0; right: 0; display: flex; justify-content: space-around; z-index: 2;` and the world banner at `top: 2%; left: 50%; transform: translateX(-50%); z-index: 2;`. Confirm visually that the 3 pills do not overlap the banner.
  - _Requirements: 2.2, 2.3_

- [ ] 5. Verification implementation.
  - Run the dev server and open the page in DevTools with iPhone 12 Pro (390×844) and iPhone X (375×812) viewports. Confirm: background fills viewport, banner reads "Star Trail", pills read "Level 12", "Stars 152", "Streak 7", bottom nav strip spans the bottom edge. Reload with a corrupted `localStorage` and confirm counters reset to the defaults. Tab through the page and confirm focus lands on the map region.
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

## Requirements

- 2.1 — Map renders 01_adventure_map_screen.png as fixed background
- 2.2 — Top counter pills Level/Stars/Streak
- 2.3 — World banner "Star Trail" centered at top
- 2.4 — Bottom nav strip from screen_crops
- 13.1 — Keyboard tab order, focusable region
- 14.1, 14.2, 14.5 — Art direction NFR (background, crops, no foreign text)

## Related Files

| Path | Action | Description |
|---|---|---|
| `src/components/counter.js` | Create | Pill counter component |
| `src/screens/map.js` | Create | Adventure Map screen render + unmount |
| `src/main.js` | Modify | Replace placeholder with `renderMap` call |

## Completion Criteria

- [ ] `src/screens/map.js` exists and exports `render(rootEl, state, dispatch) → { unmount() }`.
- [ ] Reloading the page renders the background PNG, banner, 3 counter pills, and bottom nav strip.
- [ ] The 3 counter pills read from `state.learner` and reflect the persisted values.
- [ ] The bottom nav strip is visible at the bottom edge of the viewport.
- [ ] No node 26 element, no pulse, no tap handler in this task (R1-02 adds them).
- [ ] `<div id="map-nodes">` placeholder exists at the correct z-index so R1-02 can mount into it.
- [ ] Keyboard `Tab` from the URL bar lands on the map region (`role="region"`, `aria-label="Adventure Map"`).
- [ ] No animation in this task; no console errors.
- [ ] `unmount()` removes every DOM element created by `render` and returns the root to a clean state.

## Evidence

This section is both the task-level test plan and the proof checklist. Keep it short, exact, and executable.

- [ ] Automated verification (unit/component/integration/E2E as applicable)
  - Command(s): `node -e "const fs=require('fs');['src/screens/map.js','src/components/counter.js'].forEach(p=>fs.accessSync(p));console.log('PASS')"`
  - Expected proof: prints `PASS` and exits 0
- [ ] Artifact / runtime verification
  - Inspect: open `http://127.0.0.1:5173/index.html` in DevTools at 390×844
  - Expect: background PNG fills viewport; banner "Star Trail" visible at top; 3 pill counters visible reading "Level 12", "Stars 152", "Streak 7"; bottom nav strip visible at the bottom
- [ ] Runtime reachability verification
  - Entrypoint/caller: `src/main.js::boot()` → `mountScreen('adventure_map')` → `renderMap(root, state, dispatch)`
  - Expect: the map screen is the first interactive frame; the placeholder card from R0-01 is gone
- [ ] Contract / negative-path verification
  - Check: `localStorage.setItem('mathquest:v1:state', JSON.stringify({...DEFAULT_STATE, learner:{...DEFAULT_STATE.learner, level:13, stars:200, streak:9}}))` → reload
  - Expect: counters update to Level 13, Stars 200, Streak 9 without code change (proves the read is from state, not hard-coded)
  - Check: corrupt `localStorage` and reload
  - Expect: counters fall back to defaults (12 / 152 / 7) and a console warning is logged

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Counters and banner overlap on small viewports | Medium | Use percentage positioning and verify on 375×812 in addition to 390×844. |
| Bottom nav strip image is too short on tall viewports | Medium | Use `width: 100%; height: auto;` and let the image keep its aspect ratio; verify the strip is fully visible. |
| Background PNG is too large and slows first paint | Low | `<link rel="preload" as="image" href="assets/screens/01_adventure_map_screen.png">` is already in `index.html` (R0-01). |

---

> **Parallel marker**: This task is parallelizable with R2-01 (Lesson Screen frame) — both depend only on R0-01 and touch different files. Mark as `(P)`.
> **Test note**: No automated test framework; manual viewport verification in DevTools.
> **Requirement mapping**: Every sub-task MUST end with `_Requirements: X.X_`. No mapping = invalid task file.
> **Evidence rule**: No `## Evidence` section = invalid task file.
