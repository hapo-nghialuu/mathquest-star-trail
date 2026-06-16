// Bottom navigation — the glossy nav strip PNG with three icon slots
// (Quests / Practice / Shop). Click targets dispatch `onSelect` for future use.
import React from 'react';
import { assets } from '../data/assets.js';

const NAV_ITEMS = [
  { id: 'quests', label: 'Quests', icon: assets.navIconQuests },
  { id: 'practice', label: 'Practice', icon: assets.navIconPractice },
  { id: 'shop', label: 'Shop', icon: assets.navIconShop },
];

const styles = {
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 110,
    zIndex: 10,
    pointerEvents: 'none',
  },
  strip: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 320,
    height: 'auto',
    pointerEvents: 'auto',
  },
  item: {
    position: 'absolute',
    bottom: 14,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    background: 'transparent',
    border: 'none',
    padding: 0,
    pointerEvents: 'auto',
    color: 'var(--c-white)',
    textShadow: '0 1px 0 rgba(20, 30, 70, 0.6)',
    fontSize: 11,
    fontWeight: 900,
  },
  icon: {
    width: 50,
    height: 50,
    objectFit: 'contain',
  },
};

const ITEM_X = { quests: '20%', practice: '50%', shop: '80%' };

export default function BottomNav({ active = 'quests', onSelect = () => {} }) {
  return (
    <div style={styles.wrap}>
      <img src={assets.bottomNavStrip} alt="" style={styles.strip} />
      {NAV_ITEMS.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            style={{
              ...styles.item,
              left: ITEM_X[item.id],
              transform: 'translateX(-50%)',
              filter: isActive ? 'drop-shadow(0 0 6px rgba(255, 210, 74, 0.9))' : 'none',
            }}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <img src={item.icon} alt="" style={styles.icon} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
