import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { INTERACTIVE_COUNT, NETWORK } from '../network';
import { nodeType, corruptEdgesAt, type NodeType } from '../game';
import { devScanInfo } from '../devscan';

// short, monochrome AR tags per important node type (others stay unlabelled)
const DEV_TAG: Partial<Record<NodeType, string>> = {
  GATEWAY: 'GATE',
  DECOY: 'DECOY',
  ARCHIVE: 'ARCH',
  LOCKED: 'LOCK',
  CAMERA: 'CAM',
};

// thin cube-edge bracket for the nearest-gateway locator marker
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

const posOf = (i: number): [number, number, number] => [
  NETWORK.positions[i * 3], NETWORK.positions[i * 3 + 1], NETWORK.positions[i * 3 + 2],
];

/**
 * Developer-only scan overlay (toggled with D). Renders small thin-white AR tags on the
 * important node types (GATEWAY/DECOY/ARCHIVE/LOCKED/CAMERA) and a pulsing bracket around
 * the nearest gateway (tracked live in `devScanInfo`). Mounted only while active, so it
 * costs nothing — and changes no node visuals — during normal play. Lives inside the grid
 * group so tags/marker follow the network as it rotates.
 */
export default function DevScanOverlay({
  depth,
  active,
  watcher = false,
  signalWar = false,
  linkStabilized = {},
  homeNodeId = null,
  coreNodeId = null,
}: {
  depth: number;
  active: boolean;
  watcher?: boolean; // Mission 03: CAMERA nodes are watchers (relabel)
  signalWar?: boolean; // Mission 03: also flag corrupted-link hubs
  linkStabilized?: Record<number, boolean>; // repaired corrupted edges (excluded from the hubs)
  homeNodeId?: number | null; // Player Subnetwork HOME node — labelled HOME when unlocked
  coreNodeId?: number | null; // Mission 07 CORE node (deep frontier) — labelled CORE
}) {
  const markerRef = useRef<THREE.Group>(null!);
  const markerMat = useRef<THREE.LineBasicMaterial>(null!);
  const bracketGeo = useMemo(() => cubeEdges(), []);

  const labels = useMemo(() => {
    if (!active) return [];
    const out: { i: number; tag: string; gw: boolean }[] = [];
    for (let i = 0; i < INTERACTIVE_COUNT; i++) {
      const t = nodeType(i, depth);
      const tag = watcher && t === 'CAMERA' ? 'WATCH' : DEV_TAG[t];
      if (tag) out.push({ i, tag, gw: tag === 'GATE' });
    }
    return out;
  }, [depth, active, watcher]);

  // Mission 03 dev aid: the worst remaining corrupted-link hubs (most unstabilized
  // corrupted edges still touching them) get a faint guide bracket + CORRUPT label, so a
  // developer can see at a glance where TRACE LINKS still has work. Capped so it stays a
  // clean annotation, not a wall of labels.
  const corruptHubs = useMemo(() => {
    if (!active || !signalWar) return [];
    const scored: { i: number; n: number }[] = [];
    for (let i = 0; i < INTERACTIVE_COUNT; i++) {
      let n = 0;
      for (const e of corruptEdgesAt(i)) if (!linkStabilized[e]) n++;
      if (n > 0) scored.push({ i, n });
    }
    scored.sort((a, b) => b.n - a.n);
    return scored.slice(0, 5);
  }, [active, signalWar, linkStabilized]);

  useFrame((state) => {
    const m = markerRef.current;
    if (!active || !m) return;
    const id = devScanInfo.nearestId;
    if (id < 0) {
      m.visible = false;
      return;
    }
    m.visible = true;
    m.position.set(NETWORK.positions[id * 3], NETWORK.positions[id * 3 + 1], NETWORK.positions[id * 3 + 2]);
    const t = state.clock.elapsedTime;
    m.scale.setScalar(2.6 + Math.sin(t * 3) * 0.5);
    m.rotation.y += 0.02;
    if (markerMat.current) markerMat.current.opacity = 0.6 + 0.3 * (0.5 + 0.5 * Math.sin(t * 3));
  });

  if (!active) return null;

  return (
    <group>
      {labels.map(({ i, tag, gw }) => {
        const p = posOf(i);
        return (
          <Html
            key={i}
            position={[p[0], p[1] + 1.1, p[2]]}
            center
            distanceFactor={26}
            zIndexRange={[12, 0]}
            style={{ pointerEvents: 'none' }}
          >
            <span className={`dev-tag${gw ? ' dev-tag--gw' : ''}`}>{tag}</span>
          </Html>
        );
      })}

      {/* faint guide brackets + CORRUPT labels on the worst remaining corrupted hubs */}
      {corruptHubs.map(({ i, n }) => {
        const p = posOf(i);
        return (
          <group key={`corrupt-${i}`}>
            <lineSegments geometry={bracketGeo} position={p} scale={3.4} frustumCulled={false}>
              <lineBasicMaterial
                color="#e08a8a"
                transparent
                opacity={0.42}
                toneMapped={false}
                depthWrite={false}
              />
            </lineSegments>
            <Html
              position={[p[0], p[1] - 2.2, p[2]]}
              center
              distanceFactor={26}
              zIndexRange={[12, 0]}
              style={{ pointerEvents: 'none' }}
            >
              <span className="dev-tag dev-tag--corrupt">CORRUPT {n}</span>
            </Html>
          </group>
        );
      })}

      {/* Player Subnetwork HOME node tag (only once the private grid is unlocked) */}
      {homeNodeId != null && (
        <Html
          position={[posOf(homeNodeId)[0], posOf(homeNodeId)[1] + 1.1, posOf(homeNodeId)[2]]}
          center
          distanceFactor={26}
          zIndexRange={[12, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <span className="dev-tag dev-tag--gw">HOME</span>
        </Html>
      )}

      {/* Mission 07 CORE node tag (the deep-frontier objective) */}
      {coreNodeId != null && (
        <Html
          position={[posOf(coreNodeId)[0], posOf(coreNodeId)[1] + 1.1, posOf(coreNodeId)[2]]}
          center
          distanceFactor={26}
          zIndexRange={[12, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <span className="dev-tag dev-tag--gw">CORE</span>
        </Html>
      )}

      {/* pulsing bracket around the nearest gateway (the locator) */}
      <group ref={markerRef} frustumCulled={false}>
        <lineSegments geometry={bracketGeo} frustumCulled={false}>
          <lineBasicMaterial
            ref={markerMat}
            color="#ffffff"
            transparent
            opacity={0.8}
            toneMapped={false}
            depthWrite={false}
          />
        </lineSegments>
      </group>
    </group>
  );
}
