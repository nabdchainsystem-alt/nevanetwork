import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { INTERACTIVE_COUNT, NETWORK } from '../network';
import { nodeType } from '../game';

/**
 * `scan` overlay — a thin vertical silver-gradient line above each node with its KIND
 * labelled at the top. To stay un-noisy it only marks the nodes NEAR the camera (within
 * `SCAN_RADIUS`, capped at `MAX_MARKS`), each fading with distance; the far field stays
 * clean. Recomputed a few times a second (not every frame). Pure read-only annotation —
 * no game-rule effect — toggled on/off from the terminal.
 */

const SCAN_RADIUS = 58; // world units — only nodes this close show a marker
const MAX_MARKS = 30; // hard cap so a dense pocket never floods the view
const RECOMPUTE_S = 0.2; // ~5x/sec
const _w = new THREE.Vector3();

export default function ScanLabels({ scanOn, depth }: { scanOn: boolean; depth: number }) {
  const grpRef = useRef<THREE.Group>(null!);
  const acc = useRef(0);
  const sig = useRef('');
  const [marks, setMarks] = useState<{ i: number; d: number }[]>([]);
  const { camera } = useThree();

  // force a fresh recompute when scan (re)enables or the depth/layer changes (so kind
  // labels re-resolve). Only mutates a ref; the render is already gated on `scanOn`.
  useEffect(() => {
    sig.current = '';
  }, [scanOn, depth]);

  useFrame((_, dt) => {
    if (!scanOn) return;
    acc.current += dt;
    if (acc.current < RECOMPUTE_S) return;
    acc.current = 0;
    const grp = grpRef.current;
    if (!grp) return;
    grp.updateWorldMatrix(true, false); // node positions are local to the rotating grid group
    const near: { i: number; d: number }[] = [];
    for (let i = 0; i < INTERACTIVE_COUNT; i++) {
      _w.set(NETWORK.positions[i * 3], NETWORK.positions[i * 3 + 1], NETWORK.positions[i * 3 + 2])
        .applyMatrix4(grp.matrixWorld);
      const d = _w.distanceTo(camera.position);
      if (d < SCAN_RADIUS) near.push({ i, d });
    }
    near.sort((a, b) => a.d - b.d);
    if (near.length > MAX_MARKS) near.length = MAX_MARKS;
    const s = near.map((n) => n.i).join(',');
    if (s !== sig.current) {
      sig.current = s;
      setMarks(near);
    }
  });

  return (
    <group ref={grpRef}>
      {scanOn &&
        marks.map(({ i, d }) => {
          const x = NETWORK.positions[i * 3];
          const y = NETWORK.positions[i * 3 + 1];
          const z = NETWORK.positions[i * 3 + 2];
          return (
            <Html
              key={i}
              position={[x, y + 1.6, z]}
              center
              distanceFactor={30}
              zIndexRange={[14, 0]}
              style={{ pointerEvents: 'none' }}
            >
              <div className="scan-mark" style={{ opacity: Math.max(0.16, 1 - d / SCAN_RADIUS) }}>
                <span className="scan-mark__kind">{nodeType(i, depth)}</span>
                <span className="scan-mark__bar" />
              </div>
            </Html>
          );
        })}
    </group>
  );
}
