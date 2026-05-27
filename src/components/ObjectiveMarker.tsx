import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NETWORK } from '../network';
import type { ObjectiveVisualKind } from '../objectives';

/**
 * A subtle camera-facing pulse on the CURRENT mission objective node — so the player is guided to
 * the target instead of inspecting nodes one by one. Driven entirely by the reusable objective
 * resolver (GameApp passes the resolved target node + its visual kind, or null). Shown only when
 * the target is revealed and NOT the node already selected (the selection frame covers that one).
 *
 * Phase 4 — the marker now reflects the objective's CATEGORY (purely visual): a calm cyan ring for
 * DATA/VAULT, a sharp angular ring for FIREWALL/BLACK ROUTE, a red glitch flicker for STORM/
 * CORRUPTION, an expanding signal wave for RELAY, and a stronger central glow for the CORE.
 * Still one small group of additive meshes → negligible cost; respects the monochrome-ish aesthetic.
 */
interface KindStyle {
  color: string;
  speed: number; // pulse frequency
  scale: number; // base radius multiplier
  baseOp: number;
  ampOp: number;
  angular: boolean; // firewall — low-segment polygonal ring
  glow: boolean; // core — soft additive disc behind the ring
  wave: boolean; // relay — ring expands outward then resets
  flicker: boolean; // corruption — jittery opacity
}

const KINDS: Record<ObjectiveVisualKind, KindStyle> = {
  data: { color: '#cfe6ff', speed: 2.1, scale: 1.0, baseOp: 0.22, ampOp: 0.36, angular: false, glow: false, wave: false, flicker: false },
  firewall: { color: '#bcd2ff', speed: 1.5, scale: 0.96, baseOp: 0.26, ampOp: 0.34, angular: true, glow: false, wave: false, flicker: false },
  corruption: { color: '#ff8f8f', speed: 4.6, scale: 1.0, baseOp: 0.2, ampOp: 0.46, angular: false, glow: false, wave: false, flicker: true },
  relay: { color: '#a9e0d2', speed: 2.0, scale: 1.0, baseOp: 0.18, ampOp: 0.34, angular: false, glow: false, wave: true, flicker: false },
  core: { color: '#e4f0ff', speed: 1.7, scale: 1.28, baseOp: 0.3, ampOp: 0.44, angular: false, glow: true, wave: false, flicker: false },
};

export default function ObjectiveMarker({
  node,
  kind = 'data',
}: {
  node: number | null;
  kind?: ObjectiveVisualKind;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const ringMat = useRef<THREE.MeshBasicMaterial>(null!);
  const glowMat = useRef<THREE.MeshBasicMaterial>(null!);
  const st = KINDS[kind];

  // smooth ring for most kinds; a low-segment (octagonal) ring for the angular FIREWALL look.
  const ringGeo = useMemo(
    () => (st.angular ? new THREE.RingGeometry(2.7, 3.25, 8) : new THREE.RingGeometry(2.6, 3.05, 56)),
    [st.angular],
  );
  const glowGeo = useMemo(() => new THREE.CircleGeometry(2.5, 40), []);

  useFrame((state) => {
    const g = groupRef.current;
    if (node == null || !g) return;
    g.quaternion.copy(state.camera.quaternion); // billboard toward the camera
    const t = state.clock.elapsedTime;
    let scale: number;
    let op: number;
    if (st.wave) {
      // RELAY — a signal wave that expands outward and resets (calm sawtooth)
      const w = (t * 0.62) % 1;
      scale = st.scale * (0.7 + w * 0.95);
      op = st.baseOp + (1 - w) * st.ampOp;
    } else {
      let pulse = 0.5 + 0.5 * Math.sin(t * st.speed);
      // CORRUPTION — overlay a faster jitter so it reads as an unstable glitch (still bounded)
      if (st.flicker) pulse *= 0.55 + 0.45 * Math.abs(Math.sin(t * 13.0) * Math.cos(t * 5.0));
      scale = st.scale * (0.85 + 0.16 * pulse);
      op = st.baseOp + st.ampOp * pulse;
    }
    g.scale.setScalar(scale);
    if (ringMat.current) ringMat.current.opacity = op;
    if (st.angular) g.rotation.z = t * 0.25; // slow spin reads as a "locked" scanning border
    if (glowMat.current) glowMat.current.opacity = (st.baseOp + st.ampOp) * 0.5 * (0.6 + 0.4 * Math.sin(t * st.speed));
  });

  if (node == null) return null;
  const pos: [number, number, number] = [
    NETWORK.positions[node * 3],
    NETWORK.positions[node * 3 + 1],
    NETWORK.positions[node * 3 + 2],
  ];
  return (
    <group ref={groupRef} position={pos}>
      {/* CORE — a soft additive disc behind the ring for a stronger central glow */}
      {st.glow && (
        <mesh geometry={glowGeo} frustumCulled={false} position={[0, 0, -0.01]}>
          <meshBasicMaterial
            ref={glowMat}
            color={st.color}
            transparent
            opacity={0.3}
            toneMapped={false}
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
      <mesh geometry={ringGeo} frustumCulled={false}>
        <meshBasicMaterial
          ref={ringMat}
          color={st.color}
          transparent
          opacity={st.baseOp}
          toneMapped={false}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
