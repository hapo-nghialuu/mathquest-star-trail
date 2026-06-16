// localStorage persistence for MathQuest state. Only the HUD counters and
// node state are persisted; transient UI flags (feedback, shaking) reset
// to defaults on load.

import { STORAGE_KEY, buildInitialState } from './reducer.js';

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    // Hydrate against the latest initial state so the schema is always current.
    const fresh = buildInitialState();
    return {
      ...fresh,
      ...parsed,
      hud: { ...fresh.hud, ...(parsed.hud || {}) },
      nodes: Array.isArray(parsed.nodes) && parsed.nodes.length === fresh.nodes.length
        ? parsed.nodes
        : fresh.nodes,
      // Lesson transient fields always start clean.
      lesson: { ...fresh.lesson },
      reward: { ...fresh.reward, ...(parsed.reward || {}) },
    };
  } catch (err) {
    console.warn('[mathquest] failed to load state:', err);
    return null;
  }
}

export function saveState(state) {
  try {
    const persisted = {
      screen: state.screen,
      hud: state.hud,
      nodes: state.nodes,
      reward: state.reward,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  } catch (err) {
    console.warn('[mathquest] failed to save state:', err);
  }
}

export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('[mathquest] failed to clear state:', err);
  }
}
