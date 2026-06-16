// MapNode — a single node on the adventure map. Renders the right PNG for
// each state and adds a CSS pulse when active.
import React from 'react';
import { assets } from '../data/assets.js';

const STATE_TO_ASSET = {
  completed: assets.mapNodeCompleted3Stars,
  active: assets.mapNodeBlankBlue,
  locked: assets.mapNodeLocked,
};

const styles = {
  wrap: {
    position: 'absolute',
    width: 70,
    height: 70,
    transform: 'translate(-50%, -50%)',
    background: 'transparent',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapDisabled: { cursor: 'not-allowed', opacity: 0.85 },
  wrapActive: {
    filter: 'drop-shadow(0 0 14px rgba(255, 210, 74, 0.85))',
    animation: 'map-node-pulse 1.6s ease-in-out infinite',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    pointerEvents: 'none',
  },
  label: {
    position: 'absolute',
    bottom: -22,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'var(--c-navy)',
    color: 'var(--c-white)',
    borderRadius: 'var(--radius-pill)',
    padding: '2px 10px',
    fontSize: 13,
    fontWeight: 900,
    whiteSpace: 'nowrap',
    boxShadow: 'var(--shadow-button)',
  },
};

export default function MapNode({ node, onSelect }) {
  const asset = STATE_TO_ASSET[node.state] || assets.mapNodeLocked;
  const isClickable = node.state === 'active';
  const wrapStyle = {
    ...styles.wrap,
    left: node.x,
    top: node.y,
    ...(node.state === 'active' ? styles.wrapActive : {}),
    ...(isClickable ? {} : styles.wrapDisabled),
  };
  return (
    <button
      type="button"
      onClick={() => onSelect(node)}
      style={wrapStyle}
      aria-label={`Node ${node.id} — ${node.state}`}
      aria-disabled={!isClickable}
      disabled={!isClickable}
    >
      <img src={asset} alt="" style={styles.img} draggable={false} />
      <span style={styles.label}>{node.id}</span>
    </button>
  );
}
