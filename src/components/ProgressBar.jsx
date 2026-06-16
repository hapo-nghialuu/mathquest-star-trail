// ProgressBar — cream pill background with a green fill, plus the "current /
// total" text overlay.
import React from 'react';

const styles = {
  wrap: {
    position: 'relative',
    width: '100%',
    height: 22,
    background: 'var(--c-cream)',
    border: '2px solid var(--c-navy)',
    borderRadius: 'var(--radius-pill)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-button)',
  },
  fill: {
    height: '100%',
    background: 'linear-gradient(180deg, var(--c-success-green) 0%, var(--c-success-green-dark) 100%)',
    transition: 'width 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
  },
  label: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 900,
    color: 'var(--c-navy)',
    textShadow: '0 1px 0 rgba(255, 255, 255, 0.7)',
    pointerEvents: 'none',
  },
};

export default function ProgressBar({ current, total }) {
  const pct = Math.max(0, Math.min(100, (current / total) * 100));
  return (
    <div style={styles.wrap} role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total}>
      <div style={{ ...styles.fill, width: `${pct}%` }} />
      <span style={styles.label}>
        {current} / {total}
      </span>
    </div>
  );
}
