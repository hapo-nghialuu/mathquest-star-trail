// screens/reward.js — Reward / Completion screen.
// Consumes the reward payload computed by the App Shell (Red Team 2026-06-15).

import rewardBg from '../../assets/screens/03_reward_completion_screen.png';
import rewardBanner from '../../assets/screen_crops/reward_stars_banner.png';
import xpBadge from '../../assets/screen_crops/xp_badge_60.png';
import { h } from '../util/dom.js';
import { createRewardTimeline } from '../motion/reward-pop.js';
import { EVENTS } from '../state/machine.js';

const DEFAULT_REWARD = { score: 10, stars: 3, xpBonus: 60, wrongCount: 0, usedHint: false };

export function render(rootEl, state, dispatch, payload) {
  const reward = (payload && typeof payload === 'object') ? payload : DEFAULT_REWARD;
  if (!payload) {
    console.warn('[reward] missing payload; using DEFAULT_REWARD');
  }
  const targetScore = Number(reward.score) || 0;
  const awardedStars = Math.max(0, Math.min(3, Number(reward.stars) || 0));

  const bg = h('img', { className: 'bg', src: rewardBg, alt: 'Reward background with bridge restored' });

  const banner = h('img', {
    src: rewardBanner,
    alt: 'Bridge Repaired banner',
    className: 'reward-banner',
  });

  const starsRow = h('div', { className: 'reward-stars', 'aria-label': `${awardedStars} out of 3 stars awarded` });
  for (let i = 0; i < 3; i += 1) {
    const dim = i >= awardedStars;
    const star = h('span', { className: dim ? 'star--dim' : '', text: '★' });
    starsRow.appendChild(star);
  }

  const xpImg = h('img', {
    src: xpBadge,
    alt: 'XP badge',
    className: 'reward-xp',
  });
  const xpText = h('div', {
    className: 'reward-xp-text',
    'aria-label': `Score ${targetScore}`,
    text: '0',
  });

  const message = h('h2', { className: 'reward-message', text: 'Great job!' });
  const nodeBadge = h('div', { className: 'reward-node-badge', text: 'Node 26' });

  const continueBtn = h('button', {
    className: 'btn btn-glossy',
    ariaLabel: 'Continue Adventure',
    text: 'Continue Adventure',
    onClick: () => dispatch(EVENTS.CONTINUE),
  });
  const backBtn = h('button', {
    className: 'btn-link',
    ariaLabel: 'Back to Map',
    text: 'Back to Map',
    onClick: () => dispatch(EVENTS.BACK_TO_MAP),
  });

  const cta = h('div', { className: 'reward-cta' }, [
    continueBtn,
    backBtn,
  ]);

  const frame = h('div', { className: 'reward-frame', role: 'region', ariaLabel: 'Reward' }, [
    banner,
    starsRow,
    xpImg,
    xpText,
    message,
    nodeBadge,
    cta,
  ]);

  let timeline = null;
  // Defer the timeline so the DOM has measured sizes.
  requestAnimationFrame(() => {
    timeline = createRewardTimeline({
      bannerEl: banner,
      starEls: Array.from(starsRow.querySelectorAll('span')),
      xpEl: xpText,
      targetXp: targetScore,
    });
    timeline.play();
  });

  rootEl.appendChild(bg);
  rootEl.appendChild(frame);

  return {
    unmount() {
      if (timeline) timeline.kill();
      bg.remove();
      frame.remove();
    },
  };
}
