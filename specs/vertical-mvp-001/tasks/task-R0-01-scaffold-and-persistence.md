# Task R0-01: Scaffold app shell and persistence layer

**Requirement:** R1 — Boot and initial state, R8 — Scoring, R9 — Persistence, R11 — Reduced motion, R12 — Performance
**Status:** pending
**Priority:** P0
**Estimated Effort:** M
**Dependencies:** none
**Spec:** specs/vertical-mvp-001/

## Context

- **Why**: This task is the foundation of the slice. It creates the HTML entry, the boot flow, the state machine, the localStorage layer, and the reduced-motion detector. Every other task depends on it because screens cannot mount, transition, or persist without these primitives.
- **Current state**: Greenfield. No `package.json`, no `src/`, no `index.html`. The runtime entrypoint does not exist.
- **Target outcome**: A `python3 -m http.server` (or any static server) can serve the project, the browser loads `index.html`, the Adventure Map screen renders, the state machine transitions to `adventure_map`, and `localStorage['mathquest:v1:state']` round-trips correctly. Reduced motion is detected on demand and reflected as a `data-reduced-motion` attribute on the root.

## Constraints

- **MUST**: Use vanilla HTML + ES modules + GSAP via CDN import map. No bundler, no npm install, no TypeScript.
- **MUST**: Put all app code under `src/` and keep `index.html` at the project root.
- **MUST**: Use `localStorage` key `mathquest:v1:state` exactly. Bump the version only on a schema change, not on every release.
- **MUST**: Wrap every `localStorage` access in try/catch and never throw.
- **SHOULD**: Re-query `matchMedia` on every call, not cache at module scope.
- **MUST NOT**: Add a build step, a test framework, or any other dependency beyond GSAP.
- **SCOPE**: Implement only the boot, state machine, scoring, store, reduced-motion, and the file/folder scaffold required by other tasks. Do not implement any screen content here; that belongs to R1/R2/R3.

## Steps

- [ ] 1. Create `index.html` at the project root.
  - Business intent: a single entrypoint that the browser can open and that loads the app.
  - Code detail: `<!doctype html>`, `<html lang="en">`, `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">`, `<meta name="theme-color" content="#0a1f5c">`, `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; object-src 'none'; base-uri 'none'; frame-ancestors 'none'">`, `<title>MathQuest: Star Trail</title>`, `<link rel="preload" as="image" href="assets/screens/01_adventure_map_screen.png">`, `<script type="importmap">{"imports":{"gsap":"https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm"}}</script>`, `<script type="module" src="src/main.js"></script>`, and a single `<div id="app"></div>` mount point. Header comment must document the offline fallback (swap to local `public/gsap.min.js`).
  - _Requirements: 1.1, 12.1_

- [ ] 2. Create `src/styles/tokens.css`.
  - Business intent: a single source of color truth derived from the approved art direction.
  - Code detail: define `:root { --c-sky:#7ec8ff; --c-navy:#0a1f5c; --c-success:#3ec47a; --c-gold:#ffd84a; --c-purple:#9b6cff; --c-fox:#ff7a3d; --c-red:#ff5c6b; --c-bg:#0e1545; --c-text:#0a1f5c; --c-text-onDark:#ffffff; --radius-lg:24px; --radius-md:16px; --shadow-card:0 8px 24px rgba(10,31,92,0.18); }`. Include a short comment header that references `assets/references/01_color_palette_reference.png` as the source of truth.
  - _Requirements: 14.1–14.5_

- [ ] 3. Create `src/styles/main.css`.
  - Business intent: reset and reusable classes used by every screen.
  - Code detail: `*,*::before,*::after{box-sizing:border-box;} html,body{margin:0;padding:0;height:100%;background:var(--c-bg);color:var(--c-text-onDark);font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;-webkit-font-smoothing:antialiased;} body{overflow:hidden;} #app{position:relative;width:100vw;height:100vh;overflow:hidden;} .bg{position:fixed;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none;} .pill{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;background:rgba(255,255,255,0.92);color:var(--c-text);font-weight:700;font-size:14px;box-shadow:var(--shadow-card);} .card{background:rgba(255,255,255,0.96);border-radius:var(--radius-lg);box-shadow:var(--shadow-card);} .btn{border:0;border-radius:var(--radius-md);padding:12px 20px;font-weight:800;font-size:15px;cursor:pointer;box-shadow:var(--shadow-card);transition:transform 80ms ease;} .btn:active{transform:scale(0.97);} .btn:focus-visible{outline:3px solid var(--c-gold);outline-offset:2px;}`. Include rules for `.btn-glossy` (linear gradient), `.answer-tile` (88×88 min, rounded, glossy), and the safe-area inset padding.
  - _Requirements: 2.2, 4.4, 5.2, 6.1, 13.1, 14.1–14.5_

- [ ] 4. Create `src/styles/motion.css`.
  - Business intent: reduced-motion CSS hooks that mirror the JS reduced branch so transitions stay coherent across CSS and GSAP.
  - Code detail: `[data-reduced-motion="true"] *{animation-duration:0.001ms !important;animation-iteration-count:1 !important;transition-duration:200ms !important;} [data-reduced-motion="true"] .pulse-node{animation:none !important;border:2px solid var(--c-gold) !important;box-shadow:none !important;}`. Document that JS `gsap.set` is the source of truth for element-level reduced state; this CSS is the safety net.
  - _Requirements: 11.1, 11.2, 13.3_

- [ ] 5. Create `src/util/dom.js`.
  - Business intent: a tiny helper to build DOM trees declaratively without a framework.
  - Code detail: export `h(tag, props, children) => { /* element creator with className, style, dataset, on* events, text, children */ }` and `qs(root, sel)`, `qsa(root, sel)`. No virtual DOM; just direct element creation.
  - _Requirements: 13.1, 13.2_

- [ ] 6. Create `src/state/config.js`.
  - Business intent: inlined copy of the JSON guidance so the app does not fetch at runtime.
  - Code detail: export `const LESSON = { id:'place_value_400_30_6', topic:'Place Value', objective:'Understand hundreds, tens and ones', progress:{current:4,total:10,label:'4 / 10'}, hearts:{filled:2,empty:1}, question:'Which number is 400 + 30 + 6?', choices:[{id:'a',label:'436',correct:true},{id:'b',label:'463',correct:false},{id:'c',label:'406',correct:false},{id:'d',label:'346',correct:false}], hint:'Think about the hundreds, tens and ones.', explanation:'400 plus 30 plus 6 equals 436.', supportControls:['Hint','Help','Read'] };` and `const DEFAULT_STATE = { schemaVersion:1, savedAt:null, learner:{level:12, stars:152, streak:7, xp:1840, activeNodeId:26}, nodes:[{id:21,state:'completed',stars:3,bestScore:10,attempts:1},{id:22,state:'completed',stars:3,bestScore:10,attempts:1},{id:23,state:'completed',stars:3,bestScore:10,attempts:1},{id:24,state:'completed',stars:3,bestScore:10,attempts:1},{id:25,state:'completed',stars:3,bestScore:10,attempts:1},{id:26,state:'active',stars:0,bestScore:0,attempts:0},{id:27,state:'locked',stars:0,bestScore:0,attempts:0}], currentWorld:'Star Trail' };`. Export the full 9-state machine enum, scoring constants, and animation durations so other modules import a single source.
  - _Requirements: 1.2, 9.2, 8.1–8.6_

- [ ] 7. Create `src/state/scoring.js`.
  - Business intent: pure function mapping attempt path to reward, implemented as a lookup table keyed by `wrongCount` (the dominant axis). `usedHint` only downgrades the top tier (first-try correct).
  - Code detail: `const TIERS = [{ max: 0, score: 10, stars: 3 }, { max: 1, score: 5, stars: 2 }, { max: Infinity, score: 3, stars: 1 }]; export function computeReward({ usedHint, wrongCount }) { const hint = Boolean(usedHint); const wrong = Math.max(0, Number(wrongCount) || 0); const tier = TIERS.find((t) => wrong <= t.max); let { score, stars } = tier; if (hint && wrong === 0) { score = 7; stars = 2; } return { score, stars, xpBonus: 60 }; }`. Followed by a comment block citing the truth table from Requirement 8 AC 2. No side effects, no imports. Normalize inputs as the first step.
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 8. Create `src/state/store.js`.
  - Business intent: a single persistence layer with versioned key, strict shape validation, safe defaults, and a pure `mergeLessonResult`.
  - Code detail: export `STORAGE_KEY = 'mathquest:v1:state'`; `export function load()` that reads the key, JSON-parses, and **strictly validates** the snapshot: `schemaVersion === 1`; `learner.level | stars | streak | xp | activeNodeId` are finite integers (stars, xp, streak are non-negative); `nodes.length === 7` and each entry has `id` in `21..27`, `state` in `{'locked','available','active','completed'}`, and non-negative integer `stars | bestScore | attempts`. Any mismatch → return `DEFAULT_STATE` and log a console warning. `export function save(state)` that stamps `savedAt`, sets `schemaVersion:1`, stringifies, wraps `setItem` in try/catch, and **returns `{ ok: true }` on success or `{ ok: false, error: <message> }` on failure** (never throws). `export function mergeLessonResult(state, { score, stars, xpBonus, wrongCount })` that is **pure**: takes the current state explicitly (no internal `load()`), updates the active node (`stars = max(prev, stars)`, `bestScore = max(prev, score)`, `attempts++`, `state = 'completed'`), adds `stars` to `learner.stars`, adds `60` to `learner.xp`, sets `learner.streak += (wrongCount <= 1 ? 1 : 0)`, sets the next node's `state` to `available` if it was `locked`, sets `learner.activeNodeId` to the next node's id (or keeps it if at the end), and returns `{ nextState, persisted: { ok, error? } }`. The caller decides whether to update its in-memory state based on `persisted.ok`.
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 10.2, 12.2_

- [ ] 9. Create `src/state/machine.js`.
  - Business intent: the single source of valid transitions for the **6 active runtime states** (Red Team 2026-06-15 simplification).
  - Code detail: export `STATES` (frozen object of 6 active states: `BOOT`, `ADVENTURE_MAP`, `LESSON_QUESTION`, `REWARD_COMPLETION`, `SAVE_PROGRESS`, `RETURN_TO_MAP`) and `EVENTS` (frozen object of intermediate event names: `NODE_26_SELECTED`, `CORRECT`, `INCORRECT`, `CLOSE`, `CONTINUE`, `BACK_TO_MAP`, `DONE`). Export `TRANSITIONS` (a table mapping current state + event to next state: `{ adventure_map:{ NODE_26_SELECTED:'lesson_question', CLOSE:'return_to_map' }, lesson_question:{ CORRECT:'reward_completion', INCORRECT:'lesson_question', CLOSE:'return_to_map' }, reward_completion:{ CONTINUE:'save_progress', BACK_TO_MAP:'return_to_map' }, save_progress:{ DONE:'return_to_map' }, return_to_map:{ DONE:'adventure_map' } }`). Export `transition(currentState, event)` that returns the next state or throws. Export `dispatch(currentState, event, payload, hooks={onTransition})` that calls `transition` and runs the hook with `(prevState, nextState, event, payload)`.
  - _Requirements: 1.3, 10.1_

- [ ] 10. Create `src/motion/reduced.js`.
  - Business intent: a single point of truth for the reduced-motion flag and a DOM hook.
  - Code detail: export `isReducedMotion() { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } }` and `setRootDataAttribute(rootEl) { if (rootEl) rootEl.setAttribute('data-reduced-motion', String(isReducedMotion())); }`. No module-level cache; the function re-queries each call.
  - _Requirements: 11.1, 13.3_

- [ ] 11. Create `src/main.js` with the boot flow.
  - Business intent: the App Shell that boots the app and routes to the first screen, with a single `appState` object (Red Team 2026-06-15).
  - Code detail: `import './styles/tokens.css'; import './styles/main.css'; import './styles/motion.css'; import { load as loadState, save, mergeLessonResult } from './state/store.js'; import { computeReward } from './state/scoring.js'; import { dispatch as machineDispatch, STATES, EVENTS } from './state/machine.js'; import { setRootDataAttribute } from './motion/reduced.js'; import { render as renderMap } from './screens/map.js'; import { render as renderLesson } from './screens/lesson.js'; import { render as renderReward } from './screens/reward.js'; const root = document.getElementById('app'); const appState = { currentUnmount: null, currentState: null }; export function mountScreen(name, payload) { setRootDataAttribute(root); if (appState.currentUnmount) { appState.currentUnmount(); appState.currentUnmount = null; } if (name === 'adventure_map') { appState.currentUnmount = renderMap(root, appState.currentState, dispatch).unmount; } else if (name === 'lesson_question') { appState.currentUnmount = renderLesson(root, appState.currentState, dispatch).unmount; } else if (name === 'reward_completion') { appState.currentUnmount = renderReward(root, appState.currentState, dispatch, payload).unmount; } } export function dispatch(event, payload) { if (event === EVENTS.CORRECT) { const reward = computeReward({ usedHint: payload.session.usedHint, wrongCount: payload.session.wrongCount }); const rewardPayload = { ...reward, wrongCount: payload.session.wrongCount, usedHint: payload.session.usedHint }; mountScreen('reward_completion', rewardPayload); } else if (event === EVENTS.CONTINUE) { const { nextState, persisted } = mergeLessonResult(appState.currentState, payload); if (persisted.ok) { appState.currentState = nextState; } else { console.warn('[main] save failed:', persisted.error); } mountScreen('return_to_map'); } else if (event === EVENTS.BACK_TO_MAP || event === EVENTS.CLOSE) { mountScreen('return_to_map'); } else if (event === EVENTS.NODE_26_SELECTED) { mountScreen('lesson_question'); } else if (event === EVENTS.INCORRECT) { /* lesson screen handles its own visual feedback; stay mounted */ } } function boot() { setRootDataAttribute(root); appState.currentState = loadState(); machineDispatch(STATES.BOOT, 'INIT', null); mountScreen('adventure_map'); } window.addEventListener('DOMContentLoaded', boot);`. Note: the lesson session `{ usedHint, wrongCount }` travels in the `CORRECT` dispatch payload from `lesson.js`; no global `lessonSession` exists in `main.js`. `setRootDataAttribute` is called on every `mountScreen` so the `data-reduced-motion` attribute stays current.
  - _Requirements: 1.1, 1.2, 1.3, 9.6, 12.1, 12.3, 13.1, 13.3_

- [ ] 12. Verification implementation.
  - Run `python3 -m http.server 5173 --bind 127.0.0.1` and open `http://127.0.0.1:5173/index.html` in Chrome DevTools with iPhone 12 Pro (390×844) viewport. Confirm the placeholder card appears, the console shows no errors, and `localStorage['mathquest:v1:state']` is set to a JSON string with `schemaVersion:1`. Toggle DevTools Rendering → emulate `prefers-reduced-motion: reduce`, reload, and confirm `<div id="app" data-reduced-motion="true">` is set.
  - _Requirements: 1.1, 1.2, 1.3, 9.1, 11.1, 13.3_

## Requirements

- 1.1 — Boot reads localStorage within 50ms
- 1.2 — Fallback to initial_learner_state on missing/corrupt
- 1.3 — Transition to adventure_map on boot
- 8.1, 8.2, 8.3, 8.4, 8.5, 8.6 — Scoring 4 tiers + 60 XP bonus
- 9.1, 9.2, 9.3, 9.4, 9.5, 9.6 — Persistence v1 shape
- 10.2 — Unlock node 27
- 11.1 — Re-query matchMedia on every mount
- 12.1, 12.2, 12.3 — Performance and reliability NFRs
- 13.1, 13.3 — Keyboard nav and data-reduced-motion root attribute
- 14.1–14.5 — Art direction NFRs (tokens, base styles, asset-ready classes)

## Related Files

| Path | Action | Description |
|---|---|---|
| `index.html` | Create | App entry, import map, mount point |
| `src/main.js` | Create | Boot, router, mountScreen stub |
| `src/styles/tokens.css` | Create | Color tokens, radii, shadows |
| `src/styles/main.css` | Create | Reset, base layout, .pill, .card, .btn |
| `src/styles/motion.css` | Create | Reduced-motion CSS safety net |
| `src/util/dom.js` | Create | h(), qs(), qsa() helpers |
| `src/state/config.js` | Create | Inlined LESSON, DEFAULT_STATE, STATES, scoring constants |
| `src/state/scoring.js` | Create | computeReward({usedHint, wrongCount}) |
| `src/state/store.js` | Create | load, save, mergeLessonResult |
| `src/state/machine.js` | Create | STATES, TRANSITIONS, transition, dispatch |
| `src/motion/reduced.js` | Create | isReducedMotion, setRootDataAttribute |

## Completion Criteria

- [ ] `index.html` exists, is valid HTML5, declares the GSAP import map, and mounts `<div id="app"></div>`.
- [ ] `src/main.js` boots to `adventure_map` and mounts the placeholder card.
- [ ] `src/state/store.js::load()` returns a state with `schemaVersion: 1` on first run and on subsequent runs.
- [ ] `src/state/store.js::mergeLessonResult()` updates node 26 to `completed`, unlocks node 27, adds the awarded stars to `learner.stars`, adds 60 to `learner.xp`, and increments `learner.streak` if `wrongCount ≤ 1`.
- [ ] `src/state/scoring.js::computeReward()` returns the correct `{score, stars, xpBonus}` for all 4 paths.
- [ ] `src/state/machine.js::transition()` throws on any invalid (currentState, event) pair.
- [ ] `src/motion/reduced.js::isReducedMotion()` re-queries `matchMedia` on every call (verifiable by toggling DevTools and calling the function twice).
- [ ] `<div id="app" data-reduced-motion="...">` reflects the current OS setting.
- [ ] No runtime errors in the browser console at boot.
- [ ] No code outside the approved scope_lock; no extra dependencies; no test framework added.

## Evidence

This section is both the task-level test plan and the proof checklist. Keep it short, exact, and executable.
Select the proof by task risk; do not run every test type for every task.

- [ ] Automated verification (unit/component/integration/E2E as applicable)
  - Command(s): `node -e "const fs=require('fs');['index.html','src/main.js','src/state/store.js','src/state/scoring.js','src/state/machine.js','src/state/config.js','src/motion/reduced.js','src/styles/tokens.css','src/styles/main.css','src/styles/motion.css','src/util/dom.js'].forEach(p=>fs.accessSync(p));console.log('PASS')"`
  - Expected proof: prints `PASS` and exits 0
- [ ] Artifact / runtime verification
  - Inspect: `localStorage.getItem('mathquest:v1:state')` in DevTools console after first load
  - Expect: a JSON string with `schemaVersion: 1`, `learner.level: 12`, `learner.stars: 152`, `learner.streak: 7`, `learner.xp: 1840`, `learner.activeNodeId: 26`, and 7 nodes (21–27)
- [ ] Runtime reachability verification
  - Entrypoint/caller: `index.html` → `src/main.js::boot()` (registered on `DOMContentLoaded`)
  - Expect: the placeholder card appears in `<div id="app">` within 1s of page load; the console shows no errors
- [ ] Contract / negative-path verification
  - Check: `localStorage.removeItem('mathquest:v1:state')` → reload → verify state is rebuilt from `DEFAULT_STATE` and the page renders normally
  - Expect: no crash, console warning logged, placeholder card still appears
  - Check: `localStorage.setItem('mathquest:v1:state','{corrupt')` → reload → verify fallback
  - Expect: same as above

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| GSAP CDN offline | High | Document local `public/gsap.min.js` fallback in `index.html` header comment; R0-01 only imports GSAP lazily (when a screen uses it), so an offline CDN does not break boot. |
| localStorage corruption / quota | Medium | try/catch in `load()` and `save()`; fallback to `DEFAULT_STATE`; console warn. |
| `matchMedia` returns null in some test harnesses | Low | wrap in try/catch and default to `false`. |
| `mountScreen` stub conflicts with R1-01's real map mount | Low | R1-01 replaces the placeholder by importing the real module; the stub exists only until R1-01 lands. |

---

> **Parallel marker**: This is the foundation; no parallel marker. All other tasks depend on it.
> **Test note**: No automated test framework is added in this slice. Manual walkthrough in R4-03 covers the end-to-end loop. The `computeReward` function is pure and testable in isolation; a future slice can add Vitest without changing this task.
> **Requirement mapping**: Every sub-task MUST end with `_Requirements: X.X_`. No mapping = invalid task file.
> **Evidence rule**: No `## Evidence` section = invalid task file.
