// Hearts — the lives indicator. Uses the heart emoji (no heart PNG in
// assets/items/) and renders `filled` filled + `empty` empty hearts.
import React from 'react';

const styles = {
  wrap: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 20,
    lineHeight: 1,
  },
};

export default function Hearts({ filled = 0, empty = 0, size = 22 }) {
  return (
    <div style={styles.wrap} aria-label={`${filled} of ${filled + empty} hearts remaining`}>
      {Array.from({ length: filled }).map((_, i) => (
        <span key={`f-${i}`} style={{ color: 'var(--c-fox-orange)', fontSize: size }}>
          ❤
        </span>
      ))}
      {Array.from({ length: empty }).map((_, i) => (
        <span
          key={`e-${i}`}
          style={{
            color: 'rgba(20, 30, 70, 0.25)',
            fontSize: size,
            filter: 'grayscale(1)',
          }}
        >
          ❤
        </span>
      ))}
    </div>
  );
}
