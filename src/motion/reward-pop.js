// reward-pop.js — banner + stars + XP count-up timeline factory.
// Red Team 2026-06-15: kill() snaps xpEl.textContent to the target value so
// the displayed XP is correct even if the user navigates away mid-animation.

import { gsap } from 'gsap';
import { isReducedMotion } from './reduced.js';

export function createRewardTimeline({ bannerEl, starEls, xpEl, targetXp }) {
  const reduced = isReducedMotion();
  if (reduced) {
    bannerEl.style.opacity = '1';
    bannerEl.style.transform = 'none';
    starEls.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'scale(1)';
    });
    xpEl.textContent = String(targetXp);
    return {
      play() {},
      kill() {
        xpEl.textContent = String(targetXp);
      },
      isReduced: true,
    };
  }
  const tl = gsap.timeline({ defaults: { ease: 'back.out(1.7)' } });
  tl.fromTo(bannerEl, { y: -120, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0);
  starEls.forEach((el, i) => {
    tl.fromTo(el, { scale: 0 }, { scale: 1, duration: 0.4 }, 0.5 + i * 0.2);
  });
  const xpObj = { v: 0 };
  tl.to(
    xpObj,
    {
      v: targetXp,
      duration: 1,
      ease: 'power1.out',
      onUpdate: () => {
        xpEl.textContent = String(Math.round(xpObj.v));
      },
    },
    0.6
  );
  return {
    play: () => tl.play(0),
    kill: () => {
      tl.kill();
      gsap.killTweensOf([bannerEl, ...starEls, xpObj]);
      bannerEl.style.transform = '';
      starEls.forEach((el) => {
        el.style.transform = '';
        el.style.opacity = '';
      });
      xpEl.textContent = String(targetXp);
    },
    isReduced: false,
  };
}
