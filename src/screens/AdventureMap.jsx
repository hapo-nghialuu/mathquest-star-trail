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
  // Wavy trail through the map, mirroring the polished reference: trail
  // sweeps from top-left across to top-right, then dips back down to the
  // bottom-right where the locked node 27 sits.
  nodeLayout: [
    { id: 21, x: '15%', y: '22%' },
    { id: 22, x: '35%', y: '30%' },
    { id: 23, x: '55%', y: '24%' },
    { id: 24, x: '75%', y: '34%' },
    { id: 25, x: '62%', y: '50%' },
    { id: 26, x: '38%', y: '60%' },
    { id: 27, x: '78%', y: '72%' },
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

      {/* World decor layers — back island, meadow, waterfall, bridge, clouds.
          The large center island sits behind the path so the trail reads
          as floating-island world (matches the reference sheet). */}
      <WorldPiece
        src={assets.floatingIslandMeadow}
        alt=""
        left="-15%"
        top="32%"
        width="70%"
        zIndex={1}
      />
      <WorldPiece
        src={assets.floatingIslandWaterfall}
        alt=""
        left="55%"
        top="58%"
        width="52%"
        zIndex={1}
      />
      <WorldPiece
        src={assets.bridgePathSegment}
        alt=""
        left="28%"
        top="48%"
        width="44%"
        zIndex={2}
        rotate={-10}
      />
      <WorldPiece
        src={assets.cloudPuffLarge}
        alt=""
        left="-8%"
        top="4%"
        width="38%"
        zIndex={2}
        opacity={0.95}
      />
      <WorldPiece
        src={assets.cloudPuffSoft}
        alt=""
        left="58%"
        top="8%"
        width="42%"
        zIndex={2}
        opacity={0.95}
      />
      <WorldPiece
        src={assets.cloudPuffSoft}
        alt=""
        left="-12%"
        top="80%"
        width="42%"
        zIndex={2}
        opacity={0.85}
      />

      {/* Nodes 21-27 */}
      {nodes.map((n) => (
        <MapNode key={n.id} node={n} onSelect={handleSelect} />
      ))}

      {/* Fox guide stands to the LEFT of the active node (26), pointing at it.
          Positioned just outside the node so it never occludes the glow. */}
      <Mascot
        pose="pointing"
        left="14%"
        top="58%"
        width={130}
      />

      <Hud hud={state.hud} />
      <BottomNav active="quests" onSelect={onNavigate} />
    </>
  );
}
