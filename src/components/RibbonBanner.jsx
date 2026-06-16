// RibbonBanner — gold ribbon PNG with overlaid title text.
import React from 'react';
import { assets } from '../data/assets.js';

const styles = {
  wrap: {
    position: 'relative',
    width: '88%',
    maxWidth: 360,
    aspectRatio: '1448 / 1086',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    pointerEvents: 'none',
  },
  text: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--c-navy)',
    fontSize: 26,
    fontWeight: 900,
    textShadow: '0 1px 0 rgba(255, 255, 255, 0.5), 0 2px 4px rgba(20, 30, 70, 0.3)',
    textAlign: 'center',
    paddingTop: '6%',
    pointerEvents: 'none',
  },
};

export default function RibbonBanner({ title }) {
  return (
    <div style={styles.wrap}>
      <img src={assets.ribbonBannerGold} alt="" style={styles.img} draggable={false} />
      <span style={styles.text}>{title}</span>
    </div>
  );
}
