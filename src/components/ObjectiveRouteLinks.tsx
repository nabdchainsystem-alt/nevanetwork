import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NETWORK } from '../network';
import type { ObjectiveVisualKind } from '../objectives';
import { ROUTE_KINDS, createRouteLinkMaterial } from '../visual/nevaMaterials';

/**
 * The "living route" to the current mission objective (Visual Upgrade Pass v3 · links).
 *
 * Draws the (≤3) edges connecting the objective node to its neighbours as a flowing line that
 * travels TOWARD the node, tinted by the objective's visual kind — a teal-ice gateway/core route, a
 * striped "blocked" firewall route, an unstable red corruption route, a calm relay flow. This makes
 * the path to the goal read as a live route instead of plain gray links.
 *
 * Purely visual + cheap (one node's edges → one draw call); never touches gameplay or picking. It
 * complements ObjectiveMarker (which rings the node) and is driven by the SAME gated `node` prop, so
 * it only shows when the objective is NOT the selected node — it never fights SelectedNodeFocus's
 * own trace links.
 */
export default function ObjectiveRouteLinks({
  node,
  kind = 'data',
}: {
  node: number | null;
  kind?: ObjectiveVisualKind;
}) {
  const ref = useRef<THREE.LineSegments>(null!);
  const material = useMemo(() => createRouteLinkMaterial(ROUTE_KINDS[kind]), [kind]);

  const geometry = useMemo(() => {
    if (node == null) return null;
    const p = NETWORK.positions;
    const ni = NETWORK.neighbours[node] ?? [];
    if (ni.length === 0) return null;
    const nx = p[node * 3], ny = p[node * 3 + 1], nz = p[node * 3 + 2];
    const verts = new Float32Array(ni.length * 2 * 3);
    const param = new Float32Array(ni.length * 2); // 0 at the neighbour → 1 at the node (flow toward node)
    const len = new Float32Array(ni.length * 2);
    let o = 0;
    let pi = 0;
    for (const j of ni) {
      const jx = p[j * 3], jy = p[j * 3 + 1], jz = p[j * 3 + 2];
      verts[o++] = jx; verts[o++] = jy; verts[o++] = jz; // far endpoint (param 0)
      verts[o++] = nx; verts[o++] = ny; verts[o++] = nz; // objective node (param 1)
      const d = Math.hypot(nx - jx, ny - jy, nz - jz);
      param[pi] = 0; param[pi + 1] = 1;
      len[pi] = d; len[pi + 1] = d;
      pi += 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    g.setAttribute('aParam', new THREE.BufferAttribute(param, 1));
    g.setAttribute('aLen', new THREE.BufferAttribute(len, 1));
    return g;
  }, [node]);

  useFrame((state) => {
    const m = ref.current?.material as THREE.ShaderMaterial | undefined;
    if (m) m.uniforms.uTime.value = state.clock.elapsedTime;
  });

  if (node == null || !geometry) return null;
  return <lineSegments ref={ref} geometry={geometry} material={material} frustumCulled={false} />;
}
