// Top HUD bar: fox avatar, level pill, star counter, streak counter, settings.
import React from 'react';
import { assets } from '../data/assets.js';

const styles = {
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 84,
    padding: '14px 12px 0',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
    pointerEvents: 'none',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: 'var(--c-cream)',
    border: '3px solid var(--c-fox-orange)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'auto',
    flexShrink: 0,
  },
  avatarImg: {
    width: '110%',
    height: '110%',
    objectFit: 'cover',
    objectPosition: 'center 20%',
  },
  pill: {
    background: 'var(--c-white)',
    border: '2px solid var(--c-navy)',
    borderRadius: 'var(--radius-pill)',
    padding: '5px 10px',
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 13,
    fontWeight: 900,
    color: 'var(--c-text-on-light)',
    boxShadow: 'var(--shadow-button)',
    pointerEvents: 'auto',
    whiteSpace: 'nowrap',
  },
  pillIcon: {
    width: 18,
    height: 18,
    objectFit: 'contain',
  },
  spacer: { flex: 1 },
  banner: {
    background: 'linear-gradient(180deg, #ffd24a 0%, #e0a82a 100%)',
    color: 'var(--c-navy)',
    padding: '4px 14px',
    borderRadius: 'var(--radius-pill)',
    fontSize: 13,
    fontWeight: 900,
    border: '2px solid var(--c-navy)',
    boxShadow: 'var(--shadow-button)',
    pointerEvents: 'auto',
  },
};

function Pill({ children }) {
  return <div style={styles.pill}>{children}</div>;
}

export default function Hud({ hud, bannerText = 'Star Trail' }) {
  return (
    <div style={styles.wrap}>
      <div style={styles.avatar} aria-label="Player avatar">
        <img src={assets.foxMascotPointing} alt="" style={styles.avatarImg} />
      </div>
      <Pill>
        <span aria-hidden="true">🏆</span>
        <span>Lv {hud.level}</span>
      </Pill>
      <Pill>
        <img src={assets.starFilledGold} alt="" style={styles.pillIcon} />
        <span>{hud.stars}</span>
      </Pill>
      <Pill>
        <span aria-hidden="true">🔥</span>
        <span>{hud.streak}</span>
      </Pill>
      <div style={styles.spacer} />
      <div style={styles.banner}>{bannerText}</div>
    </div>
  );
}
