// counter.js — pill counter (Level, Stars, Streak).

import { h } from '../util/dom.js';

const ICONS = {
  level: '⭐',
  stars: '★',
  streak: '🔥',
};

export function Counter({ kind, value }) {
  const icon = ICONS[kind] || '';
  const labelMap = { level: 'Level', stars: 'Stars', streak: 'Streak' };
  return h('span', {
    className: 'pill',
    role: 'status',
    ariaLabel: `${labelMap[kind] || kind} ${value}`,
  }, [
    h('span', { className: 'pill__icon', 'aria-hidden': 'true', text: icon }),
    h('span', { text: `${labelMap[kind] || kind} ${value}` }),
  ]);
}
