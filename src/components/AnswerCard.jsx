// AnswerCard — wraps the answer_card_orange PNG with an absolute-positioned
// number label. Optional `state` adds visual feedback (correct/incorrect).
import React from 'react';
import { assets } from '../data/assets.js';

const styles = {
  wrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: '1448 / 1086',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    padding: 0,
    transition: 'transform 0.15s ease, filter 0.2s ease',
  },
  wrapCorrect: {
    filter: 'drop-shadow(0 0 18px rgba(106, 211, 106, 0.9))',
  },
  wrapIncorrect: {
    filter: 'drop-shadow(0 0 12px rgba(255, 90, 106, 0.7))',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    pointerEvents: 'none',
  },
  label: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 44,
    fontWeight: 900,
    color: 'var(--c-text-on-light)',
    textShadow: '0 2px 0 rgba(255, 255, 255, 0.6)',
    pointerEvents: 'none',
    paddingTop: '8%',
  },
};

export default function AnswerCard({ choice, onSelect, state = 'idle', refCallback }) {
  const wrapStyle = {
    ...styles.wrap,
    ...(state === 'correct' ? styles.wrapCorrect : {}),
    ...(state === 'incorrect' ? styles.wrapIncorrect : {}),
  };
  return (
    <button
      ref={refCallback}
      type="button"
      onClick={() => onSelect(choice)}
      style={wrapStyle}
      aria-label={`Answer ${choice.label}`}
      data-answer-id={choice.id}
    >
      <img src={assets.answerCardOrange} alt="" style={styles.img} draggable={false} />
      <span style={styles.label}>{choice.label}</span>
    </button>
  );
}
