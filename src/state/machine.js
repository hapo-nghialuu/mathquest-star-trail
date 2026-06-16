// machine.js — 6-state runtime machine (Red Team 2026-06-15 simplification).
// The original 9-state enumeration in mathquest_mvp_implementation_config.json
// listed node_26_selected, answer_selected, and feedback as intermediates;
// those are recorded below as event names (informational) — the runtime
// transitions immediately to the next active state.

export const STATES = Object.freeze({
  BOOT: 'boot',
  ADVENTURE_MAP: 'adventure_map',
  LESSON_QUESTION: 'lesson_question',
  REWARD_COMPLETION: 'reward_completion',
  SAVE_PROGRESS: 'save_progress',
  RETURN_TO_MAP: 'return_to_map',
});

export const EVENTS = Object.freeze({
  NODE_26_SELECTED: 'NODE_26_SELECTED',
  CORRECT: 'CORRECT',
  INCORRECT: 'INCORRECT',
  CLOSE: 'CLOSE',
  CONTINUE: 'CONTINUE',
  BACK_TO_MAP: 'BACK_TO_MAP',
  DONE: 'DONE',
  INIT: 'INIT',
});

export const TRANSITIONS = Object.freeze({
  [STATES.BOOT]: {
    [EVENTS.INIT]: STATES.ADVENTURE_MAP,
  },
  [STATES.ADVENTURE_MAP]: {
    [EVENTS.NODE_26_SELECTED]: STATES.LESSON_QUESTION,
    [EVENTS.CLOSE]: STATES.RETURN_TO_MAP,
  },
  [STATES.LESSON_QUESTION]: {
    [EVENTS.CORRECT]: STATES.REWARD_COMPLETION,
    [EVENTS.INCORRECT]: STATES.LESSON_QUESTION,
    [EVENTS.CLOSE]: STATES.RETURN_TO_MAP,
  },
  [STATES.REWARD_COMPLETION]: {
    [EVENTS.CONTINUE]: STATES.SAVE_PROGRESS,
    [EVENTS.BACK_TO_MAP]: STATES.RETURN_TO_MAP,
  },
  [STATES.SAVE_PROGRESS]: {
    [EVENTS.DONE]: STATES.RETURN_TO_MAP,
  },
  [STATES.RETURN_TO_MAP]: {
    [EVENTS.DONE]: STATES.ADVENTURE_MAP,
  },
});

export function transition(currentState, event) {
  const row = TRANSITIONS[currentState];
  if (!row) throw new Error(`Unknown state: ${currentState}`);
  const next = row[event];
  if (!next) throw new Error(`Invalid transition: ${currentState} -> ${event}`);
  return next;
}

export function dispatch(currentState, event, payload, hooks) {
  const next = transition(currentState, event);
  if (hooks && typeof hooks.onTransition === 'function') {
    hooks.onTransition(currentState, next, event, payload);
  }
  return { prevState: currentState, nextState: next, event, payload };
}
