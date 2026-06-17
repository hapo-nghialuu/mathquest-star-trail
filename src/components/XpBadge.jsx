// XpBadge — the +60 XP reward badge. The PNG already contains "+60 XP" text
// so we just render it. We expose a `value` prop for a GSAP count-up target
// (purely informational for the parent; animation is driven from the screen).
import React from 'react';
import { assets } from '../data/assets.js';

const styles = {
  wrap: {
    position: 'relative',
    width: 150,
    height: 150,
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    pointerEvents: 'none',
    filter: 'drop-shadow(0 8px 20px rgba(255, 210, 74, 0.5))',
  },
};

export default function XpBadge({ value = 60, style }) {
  return (
    <div style={{ ...styles.wrap, ...style }} data-xp-target={value}>
      <img src={assets.xpBadge60} alt={`+${value} XP reward`} style={styles.img} draggable={false} />
    </div>
  );
}
