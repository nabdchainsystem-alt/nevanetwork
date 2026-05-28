import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SECTOR_A02 } from '../sectorGen';
import { createFadeLineMaterial, patchNodeDepthFade } from '../fadeMaterials';
import { ROUTE_STYLES } from '../visual/routes';

/**
 * Sector A02 — the new, larger procedural grid (free-scan; no missions yet). Rendered only when the
 * player has entered A02. Uses the SAME node/cube/link visual language as A01 (soft translucent core
 * + additive hollow edge-frame + faded link lines), driven from the deterministic `SECTOR_A02` data.
 *
 * On mount it plays a PROGRESSIVE REVEAL ("new world loaded"): nodes bloom in from the centre
 * outward, then the routes draw between them, then the special anchors settle — ~3.6s, premium and
 * smooth. Batched (3 draw calls); the per-node reveal writes stop once settled (no idle cost).
 *
 * Purely visual — no gameplay, picking, or state. (A02 interaction is wired by future missions.)
 */

// A02 is a much larger world than A01 → nodes are scaled UP so they read as chunky data cubes across
// the wide space (A01 uses ~0.56 / 0.92; at A02's spread those would be sub-pixel "empty dust").
const FRAME_SCALE = 2.6; // hollow edge-frame size (the cube outline the bloom turns into a glow)
const CORE_SCALE = 1.7; // soft inner core size
const FADE_NEAR: [number, number] = [4, 34];
const FADE_FAR: [number, number] = [460, 920]; // far-fade pushed out so the whole big grid reads, only the deep frontier melts
const REVEAL_MS = 4600; // grander, staggered reveal for the bigger grid

// cube corner + 12-edge topology (hollow frame, no face diagonals)
const CR: [number, number, number][] = [
  [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5],
  [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5],
];
const EG: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7],
];
const VPN = EG.length * 2; // verts per node (24)

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();
const _c = new THREE.Color();

// per-node visual KIND (deterministic anchors) → tint. Muted NEVA palette (additive + bloom glow).
const KIND_NORMAL = 0, KIND_CORRUPT = 1, KIND_FIREWALL = 2, KIND_GATEWAY = 3, KIND_CORE = 4;
const tintFor = (kind: number, b: number): [number, number, number] => {
  switch (kind) {
    case KIND_CORRUPT: return [0.82 * b, 0.34 * b, 0.34 * b]; // muted danger red
    case KIND_FIREWALL: return [0.6 * b, 0.66 * b, 0.78 * b]; // dim/blocked cool
    case KIND_GATEWAY: return [0.6 * b, 0.88 * b, 1.02 * b]; // teal route
    case KIND_CORE: return [0.62 * b, 0.98 * b, 1.2 * b]; // premium teal-ice
    default: return [b, b, b]; // ACTIVE white/ice
  }
};
const smoothstep = (a: number, c: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (c - a)));
  return t * t * (3 - 2 * t);
};

export default function SectorA02Field({ enhanced = true, devScan = false, showLinks = true }: { enhanced?: boolean; devScan?: boolean; showLinks?: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const edgeRef = useRef<THREE.LineSegments>(null!);
  const linkRef = useRef<THREE.LineSegments>(null!);
  const start = useRef<number>(-1);
  const done = useRef(false);

  const net = SECTOR_A02.net;
  const count = net.positions.length / 3;

  // per-node static data: base brightness, kind, reveal threshold (centre-out), built once
  const stat = useMemo(() => {
    const bright = new Float32Array(count);
    const kind = new Uint8Array(count);
    const revealAt = new Float32Array(count);
    const sp = SECTOR_A02.special;
    const cs = new Set(sp.corruption), fs = new Set(sp.firewalls), gs = new Set(sp.gateways);
    let maxD = 1;
    for (let i = 0; i < count; i++) {
      const d = Math.hypot(net.positions[i * 3], net.positions[i * 3 + 1], net.positions[i * 3 + 2]);
      if (d > maxD) maxD = d;
    }
    for (let i = 0; i < count; i++) {
      bright[i] = 0.66 + (net.meta[i].signal - 70) / 70;
      kind[i] = i === sp.core ? KIND_CORE : gs.has(i) ? KIND_GATEWAY : cs.has(i) ? KIND_CORRUPT : fs.has(i) ? KIND_FIREWALL : KIND_NORMAL;
      const d = Math.hypot(net.positions[i * 3], net.positions[i * 3 + 1], net.positions[i * 3 + 2]);
      revealAt[i] = 0.12 + (d / maxD) * 0.52; // centre nodes appear first, frontier last
    }
    return { bright, kind, revealAt };
  }, [net, count]);

  const coreMat = useMemo(() => {
    const m = new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: 0.7, depthWrite: false });
    patchNodeDepthFade(m, FADE_NEAR, FADE_FAR);
    return m;
  }, []);
  const edgeMat = useMemo(
    () => createFadeLineMaterial({ opacity: 0.5, near: FADE_NEAR, far: FADE_FAR, blending: THREE.AdditiveBlending }),
    [],
  );
  const linkMat = useMemo(
    () => createFadeLineMaterial({ opacity: 0.0, near: FADE_NEAR, far: [440, 880], flicker: 0.12 }),
    [],
  );

  const edgeGeo = useMemo(() => {
    const verts = new Float32Array(count * VPN * 3);
    let o = 0;
    for (let i = 0; i < count; i++) {
      const px = net.positions[i * 3], py = net.positions[i * 3 + 1], pz = net.positions[i * 3 + 2];
      for (const [a, b] of EG) {
        verts[o++] = px + CR[a][0] * FRAME_SCALE; verts[o++] = py + CR[a][1] * FRAME_SCALE; verts[o++] = pz + CR[a][2] * FRAME_SCALE;
        verts[o++] = px + CR[b][0] * FRAME_SCALE; verts[o++] = py + CR[b][1] * FRAME_SCALE; verts[o++] = pz + CR[b][2] * FRAME_SCALE;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * VPN * 3), 3));
    return g;
  }, [net, count]);

  const linkGeo = useMemo(() => {
    const { edges, positions } = net;
    const kind = SECTOR_A02.routeKind;
    // VISIBLE-ROUTE tiering (per-edge vertex colour magnitude = relative opacity within the mesh):
    // STRUCTURAL local links read as a faint cluster hint; the long BRIDGE routes read as bright
    // teal-ice GATEWAY routes (the meaningful "this links the constellations / suggests scale" lines).
    const SR = ROUTE_STYLES.STRUCTURAL.color;
    const BR = ROUTE_STYLES.GATEWAY_ROUTE.color;
    const SM = 0.5; // structural magnitude (faint)
    const BM = 1.0; // bridge magnitude (prominent)
    const verts = new Float32Array(edges.length * 2 * 3);
    const cols = new Float32Array(edges.length * 2 * 3);
    let o = 0;
    let co = 0;
    for (let e = 0; e < edges.length; e++) {
      const [a, b] = edges[e];
      verts[o++] = positions[a * 3]; verts[o++] = positions[a * 3 + 1]; verts[o++] = positions[a * 3 + 2];
      verts[o++] = positions[b * 3]; verts[o++] = positions[b * 3 + 1]; verts[o++] = positions[b * 3 + 2];
      const bridge = kind[e] === 1;
      const c = bridge ? BR : SR;
      const m = bridge ? BM : SM;
      for (let v = 0; v < 2; v++) { cols[co++] = c[0] * m; cols[co++] = c[1] * m; cols[co++] = c[2] * m; }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    return g;
  }, [net]);

  useFrame((state) => {
    if (start.current < 0) start.current = state.clock.elapsedTime;
    const elapsed = (state.clock.elapsedTime - start.current) * 1000;
    const p = Math.min(1, elapsed / REVEAL_MS);

    const mesh = meshRef.current;
    const edge = edgeRef.current;
    // NOTE: do NOT guard on `mesh.instanceColor` here — it's null until the first setColorAt() call
    // below allocates it. Guarding on it would skip the loop forever, leaving every instance at the
    // identity matrix (all stacked at the origin → one dot). instanceMatrix is always allocated.
    if (!mesh || !edge) return;
    const breath = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 0.55);

    // cheap global "alive" breath + link time — runs every frame (3 uniform writes), even after the
    // reveal settles, so the field keeps a subtle pulse without any per-node cost.
    const linkP = smoothstep(0.42, 0.9, p);
    const lm = linkRef.current?.material as THREE.ShaderMaterial | undefined;
    if (lm) {
      lm.uniforms.uTime.value = state.clock.elapsedTime;
      // tiered visibility: low global opacity keeps STRUCTURAL links a faint hint (≈0.08 effective)
      // while the brighter-coloured BRIDGE routes stay readable (≈0.25). Dev Scan lifts the whole
      // logical graph so all links show for debugging.
      lm.uniforms.uOpacity.value = (enhanced ? 0.32 : 0.36) * (devScan ? 2.0 : 1) * linkP;
    }
    (mesh.material as THREE.MeshBasicMaterial).opacity = 0.66 + 0.06 * breath;
    (edge.material as THREE.ShaderMaterial).uniforms.uOpacity.value = (enhanced ? 0.6 : 0.34) * (0.5 + 0.5 * p);

    if (done.current && p >= 1) return; // reveal settled — skip the per-node rewrite (no idle cost)

    _q.identity();
    const edgeCol = (edge.geometry.getAttribute('color') as THREE.BufferAttribute).array as Float32Array;

    for (let i = 0; i < count; i++) {
      const rv = smoothstep(stat.revealAt[i], stat.revealAt[i] + 0.14, p); // 0 → 1 as the wave passes
      const b = stat.bright[i] * (0.92 + 0.16 * breath) * rv;
      // HIDDEN TRAP rule (CLAUDE.md §7): a decoy/corrupt node renders as a NORMAL white node until an
      // action trips it — danger-red is earned, never decorative. A02 has no trip interaction yet, so
      // CORRUPT nodes read as normal white at rest (the `kind` data stays for the future tripped reveal).
      const displayKind = stat.kind[i] === KIND_CORRUPT ? KIND_NORMAL : stat.kind[i];
      const [r, gg, bb] = tintFor(displayKind, b);
      _c.setRGB(r, gg, bb);
      mesh.setColorAt(i, _c);
      _p.set(net.positions[i * 3], net.positions[i * 3 + 1], net.positions[i * 3 + 2]);
      _s.setScalar(CORE_SCALE * (0.4 + 0.6 * rv)); // pop in slightly as it reveals
      _m.compose(_p, _q, _s);
      mesh.setMatrixAt(i, _m);
      let o = i * VPN * 3;
      for (let v = 0; v < VPN; v++) { edgeCol[o++] = r; edgeCol[o++] = gg; edgeCol[o++] = bb; }
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true; // allocated by the setColorAt() above
    (edge.geometry.getAttribute('color') as THREE.BufferAttribute).needsUpdate = true;

    if (p >= 1) done.current = true;
  });

  return (
    <group>
      {/* connection lines / routes — removed when the settings "NETWORK LINES" toggle is HIDDEN
          (the node cubes + their edge frames always render) */}
      {showLinks && <lineSegments ref={linkRef} geometry={linkGeo} material={linkMat} frustumCulled={false} />}
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]} material={coreMat} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
      <lineSegments ref={edgeRef} geometry={edgeGeo} material={edgeMat} frustumCulled={false} />
    </group>
  );
}
