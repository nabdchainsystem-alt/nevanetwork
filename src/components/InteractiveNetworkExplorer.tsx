import { useCallback, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import FlyCamera from './FlyCamera';
import InstancedBackgroundNodes from './InstancedBackgroundNodes';
import NodeConnections from './NodeConnections';
import TutorialPath from './TutorialPath';
import CorruptedLinks from './CorruptedLinks';
import WatcherRings from './WatcherRings';
import ScanLabels from './ScanLabels';
import InteractiveNodes from './InteractiveNodes';
import NodeHitProxies from './NodeHitProxies';
import SelectedNodeFocus from './SelectedNodeFocus';
import ObjectiveMarker from './ObjectiveMarker';
import NodePanelHost from './NodePanelHost';
import Subnetwork from './Subnetwork';
import PlayerSubnetwork from './PlayerSubnetwork';
import DevScanOverlay from './DevScanOverlay';
import { SPAWN } from '../world';
import { nodeType, CORE_NODE_INDEX, type GameState, type GameAction } from '../game';
import type { ObjectiveVisualKind } from '../objectives';
import type { BackgroundNoise } from '../uiSettings';

interface Props {
  selected: number | null;
  hovered: number | null;
  game: GameState;
  dispatch: React.Dispatch<GameAction>;
  onSelect: (i: number | null) => void;
  onHoverChange: (i: number | null) => void;
  onLockChange: (locked: boolean) => void;
  onFocusReadyChange?: (i: number | null) => void;
  guideNode?: number | null; // Mission 00: gently frame this node (no selection)
  objectiveNode?: number | null; // current mission target — pulsed by ObjectiveMarker
  objectiveKind?: ObjectiveVisualKind; // visual category of the current objective (marker style)
  devScan: boolean;
  scanOn: boolean; // `scan` terminal command — silver kind markers on nearby nodes
  backgroundNoise: BackgroundNoise;
}

/**
 * Owns the WebGL scene: black void, depth fog, the floating network (background
 * haze + connections + glowing interactive nodes), selection/hover markers, the
 * holographic panel, gateway sub-clusters, the camera, and bloom.
 */
export default function InteractiveNetworkExplorer({
  selected,
  hovered,
  game,
  dispatch,
  onSelect,
  onHoverChange,
  onLockChange,
  onFocusReadyChange,
  guideNode,
  objectiveNode,
  objectiveKind,
  devScan,
  scanOn,
  backgroundNoise,
}: Props) {
  // Phase 4 — sector atmosphere. Sector A02 (Deep Network, missions 08+) reads deeper: heavier
  // exp² fog (more distant nodes fade into the void) + a touch more bloom (subtle cyan intensity).
  // A01 (Memory Grid) stays the calmer, cleaner baseline. Two cheap constants — no per-frame cost.
  const deepSector = game.missionId >= 8;
  const fogDensity = deepSector ? 0.0039 : 0.0028;
  const bloomIntensity = deepSector ? 0.9 : 0.7;
  const bloomThreshold = deepSector ? 0.18 : 0.2;
  const interactiveRef = useRef<THREE.InstancedMesh>(null);
  const hitRef = useRef<THREE.InstancedMesh>(null);
  const gridRef = useRef<THREE.Group>(null);
  const [focusReadyNode, setFocusReadyNode] = useState<number | null>(null);
  const focused = selected != null;
  // Mission 00 intro: until the network is revealed, only the tutorial nodes (0..step) show, and
  // a small "light path" stands in for the full edge mesh. `introStep` = null once revealed.
  const introStep = game.networkRevealed ? null : game.mission00.step;
  const handleFocusReadyChange = useCallback(
    (i: number | null) => {
      setFocusReadyNode(i);
      onFocusReadyChange?.(i);
    },
    [onFocusReadyChange],
  );

  return (
    <Canvas
      flat
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 70, near: 0.1, far: 1600, position: SPAWN }}
    >
      <color attach="background" args={['#000000']} />
      <fogExp2 attach="fog" args={['#000000', fogDensity]} />

      <FlyCamera
        selected={selected}
        onSelect={onSelect}
        onHoverChange={onHoverChange}
        onLockChange={onLockChange}
        hitRef={hitRef}
        gridRef={gridRef}
        diveSeed={game.depthSeed}
        gatewayNode={game.gatewayNode}
        depth={game.currentDepth}
        onFocusReadyChange={handleFocusReadyChange}
        guideNode={guideNode}
      />

      {/* the whole network lives in one group that slowly counter-rotates while
          the camera orbits (idle space drift); frozen during focus/flight */}
      <group ref={gridRef}>
        <InstancedBackgroundNodes focused={focused} backgroundNoise={backgroundNoise} />
        {/* full edge mesh once revealed; during the intro a small light path stands in for it */}
        {introStep == null ? (
          <NodeConnections
            focused={focused}
            statuses={game.statuses}
            depth={game.currentDepth}
            signalWar={game.missionId >= 3}
            linkStabilized={game.linkStabilized}
            pulse={game.pulseActive}
          />
        ) : (
          <TutorialPath step={introStep} />
        )}
        {/* Mission 03: readable dashed/flicker overlay on the unstabilized corrupted links */}
        <CorruptedLinks
          signalWar={game.missionId >= 3}
          linkStabilized={game.linkStabilized}
          pulse={game.pulseActive}
          focused={focused}
          devScan={devScan}
        />
        {/* Mission 03: subtle camera-facing signal-ring around WATCHER (CAMERA) nodes */}
        <WatcherRings
          signalWar={game.missionId >= 3}
          depth={game.currentDepth}
          pulse={game.pulseActive}
          focused={focused}
        />
        {/* `scan` terminal command: silver kind-markers on nearby nodes */}
        <ScanLabels scanOn={scanOn} depth={game.currentDepth} />
        <InteractiveNodes
          meshRef={interactiveRef}
          selected={selected}
          focused={focused}
          statuses={game.statuses}
          depth={game.currentDepth}
          introStep={introStep}
        />
        <NodeHitProxies hitRef={hitRef} />
        <SelectedNodeFocus
          selected={selected}
          hovered={hovered}
          tracedFrom={game.tracedFrom}
          msgId={game.msgId}
          msgKind={game.message?.kind ?? null}
          extracted={selected != null && !!game.statuses[selected]?.extracted}
          isolated={selected != null && !!game.statuses[selected]?.isolated}
          decoy={selected != null && nodeType(selected, game.currentDepth) === 'DECOY'}
          depth={game.currentDepth}
        />
        {/* reusable mission-objective guidance — a subtle pulse on the current target node */}
        <ObjectiveMarker node={introStep == null ? objectiveNode ?? null : null} kind={objectiveKind} />
        <Subnetwork gatewayNode={game.gatewayNode} depthSeed={game.depthSeed} />
        {/* the player's private home grid (HOME node + installed module nodes) */}
        <PlayerSubnetwork sub={game.playerSubnetwork} />
        <DevScanOverlay
          depth={game.currentDepth}
          active={devScan}
          watcher={game.missionId >= 3}
          signalWar={game.missionId >= 3}
          linkStabilized={game.linkStabilized}
          homeNodeId={game.playerSubnetwork.unlocked ? game.playerSubnetwork.homeNodeId : null}
          coreNodeId={CORE_NODE_INDEX}
        />
        <NodePanelHost
          selected={selected}
          readyNode={focusReadyNode}
          game={game}
          dispatch={dispatch}
          onClose={() => onSelect(null)}
          suppressNode={game.playerSubnetwork.homeNodeId}
        />
      </group>

      <EffectComposer>
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={bloomThreshold}
          luminanceSmoothing={0.24}
          radius={0.6}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
