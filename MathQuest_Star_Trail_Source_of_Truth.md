# MathQuest: Star Trail Source of Truth

## Product Summary

MathQuest: Star Trail is a polished mobile math adventure for children studying
Cambridge Primary Mathematics Stage 3-4. The app turns curriculum-aligned
practice into a colorful journey across a floating island trail with a friendly
fox guide.

## First Vertical MVP Slice

The MVP slice should feel like a complete playable loop:

1. The learner starts on the Star Trail adventure map.
2. The learner selects the active node, level 26.
3. The learner answers a Place Value question.
4. The app gives supportive feedback.
5. The learner receives a reward: bridge repaired, three stars, and +60 XP.
6. Progress returns to the map with the next node visible.

## Core Screens

### Adventure Map

The map screen shows a bright floating-island world with a glowing path through
Number Meadow, Fraction Lagoon, and Shape Castle.

Required details:

- Fox avatar at the top left.
- Level 12 badge.
- Star counter: 152.
- Streak counter: 7.
- Settings button.
- Banner: Star Trail.
- Nodes 21, 22, 23, 24, 25, 26, and locked node 27.
- Active node 26 with a strong glow.
- Bottom navigation: Quests, Practice, Shop.
- Encouraging fox message near the active path.

### Lesson / Question

The lesson screen focuses on readability and large touch targets.

Required details:

- Close button.
- Progress bar: 4 / 10.
- Hearts/lives indicator.
- Topic: Place Value.
- Objective: Understand hundreds, tens and ones.
- Read-aloud icon.
- Question: Which number is 400 + 30 + 6?
- Answers: 436, 463, 406, 346.
- Correct answer: 436.
- Fox mascot support.
- Hint, Help, and Read controls.

### Reward / Completion

The reward screen celebrates success with a highly polished fantasy-game feel.

Required details:

- Banner: Bridge Repaired!
- Three glowing stars.
- Message: Great job!
- XP badge: +60 XP.
- Happy fox mascot.
- Node 26 badge.
- Primary CTA: Continue Adventure.
- Secondary action: Back to Map.

## Business Logic

### Progression

- Nodes can be locked, available, active, completed, or mastered.
- Node 26 is active in this slice.
- Completing node 26 unlocks node 27.
- Each completed node stores stars earned, XP earned, accuracy, and completion
  time.

### Scoring

- Correct on first try: 3 stars and 10 score points.
- Correct after hint: 2 stars and 7 score points.
- Correct after one wrong answer: 2 stars and 5 score points.
- Correct after multiple wrong answers: 1 star and 3 score points.
- Completing the lesson grants +60 XP.
- Streak increases when the learner completes the lesson with at most one wrong
  answer.

### Support Actions

- Hint gives a reasoning nudge: "Think about hundreds, tens and ones."
- Help can show a worked example using place-value blocks.
- Read plays the question aloud and highlights answer choices.

## Animation Direction

Use GSAP-style timelines or equivalent UI animation:

- Map enter: clouds drift subtly, active node 26 pulses, path sparkles.
- Node tap: node scales up, bridge glow intensifies, transition to lesson.
- Correct answer: chosen answer glows green, star particles emit, progress bar
  advances.
- Incorrect answer: tile shakes, then returns to neutral with a positive retry
  prompt.
- Reward enter: banner drops in, stars pop in one by one, XP badge counts up.
- Continue Adventure: button press transitions back to the map.

Reduced-motion mode should replace large motion with opacity changes and instant
state updates.

## Art Direction

The approved asset direction is visible in:

- `assets/screens/mathquest_app_concept_sheet.png`
- `assets/screens/00_product_concept_sheet.png`
- `assets/references/01_color_palette_reference.png`
- `assets/references/02_fox_mascot_reference.png`
- `assets/references/03_ui_component_reference.png`
- `assets/references/04_map_world_reference.png`

All future screens and assets should match these references: bright fantasy
math-adventure, rounded UI, high polish, readable text, glowing reward elements,
and a cute fox mascot.

## Definition Of Done

The MVP is done when a learner can complete the full map -> question -> reward
loop using assets and UI states aligned to this package, with persistent
progress, correct scoring, accessible controls, and polished transitions.
