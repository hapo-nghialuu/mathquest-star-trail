// StarIcon — filled or outlined gold star. Used on reward screen + HUD pills.
import React from 'react';
import { assets } from '../data/assets.js';

const styles = {
  wrap: {
    display: 'inline-block',
    lineHeight: 0,
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
};

export default function StarIcon({ filled = true, size = 48, style }) {
  return (
    <span
      style={{
        ...styles.wrap,
        width: size,
        height: size,
        ...style,
      }}
    >
      <img
        src={filled ? assets.starFilledGold : assets.starOutlineEmpty}
        alt={filled ? 'Filled star' : 'Empty star'}
        style={styles.img}
        draggable={false}
      />
    </span>
  );
}
