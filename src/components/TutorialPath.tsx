import { useMemo } from 'react';
import * as THREE from 'three';
import { NETWORK } from '../network';
import { TUTORIAL_NODES } from '../game';

/**
 * Mission 00 "light path" — faint silver segments linking the revealed tutorial nodes
 * (node 0 → 1 → … → current step). Stands in for the full network's edges during the
 * guided intro, so the player sees a small controlled route grow one link at a time.
 */
export default function TutorialPath({ step }: { step: number }) {
  const geometry = useMemo(() => {
    const pos = NETWORK.positions;
    const segs = Math.max(0, Math.min(step, TUTORIAL_NODES.length - 1)); // links 0..step-1
    const verts = new Float32Array(segs * 2 * 3);
    let o = 0;
    for (let i = 0; i < segs; i++) {
      const a = TUTORIAL_NODES[i];
      const b = TUTORIAL_NODES[i + 1];
      verts[o++] = pos[a * 3]; verts[o++] = pos[a * 3 + 1]; verts[o++] = pos[a * 3 + 2];
      verts[o++] = pos[b * 3]; verts[o++] = pos[b * 3 + 1]; verts[o++] = pos[b * 3 + 2];
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    return g;
  }, [step]);

  if (step < 1) return null;
  return (
    <lineSegments geometry={geometry} frustumCulled={false}>
      <lineBasicMaterial color="#9fb4c8" transparent opacity={0.55} toneMapped={false} />
    </lineSegments>
  );
}
