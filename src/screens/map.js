// screens/map.js — Adventure Map screen.

import { gsap } from 'gsap';
import mapBg from '../../assets/screens/01_adventure_map_screen.png';
import bottomNav from '../../assets/screen_crops/bottom_nav_quests_practice_shop.png';
import currentNode26 from '../../assets/screen_crops/map_node_current_26.png';
import { h, qs } from '../util/dom.js';
import { Counter } from '../components/counter.js';
import { Node } from '../components/node.js';
import { NODE_POSITIONS } from '../state/config.js';
import { createPulseTimeline } from '../motion/pulse.js';
import { EVENTS } from '../state/machine.js';

export function render(rootEl, state, dispatch) {
  const pulseTimelines = [];
  let node26Tapped = false; // double-tap guard (code review 2026-06-15)

  // Background.
  const bg = h('img', {
    className: 'bg',
    src: mapBg,
    alt: 'Star Trail floating islands with a glowing trail path',
  });

  // Top row: world banner + 3 counter pills.
  const banner = h('div', { className: 'map-banner', text: 'Star Trail' });

  const counters = h('div', { className: 'map-top-row', role: 'group', ariaLabel: 'Learner counters' }, [
    Counter({ kind: 'level', value: state.learner.level }),
    Counter({ kind: 'stars', value: state.learner.stars }),
    Counter({ kind: 'streak', value: state.learner.streak }),
  ]);

  // Node layer.
  const nodeLayer = h('div', { className: 'map-nodes', 'aria-hidden': 'false' });
  const activeNode = state.nodes.find((n) => n.id === state.learner.activeNodeId && n.state === 'active');

  state.nodes.forEach((n) => {
    const pos = NODE_POSITIONS[n.id];
    if (!pos) return;
    if (n.id === activeNode && n.id === 26) {
      // Use the current-26 marker as the visual base; still wrap in a Node
      // button for keyboard focus. The pulse timeline drives the active cue.
      const wrapper = h('button', {
        className: 'map-node map-node--active pulse-node',
        style: {
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          padding: 0,
          overflow: 'hidden',
        },
        ariaLabel: `Node ${n.id}, active. Tap to start the lesson.`,
        onClick: (e) => {
          e.preventDefault();
          handleNodeTap(dispatch, n.id, wrapper);
        },
        onKeydown: (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleNodeTap(dispatch, n.id, wrapper);
          }
        },
      }, [
        h('img', {
          src: currentNode26,
          alt: '',
          'aria-hidden': 'true',
          style: { width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' },
        }),
      ]);
      nodeLayer.appendChild(wrapper);
      const tl = createPulseTimeline(wrapper, { isCompleted: false });
      pulseTimelines.push(tl);
      tl.play();
    } else {
      const nodeEl = Node({
        id: n.id,
        x: pos.x,
        y: pos.y,
        state: n.state,
        stars: n.stars,
        onTap: n.id === 26 && n.state === 'active' ? (id) => handleNodeTap(dispatch, id, qs(nodeLayer, `button[aria-label^="Node ${id}"]`)) : null,
      });
      nodeLayer.appendChild(nodeEl);
    }
  });

  // Bottom nav strip.
  const nav = h('div', { className: 'map-nav', role: 'navigation', ariaLabel: 'Bottom navigation' }, [
    h('img', {
      src: bottomNav,
      alt: 'Bottom navigation: Quests, Practice, Shop',
      style: { width: '100%', display: 'block', pointerEvents: 'none' },
    }),
  ]);

  const frame = h('div', { className: 'map-root', role: 'region', ariaLabel: 'Adventure Map' }, [
    banner,
    counters,
    nodeLayer,
    nav,
  ]);

  rootEl.appendChild(bg);
  rootEl.appendChild(frame);

  return {
    unmount() {
      pulseTimelines.forEach((tl) => tl.kill());
      pulseTimelines.length = 0;
      bg.remove();
      frame.remove();
    },
  };
}

function handleNodeTap(dispatch, id, nodeEl) {
  if (id !== 26) return;
  if (node26Tapped) return;
  node26Tapped = true;
  // Tap scale-up animation, then dispatch the event.
  if (nodeEl) {
    gsap.fromTo(
      nodeEl,
      { scale: 1.0 },
      { scale: 1.15, duration: 0.15, yoyo: true, repeat: 1, ease: 'power1.out' }
    );
  }
  dispatch(EVENTS.NODE_26_SELECTED);
}
