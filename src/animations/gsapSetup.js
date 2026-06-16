// Centralised GSAP setup. Provides:
//   - getReducedMotion()  : checks prefers-reduced-motion
//   - pulseNode(el)       : infinite pulse for the active map node
//   - glowNode(el)        : one-shot scale + glow on node select
//   - correctAnswer(el)   : green glow + scale punch
//   - shakeAnswer(el)     : horizontal shake on wrong answer
//   - bannerDropIn(el)    : top-down entrance for the reward banner
//   - starPopIn(els)      : staggered pop-in for the reward stars
//   - xpCountUp(el, to)   : count up the +60 XP target value

import { gsap } from 'gsap';

export function getReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ---------- Map ----------

export function pulseNode(el) {
  if (!el) return () => {};
  if (getReducedMotion()) {
    gsap.set(el, { scale: 1.06, transformOrigin: '50% 50%' });
    return () => gsap.set(el, { clearProps: 'transform' });
  }
  const tween = gsap.to(el, {
    scale: 1.06,
    duration: 0.9,
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut',
    transformOrigin: '50% 50%',
  });
  return () => tween.kill();
}

export function glowNode(el) {
  if (!el) return Promise.resolve();
  if (getReducedMotion()) {
    gsap.set(el, { scale: 1.12 });
    return Promise.resolve();
  }
  return gsap.to(el, {
    scale: 1.18,
    duration: 0.35,
    ease: 'back.out(2)',
    transformOrigin: '50% 50%',
  });
}

// ---------- Lesson ----------

export function correctAnswer(el) {
  if (!el) return Promise.resolve();
  if (getReducedMotion()) {
    gsap.set(el, { scale: 1.04 });
    return Promise.resolve();
  }
  return gsap
    .timeline()
    .to(el, { scale: 1.08, duration: 0.18, ease: 'power2.out' })
    .to(el, { scale: 1.0, duration: 0.25, ease: 'elastic.out(1, 0.4)' });
}

export function shakeAnswer(el) {
  if (!el) return Promise.resolve();
  if (getReducedMotion()) return Promise.resolve();
  return gsap.fromTo(
    el,
    { x: -10 },
    { x: 10, duration: 0.06, repeat: 5, yoyo: true, ease: 'power1.inOut' }
  );
}

// ---------- Reward ----------

export function bannerDropIn(el) {
  if (!el) return Promise.resolve();
  if (getReducedMotion()) {
    gsap.set(el, { y: 0, opacity: 1 });
    return Promise.resolve();
  }
  return gsap.fromTo(
    el,
    { y: -160, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.4)' }
  );
}

export function starPopIn(els) {
  const list = (Array.isArray(els) ? els : [els]).filter(Boolean);
  if (list.length === 0) return Promise.resolve();
  if (getReducedMotion()) {
    list.forEach((el) => gsap.set(el, { scale: 1, opacity: 1, rotate: 0 }));
    return Promise.resolve();
  }
  return gsap.fromTo(
    list,
    { scale: 0, opacity: 0, rotate: -25 },
    {
      scale: 1,
      opacity: 1,
      rotate: 0,
      duration: 0.5,
      stagger: 0.18,
      ease: 'back.out(2)',
    }
  );
}

export function xpCountUp(el, to = 60, duration = 1.1) {
  if (!el) return Promise.resolve();
  const counter = { n: 0 };
  if (getReducedMotion()) {
    el.textContent = `+${to} XP`;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    gsap.to(counter, {
      n: to,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = `+${Math.round(counter.n)} XP`;
      },
      onComplete: () => {
        el.textContent = `+${to} XP`;
        resolve();
      },
    });
  });
}
