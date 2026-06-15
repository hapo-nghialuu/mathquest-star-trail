// hearts.js — hearts row (filled + empty).

import { h } from '../util/dom.js';

export function Hearts({ filled, empty }) {
  const items = [];
  for (let i = 0; i < filled; i += 1) {
    items.push(h('span', { className: 'heart heart--filled', 'aria-hidden': 'true', text: '♥' }));
  }
  for (let i = 0; i < empty; i += 1) {
    items.push(h('span', { className: 'heart heart--empty', 'aria-hidden': 'true', text: '♡' }));
  }
  return h('div', { className: 'lesson-hearts', 'aria-label': `${filled} hearts remaining` }, items);
}
