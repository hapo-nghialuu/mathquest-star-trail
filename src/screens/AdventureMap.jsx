// AdventureMap — nodes 21-27 on a floating-island world.
// Coordinates were hand-tuned to mimic the curved trail in
// assets/screens/01_adventure_map_screen.png.

import React from 'react';
import { assets } from '../data/assets.js';
import Hud from '../components/Hud.jsx';
import BottomNav from '../components/BottomNav.jsx';
import WorldPiece from '../components/WorldPiece.jsx';
import MapNode from '../components/MapNode.jsx';
import Mascot from '../components/Mascot.jsx';
import { glowNode } from '../animations/gsapSetup.js';

const styles = {
  bg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 0,
  },
  // Wavy trail through the map. Coordinates in px (within 375x812 frame).
  nodeLayout: [
    { id: 21, x: '12%', y: '20%' },
    { id: 22, x: '32%', y: '30%' },
    { id: 23, x: '52%', y: '22%' },
    { id: 24, x: '72%', y: '34%' },
    { id: 25, x: '60%', y: '50%' },
    { id: 26, x: '40%', y: '58%' },
    { id: 27, x: '20%', y: '68%' },
  ],
};

function decorateNodes(stateNodes) {
  return stateNodes.map((n) => {
    const layout = styles.nodeLayout.find((l) => l.id === n.id) || { x: '50%', y: '50%' };
    return { ...n, ...layout };
  });
}

export default function AdventureMap({ state, dispatch, onNavigate }) {
  const nodes = decorateNodes(state.nodes);

  const handleSelect = async (node) => {
    if (node.state !== 'active') return;
    // Find the corresponding DOM element to play the glow animation.
    const el = document.querySelector(`[aria-label="Node ${node.id} — ${node.state}"]`);
    await glowNode(el);
    dispatch({ type: 'SELECT_NODE', nodeId: node.id });
  };

  return (
    <>
      <img src={assets.dayPathBackground} alt="" style={styles.bg} draggable={false} />

      {/* World decor layers — meadow + waterfall + clouds */}
      <WorldPiece
        src={assets.floatingIslandMeadow}
        alt=""
        left="-12%"
        top="14%"
        width="50%"
        zIndex={1}
      />
      <WorldPiece
        src={assets.floatingIslandWaterfall}
        alt=""
        left="60%"
        top="62%"
        width="48%"
        zIndex={1}
      />
      <WorldPiece
        src={assets.bridgePathSegment}
        alt=""
        left="22%"
        top="55%"
        width="36%"
        zIndex={2}
        rotate={-8}
      />
      <WorldPiece
        src={assets.cloudPuffLarge}
        alt=""
        left="-6%"
        top="6%"
        width="36%"
        zIndex={2}
        opacity={0.95}
      />
      <WorldPiece
        src={assets.cloudPuffSoft}
        alt=""
        left="56%"
        top="10%"
        width="44%"
        zIndex={2}
        opacity={0.95}
      />
      <WorldPiece
        src={assets.cloudPuffSoft}
        alt=""
        left="-10%"
        top="78%"
        width="40%"
        zIndex={2}
        opacity={0.85}
      />

      {/* Nodes 21-27 */}
      {nodes.map((n) => (
        <MapNode key={n.id} node={n} onSelect={handleSelect} />
      ))}

      {/* Mascot near the active node */}
      <Mascot
        pose="pointing"
        left="50%"
        top="50%"
        width={120}
        style={{ transform: 'translateX(-30%)' }}
      />

      <Hud hud={state.hud} />
      <BottomNav active="quests" onSelect={onNavigate} />
    </>
  );
}
