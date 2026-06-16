// LessonQuestion — Place Value question. Shows progress, hearts, the question
// card, 2x2 answer grid, and Hint/Help/Read bottom controls. Drives the
// lesson state machine via the reducer.

import React from 'react';
import { mvpConfig } from '../data/config.js';
import { assets } from '../data/assets.js';
import ProgressBar from '../components/ProgressBar.jsx';
import Hearts from '../components/Hearts.jsx';
import AnswerCard from '../components/AnswerCard.jsx';
import Mascot from '../components/Mascot.jsx';
import WorldPiece from '../components/WorldPiece.jsx';
import { correctAnswer, shakeAnswer, getReducedMotion } from '../animations/gsapSetup.js';

const styles = {
  bg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 0,
  },
  // Top bar with close, progress, hearts
  topBar: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    zIndex: 6,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: 'var(--c-white)',
    border: '2px solid var(--c-navy)',
    color: 'var(--c-navy)',
    fontSize: 18,
    fontWeight: 900,
    cursor: 'pointer',
    boxShadow: 'var(--shadow-button)',
    flexShrink: 0,
  },
  progressWrap: {
    flex: 1,
    minWidth: 0,
  },
  // Topic + objective text block
  meta: {
    position: 'absolute',
    top: 70,
    left: 24,
    right: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 2,
    zIndex: 5,
  },
  topic: {
    background: 'var(--c-magic-purple)',
    color: 'var(--c-white)',
    padding: '4px 14px',
    borderRadius: 'var(--radius-pill)',
    fontSize: 13,
    fontWeight: 900,
    border: '2px solid var(--c-navy)',
    boxShadow: 'var(--shadow-button)',
  },
  objective: {
    color: 'var(--c-navy)',
    fontSize: 12,
    fontWeight: 800,
    opacity: 0.85,
    textShadow: '0 1px 0 rgba(255, 255, 255, 0.5)',
  },
  // Question card
  questionCard: {
    position: 'absolute',
    top: 130,
    left: '8%',
    right: '8%',
    background: 'var(--c-cream)',
    border: '3px solid var(--c-navy)',
    borderRadius: 'var(--radius-card)',
    padding: '18px 16px',
    boxShadow: 'var(--shadow-card)',
    zIndex: 5,
  },
  questionText: {
    fontSize: 22,
    fontWeight: 900,
    color: 'var(--c-text-on-light)',
    textAlign: 'center',
    lineHeight: 1.3,
  },
  // 2x2 answer grid
  answerGrid: {
    position: 'absolute',
    top: 270,
    left: '6%',
    right: '6%',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    zIndex: 5,
  },
  // Bottom controls
  bottomBar: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    display: 'flex',
    justifyContent: 'center',
    gap: 10,
    zIndex: 6,
  },
  control: {
    flex: 1,
    maxWidth: 110,
    background: 'linear-gradient(180deg, var(--c-sky-blue) 0%, var(--c-sky-blue-dark) 100%)',
    color: 'var(--c-white)',
    border: '2px solid var(--c-navy)',
    borderRadius: 'var(--radius-pill)',
    padding: '10px 14px',
    fontSize: 14,
    fontWeight: 900,
    boxShadow: 'var(--shadow-button)',
    textShadow: '0 1px 0 rgba(20, 30, 70, 0.4)',
  },
  // Hint popup
  hint: {
    position: 'absolute',
    top: 195,
    left: '10%',
    right: '10%',
    background: 'var(--c-white)',
    border: '2px solid var(--c-magic-purple)',
    borderRadius: 'var(--radius-card)',
    padding: '10px 14px',
    fontSize: 14,
    fontWeight: 800,
    color: 'var(--c-navy)',
    boxShadow: 'var(--shadow-card)',
    zIndex: 7,
    textAlign: 'center',
  },
};

function getAnswerState(choiceId, lesson) {
  if (lesson.feedback === 'correct' && lesson.selectedAnswerId === choiceId) return 'correct';
  if (lesson.shaking === choiceId) return 'incorrect';
  return 'idle';
}

export default function LessonQuestion({ state, dispatch }) {
  const { lesson } = state;
  const question = mvpConfig.lesson;

  const handleSelect = async (choice) => {
    if (lesson.feedback === 'correct') return; // ignore double-tap

    const cardEl = document.querySelector(`[data-answer-id="${choice.id}"]`);
    if (choice.correct) {
      await correctAnswer(cardEl);
      dispatch({ type: 'SELECT_ANSWER', choice });
      // After a brief delay, transition to reward.
      setTimeout(() => dispatch({ type: 'GO_TO_REWARD' }), 850);
    } else {
      shakeAnswer(cardEl);
      dispatch({ type: 'SELECT_ANSWER', choice });
      // Clear the shake after the animation.
      setTimeout(() => dispatch({ type: 'CLEAR_FEEDBACK' }), 700);
    }
  };

  const closeLesson = () => dispatch({ type: 'CONTINUE_TO_MAP' });

  return (
    <>
      <img src={assets.lessonSkyBackground} alt="" style={styles.bg} draggable={false} />

      {/* Decorative clouds */}
      <WorldPiece src={assets.cloudPuffSoft} alt="" left="-8%" top="0%" width="40%" zIndex={1} opacity={0.85} />
      <WorldPiece src={assets.cloudPuffLarge} alt="" left="64%" top="4%" width="38%" zIndex={1} opacity={0.9} />

      {/* Top bar */}
      <div style={styles.topBar}>
        <button
          type="button"
          onClick={closeLesson}
          style={styles.iconButton}
          aria-label="Close lesson"
        >
          ✕
        </button>
        <div style={styles.progressWrap}>
          <ProgressBar current={lesson.progress} total={lesson.total} />
        </div>
        <Hearts filled={lesson.heartsFilled} empty={lesson.heartsEmpty} size={22} />
      </div>

      {/* Meta block */}
      <div style={styles.meta}>
        <span style={styles.topic}>{question.topic}</span>
        <span style={styles.objective}>{question.objective}</span>
      </div>

      {/* Question card */}
      <div style={styles.questionCard}>
        <p style={styles.questionText}>{question.question}</p>
      </div>

      {/* Hint popup */}
      {lesson.usedHint && (
        <div style={styles.hint} role="note">
          💡 {question.hint}
        </div>
      )}

      {/* Answer grid */}
      <div style={styles.answerGrid}>
        {question.choices.map((choice) => (
          <AnswerCard
            key={choice.id}
            choice={choice}
            onSelect={handleSelect}
            state={getAnswerState(choice.id, lesson)}
          />
        ))}
      </div>

      {/* Mascot — happy when correct, worried when wrong, thinking otherwise */}
      <Mascot
        pose={
          lesson.feedback === 'correct'
            ? 'jumping'
            : lesson.feedback === 'incorrect'
              ? 'worried'
              : 'thinking'
        }
        left="64%"
        top="55%"
        width={120}
      />

      {/* Bottom controls */}
      <div style={styles.bottomBar}>
        <button
          type="button"
          onClick={() => dispatch({ type: 'OPEN_HINT' })}
          style={styles.control}
        >
          💡 Hint
        </button>
        <button type="button" onClick={() => alert('Help: think in groups of 100, 10, and 1.')} style={styles.control}>
          ❓ Help
        </button>
        <button
          type="button"
          onClick={() => {
            try {
              const utter = new SpeechSynthesisUtterance(question.question);
              speechSynthesis.speak(utter);
            } catch {
              // noop — Read button is best-effort.
            }
          }}
          style={styles.control}
        >
          🔊 Read
        </button>
      </div>
    </>
  );
}

// Suppress unused import warning for getReducedMotion — kept for future
// conditional logic (e.g. immediate feedback when reduced motion is on).
void getReducedMotion;
