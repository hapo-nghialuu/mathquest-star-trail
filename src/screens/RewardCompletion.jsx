// RewardCompletion — "Bridge Repaired!" celebration. Drives the entrance
// animations (banner drop, star pop, XP count-up) on mount.

import React from 'react';
import { mvpConfig } from '../data/config.js';
import { assets } from '../data/assets.js';
import Hud from '../components/Hud.jsx';
import BottomNav from '../components/BottomNav.jsx';
import Mascot from '../components/Mascot.jsx';
import RibbonBanner from '../components/RibbonBanner.jsx';
import StarIcon from '../components/StarIcon.jsx';
import XpBadge from '../components/XpBadge.jsx';
import Sparkles from '../components/Sparkles.jsx';
import {
  bannerDropIn,
  starPopIn,
  xpCountUp,
  getReducedMotion,
} from '../animations/gsapSetup.js';

const styles = {
  bg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 0,
  },
  bannerWrap: {
    position: 'absolute',
    top: 130,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    zIndex: 5,
  },
  starsRow: {
    position: 'absolute',
    top: 320,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    gap: 14,
    zIndex: 5,
  },
  message: {
    position: 'absolute',
    top: 405,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'var(--c-white)',
    fontSize: 22,
    fontWeight: 900,
    textShadow: '0 2px 0 rgba(20, 30, 70, 0.5)',
    zIndex: 5,
  },
  xpWrap: {
    position: 'absolute',
    top: 445,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    zIndex: 5,
  },
  xpText: {
    color: 'var(--c-star-gold)',
    fontSize: 20,
    fontWeight: 900,
    textShadow: '0 2px 0 rgba(20, 30, 70, 0.5)',
  },
  mascotWrap: {
    position: 'absolute',
    top: 470,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    zIndex: 4,
  },
  ctaWrap: {
    position: 'absolute',
    bottom: 120,
    left: 24,
    right: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    zIndex: 6,
  },
  primaryCta: {
    width: '100%',
    background: 'linear-gradient(180deg, var(--c-success-green) 0%, var(--c-success-green-dark) 100%)',
    color: 'var(--c-white)',
    border: '3px solid var(--c-navy)',
    borderRadius: 'var(--radius-pill)',
    padding: '14px 24px',
    fontSize: 18,
    fontWeight: 900,
    boxShadow: '0 6px 0 rgba(20, 30, 70, 0.4)',
    textShadow: '0 1px 0 rgba(20, 30, 70, 0.4)',
  },
  secondaryCta: {
    background: 'transparent',
    color: 'var(--c-white)',
    border: 'none',
    fontSize: 14,
    fontWeight: 800,
    textShadow: '0 1px 0 rgba(20, 30, 70, 0.5)',
    textDecoration: 'underline',
  },
};

export default function RewardCompletion({ state, dispatch, onNavigate }) {
  const bannerRef = React.useRef(null);
  const starRefs = React.useRef([]);
  const xpRef = React.useRef(null);
  const [playKey, setPlayKey] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    const run = async () => {
      // Reset XP label
      if (xpRef.current) xpRef.current.textContent = '+0 XP';
      const bannerEl = bannerRef.current;
      const starEls = starRefs.current.filter(Boolean);
      await Promise.all([bannerDropIn(bannerEl), starPopIn(starEls)]);
      if (cancelled) return;
      await xpCountUp(xpRef.current, state.reward.earnedXp, 1.1);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [state.reward.earnedXp, playKey]);

  // Empty star count so the row shows 3 total
  const totalStars = 3;
  const earnedStars = Math.max(0, Math.min(totalStars, state.reward.earnedStars));

  return (
    <>
      <img src={assets.rewardNightBackground} alt="" style={styles.bg} draggable={false} />

      <Hud hud={state.hud} />

      <div ref={bannerRef} style={styles.bannerWrap}>
        <RibbonBanner title={mvpConfig.reward.title} />
      </div>

      <div style={styles.starsRow}>
        {Array.from({ length: totalStars }).map((_, i) => (
          <div
            key={`s-${i}-${playKey}`}
            ref={(el) => (starRefs.current[i] = el)}
            style={{ width: 78, height: 78 }}
          >
            <StarIcon filled={i < earnedStars} size={78} />
          </div>
        ))}
      </div>

      <p style={styles.message}>{mvpConfig.reward.message}</p>

      <div style={styles.xpWrap}>
        <XpBadge value={state.reward.earnedXp} />
        <span ref={xpRef} style={styles.xpText}>
          +0 XP
        </span>
      </div>

      <div style={styles.mascotWrap}>
        <Mascot pose="jumping" width={150} />
      </div>

      <Sparkles playKey={playKey} />

      <div style={styles.ctaWrap}>
        <button
          type="button"
          onClick={() => {
            dispatch({ type: 'CONTINUE_TO_MAP' });
            setPlayKey((k) => k + 1);
          }}
          style={styles.primaryCta}
        >
          {mvpConfig.reward.primary_cta} ▶
        </button>
        <button
          type="button"
          onClick={() => {
            dispatch({ type: 'CONTINUE_TO_MAP' });
            setPlayKey((k) => k + 1);
          }}
          style={styles.secondaryCta}
        >
          {mvpConfig.reward.secondary_cta}
        </button>
      </div>

      <BottomNav active="quests" onSelect={onNavigate} />
    </>
  );
}

void getReducedMotion;
