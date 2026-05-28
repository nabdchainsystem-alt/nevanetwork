import { useCallback, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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
import ObjectiveRouteLinks from './ObjectiveRouteLinks';
import SectorA02Field from './SectorA02Field';
import NodePanelHost from './NodePanelHost';
import Subnetwork from './Subnetwork';
import PlayerSubnetwork from './PlayerSubnetwork';
import DevScanOverlay from './DevScanOverlay';
import ActionEffects from './ActionEffects';
import { SPAWN } from '../world';
import { nodeType, CORE_NODE_INDEX, type GameState, type GameAction } from '../game';
import { getPreset, resolveAtmosphere, FOG_INITIAL } from '../visual/nevaMaterials';
import { SECTOR_A02 } from '../sectorGen';
import type { ObjectiveVisualKind } from '../objectives';

// A02 establishing-shot framing — derived once from the generated grid's bounding radius so the
// camera starts FAR enough back to see the whole larger network (not inside the empty inner region).
const A02_OVERVIEW_RADIUS = SECTOR_A02.bounds.radius * 1.5;
const A02_OVERVIEW_HEIGHT = SECTOR_A02.bounds.radius * 0.2;
// background star-dust spread for A02 — scales the A01 dust field up to surround the larger world
// (A01 dust halo ≈ FIELD.radius·1.25 ≈ 162; ×3 ≈ 486 ≈ the A02 overview radius).
const A02_DUST_SPREAD = 3;

/**
 * Eases the scene's exp² fog density toward the live sector/depth target (Visual Upgrade Pass v6),
 * so moving deeper / into Sector A02 fades the atmosphere in smoothly instead of snapping. Mutates
 * the existing fog object (created once with a stable initial density) — no allocation per frame.
 */
function SectorAtmosphere({ fog }: { fog: number }) {
  const { scene } = useThree();
  useFrame((_, delta) => {
    const f = scene.fog as THREE.FogExp2 | null;
    if (f && (f as THREE.FogExp2).isFogExp2) {
      // eslint-disable-next-line react-hooks/immutability -- intentional per-frame ease of the three.js scene fog (standard R3F idiom; no setter to call)
      f.density += (fog - f.density) * (1 - Math.exp(-1.4 * Math.min(delta, 0.05)));
    }
  });
  return null;
}
import type { BackgroundNoise } from '../uiSettings';
import type { FxEvent } from '../actionFx';

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
  actionFx: FxEvent[]; // transient cinematic action effects (Visual Upgrade Pass v2)
  enhanced: boolean; // VISUAL MODE (K): ENHANCED premium look vs CLASSIC flat baseline
  showLinks: boolean; // settings toggle — fully show or fully hide all connection lines / routes
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
  actionFx,
  enhanced,
  showLinks,
}: Props) {
  // Visual Upgrade Pass v6 — SECTOR / DEPTH atmosphere. The look now scales by BOTH the sector
  // (A01 Memory Grid = clean/readable → A02 Deep Network = deeper/heavier fog + more bloom) AND the
  // current depth (deeper = thicker fog, more bloom pressure, thinner far dust). Centralized in
  // `resolveAtmosphere`; combined with the VISUAL MODE (K) bloom base. Fog eases via SectorAtmosphere.
  const preset = getPreset(enhanced);
  // Sector A02 = the new procedural grid (free-scan). When entered, swap the A01 interactive layers
  // for the A02 field; A01 gameplay/rendering is otherwise completely untouched.
  const inA02 = game.sectorProgress.currentSector === 'A02';
  const atmo = resolveAtmosphere(inA02 ? 'A02' : 'A01', game.missionId, game.currentDepth, preset);
  const bloomIntensity = atmo.bloomIntensity;
  const bloomThreshold = atmo.bloomThreshold;
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
      {/* fog created once at a stable density; SectorAtmosphere eases it toward the live target */}
      <fogExp2 attach="fog" args={['#000000', FOG_INITIAL]} />
      <SectorAtmosphere fog={atmo.fogDensity} />

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
        enhanced={enhanced}
        overviewRadius={inA02 ? A02_OVERVIEW_RADIUS : undefined}
        overviewHeight={inA02 ? A02_OVERVIEW_HEIGHT : undefined}
        flightSpeedScale={inA02 ? 1.3 : 1}
      />

      {/* the whole network lives in one group that slowly counter-rotates while
          the camera orbits (idle space drift); frozen during focus/flight */}
      <group ref={gridRef}>
        <InstancedBackgroundNodes focused={focused} backgroundNoise={backgroundNoise} atmoOpacity={atmo.particleOpacity} spread={inA02 ? A02_DUST_SPREAD : 1} />

        {/* SECTOR A02 — the new, larger procedural grid (free-scan). Mounts + plays its progressive
            reveal only once the player has entered A02. A01 layers below are hidden while in A02. */}
        {inA02 && <SectorA02Field enhanced={enhanced} devScan={devScan} showLinks={showLinks} />}

        {/* ───────── SECTOR A01 interactive layers (Missions 00–20) — hidden while in A02 ───────── */}
        {!inA02 && (<>
        {/* full edge mesh once revealed; during the intro a small light path stands in for it.
            The settings "NETWORK LINES: HIDDEN" toggle removes the resting connection lines (the
            guided TutorialPath stays so onboarding isn't broken). */}
        {introStep == null ? (
          showLinks && (
            <NodeConnections
              focused={focused}
              statuses={game.statuses}
              depth={game.currentDepth}
              signalWar={game.missionId >= 3}
              linkStabilized={game.linkStabilized}
              pulse={game.pulseActive}
              enhanced={enhanced}
              devScan={devScan}
            />
          )
        ) : (
          <TutorialPath step={introStep} />
        )}
        {/* Mission 03: readable dashed/flicker overlay on the unstabilized corrupted links */}
        {showLinks && (
          <CorruptedLinks
            signalWar={game.missionId >= 3}
            linkStabilized={game.linkStabilized}
            pulse={game.pulseActive}
            focused={focused}
            devScan={devScan}
          />
        )}
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
          coreNode={CORE_NODE_INDEX}
          homeNode={game.playerSubnetwork.unlocked ? game.playerSubnetwork.homeNodeId : null}
          enhanced={enhanced}
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
          enhanced={enhanced}
          showLinks={showLinks}
        />
        {/* reusable mission-objective guidance — a subtle pulse on the current target node */}
        <ObjectiveMarker node={introStep == null ? objectiveNode ?? null : null} kind={objectiveKind} />
        {/* a flowing "living route" along the edges leading to that objective node (kind-tinted) */}
        {showLinks && <ObjectiveRouteLinks node={introStep == null ? objectiveNode ?? null : null} kind={objectiveKind} />}
        {/* transient cinematic action FX (export/trace/isolate/openStream/dive/core/fail) */}
        <ActionEffects events={actionFx} />
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
        </>)}
      </group>

      <EffectComposer>
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={bloomThreshold}
          luminanceSmoothing={0.3}
          radius={0.55}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
