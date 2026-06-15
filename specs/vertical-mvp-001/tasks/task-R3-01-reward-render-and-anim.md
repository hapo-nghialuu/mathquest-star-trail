# Task R3-01: Reward screen render with banner drop, star pop, and XP count-up

**Requirement:** R7 — Reward screen and animation
**Status:** pending
**Priority:** P0
**Estimated Effort:** M
**Dependencies:** tasks/task-R2-02-lesson-question-and-answers.md, tasks/task-R2-03-hint-help-read-controls.md
**Spec:** specs/vertical-mvp-001/

## Context

- **Why**: The reward screen is the moment of celebration. The learner needs a clear, animated "Bridge Repaired!" banner, 3 glowing stars, and an XP count-up to feel recognized. The "Continue Adventure" CTA closes the loop and returns to the map.
- **Current state**: R2-02 routes `CORRECT` events to a placeholder card reading "Reward placeholder — wired in R3-01." The real screen needs to replace it.
- **Target outcome**: When the state machine enters `reward_completion`, the polished full-screen reward background renders, the banner drops in, 3 stars pop in sequence, the XP count-up animates from 0 to 60, and the primary "Continue Adventure" CTA is the dominant action. Under reduced motion, the animation is replaced with an opacity transition and an immediate XP value.

## Constraints

- **MUST**: Use `assets/screens/03_reward_completion_screen.png` as the fixed background.
- **MUST**: Use `assets/screen_crops/reward_stars_banner.png` for the banner area and `assets/screen_crops/xp_badge_60.png` for the XP badge.
- **MUST**: Use `motion/reward-pop.js` (created in step 1) for the GSAP timeline; fall back to opacity transitions under reduced motion.
- **MUST**: Read the reward `{score, stars, xpBonus}` from the lesson session (passed in via the dispatch payload) and use the awarded `stars` to drive the number of glowing stars on screen. For this slice the placeholder tier is "first-try correct" (3 stars, +60 XP); R4-01 will replace the static reward with a payload-driven reward.
- **MUST NOT**: Implement persistence in this task; that belongs to R4-01.
- **MUST NOT**: Trigger the `return_to_map` transition from this task; only dispatch the event. R4-02 wires the transition.
- **SCOPE**: Reward screen render and animation. The reward payload is hard-coded for this task; R4-01 will pass it in dynamically.

## Steps

- [ ] 1. Create `src/motion/reward-pop.js`.
  - Business intent: GSAP timeline factory for the reward enter sequence, with `kill()` that snaps XP text to the target value (Red Team 2026-06-15).
  - Code detail: `import { gsap } from 'gsap'; import { isReducedMotion } from './reduced.js'; export function createRewardTimeline({ bannerEl, starEls, xpEl, targetXp }) { const reduced = isReducedMotion(); if (reduced) { bannerEl.style.opacity = '1'; bannerEl.style.transform = 'none'; starEls.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'scale(1)'; }); xpEl.textContent = String(targetXp); return { play(){}, kill(){ xpEl.textContent = String(targetXp); }, isReduced:true }; } const tl = gsap.timeline({ defaults:{ ease:'back.out(1.7)' } }); tl.fromTo(bannerEl, { y:-120, opacity:0 }, { y:0, opacity:1, duration:0.5 }, 0); starEls.forEach((el, i) => { tl.fromTo(el, { scale:0 }, { scale:1, duration:0.4 }, 0.5 + i * 0.2); }); const xpObj = { v:0 }; tl.to(xpObj, { v:targetXp, duration:1, ease:'power1.out', onUpdate:() => { xpEl.textContent = String(Math.round(xpObj.v)); } }, 0.6); return { play:()=>tl.play(0), kill:()=>{ tl.kill(); gsap.killTweensOf([bannerEl, ...starEls, xpObj]); bannerEl.style.transform=''; starEls.forEach(el => { el.style.transform=''; el.style.opacity=''; }); xpEl.textContent = String(targetXp); }, isReduced:false }; }`. The banner drops at 0s, stars pop at 0.5s / 0.7s / 0.9s, and the XP count-up runs 0.6s–1.6s. `kill()` always snaps `xpEl.textContent` to the target value so the displayed XP is correct even if the user navigates away mid-animation.
  - _Requirements: 7.2, 7.3, 7.4, 11.3_

- [ ] 2. Create `src/screens/reward.js` with `render(rootEl, state, dispatch, payload)`.
  - Business intent: the real reward screen that consumes the reward payload computed by the App Shell (Red Team 2026-06-15 — payload is no longer hard-coded).
  - Code detail: import `assets/screens/03_reward_completion_screen.png`, `assets/screen_crops/reward_stars_banner.png`, `assets/screen_crops/xp_badge_60.png`, and `createRewardTimeline`. Render the background `<img class="bg">`, the banner image (positioned `top: 12%; left: 50%; transform: translateX(-50%); z-index: 1;`), a 3-star row (each star is a `<span class="star" aria-hidden="true">★</span>` inside a flex row at `top: 30%; left: 50%; transform: translateX(-50%); z-index: 1;`) — the **number of glowing stars equals `payload.stars`** (1, 2, or 3), the rest are dimmed (`opacity: 0.3`), the XP badge using `xp_badge_60.png` with an inner text element that starts at `"0"` and counts up to `payload.score` (the score, not 60, is the count-up target; the badge image is just visual chrome — see design.md), the "Bridge Repaired!" overlay text (use `<h1>` reading "Bridge Repaired!"), the "Great job!" message, a node 26 badge reading "Node 26", the primary CTA `<button class="btn btn-glossy" aria-label="Continue Adventure">Continue Adventure</button>`, and a secondary action `<button class="btn-link" aria-label="Back to Map">Back to Map</button>`. Wire the primary CTA: `dispatch(EVENTS.CONTINUE, payload)` — `payload` is forwarded as-is to the App Shell's `mergeLessonResult` handler. The secondary action dispatches `EVENTS.BACK_TO_MAP` (which routes to the map without persisting). On mount, call `createRewardTimeline({ bannerEl, starEls, xpEl, targetXp: payload.score }).play()`. On unmount, call `kill()` and remove every DOM element. Defensive: if `payload` is missing (defensive programming only — the App Shell guarantees it), default to `{ score: 10, stars: 3, xpBonus: 60, wrongCount: 0, usedHint: false }` and log a console warning.
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 14.4, 14.5_

- [ ] 3. Wire `src/main.js` to import the reward screen and route the `reward_completion` state.
  - Business intent: replace the R2-02 placeholder with the real screen.
  - Code detail: in `src/main.js`, import `render as renderReward` from `./screens/reward.js`. Update `mountScreen` to handle `'reward_completion' → renderReward(root, state, dispatch, payload)`. The payload is taken from the most recent `CORRECT` dispatch (kept in a module-level variable in `main.js`). For now, R2-02 passes `{ score: 10, stars: 3, xpBonus: 60, wrongCount: 0, usedHint: false }` as a placeholder; R4-01 will compute the real payload.
  - _Requirements: 1.3, 10.1, 10.3, 12.3_

- [ ] 4. Verification implementation.
  - Run the dev server at 390×844 viewport. Tap node 26 → tap "436" (correct) → reward screen mounts → banner drops → 3 stars pop in sequence → XP counts up to 60 → "Continue Adventure" is visible. Tap "Continue Adventure" → placeholder for now (R4-02 will route back to map). Under reduced motion, verify banner and stars are immediately visible (no animation) and XP reads "60" without a count-up. Tab through and confirm focus lands on the primary CTA first.
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 11.3_

## Requirements

- 7.1 — Reward renders 03_reward_completion_screen.png as fixed background
- 7.2 — Banner drop 500ms back.out
- 7.3 — 3 stars pop, 200ms stagger
- 7.4 — XP badge count-up 0→60, 1s
- 7.5 — Continue Adventure + Back to Map CTAs
- 11.3 — Reduced motion: opacity transition + immediate XP value
- 14.4, 14.5 — Art direction NFR (banner, XP badge, no foreign text)

## Related Files

| Path | Action | Description |
|---|---|---|
| `src/motion/reward-pop.js` | Create | Banner + stars + XP count-up timeline factory |
| `src/screens/reward.js` | Create | Reward screen render + unmount |
| `src/main.js` | Modify | Import reward screen, route `reward_completion`, pass placeholder payload |

## Completion Criteria

- [ ] `src/motion/reward-pop.js` exists and exports `createRewardTimeline({ bannerEl, starEls, xpEl, targetXp, isReduced }) → { play, kill, isReduced }`.
- [ ] `src/screens/reward.js` exists and exports `render(rootEl, state, dispatch, payload) → { unmount() }`.
- [ ] Tapping the correct answer routes to the real reward screen (not the placeholder).
- [ ] Banner drops in 500ms with `back.out` ease.
- [ ] 3 stars pop in sequence with 200ms stagger.
- [ ] XP text counts up from 0 to 60 over 1 second.
- [ ] "Continue Adventure" is the primary CTA, "Back to Map" is the secondary action.
- [ ] Under reduced motion, banner and stars are immediately visible and XP reads "60" without animation.
- [ ] Tapping "Continue Adventure" dispatches `CONTINUE` but the screen does not yet return to the map (R4-02 wires the transition).
- [ ] `unmount()` kills the active timeline and removes every DOM element.

## Evidence

This section is both the task-level test plan and the proof checklist.

- [ ] Automated verification
  - Command(s): `node -e "const fs=require('fs');['src/motion/reward-pop.js','src/screens/reward.js'].forEach(p=>fs.accessSync(p));console.log('PASS')"`
  - Expected proof: prints `PASS` and exits 0
- [ ] Artifact / runtime verification
  - Inspect: tap node 26 → tap "436" in DevTools at 390×844
  - Expect: reward screen with background, banner "Bridge Repaired!", 3 glowing stars, XP badge with text counting 0→60, primary CTA "Continue Adventure"
- [ ] Runtime reachability verification
  - Entrypoint/caller: tap "436" in `lesson.js` → `dispatch('CORRECT', payload)` → `mountScreen('reward_completion', payload)` in `src/main.js` → `renderReward(root, state, dispatch, payload)`
  - Expect: reward screen mounts with the banner drop, star pop, and XP count-up
- [ ] Contract / negative-path verification
  - Check: simulate reduced motion and tap "436"
  - Expect: reward screen mounts, banner and stars are visible immediately, XP reads "60", no count-up animation
  - Check: tap "Continue Adventure"
  - Expect: dispatch fires, screen remains (R4-02 will wire the route back to map)

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Banner overlaps the stars on small viewports | Low | Position banner at `top: 12%` and stars at `top: 30%`; verify on 375×812. |
| XP text overflows the badge image | Low | Constrain the text element width to 60% of the badge width and use `text-align: center`. |
| `unmount()` does not kill the timeline before the next screen mounts | Medium | `unmount()` calls `rewardTimeline.kill()` and `gsap.killTweensOf` on each animated element. |

---

> **Parallel marker**: Not parallelizable; depends on R2-02 and R2-03.
> **Test note**: No automated test framework; manual walkthrough in DevTools.
> **Requirement mapping**: Every sub-task MUST end with `_Requirements: X.X_`. No mapping = invalid task file.
> **Evidence rule**: No `## Evidence` section = invalid task file.
