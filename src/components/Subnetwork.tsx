import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NETWORK } from '../network';
import { WORLD_SEED, mulberry32 } from '../world';

const C: [number, number, number][] = [
  [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5],
  [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5],
];
const E: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
];

interface Props {
  gatewayNode: number | null;
  depthSeed: number;
}

/**
 * A small wireframe sub-cluster that materialises around a GATEWAY node when
 * the player enters its subnetwork. Purely visual (keeps the same monochrome
 * style); remounts per depthSeed so each dive spawns a fresh cluster.
 */
export default function Subnetwork({ gatewayNode, depthSeed }: Props) {
  const groupRef = useRef<THREE.Group>(null!);
  const matRef = useRef<THREE.LineBasicMaterial>(null!);
  const life = useRef(0);

  const geometry = useMemo(() => {
    const verts: number[] = [];
    if (gatewayNode != null) {
      const rng = mulberry32((WORLD_SEED ^ (depthSeed * 0x9e37 + 1)) >>> 0);
      // deeper subnetworks materialise with a little more activity around the gateway
      const COUNT = 8 + Math.min(depthSeed, 4) * 2; // depth 02 → 10, depth 03 → 12 …
      const pts: [number, number, number][] = [];
      for (let i = 0; i < COUNT; i++) {
        const u = rng() * 2 - 1;
        const ang = rng() * Math.PI * 2;
        const rad = 3.5 + rng() * 4;
        const s = Math.sqrt(1 - u * u);
        const cx = Math.cos(ang) * s * rad;
        const cy = u * rad * 0.8;
        const cz = Math.sin(ang) * s * rad;
        pts.push([cx, cy, cz]);
        const e = 0.5 + rng() * 0.5; // small cube
        for (const [a, b] of E) {
          verts.push(cx + C[a][0] * e, cy + C[a][1] * e, cz + C[a][2] * e);
          verts.push(cx + C[b][0] * e, cy + C[b][1] * e, cz + C[b][2] * e);
        }
        // spoke back to the gateway centre
        verts.push(0, 0, 0, cx, cy, cz);
      }
      // inter-cluster links — a denser weave at deeper layers (more "activity")
      const span = depthSeed >= 2 ? 3 : 2;
      for (let k = 0; k < COUNT; k++) {
        const a = pts[k];
        const b = pts[(k + 2) % COUNT];
        verts.push(a[0], a[1], a[2], b[0], b[1], b[2]);
        const c = pts[(k + span) % COUNT];
        verts.push(a[0], a[1], a[2], c[0], c[1], c[2]);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3));
    return g;
  }, [gatewayNode, depthSeed]);

  useFrame((_, delta) => {
    life.current = Math.min(1, life.current + delta * 1.4);
    if (matRef.current) matRef.current.opacity = life.current * 0.6;
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.08;
  });

  if (gatewayNode == null || depthSeed === 0) return null;

  const pos: [number, number, number] = [
    NETWORK.positions[gatewayNode * 3],
    NETWORK.positions[gatewayNode * 3 + 1],
    NETWORK.positions[gatewayNode * 3 + 2],
  ];

  return (
    <group ref={groupRef} position={pos}>
      <lineSegments geometry={geometry} frustumCulled={false}>
        <lineBasicMaterial ref={matRef} color="#ffffff" transparent opacity={0} toneMapped={false} depthWrite={false} />
      </lineSegments>
    </group>
  );
}
