// config.js — inlined copy of the JSON guidance + scoring constants.
// Single source of truth for any data the app needs at runtime.

export const LESSON = {
  id: 'place_value_400_30_6',
  topic: 'Place Value',
  objective: 'Understand hundreds, tens and ones',
  progress: { current: 4, total: 10, label: '4 / 10' },
  hearts: { filled: 2, empty: 1 },
  question: 'Which number is 400 + 30 + 6?',
  choices: [
    { id: 'a', label: '436', correct: true },
    { id: 'b', label: '463', correct: false },
    { id: 'c', label: '406', correct: false },
    { id: 'd', label: '346', correct: false },
  ],
  hint: 'Think about the hundreds, tens and ones.',
  explanation: '400 plus 30 plus 6 equals 436.',
  supportControls: ['Hint', 'Help', 'Read'],
};

export const NODE_POSITIONS = {
  21: { x: 18, y: 58 },
  22: { x: 30, y: 53 },
  23: { x: 42, y: 58 },
  24: { x: 54, y: 51 },
  25: { x: 64, y: 56 },
  26: { x: 50, y: 44 },
  27: { x: 36, y: 38 },
};

export const DEFAULT_STATE = {
  schemaVersion: 1,
  savedAt: null,
  learner: { level: 12, stars: 152, streak: 7, xp: 1840, activeNodeId: 26 },
  nodes: [
    { id: 21, state: 'completed', stars: 3, bestScore: 10, attempts: 1 },
    { id: 22, state: 'completed', stars: 3, bestScore: 10, attempts: 1 },
    { id: 23, state: 'completed', stars: 3, bestScore: 10, attempts: 1 },
    { id: 24, state: 'completed', stars: 3, bestScore: 10, attempts: 1 },
    { id: 25, state: 'completed', stars: 3, bestScore: 10, attempts: 1 },
    { id: 26, state: 'active', stars: 0, bestScore: 0, attempts: 0 },
    { id: 27, state: 'locked', stars: 0, bestScore: 0, attempts: 0 },
  ],
  currentWorld: 'Star Trail',
};

// Scoring lookup table — Requirement 8 AC 2 truth table.
// Tier is selected by `wrongCount`; `usedHint` only downgrades the top tier.
export const SCORING_TIERS = [
  { max: 0, score: 10, stars: 3 },
  { max: 1, score: 5, stars: 2 },
  { max: Infinity, score: 3, stars: 1 },
];

export const COMPLETION_XP_BONUS = 60;
