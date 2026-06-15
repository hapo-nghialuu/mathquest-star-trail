# Requirements Document

## Introduction

MathQuest: Star Trail is a polished mobile math adventure for children. This spec defines the requirements for the first vertical MVP slice: a complete map → lesson → reward loop that a learner can play end-to-end, with persistent progress, accurate scoring, accessible controls, and motion that respects the user's reduced-motion preference. The slice must render the three core screens (Adventure Map, Lesson / Question, Reward / Completion) using the approved polished art package and align with the JSON guidance in `json/mathquest_mvp_implementation_config.json` and `json/mathquest_ai_agent_art_guideline.json`. Persistence is local-only via `localStorage`; no backend, no auth, no audio.

## Requirements

### Requirement 1: Boot and initial state
**Objective:** As a learner, I want the app to start on the Adventure Map with my saved progress, so that I can continue the journey seamlessly across reloads.

#### Acceptance Criteria
1. When the page is loaded, the MathQuest Boot Module shall read `mathquest:v1:state` from `localStorage` and parse it within 50ms.
2. If the stored state is missing, malformed, or has a `schemaVersion` other than 1, the MathQuest Boot Module shall fall back to the `initial_learner_state` defined in `mathquest_mvp_implementation_config.json` and log a console warning.
3. When boot completes successfully, the MathQuest Boot Module shall transition the state machine to `adventure_map` and the App Shell shall mount the Adventure Map screen.

### Requirement 2: Adventure Map screen rendering
**Objective:** As a learner, I want to see the Star Trail floating-island map with the active node, so that I know where to start the next lesson.

#### Acceptance Criteria
1. While the state machine is in `adventure_map`, the Adventure Map Screen shall render `assets/screens/01_adventure_map_screen.png` as a fixed full-viewport background with `object-fit: cover`.
2. The Adventure Map Screen shall display the top counter pills reading "Level 12", "Stars 152", and "Streak 7" within the first 5% of viewport height.
3. The Adventure Map Screen shall display the world banner labeled "Star Trail" centered at the top of the viewport.
4. The Adventure Map Screen shall render `assets/screen_crops/bottom_nav_quests_practice_shop.png` anchored to the bottom edge with full viewport width.

### Requirement 3: Active node 26 pulse and tap
**Objective:** As a learner, I want the active node to be visually obvious and tappable, so that I can start the next lesson with one tap.

#### Acceptance Criteria
1. While the state machine is in `adventure_map` and node 26 is the active node, the Adventure Map Screen shall render `assets/screen_crops/map_node_current_26.png` at the node 26 position.
2. While the Adventure Map Screen is mounted, the node 26 element shall pulse on a 1.6-second yoyo loop with a scale range of 1.0 to 1.08 and a `box-shadow` opacity range of 0.4 to 1.0.
3. When the learner taps the node 26 element, the Adventure Map Screen shall play a 300ms scale-up animation (`1.0 → 1.15 → 1.0`) and dispatch the `NODE_26_SELECTED` event; the App Shell shall transition the state machine to `lesson_question` and mount the Lesson Screen.
4. The node 26 element shall be reachable by keyboard `Tab` and activatable by `Enter` or `Space` for accessibility.

### Requirement 4: Lesson screen frame and progress
**Objective:** As a learner, I want the lesson screen to show my progress and remaining hearts, so that I know how far I am from the reward.

#### Acceptance Criteria
1. When the state machine enters `lesson_question`, the Lesson Screen shall render `assets/screens/02_lesson_question_screen.png` as a fixed full-viewport background with `object-fit: cover`.
2. The Lesson Screen shall display a progress bar reading "4 / 10" at the top of the viewport, below the world header.
3. The Lesson Screen shall display 2 filled hearts and 1 empty heart in a row near the top of the viewport.
4. The Lesson Screen shall provide a close button (top-left) that is keyboard-focusable and has an `aria-label` of "Close lesson".

### Requirement 5: Lesson question and answer feedback
**Objective:** As a learner, I want to read the question and choose an answer with immediate feedback, so that I can learn at my own pace.

#### Acceptance Criteria
1. The Lesson Screen shall display the question text "Which number is 400 + 30 + 6?" in a centered card.
2. The Lesson Screen shall display 4 answer tiles with the labels "436", "463", "406", "346" in a 2×2 grid with tap targets no smaller than 88×88 CSS pixels.
3. When the learner taps the answer tile labeled "436", the Lesson Screen shall play a 600ms green-glow animation on that tile and transition the state machine to `feedback` with `isCorrect=true`.
4. When the learner taps any other answer tile ("463", "406", or "346"), the Lesson Screen shall play a 350ms horizontal shake animation (`x: 0 → -8 → 8 → -6 → 6 → 0`) on that tile and remain on `lesson_question` for retry.
5. The Lesson Screen shall increment an internal `wrongCount` counter by 1 for each non-"436" tap and clear the visual shake before accepting another tap.

### Requirement 6: Hint, Help, and Read controls
**Objective:** As a learner, I want Hint, Help, and Read controls, so that I can get support when I am stuck or want the question read to me.

#### Acceptance Criteria
1. The Lesson Screen shall display three support buttons labeled "Hint", "Help", and "Read" anchored to the bottom of the viewport, above any safe-area inset.
2. When the learner taps "Hint", the Lesson Screen shall display a tooltip containing the text "Think about the hundreds, tens and ones." and shall set a `usedHint` flag that influences the final reward scoring.
3. When the learner taps "Help", the Lesson Screen shall display a worked-example block describing the place-value composition of 436.
4. When the learner taps "Read", the Lesson Screen shall perform a visual highlight sweep that moves a focus ring across the 4 answer tiles in sequence (no audio output).
5. The Hint, Help, and Read buttons shall each be keyboard-focusable and have descriptive `aria-label` attributes.

### Requirement 7: Reward screen and animation
**Objective:** As a learner, I want a celebratory reward screen with animated stars, so that I feel my progress is recognized.

#### Acceptance Criteria
1. When the state machine enters `reward_completion`, the Reward Screen shall render `assets/screens/03_reward_completion_screen.png` as a fixed full-viewport background with `object-fit: cover`.
2. The Reward Screen shall render `assets/screen_crops/reward_stars_banner.png` at the top of the viewport and animate a banner drop (`y: -120 → 0`, `opacity: 0 → 1`) over 500ms with a `back.out` ease.
3. The Reward Screen shall render 3 star elements that pop in sequentially with a 200ms stagger and 400ms `back.out` scale animation (`scale: 0 → 1`).
4. The Reward Screen shall display an XP badge using `assets/screen_crops/xp_badge_60.png` whose text counts up from 0 to 60 over 1 second with `power1.out` ease.
5. The Reward Screen shall display a primary CTA labeled "Continue Adventure" and a secondary action labeled "Back to Map".

### Requirement 8: Scoring computation
**Objective:** As a learner, I want the reward to reflect how I solved the question, so that good first attempts are rewarded more than attempts with help or wrong answers.

#### Acceptance Criteria
1. When the lesson dispatches `CORRECT`, the App Shell shall compute `{score, stars, xpBonus}` from the lesson session's `{usedHint, wrongCount}` using the Scoring Module, and pass the result as the reward payload to the Reward Screen.
2. The Scoring Module shall return the reward according to the truth table:

   | `wrongCount` | `usedHint` | `score` | `stars` | `xpBonus` |
   |---|---|---|---|---|
   | 0 | false | 10 | 3 | 60 |
   | 0 | true  | 7  | 2 | 60 |
   | 1 | false | 5  | 2 | 60 |
   | 1 | true  | 5  | 2 | 60 |
   | ≥2 | false | 3  | 1 | 60 |
   | ≥2 | true  | 3  | 1 | 60 |

3. The Scoring Module shall normalize its input: `usedHint` is `Boolean(usedHint)`, `wrongCount` is `Math.max(0, Number(wrongCount) || 0)`. Falsy or invalid inputs shall be treated as `false` / `0`.
4. The Scoring Module shall always set `xpBonus` to 60 (the completion bonus).

### Requirement 9: Persistence and save_progress
**Objective:** As a learner, I want my progress saved when I finish a lesson, so that the next time I open the app the map reflects what I completed.

#### Acceptance Criteria
1. When the state machine enters `save_progress`, the Store Module shall write the current learner snapshot to `localStorage` under the key `mathquest:v1:state`.
2. The persisted snapshot shall include `schemaVersion: 1`, `savedAt` (ISO 8601 UTC), `learner {level, stars, streak, xp, activeNodeId}`, and `nodes[7] {id, state, stars, bestScore, attempts}`.
3. The Store Module shall update the active node's `state` to `completed`, set its `stars` to `max(prev, awarded)`, set `bestScore` to `max(prev, awardedScore)`, and increment `attempts` by 1.
4. The Store Module shall add the awarded stars to `learner.stars` and add 60 to `learner.xp` (the completion bonus).
5. If `wrongCount ≤ 1`, the Store Module shall increment `learner.streak` by 1; otherwise `learner.streak` shall remain unchanged.
6. If `localStorage.setItem` throws (quota or private mode), `save()` shall return `{ ok: false, error: <message> }` and the App Shell shall log a console warning, keep the in-memory state at the pre-merge value, and continue without crashing.
7. `load()` shall strictly validate the persisted snapshot: every field's type and the `nodes` array length. Any mismatch (missing field, wrong type, wrong array length, unknown `state` value) shall cause `load()` to return `DEFAULT_STATE` and log a console warning.
8. `mergeLessonResult(state, result)` shall be a pure function: it takes the current state explicitly, never calls `load()` internally, and returns `{ nextState, persisted }` where `persisted.ok === false` means the App Shell should NOT update its in-memory state.

### Requirement 10: Return to map and node 27 unlock
**Objective:** As a learner, I want the map to update after a reward, so that the next node is available to play.

#### Acceptance Criteria
1. When the learner taps the "Continue Adventure" CTA, the App Shell shall transition the state machine to `return_to_map`.
2. When the state machine enters `return_to_map`, the Store Module shall set the next node in sequence (id 27) `state` to `available` if its current state is `locked`.
3. The App Shell shall unmount the Reward Screen and remount the Adventure Map Screen with the updated counters and node states.
4. While the Adventure Map Screen is mounted and node 26 is in `completed` state, the node 26 pulse animation shall not run.
5. The Adventure Map Screen shall render node 27 with a non-pulsing, non-locked visual style.

### Requirement 11: Reduced-motion accessibility
**Objective:** As a learner with motion sensitivity, I want the app to respect my OS reduced-motion setting, so that animations do not make me uncomfortable.

#### Acceptance Criteria
1. While the page is loaded, the Reduced-Motion Detector shall query `window.matchMedia('(prefers-reduced-motion: reduce)').matches` on every screen mount and never cache the result at module scope.
2. When reduced motion is active, the node 26 pulse shall be replaced with a static 2px solid gold border on the node 26 element.
3. When reduced motion is active, the reward banner drop, star pop, and XP count-up animations shall be replaced with a 200ms opacity transition and an immediate display of the final XP value (60).
4. When reduced motion is active, the incorrect-answer shake shall be replaced with an instant state change to a red-tinted tile and a supportive retry prompt.

### Requirement 12: Performance & Reliability (NFR)
**Objective:** As a system owner, I want predictable performance and graceful failure handling, so that the slice is shippable on a wide range of devices.

#### Acceptance Criteria
1. The App Shell shall render the first interactive frame (Adventure Map) within 1 second on a mid-range mobile device on a 4G connection.
2. The Store Module shall never throw an unhandled exception during `load` or `save`; failures shall be caught and logged.
3. The App Shell shall kill all active GSAP timelines and tweens when transitioning between screens to prevent memory leaks.

## Non-Functional Requirements

### Requirement 13: Accessibility (NFR)
**Objective:** As a learner using assistive technology, I want the app to be navigable by keyboard and screen reader, so that I can play the lesson independently.

#### Acceptance Criteria
1. The node 26 element, the close button, the four answer tiles, and the Hint, Help, Read buttons shall be reachable by keyboard `Tab` in DOM order.
2. The four answer tiles shall have `role="button"` and an `aria-label` of the answer text (e.g. "Answer 436").
3. The reduced-motion preference, when active, shall be observable in the DOM (a `data-reduced-motion="true"` attribute on the root element) so that CSS can react.

### Requirement 14: Art direction conformance (NFR)
**Objective:** As a product owner, I want the slice to match the approved art direction, so that it looks and feels like a polished mobile game.

#### Acceptance Criteria
1. The Adventure Map Screen, Lesson Screen, and Reward Screen shall each render the corresponding full-screen PNG from `assets/screens/` as their background.
2. The Adventure Map Screen shall render `map_node_current_26.png`, `bottom_nav_quests_practice_shop.png` overlays.
3. The Lesson Screen shall render `fox_mascot_cheer.png` as a static overlay in the upper-right of the question card area.
4. The Reward Screen shall render `reward_stars_banner.png` and `xp_badge_60.png` as overlays at the documented positions.
5. The app shall not embed any text, watermark, or logo in the rendered output that is not present in the approved art package.
