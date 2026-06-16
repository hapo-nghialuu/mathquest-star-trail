// State machine + scoring logic for MathQuest: Star Trail.
// Mirrors json/mathquest_mvp_implementation_config.json state machine and
// scoring_rules.
//
// State machine:
//   boot -> adventure_map -> node_26_selected -> lesson_question
//         -> answer_selected -> feedback -> reward_completion
//         -> save_progress -> return_to_map

import { mvpConfig, scoringRules, initialLearnerState } from '../data/config.js';

const STORAGE_KEY = 'mathquest_state_v1';

// Build the initial nodes array from the MVP config (nodes 21-27).
function buildInitialNodes() {
  return mvpConfig.map.nodes.map((n) => ({ ...n }));
}

export function buildInitialState() {
  return {
    screen: 'adventure_map',
    // Map nodes
    nodes: buildInitialNodes(),
    // HUD counters (level / stars / streak / xp)
    hud: {
      level: initialLearnerState.level,
      stars: initialLearnerState.stars,
      streak: initialLearnerState.streak,
      xp: initialLearnerState.xp,
    },
    // Lesson state
    lesson: {
      id: 'place_value_400_30_6',
      progress: mvpConfig.lesson.progress.current,
      total: mvpConfig.lesson.progress.total,
      heartsFilled: mvpConfig.lesson.hearts.filled,
      heartsEmpty: mvpConfig.lesson.hearts.empty,
      // Live counters during the question
      attempts: 0, // number of wrong attempts so far
      usedHint: false,
      selectedAnswerId: null,
      // UX flags
      shaking: null, // 'a' | 'b' | 'c' | 'd' | null
      feedback: null, // 'correct' | 'incorrect' | null
    },
    // Reward state (populated when transitioning to reward_completion)
    reward: {
      earnedStars: 0,
      earnedXp: scoringRules.completion_xp,
    },
  };
}

// Scoring: figure out how many stars / score the user earned.
export function calculateRewardStars(attempts, usedHint) {
  if (usedHint) return scoringRules.after_hint.stars;
  if (attempts === 0) return scoringRules.first_try.stars;
  if (attempts === 1) return scoringRules.after_one_incorrect.stars;
  return scoringRules.after_multiple_incorrect.stars;
}

export function reducer(state, action) {
  switch (action.type) {
    case 'SELECT_NODE': {
      const node = state.nodes.find((n) => n.id === action.nodeId);
      if (!node || node.state === 'locked' || node.state === 'completed') {
        return state;
      }
      return { ...state, screen: 'lesson_question' };
    }

    case 'OPEN_HINT': {
      return {
        ...state,
        lesson: { ...state.lesson, usedHint: true },
      };
    }

    case 'SELECT_ANSWER': {
      const choice = action.choice; // { id, label, correct }
      const isCorrect = choice.correct === true;

      if (isCorrect) {
        const earnedStars = calculateRewardStars(
          state.lesson.attempts,
          state.lesson.usedHint
        );
        return {
          ...state,
          lesson: {
            ...state.lesson,
            selectedAnswerId: choice.id,
            feedback: 'correct',
            shaking: null,
          },
          reward: {
            ...state.reward,
            earnedStars,
          },
        };
      }

      // Wrong answer
      return {
        ...state,
        lesson: {
          ...state.lesson,
          selectedAnswerId: choice.id,
          attempts: state.lesson.attempts + 1,
          feedback: 'incorrect',
          shaking: choice.id,
        },
      };
    }

    case 'CLEAR_FEEDBACK': {
      return {
        ...state,
        lesson: { ...state.lesson, feedback: null, shaking: null },
      };
    }

    case 'GO_TO_REWARD': {
      return { ...state, screen: 'reward_completion' };
    }

    case 'CONTINUE_TO_MAP': {
      // Update node 26 to completed, unlock node 27, grant reward.
      const updatedNodes = state.nodes.map((n) => {
        if (n.id === 26) {
          return { ...n, state: 'completed', stars: state.reward.earnedStars };
        }
        if (n.id === 27) {
          return { ...n, state: 'active' };
        }
        return n;
      });
      return {
        ...state,
        screen: 'adventure_map',
        nodes: updatedNodes,
        hud: {
          ...state.hud,
          stars: state.hud.stars + state.reward.earnedStars,
          xp: state.hud.xp + state.reward.earnedXp,
          streak: state.hud.streak + 1,
        },
        // Reset lesson state for the next run.
        lesson: {
          ...state.lesson,
          attempts: 0,
          usedHint: false,
          selectedAnswerId: null,
          feedback: null,
          shaking: null,
        },
      };
    }

    case 'RESET': {
      return buildInitialState();
    }

    default:
      return state;
  }
}

export { STORAGE_KEY };
