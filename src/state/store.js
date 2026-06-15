// store.js — localStorage v1 persistence with strict shape validation
// and a pure mergeLessonResult.

import { DEFAULT_STATE } from './config.js';

export const STORAGE_KEY = 'mathquest:v1:state';

const NODE_STATES = new Set(['locked', 'available', 'active', 'completed']);

function isFiniteInt(n) {
  return Number.isInteger(n) && Number.isFinite(n);
}

function isValidLearner(learner) {
  if (!learner || typeof learner !== 'object') return false;
  const { level, stars, streak, xp, activeNodeId } = learner;
  return (
    isFiniteInt(level) &&
    level > 0 &&
    isFiniteInt(stars) && stars >= 0 &&
    isFiniteInt(streak) && streak >= 0 &&
    isFiniteInt(xp) && xp >= 0 &&
    isFiniteInt(activeNodeId)
  );
}

function isValidNode(node) {
  if (!node || typeof node !== 'object') return false;
  if (!isFiniteInt(node.id) || node.id < 21 || node.id > 27) return false;
  if (!NODE_STATES.has(node.state)) return false;
  if (!isFiniteInt(node.stars) || node.stars < 0) return false;
  if (!isFiniteInt(node.bestScore) || node.bestScore < 0) return false;
  if (!isFiniteInt(node.attempts) || node.attempts < 0) return false;
  return true;
}

function isValidState(parsed) {
  if (!parsed || typeof parsed !== 'object') return false;
  if (parsed.schemaVersion !== 1) return false;
  if (!isValidLearner(parsed.learner)) return false;
  if (!Array.isArray(parsed.nodes) || parsed.nodes.length !== 7) return false;
  if (!parsed.nodes.every(isValidNode)) return false;
  if (typeof parsed.currentWorld !== 'string') return false;
  return true;
}

export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefault();
    const parsed = JSON.parse(raw);
    if (!isValidState(parsed)) {
      console.warn('[store] persisted state failed validation; using DEFAULT_STATE');
      return cloneDefault();
    }
    return parsed;
  } catch (err) {
    console.warn('[store] load failed:', err);
    return cloneDefault();
  }
}

export function save(state) {
  try {
    const stamped = { ...state, schemaVersion: 1, savedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stamped));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err && err.message ? err.message : String(err) };
  }
}

export function mergeLessonResult(state, { score, stars, xpBonus, wrongCount } = {}) {
  // Pure: never reads localStorage. Caller passes the current state explicitly.
  // Clamp inputs to finite non-negative integers to prevent Infinity/NaN/negative
  // values from corrupting the persisted snapshot (code review 2026-06-15 finding 6).
  const safeScore = clampInt(score, 0, 1000);
  const safeStars = clampInt(stars, 0, 3);
  const safeXpBonus = clampInt(xpBonus, 0, 10000);
  const safeWrong = clampInt(wrongCount, 0, 100);

  // Deep clone the nodes array so we never mutate the input.
  const nodes = state.nodes.map((n) => ({ ...n }));

  // Update the active node.
  const activeIdx = nodes.findIndex((n) => n.id === state.learner.activeNodeId);
  if (activeIdx < 0) {
    return { nextState: state, persisted: { ok: false, error: 'no active node' } };
  }
  const active = nodes[activeIdx];
  const prevBest = Math.max(active.bestScore || 0, safeScore);
  const prevStars = Math.max(active.stars || 0, safeStars);
  nodes[activeIdx] = {
    ...active,
    state: 'completed',
    stars: prevStars,
    bestScore: prevBest,
    attempts: (active.attempts || 0) + 1,
  };

  // Unlock the next locked node (if any) and move activeNodeId to it.
  const sortedById = [...nodes].sort((a, b) => a.id - b.id);
  const activePos = sortedById.findIndex((n) => n.id === active.id);
  let nextActiveId = active.id;
  for (let i = activePos + 1; i < sortedById.length; i += 1) {
    if (sortedById[i].state === 'locked') {
      const unlockId = sortedById[i].id;
      const unlockIdx = nodes.findIndex((n) => n.id === unlockId);
      nodes[unlockIdx] = { ...nodes[unlockIdx], state: 'available' };
      nextActiveId = unlockId;
      break;
    }
  }
  // If no locked node was found, the active remains the same; that's fine for the last node.

  const learner = {
    ...state.learner,
    stars: (state.learner.stars || 0) + safeStars,
    xp: (state.learner.xp || 0) + safeXpBonus,
    streak: (state.learner.streak || 0) + (safeWrong <= 1 ? 1 : 0),
    activeNodeId: nextActiveId,
  };

  const nextState = { ...state, nodes, learner };
  const persisted = save(nextState);
  return { nextState, persisted };
}

function cloneDefault() {
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function clampInt(value, min, max) {
  const n = Number(value);
  // Number.isFinite rejects Infinity/-Infinity/NaN. For non-finite values
  // we treat the input as a non-event and fall back to the minimum (safe
  // default — refuse to add or change anything on garbage input).
  if (!Number.isFinite(n)) return min;
  const i = Math.trunc(n);
  if (i < min) return min;
  if (i > max) return max;
  return i;
}
