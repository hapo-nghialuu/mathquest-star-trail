// screens/lesson.js — Lesson / Question screen.
// Owns the lesson session in its closure (Red Team 2026-06-15). The session
// travels in the `CORRECT` dispatch payload — main.js does not own it.

import lessonBg from '../../assets/screens/02_lesson_question_screen.png';
import foxMascot from '../../assets/screen_crops/fox_mascot_cheer.png';
import { h } from '../util/dom.js';
import { Progress } from '../components/progress.js';
import { Hearts } from '../components/hearts.js';
import { LESSON } from '../state/config.js';
import { createShakeTimeline } from '../motion/shake.js';
import { EVENTS } from '../state/machine.js';

let tooltipEl = null;
let exampleEl = null;

export function render(rootEl, state, dispatch) {
  // Closure-local session. Reset on every mount.
  const session = { usedHint: false, wrongCount: 0, busy: false };
  let tooltipTimer = null;
  let exampleTimer = null;

  function dismissTooltip() {
    if (tooltipTimer) { clearTimeout(tooltipTimer); tooltipTimer = null; }
    if (tooltipEl) { tooltipEl.remove(); tooltipEl = null; }
  }
  function dismissExample() {
    if (exampleTimer) { clearTimeout(exampleTimer); exampleTimer = null; }
    if (exampleEl) { exampleEl.remove(); exampleEl = null; }
  }

  const bg = h('img', { className: 'bg', src: lessonBg, alt: 'Lesson background' });

  const closeBtn = h('button', {
    className: 'lesson-close',
    ariaLabel: 'Close lesson',
    text: '×',
    onClick: () => dispatch(EVENTS.CLOSE),
  });

  const progress = Progress(LESSON.progress);
  const hearts = Hearts(LESSON.hearts);

  const questionCard = h('div', { className: 'lesson-question card', role: 'region', ariaLabel: 'Question' }, [
    h('h1', { text: LESSON.question }),
    h('div', { className: 'lesson-answers' },
      LESSON.choices.map((choice) =>
        h('button', {
          className: 'answer-tile',
          role: 'button',
          ariaLabel: `Answer ${choice.label}`,
          onClick: () => handleTileTap(choice),
        }, [
          h('span', { text: choice.label }),
        ])
      )
    ),
  ]);

  const mascot = h('img', {
    className: 'lesson-mascot',
    src: foxMascot,
    alt: '',
    'aria-hidden': 'true',
  });

  const controls = h('div', { className: 'lesson-controls', role: 'group', ariaLabel: 'Lesson support controls' }, [
    h('button', { className: 'btn', ariaLabel: 'Show hint', text: 'Hint', onClick: showHint }),
    h('button', { className: 'btn', ariaLabel: 'Show worked example', text: 'Help', onClick: showHelp }),
    h('button', { className: 'btn', ariaLabel: 'Read question and answers', text: 'Read', onClick: showRead }),
  ]);

  const frame = h('div', { className: 'lesson-frame', role: 'region', ariaLabel: 'Lesson' }, [
    closeBtn,
    progress,
    hearts,
    mascot,
    questionCard,
    controls,
  ]);

  function handleTileTap(choice) {
    if (session.busy) return;
    // Set busy synchronously BEFORE yielding to GSAP (multi-touch guard).
    session.busy = true;
    if (!choice.correct) session.wrongCount += 1;

    const tileEl = questionEl(choice.id);
    const tl = createShakeTimeline(tileEl, {
      isCorrect: choice.correct,
      onComplete: () => {
        session.busy = false;
        if (choice.correct) {
          dispatch(EVENTS.CORRECT, {
            session: { usedHint: session.usedHint, wrongCount: session.wrongCount },
          });
        } else {
          dispatch(EVENTS.INCORRECT, {});
        }
      },
    });
    tl.play();
  }

  function questionEl(choiceId) {
    const tiles = questionCard.querySelectorAll('.answer-tile');
    const choice = LESSON.choices.find((c) => c.id === choiceId);
    const idx = LESSON.choices.indexOf(choice);
    return tiles[idx] || null;
  }

  function showHint() {
    session.usedHint = true;
    dismissExample();
    dismissTooltip();
    tooltipEl = h('div', { className: 'lesson-tooltip', role: 'tooltip' }, [
      h('span', { text: LESSON.hint }),
    ]);
    questionCard.parentNode.insertBefore(tooltipEl, questionCard);
    tooltipTimer = setTimeout(dismissTooltip, 6000);
  }

  function showHelp() {
    dismissTooltip();
    dismissExample();
    exampleEl = h('div', { className: 'lesson-worked-example', role: 'region', ariaLabel: 'Worked example' }, [
      h('h3', { text: 'Worked example' }),
      h('ol', {}, [
        h('li', { text: '4 hundreds → 400' }),
        h('li', { text: '3 tens → 30' }),
        h('li', { text: '6 ones → 6' }),
      ]),
      h('p', { text: '400 + 30 + 6 = 436' }),
    ]);
    questionCard.parentNode.insertBefore(exampleEl, questionCard);
    exampleTimer = setTimeout(dismissExample, 8000);
  }

  async function showRead() {
    if (session.busy) return;
    session.busy = true;
    try {
      const tiles = questionCard.querySelectorAll('.answer-tile');
      for (const tile of tiles) {
        tile.setAttribute('data-read-active', 'true');
        tile.focus({ preventScroll: true });
        await new Promise((r) => setTimeout(r, 700));
        tile.removeAttribute('data-read-active');
      }
    } finally {
      session.busy = false;
    }
  }

  // Dismiss tooltip / example when tapping elsewhere.
  const dismissOnClick = (e) => {
    if (tooltipEl && !tooltipEl.contains(e.target) && !e.target.closest('.btn')) {
      dismissTooltip();
    }
    if (exampleEl && !exampleEl.contains(e.target) && !e.target.closest('.btn')) {
      dismissExample();
    }
  };
  rootEl.addEventListener('click', dismissOnClick);

  rootEl.appendChild(bg);
  rootEl.appendChild(frame);

  return {
    unmount() {
      dismissTooltip();
      dismissExample();
      rootEl.removeEventListener('click', dismissOnClick);
      bg.remove();
      frame.remove();
    },
  };
}
