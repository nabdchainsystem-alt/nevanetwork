import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { NETWORK } from '../network';
import { MODULE_DEFS, type PlayerSubnetwork as Sub } from '../game';

// thin cube-edge wireframe (same AR style as the node reticle / dev-scan marker)
const C: [number, number, number][] = [
  [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5],
  [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5],
];
const E: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
];
function cubeEdges(): THREE.BufferGeometry {
  const v = new Float32Array(E.length * 2 * 3);
  let o = 0;
  for (const [a, b] of E) {
    v[o++] = C[a][0]; v[o++] = C[a][1]; v[o++] = C[a][2];
    v[o++] = C[b][0]; v[o++] = C[b][1]; v[o++] = C[b][2];
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(v, 3));
  return g;
}

const RING_R = 7; // module-node distance from the HOME node
const RING_Y = 1.4; // slight lift so module nodes read above the home frame

/**
 * The player's private grid, rendered in-world (inside the rotating grid group). The HOME
 * node gets a brighter structured frame + a faint cube shell + an inner marker, and each
 * INSTALLED module appears as a small square-frame node on a ring around it, joined by a thin
 * line and a small marker label (VAULT / SHIELD / CACHE / RELAY) — "building your own network".
 * Monochrome, subtle. Mounts nothing until the subnetwork is unlocked.
 */
export default function PlayerSubnetwork({ sub }: { sub: Sub }) {
  const homeRef = useRef<THREE.Group>(null!);
  const modMats = useRef<THREE.LineBasicMaterial[]>([]);
  const cage = useMemo(() => cubeEdges(), []);
  const id = sub.homeNodeId;

  // installed module ring positions (computed unconditionally to keep hook order stable)
  const mods = useMemo(() => {
    if (id == null) return [];
    const hx = NETWORK.positions[id * 3];
    const hy = NETWORK.positions[id * 3 + 1];
    const hz = NETWORK.positions[id * 3 + 2];
    return MODULE_DEFS.map((def, k) => ({ def, lvl: sub.modules[def.id], k }))
      .filter((m) => m.lvl > 0)
      .map(({ def, lvl, k }) => {
        const ang = (k * Math.PI) / 2 + Math.PI / 4;
        return {
          id: def.id,
          marker: def.marker,
          lvl,
          x: hx + Math.cos(ang) * RING_R,
          y: hy + RING_Y,
          z: hz + Math.sin(ang) * RING_R,
        };
      });
  }, [id, sub.modules]);

  // thin lines HOME → each installed module
  const linkGeo = useMemo(() => {
    if (id == null || mods.length === 0) return null;
    const hx = NETWORK.positions[id * 3];
    const hy = NETWORK.positions[id * 3 + 1];
    const hz = NETWORK.positions[id * 3 + 2];
    const verts = new Float32Array(mods.length * 6);
    let o = 0;
    for (const m of mods) {
      verts[o++] = hx; verts[o++] = hy; verts[o++] = hz;
      verts[o++] = m.x; verts[o++] = m.y; verts[o++] = m.z;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    return g;
  }, [id, mods]);

  useFrame((state) => {
    if (!homeRef.current) return;
    const t = state.clock.elapsedTime;
    homeRef.current.rotation.y = t * 0.15; // slow self-rotation marks it as the "base"
    homeRef.current.scale.setScalar(2.7 + Math.sin(t * 0.8) * 0.08); // gentle breath
    // each installed module node breathes subtly (out of phase) — reads as "active"
    for (let i = 0; i < modMats.current.length; i++) {
      const mat = modMats.current[i];
      if (mat) mat.opacity = 0.55 + 0.22 * (0.5 + 0.5 * Math.sin(t * 1.6 + i * 1.3));
    }
  });

  if (!sub.unlocked || id == null) return null;
  const home: [number, number, number] = [
    NETWORK.positions[id * 3], NETWORK.positions[id * 3 + 1], NETWORK.positions[id * 3 + 2],
  ];

  return (
    <group>
      {/* HOME node — brighter structured frame + faint cube shell + inner marker */}
      <group position={home}>
        <group ref={homeRef}>
          <lineSegments geometry={cage} frustumCulled={false}>
            <lineBasicMaterial color="#ffffff" transparent opacity={0.85} toneMapped={false} depthWrite={false} />
          </lineSegments>
        </group>
        <mesh frustumCulled={false} scale={2.0}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#dfe8f2" transparent opacity={0.07} toneMapped={false} depthWrite={false} />
        </mesh>
        <mesh frustumCulled={false} scale={0.7}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} toneMapped={false} />
        </mesh>
      </group>

      {/* thin connecting lines to the installed module nodes */}
      {linkGeo && (
        <lineSegments geometry={linkGeo} frustumCulled={false}>
          <lineBasicMaterial color="#9fb6c8" transparent opacity={0.4} toneMapped={false} depthWrite={false} />
        </lineSegments>
      )}

      {/* installed module nodes + small markers (each subtly pulses to read as "active") */}
      {mods.map((m, i) => (
        <group key={m.id}>
          <lineSegments geometry={cage} position={[m.x, m.y, m.z]} scale={1.3} frustumCulled={false}>
            <lineBasicMaterial
              ref={(mat) => { if (mat) modMats.current[i] = mat; }}
              color="#ffffff"
              transparent
              opacity={0.7}
              toneMapped={false}
              depthWrite={false}
            />
          </lineSegments>
          <Html
            position={[m.x, m.y + 1.5, m.z]}
            center
            distanceFactor={26}
            zIndexRange={[12, 0]}
            style={{ pointerEvents: 'none' }}
          >
            <span className="psn-mod">{m.marker}{m.lvl > 1 ? ` ·${m.lvl}` : ''}</span>
          </Html>
        </group>
      ))}
    </group>
  );
}
