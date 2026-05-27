import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NETWORK } from '../network';
import { createFadeLineMaterial } from '../fadeMaterials';
import { nodeType, EDGE_CORRUPT, type NodeStatus } from '../game';

const BASE_OPACITY = 0.26;

// per-endpoint link colour by node state: decoys read red (hazard), links to
// extracted nodes fade toward cyan, isolated toward a dim gray, active normal.
function writeLinkCol(arr: Float32Array, o: number, st: NodeStatus | undefined, isDecoy: boolean) {
  // muted to match the restrained node palette (no neon); isolated links read dimmest.
  // dormant decoys stay neutral (hidden traps) — only a TRIPPED decoy reveals red.
  if (isDecoy && st?.extracted) { arr[o] = 0.58; arr[o + 1] = 0.2; arr[o + 2] = 0.21; }
  else if (st?.extracted) { arr[o] = 0.28; arr[o + 1] = 0.44; arr[o + 2] = 0.5; }
  else if (st?.isolated) { arr[o] = 0.18; arr[o + 1] = 0.2; arr[o + 2] = 0.26; }
  else { arr[o] = 0.55; arr[o + 1] = 0.55; arr[o + 2] = 0.55; }
}

// a corrupted (unstabilized) link in the Signal War layer — a faint gray-red caution,
// brighter while a signal pulse is active. Monochrome-leaning; never neon.
function writeCorruptCol(arr: Float32Array, o: number, pulse: boolean) {
  const r = pulse ? 0.62 : 0.4;
  arr[o] = r; arr[o + 1] = 0.26; arr[o + 2] = 0.27;
}

/**
 * The resting mesh of links between nearby nodes (NETWORK.edges) baked into one
 * LineSegments. Distance-faded so nothing smears the lens, dimmed while a node
 * is in focus, and tinted/dimmed toward extracted or isolated endpoints.
 */
export default function NodeConnections({
  focused,
  statuses,
  depth,
  signalWar,
  linkStabilized,
  pulse,
}: {
  focused: boolean;
  statuses: Record<number, NodeStatus>;
  depth: number; // node types (and thus decoy link tint) re-roll at depth ≥ 2
  signalWar: boolean; // Mission 03: show corrupted (unstabilized) links as caution
  linkStabilized: Record<number, boolean>; // repaired corrupted edge indices
  pulse: boolean; // a signal pulse is active (corrupted links brighten)
}) {
  const ref = useRef<THREE.LineSegments>(null!);
  const dim = useRef(1);

  const material = useMemo(
    () =>
      createFadeLineMaterial({
        opacity: BASE_OPACITY,
        near: [3, 18],
        far: [160, 320],
        flicker: 0.1,
      }),
    [],
  );

  const geometry = useMemo(() => {
    const { edges, positions } = NETWORK;
    const verts = new Float32Array(edges.length * 2 * 3);
    const cols = new Float32Array(edges.length * 2 * 3).fill(0.55);
    let o = 0;
    for (const [a, b] of edges) {
      verts[o++] = positions[a * 3];
      verts[o++] = positions[a * 3 + 1];
      verts[o++] = positions[a * 3 + 2];
      verts[o++] = positions[b * 3];
      verts[o++] = positions[b * 3 + 1];
      verts[o++] = positions[b * 3 + 2];
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    return g;
  }, []);

  // recolour link endpoints whenever node states change
  useEffect(() => {
    const colAttr = geometry.getAttribute('color') as THREE.BufferAttribute;
    const arr = colAttr.array as Float32Array;
    const { edges } = NETWORK;
    for (let e = 0; e < edges.length; e++) {
      const [a, b] = edges[e];
      // Mission 03: an unstabilized corrupted edge reads as caution on both ends
      if (signalWar && EDGE_CORRUPT[e] && !linkStabilized[e]) {
        writeCorruptCol(arr, 2 * e * 3, pulse);
        writeCorruptCol(arr, (2 * e + 1) * 3, pulse);
        continue;
      }
      writeLinkCol(arr, 2 * e * 3, statuses[a], nodeType(a, depth) === 'DECOY');
      writeLinkCol(arr, (2 * e + 1) * 3, statuses[b], nodeType(b, depth) === 'DECOY');
    }
    colAttr.needsUpdate = true;
  }, [statuses, geometry, depth, signalWar, linkStabilized, pulse]);

  useFrame((state, rawDelta) => {
    const mat = ref.current.material as THREE.ShaderMaterial;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    const target = focused ? 0.32 : 1;
    dim.current += (target - dim.current) * (1 - Math.exp(-4 * Math.min(rawDelta, 0.05)));
    // a signal pulse sends a subtle brightening wave through the whole network
    const pulseBoost = pulse ? 1.35 : 1;
    mat.uniforms.uOpacity.value = BASE_OPACITY * dim.current * pulseBoost;
  });

  return (
    <lineSegments
      ref={ref}
      geometry={geometry}
      material={material}
      frustumCulled={false}
    />
  );
}
