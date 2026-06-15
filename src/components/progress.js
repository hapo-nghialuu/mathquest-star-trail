// progress.js — 4 / 10 progress bar.

import { h } from '../util/dom.js';

export function Progress({ current, total, label }) {
  const pct = Math.max(0, Math.min(100, (current / total) * 100));
  return h('div', {
    className: 'lesson-progress',
    role: 'progressbar',
    'aria-valuenow': current,
    'aria-valuemin': 0,
    'aria-valuemax': total,
    'aria-label': label,
  }, [
    h('div', { className: 'progress-track', 'aria-hidden': 'true' }, [
      h('div', { className: 'progress-fill', style: { width: `${pct}%` } }),
    ]),
    h('span', { text: label }),
  ]);
}
