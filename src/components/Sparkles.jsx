// Sparkles — celebration particle overlay. Renders N copies of the sparkle
// PNG at absolute positions, each with a slight scale + rotation variance.
// A `playKey` prop changes the rendered structure to retrigger animations.
import React from 'react';
import { assets } from '../data/assets.js';

const PRESETS = {
  default: [
    { left: '20%', top: '30%', size: 80, rotate: -10, delay: 0.05 },
    { left: '75%', top: '20%', size: 70, rotate: 18, delay: 0.18 },
    { left: '50%', top: '55%', size: 100, rotate: -5, delay: 0.08 },
    { left: '12%', top: '60%', size: 60, rotate: 25, delay: 0.25 },
    { left: '70%', top: '70%', size: 80, rotate: -20, delay: 0.14 },
  ],
};

const styles = {
  wrap: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 4,
  },
  particle: {
    position: 'absolute',
    transformOrigin: 'center',
    animation: 'sparkle-pop 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) both',
    pointerEvents: 'none',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    filter: 'drop-shadow(0 0 12px rgba(255, 210, 74, 0.8))',
  },
};

export default function Sparkles({ variant = 'default', playKey = 0 }) {
  const items = PRESETS[variant] || PRESETS.default;
  return (
    <div key={playKey} style={styles.wrap} aria-hidden="true">
      {items.map((p, i) => (
        <div
          key={`${playKey}-${i}`}
          style={{
            ...styles.particle,
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            transform: `translate(-50%, -50%) rotate(${p.rotate}deg)`,
            animationDelay: `${p.delay}s`,
          }}
        >
          <img src={assets.sparkleParticle} alt="" style={styles.img} draggable={false} />
        </div>
      ))}
    </div>
  );
}
