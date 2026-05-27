import { useLayoutEffect, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { INTERACTIVE_COUNT, NETWORK } from '../network';
import { nodeType, TUTORIAL_NODES, type NodeStatus } from '../game';

const BASE_SCALE = 0.95;

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();
const _c = new THREE.Color();

interface Props {
  meshRef: RefObject<THREE.InstancedMesh | null>;
  selected: number | null;
  focused: boolean;
  statuses: Record<number, NodeStatus>;
  depth: number; // current subnetwork depth — node types re-roll riskier at depth ≥ 2
  introStep: number | null; // Mission 00: when set, hide all but the revealed tutorial nodes (0..step)
}

/**
 * The clickable nodes — small glowing cubes, a touch brighter than the
 * background haze, sharing one InstancedMesh (exposed via meshRef for
 * raycasting). The selected node renders nothing here (collapsed to zero) — the
 * hollow AR focus frame in SelectedNodeFocus is its visual; the rest dim while
 * focused.
 */
export default function InteractiveNodes({ meshRef, selected, focused, statuses, depth, introStep }: Props) {
  const bright = useRef<Float32Array>(new Float32Array(INTERACTIVE_COUNT));
  // Mission 00 reveal gate: while `introStep` is set, only TUTORIAL_NODES[0..introStep] are shown.
  const revealed = introStep == null ? null : new Set(TUTORIAL_NODES.slice(0, introStep + 1));

  useLayoutEffect(() => {
    const mesh = meshRef.current!;
    _q.identity();
    for (let i = 0; i < INTERACTIVE_COUNT; i++) {
      _p.set(NETWORK.positions[i * 3], NETWORK.positions[i * 3 + 1], NETWORK.positions[i * 3 + 2]);
      _s.setScalar(BASE_SCALE);
      _m.compose(_p, _q, _s);
      mesh.setMatrixAt(i, _m);
      bright.current[i] = 0.7 + (NETWORK.meta[i].signal - 78) / 60;
      const b = bright.current[i];
      _c.setRGB(b, b, b);
      mesh.setColorAt(i, _c);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [meshRef]);

  // these nodes have no per-frame animation — their look is fully determined by
  // (selected, focused, statuses, depth). So only rebuild + re-upload the instance
  // buffers when one of those actually changes; idle frames cost nothing.
  const last = useRef<{ sel: number | null; focused: boolean; statuses: Record<number, NodeStatus> | null; depth: number; intro: number | null }>({
    sel: null,
    focused: false,
    statuses: null,
    depth: -1,
    intro: -2, // sentinel ≠ any real step / null, so the first frame always rebuilds
  });

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh || !mesh.instanceColor) return;
    const L = last.current;
    if (L.statuses === statuses && L.sel === selected && L.focused === focused && L.depth === depth && L.intro === introStep) {
      return; // nothing changed — skip the 220-instance rewrite + GPU upload
    }
    L.statuses = statuses;
    L.sel = selected;
    L.focused = focused;
    L.depth = depth;
    L.intro = introStep;
    _q.identity();
    for (let i = 0; i < INTERACTIVE_COUNT; i++) {
      const isSel = i === selected;
      let b: number;
      let sc: number;
      if (revealed && !revealed.has(i)) {
        // Mission 00: this node hasn't been revealed yet — collapse it away (also unclickable).
        b = 0;
        sc = 0;
      } else if (isSel) {
        // Selected node renders NO solid cube — the hollow AR focus frame in
        // SelectedNodeFocus is the entire visual. Collapse the instance away.
        b = 0;
        sc = 0;
      } else {
        b = focused ? bright.current[i] * 0.45 : bright.current[i];
        sc = BASE_SCALE;
      }
      // Restrained state palette — stays monochrome-leaning; only EXTRACTED and a
      // TRIPPED decoy carry any tint, both muted (never neon/arcade). DECOYs are
      // hidden traps: they look like normal active nodes until an action trips one.
      //   ACTIVE   white/gray (also dormant DECOYs)   EXTRACTED glowing green (secured)
      //   ISOLATED muted cool slate                   DECOY(tripped) muted danger red
      //   LOCKED   dim / blocked gray until traced or access-granted
      const st = statuses[i];
      const type = nodeType(i, depth);
      if (type === 'DECOY' && st?.extracted) {
        _c.setRGB(0.86, 0.27, 0.28); // tripped decoy — revealed muted red
      } else if (st?.extracted) {
        _c.setRGB(0.12, 1.15, 0.42); // secured node — overdriven green core blooms into a dark-green→black halo
      } else if (st?.isolated) {
        const d = b * 0.4;
        _c.setRGB(d * 0.85, d * 0.92, d * 1.06); // muted cool slate
      } else if (type === 'LOCKED' && !st?.unlocked) {
        const d = b * 0.5;
        _c.setRGB(d, d, d * 1.06); // dim / blocked until traced or access granted
      } else {
        _c.setRGB(b, b, b); // ACTIVE — also conceals dormant DECOYs (true traps)
      }
      mesh.setColorAt(i, _c);
      _p.set(NETWORK.positions[i * 3], NETWORK.positions[i * 3 + 1], NETWORK.positions[i * 3 + 2]);
      _s.setScalar(sc);
      _m.compose(_p, _q, _s);
      mesh.setMatrixAt(i, _m);
    }
    mesh.instanceColor.needsUpdate = true;
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, INTERACTIVE_COUNT]}
      frustumCulled={false}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial toneMapped={false} transparent opacity={1} />
    </instancedMesh>
  );
}
