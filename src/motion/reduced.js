// reduced.js — prefers-reduced-motion detector. Re-queries matchMedia on every
// call so toggles mid-session are picked up. Also exposes a helper that syncs
// the boolean to a data attribute on the root element.

export function isReducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export function setRootDataAttribute(rootEl) {
  if (!rootEl) return;
  rootEl.setAttribute('data-reduced-motion', String(isReducedMotion()));
}
