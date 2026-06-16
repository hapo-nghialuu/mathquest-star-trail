// Mascot — the friendly orange fox. Takes a `pose` prop matching one of the
// four fox PNGs and renders it with the supplied positioning.
import React from 'react';
import { assets } from '../data/assets.js';

const POSE_TO_ASSET = {
  jumping: assets.foxMascotJumping,
  pointing: assets.foxMascotPointing,
  thinking: assets.foxMascotThinking,
  worried: assets.foxMascotWorried,
};

const styles = {
  wrap: {
    position: 'absolute',
    width: 140,
    height: 180,
    pointerEvents: 'none',
    zIndex: 5,
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    objectPosition: 'center bottom',
    filter: 'drop-shadow(0 6px 12px rgba(20, 30, 70, 0.25))',
  },
};

export default function Mascot({ pose = 'pointing', left, top, width, style, className = '' }) {
  const asset = POSE_TO_ASSET[pose] || assets.foxMascotPointing;
  return (
    <div
      className={className}
      style={{
        ...styles.wrap,
        left,
        top,
        width: width || styles.wrap.width,
        height: 'auto',
        aspectRatio: '1086 / 1448',
        ...style,
      }}
      data-mascot-pose={pose}
    >
      <img src={asset} alt={`Fox mascot — ${pose}`} style={styles.img} draggable={false} />
    </div>
  );
}
