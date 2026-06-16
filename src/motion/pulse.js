// pulse.js — node 26 pulse timeline factory.
// Red Team 2026-06-15: kill() re-applies the green ring for completed nodes
// (so the visual cue survives the timeline teardown).
// Code review 2026-06-15: if the GSAP import fails (CDN offline, CSP block),
// the early `isReducedMotion` branch already returns a no-op shim, so the
// game degrades to static visuals instead of crashing.

import { gsap } from 'gsap';
import { isReducedMotion } from './reduced.js';

export function createPulseTimeline(nodeEl, { isCompleted = false } = {}) {
  const reduced = isReducedMotion();
  if (reduced) {
    nodeEl.style.border = '2px solid var(--c-gold)';
    nodeEl.style.boxShadow = 'none';
    nodeEl.classList.add('pulse-node');
    return {
      play() {},
      kill() {
        nodeEl.classList.remove('pulse-node');
        nodeEl.style.border = '';
        nodeEl.style.boxShadow = '';
      },
      isReduced: true,
    };
  }
  const tl = gsap.timeline({
    repeat: -1,
    yoyo: true,
    defaults: { ease: 'sine.inOut', duration: 0.8 },
  });
  tl.to(nodeEl, { scale: 1.08, boxShadow: '0 0 0 8px rgba(255,216,74,0.45)' }, 0);
  tl.to(nodeEl, { scale: 1.0, boxShadow: '0 0 0 0 rgba(255,216,74,0)' }, 0.8);
  return {
    play: () => tl.play(0),
    kill: () => {
      tl.kill();
      gsap.killTweensOf(nodeEl);
      if (isCompleted) {
        nodeEl.style.transform = '';
        nodeEl.style.boxShadow = '0 0 0 4px var(--c-success)';
      } else {
        nodeEl.style.transform = '';
        nodeEl.style.boxShadow = '';
      }
    },
    isReduced: false,
  };
}
