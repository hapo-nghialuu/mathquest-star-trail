// App.jsx — top-level screen router. Holds the reducer state, persists
// HUD + nodes to localStorage, and renders the right screen for the
// current state.screen value.

import React from 'react';
import { reducer, buildInitialState } from './state/reducer.js';
import { loadState, saveState, clearState } from './state/storage.js';
import PhoneFrame from './components/PhoneFrame.jsx';
import AdventureMap from './screens/AdventureMap.jsx';
import LessonQuestion from './screens/LessonQuestion.jsx';
import RewardCompletion from './screens/RewardCompletion.jsx';

export default function App() {
  const [state, dispatch] = React.useReducer(
    reducer,
    null,
    () => {
      const loaded = loadState() || buildInitialState();
      // Debug-only: ?screen=lesson|reward|map forces a screen for screenshots.
      const urlScreen = new URLSearchParams(window.location.search).get('screen');
      if (urlScreen === 'lesson' || urlScreen === 'reward' || urlScreen === 'map') {
        return { ...loaded, screen: urlScreen === 'map' ? 'adventure_map' : urlScreen };
      }
      return loaded;
    }
  );

  // Persist HUD + node state on every change.
  React.useEffect(() => {
    saveState(state);
  }, [state.hud, state.nodes, state.screen, state.reward]);

  // Bottom nav handler — for the MVP slice only "quests" is wired to the
  // adventure map screen; the others reset progress.
  const handleNav = (id) => {
    if (id === 'quests') {
      dispatch({ type: 'CONTINUE_TO_MAP' });
    } else {
      // Friendly placeholder: practice / shop are not in this MVP slice.
      // We deliberately do not clear progress; just no-op.
    }
  };

  let screen = null;
  if (state.screen === 'lesson_question') {
    screen = <LessonQuestion state={state} dispatch={dispatch} />;
  } else if (state.screen === 'reward_completion') {
    screen = <RewardCompletion state={state} dispatch={dispatch} onNavigate={handleNav} />;
  } else {
    screen = <AdventureMap state={state} dispatch={dispatch} onNavigate={handleNav} />;
  }

  return <PhoneFrame>{screen}</PhoneFrame>;
}

// Expose a tiny debug hook: in dev, `window.__mathquest.reset()` clears storage.
if (typeof window !== 'undefined') {
  window.__mathquest = window.__mathquest || {};
  window.__mathquest.reset = () => {
    clearState();
    window.location.reload();
  };
}
