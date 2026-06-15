// shake.js — answer-tile feedback timeline factory.
// Red Team 2026-06-15: onComplete callback wires the busy flag reset on both
// the full-motion branch (GSAP onComplete) and the reduced-motion branch
// (setTimeout(200)).

import { gsap } from 'gsap';
import { isReducedMotion } from './reduced.js';

export function createShakeTimeline(tileEl, { isCorrect, onComplete } = {}) {
  const reduced = isReducedMotion();
  if (reduced) {
    if (isCorrect) {
      tileEl.style.boxShadow = '0 0 0 4px var(--c-success)';
      tileEl.style.opacity = '1';
    } else {
      tileEl.style.boxShadow = '0 0 0 4px var(--c-red)';
      tileEl.style.opacity = '1';
    }
    setTimeout(() => {
      tileEl.style.boxShadow = '';
      tileEl.style.opacity = '';
      if (typeof onComplete === 'function') onComplete();
    }, 200);
    return {
      play() {},
      kill() {
        tileEl.style.boxShadow = '';
        tileEl.style.opacity = '';
      },
      isReduced: true,
      isCorrect,
    };
  }
  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
    onComplete: () => {
      if (typeof onComplete === 'function') onComplete();
    },
  });
  if (isCorrect) {
    tl.to(tileEl, { boxShadow: '0 0 24px 8px var(--c-success)', duration: 0.3 })
      .to(tileEl, { boxShadow: '0 0 0 0 rgba(0,0,0,0)', duration: 0.3 });
  } else {
    tl.to(tileEl, { x: -8, duration: 0.07 })
      .to(tileEl, { x: 8, duration: 0.07 })
      .to(tileEl, { x: -6, duration: 0.07 })
      .to(tileEl, { x: 6, duration: 0.07 })
      .to(tileEl, { x: 0, duration: 0.07 });
  }
  return {
    play: () => tl.play(0),
    kill: () => {
      tl.kill();
      gsap.killTweensOf(tileEl);
      tileEl.style.boxShadow = '';
      tileEl.style.transform = '';
    },
    isReduced: false,
    isCorrect,
  };
}
