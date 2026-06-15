// scoring.js — pure function mapping attempt path to reward.
// Truth table (Requirement 8 AC 2):
//
//   wrongCount | usedHint | score | stars | xpBonus
//   -----------+----------+-------+-------+--------
//        0     |  false   |  10   |   3   |  60
//        0     |  true    |   7   |   2   |  60
//        1     |  false   |   5   |   2   |  60
//        1     |  true    |   5   |   2   |  60
//       >=2    |  false   |   3   |   1   |  60
//       >=2    |  true    |   3   |   1   |  60

import { SCORING_TIERS, COMPLETION_XP_BONUS } from './config.js';

export function computeReward({ usedHint, wrongCount } = {}) {
  const hint = Boolean(usedHint);
  const wrong = Math.max(0, Number(wrongCount) || 0);
  const tier = SCORING_TIERS.find((t) => wrong <= t.max);
  let { score, stars } = tier;
  // usedHint only downgrades the top tier (first-try correct).
  if (hint && wrong === 0) {
    score = 7;
    stars = 2;
  }
  return { score, stars, xpBonus: COMPLETION_XP_BONUS };
}
