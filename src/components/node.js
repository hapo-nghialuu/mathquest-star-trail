// node.js — map node DOM. Owns its own visual state and lifecycle.
// Red Team 2026-06-15: the Node component renders the green ring inline for
// completed nodes (no separate pulse timeline needed for non-active nodes).

import { h } from '../util/dom.js';

const STARS = ['', '⭐', '⭐⭐', '⭐⭐⭐'];

export function Node({ id, x, y, state, stars, onTap }) {
  const disabled = state === 'locked';
  const ariaLabel = `Node ${id}, ${state}`;
  const labelText = state === 'completed' ? `✓ ${id}` : String(id);
  const className = `map-node map-node--${state}`;
  const style = { left: `${x}%`, top: `${y}%` };
  if (state === 'completed') {
    style.boxShadow = '0 0 0 4px var(--c-success)';
  }
  const handleTap = (e) => {
    e.preventDefault();
    if (typeof onTap === 'function') onTap(id);
  };
  return h('button', {
    className,
    style,
    ariaLabel,
    onClick: handleTap,
    onKeydown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') handleTap(e);
    },
  }, [
    h('span', { text: labelText }),
    state === 'completed' ? h('span', { 'aria-hidden': 'true', text: ` ${STARS[stars] || ''}` }) : null,
  ]);
}
