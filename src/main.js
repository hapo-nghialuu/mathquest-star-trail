// main.js — App Shell.
//
// State of truth: a single `appState` object (Red Team 2026-06-15).
// Lesson session is closed over inside src/screens/lesson.js and travels in
// the `CORRECT` dispatch payload — there is no global `lessonSession` here.

import './styles/tokens.css';
import './styles/main.css';
import './styles/motion.css';

import { load as loadState, mergeLessonResult } from './state/store.js';
import { computeReward } from './state/scoring.js';
import { STATES, EVENTS, transition as machineTransition } from './state/machine.js';
import { setRootDataAttribute } from './motion/reduced.js';
import { render as renderMap } from './screens/map.js';
import { render as renderLesson } from './screens/lesson.js';
import { render as renderReward } from './screens/reward.js';

const root = document.getElementById('app');
const appState = {
  currentUnmount: null,
  currentState: null,
  currentStateName: STATES.BOOT,
  lastReward: null,
};

export function mountScreen(name, payload) {
  // Re-evaluate reduced-motion on every mount so the attribute stays current
  // and motion factories read the latest preference.
  setRootDataAttribute(root);
  if (typeof appState.currentUnmount === 'function') {
    appState.currentUnmount();
    appState.currentUnmount = null;
  }
  if (name === 'adventure_map') {
    const { unmount } = renderMap(root, appState.currentState, dispatch);
    appState.currentUnmount = unmount;
  } else if (name === 'lesson_question') {
    const { unmount } = renderLesson(root, appState.currentState, dispatch);
    appState.currentUnmount = unmount;
  } else if (name === 'reward_completion') {
    const { unmount } = renderReward(root, appState.currentState, dispatch, payload);
    appState.currentUnmount = unmount;
  } else {
    console.warn('[main] unknown screen:', name);
    return;
  }
  appState.currentStateName = name;
}

export function dispatch(event, payload) {
  // Validate the transition (throws on invalid). This protects screens from
  // dispatching in the wrong order (e.g. CONTINUE without a CORRECT first).
  let nextStateName;
  try {
    nextStateName = machineTransition(appState.currentStateName, event);
  } catch (err) {
    console.warn('[main] invalid transition:', err.message);
    return;
  }

  if (event === EVENTS.CORRECT) {
    const session = (payload && payload.session) || { usedHint: false, wrongCount: 0 };
    const reward = computeReward({ usedHint: session.usedHint, wrongCount: session.wrongCount });
    appState.lastReward = {
      ...reward,
      wrongCount: session.wrongCount,
      usedHint: session.usedHint,
    };
    mountScreen('reward_completion', appState.lastReward);
  } else if (event === EVENTS.CONTINUE) {
    const result = mergeLessonResult(appState.currentState, appState.lastReward || {});
    if (result.persisted.ok) {
      appState.currentState = result.nextState;
    } else {
      console.warn('[main] save failed:', result.persisted.error);
    }
    // Transition through SAVE_PROGRESS then dispatch DONE so the state
    // machine table actually executes (code review 2026-06-15 finding 5).
    appState.currentStateName = STATES.SAVE_PROGRESS;
    dispatch(EVENTS.DONE);
  } else if (event === EVENTS.BACK_TO_MAP) {
    // State was already saved on CONTINUE. Just remount the map.
    appState.currentStateName = STATES.RETURN_TO_MAP;
    mountScreen('return_to_map');
  } else if (event === EVENTS.CLOSE) {
    // Lesson closed without answering — no save, no reward.
    appState.currentStateName = STATES.RETURN_TO_MAP;
    mountScreen('return_to_map');
  } else if (event === EVENTS.NODE_26_SELECTED) {
    appState.currentStateName = STATES.LESSON_QUESTION;
    mountScreen('lesson_question');
  } else if (event === EVENTS.INCORRECT) {
    // Lesson screen handles its own visual feedback; stay mounted.
    appState.currentStateName = STATES.LESSON_QUESTION;
  } else if (event === EVENTS.DONE) {
    // save_progress -> return_to_map -> adventure_map
    appState.currentStateName = STATES.RETURN_TO_MAP;
    mountScreen('return_to_map');
  } else if (event === EVENTS.INIT) {
    appState.currentStateName = STATES.ADVENTURE_MAP;
    mountScreen('adventure_map');
  }
}

function boot() {
  setRootDataAttribute(root);
  appState.currentState = loadState();
  appState.currentStateName = STATES.BOOT;
  dispatch(EVENTS.INIT);
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
