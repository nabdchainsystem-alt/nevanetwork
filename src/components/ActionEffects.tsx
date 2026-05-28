import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NETWORK } from '../network';
import type { FxEvent } from '../actionFx';

/**
 * Transient, GPU-light cinematic accents for successful actions (Visual Upgrade Pass v2). Purely
 * visual — events are derived from game-state transitions (see actionFx.ts), live only briefly, and
 * are pruned by the parent. Each active event renders a small composition of thin additive frames /
 * a data streak / a flash, animated by normalized age. NEVA palette only: white / ice-blue / slate
 * / muted red — no colour, no arcade. Only a few exist at once (user-paced), so per-event groups are
 * cheap; geometries are shared module-level singletons.
 */

// palette (cool, restrained — additive + bloom give the glow)
const ICE = '#74c4ff';
const WHITE = '#dfeaff';
const SLATE = '#8c98b2';
const TEAL = '#7fe2ff';
const RED = '#e06a6a';
const GREEN = '#5cf0a0'; // secured-green (extract) — matches the node's extracted glow + panel edges

// shared geometries (built once) -------------------------------------------------
const _CR: [number, number, number][] = [
  [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5],
  [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5],
];
const _EG: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7],
];
function cubeEdges(): THREE.BufferGeometry {
  const v = new Float32Array(_EG.length * 2 * 3);
  let o = 0;
  for (const [a, b] of _EG) {
    v[o++] = _CR[a][0]; v[o++] = _CR[a][1]; v[o++] = _CR[a][2];
    v[o++] = _CR[b][0]; v[o++] = _CR[b][1]; v[o++] = _CR[b][2];
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(v, 3));
  return g;
}
const CUBE_EDGES = cubeEdges();

// a vertical dashed "data stream" trail along +Y (rises out of the node)
const STREAK_GEO = (() => {
  const dashes: [number, number][] = [[0, 0.18], [0.34, 0.52], [0.68, 0.86], [1.02, 1.2]];
  const v = new Float32Array(dashes.length * 2 * 3);
  let o = 0;
  for (const [y0, y1] of dashes) {
    v[o++] = 0; v[o++] = y0; v[o++] = 0;
    v[o++] = 0; v[o++] = y1; v[o++] = 0;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(v, 3));
  return g;
})();

// N lines from a surrounding shell inward to the node (gateway route convergence)
const CONVERGE_GEO = (() => {
  const pts: [number, number, number][] = [
    [1, 0.4, 0.2], [-1, 0.3, -0.3], [0.3, 1, -0.2], [-0.2, -1, 0.3], [0.2, 0.3, 1], [-0.3, -0.2, -1],
    [0.8, -0.6, 0.5], [-0.7, 0.6, 0.6], [0.6, 0.7, -0.7], [-0.6, -0.7, -0.6], [0.9, 0.1, -0.6], [-0.9, -0.1, 0.6],
  ];
  const R = 3.4;
  const v = new Float32Array(pts.length * 2 * 3);
  let o = 0;
  for (const p of pts) {
    const n = Math.hypot(p[0], p[1], p[2]) || 1;
    v[o++] = (p[0] / n) * R; v[o++] = (p[1] / n) * R; v[o++] = (p[2] / n) * R;
    v[o++] = 0; v[o++] = 0; v[o++] = 0;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(v, 3));
  return g;
})();

const easeOut = (t: number) => 1 - Math.pow(1 - t, 2);

// --- animated primitives (mutate only via refs → React-Compiler safe) ---

function FramePulse({ startedAt, dur, delay = 0, color, from, to, opacity0 = 0.9 }: {
  startedAt: number; dur: number; delay?: number; color: string; from: number; to: number; opacity0?: number;
}) {
  const grp = useRef<THREE.Group>(null!);
  const mat = useRef<THREE.LineBasicMaterial>(null!);
  useFrame(() => {
    const lt = (performance.now() - startedAt - delay) / dur;
    if (lt < 0) { grp.current.visible = false; return; }
    grp.current.visible = true;
    const t = Math.min(1, lt);
    grp.current.scale.setScalar(from + (to - from) * easeOut(t));
    mat.current.opacity = opacity0 * (1 - t);
  });
  return (
    <group ref={grp} visible={false}>
      <lineSegments geometry={CUBE_EDGES}>
        <lineBasicMaterial ref={mat} color={color} transparent opacity={0} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </group>
  );
}

function CoreFlash({ startedAt, dur, color, max = 1 }: { startedAt: number; dur: number; color: string; max?: number }) {
  const mesh = useRef<THREE.Mesh>(null!);
  const mat = useRef<THREE.MeshBasicMaterial>(null!);
  useFrame(() => {
    const t = Math.min(1, (performance.now() - startedAt) / dur);
    mesh.current.scale.setScalar(0.3 + max * Math.sin(t * Math.PI) * 0.7); // pop: grow then shrink
    mat.current.opacity = 0.85 * (1 - t);
  });
  return (
    <mesh ref={mesh}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial ref={mat} color={color} transparent opacity={0} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

function Streak({ startedAt, dur, color }: { startedAt: number; dur: number; color: string }) {
  const grp = useRef<THREE.Group>(null!);
  const mat = useRef<THREE.LineBasicMaterial>(null!);
  useFrame(() => {
    const t = Math.min(1, (performance.now() - startedAt) / dur);
    grp.current.position.y = easeOut(t) * 6; // pulled upward / out of the node
    mat.current.opacity = 0.9 * (1 - t);
  });
  return (
    <group ref={grp}>
      <lineSegments geometry={STREAK_GEO}>
        <lineBasicMaterial ref={mat} color={color} transparent opacity={0} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </group>
  );
}

function Convergence({ startedAt, dur, color }: { startedAt: number; dur: number; color: string }) {
  const grp = useRef<THREE.Group>(null!);
  const mat = useRef<THREE.LineBasicMaterial>(null!);
  useFrame(() => {
    const t = Math.min(1, (performance.now() - startedAt) / dur);
    grp.current.scale.setScalar(1 - 0.94 * easeOut(t)); // outer endpoints sweep inward to the node
    mat.current.opacity = 0.85 * Math.sin(t * Math.PI); // fade in then out
  });
  return (
    <group ref={grp}>
      <lineSegments geometry={CONVERGE_GEO}>
        <lineBasicMaterial ref={mat} color={color} transparent opacity={0} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </group>
  );
}

function Glitch({ startedAt, dur }: { startedAt: number; dur: number }) {
  const grp = useRef<THREE.Group>(null!);
  const mat = useRef<THREE.LineBasicMaterial>(null!);
  useFrame(() => {
    const t = Math.min(1, (performance.now() - startedAt) / dur);
    const j = (1 - t) * 0.45;
    grp.current.position.set(Math.sin(t * 97) * j, Math.cos(t * 131) * j, Math.sin(t * 53) * j); // deterministic jitter
    grp.current.scale.setScalar(1.2 + 0.25 * Math.sin(t * 40));
    mat.current.opacity = 0.85 * (1 - t);
  });
  return (
    <group ref={grp}>
      <lineSegments geometry={CUBE_EDGES}>
        <lineBasicMaterial ref={mat} color={RED} transparent opacity={0} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </group>
  );
}

function ActionEffectItem({ ev }: { ev: FxEvent }) {
  if (ev.nodeId == null) return null;
  const i = ev.nodeId;
  const pos: [number, number, number] = [NETWORK.positions[i * 3], NETWORK.positions[i * 3 + 1], NETWORK.positions[i * 3 + 2]];
  const s = ev.startedAt;
  return (
    <group position={pos}>
      {ev.type === 'export' && (
        <>
          {/* slow, soft green extraction bloom — two staggered frames + a gentle core flash + the
              rising data streak; the node settles to its secured-green state underneath */}
          <FramePulse startedAt={s} dur={780} color={GREEN} from={0.7} to={3.4} opacity0={0.85} />
          <FramePulse startedAt={s} dur={620} delay={140} color={GREEN} from={0.7} to={2.4} opacity0={0.5} />
          <CoreFlash startedAt={s} dur={560} color={GREEN} max={1.05} />
          <Streak startedAt={s} dur={820} color={GREEN} />
        </>
      )}
      {ev.type === 'trace' && (
        <>
          <FramePulse startedAt={s} dur={520} color={WHITE} from={0.7} to={3.6} />
          <FramePulse startedAt={s} dur={420} delay={90} color={ICE} from={0.7} to={2.4} opacity0={0.6} />
        </>
      )}
      {ev.type === 'isolate' && (
        <>
          <FramePulse startedAt={s} dur={460} color={SLATE} from={2.8} to={1.3} />
          <FramePulse startedAt={s} dur={420} delay={200} color={SLATE} from={1.5} to={1.5} opacity0={0.5} />
        </>
      )}
      {ev.type === 'openStream' && (
        <>
          <FramePulse startedAt={s} dur={460} color={ICE} from={0.7} to={2.2} />
          <FramePulse startedAt={s} dur={420} delay={120} color={ICE} from={0.7} to={3.0} opacity0={0.55} />
        </>
      )}
      {ev.type === 'enterSubnetwork' && (
        <>
          <Convergence startedAt={s} dur={620} color={ICE} />
          <FramePulse startedAt={s} dur={500} delay={340} color={WHITE} from={1.0} to={4.2} opacity0={0.8} />
        </>
      )}
      {ev.type === 'coreSecure' && (
        <>
          <FramePulse startedAt={s} dur={900} color={TEAL} from={1.0} to={4.6} opacity0={0.95} />
          <FramePulse startedAt={s} dur={760} delay={170} color={TEAL} from={1.0} to={3.0} opacity0={0.7} />
          <CoreFlash startedAt={s} dur={540} color={TEAL} max={1.2} />
        </>
      )}
      {ev.type === 'fail' && <Glitch startedAt={s} dur={360} />}
    </group>
  );
}

/** Renders all currently-active action FX. Lives inside the rotating network group. */
export default function ActionEffects({ events }: { events: FxEvent[] }) {
  return <>{events.map((ev) => <ActionEffectItem key={ev.id} ev={ev} />)}</>;
}
