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
  const value = String(isReducedMotion());
  if (rootEl) rootEl.setAttribute('data-reduced-motion', value);
  // Mirror to <html> so global CSS / portals / body-level styles can react.
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.setAttribute('data-reduced-motion', value);
  }
}
