import { useLayoutEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { INTERACTIVE_COUNT, NETWORK } from '../network';
import { nodeType, TUTORIAL_NODES, type NodeStatus } from '../game';
import { createFadeLineMaterial, patchNodeDepthFade } from '../fadeMaterials';
import { getPreset } from '../visual/nevaMaterials';

// Each node reads as a premium holographic data cube: a SOFT translucent core (the volume) nested
// inside a CRISP hollow edge frame (the outline that catches the bloom). The frame is the larger
// silhouette; the core sits inside it.
const FRAME_SCALE = 0.92; // hollow edge-frame size (the cube outline)
const CORE_SCALE = 0.56; // soft inner core size

// shared depth fade for the interactive nodes — near nodes sharp, far nodes layer into the void.
const FADE_NEAR: [number, number] = [2, 16];
const FADE_FAR: [number, number] = [200, 360];

// cube corner + 12-edge topology for the hollow frame (no face diagonals → clean outline)
const CR: [number, number, number][] = [
  [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5],
  [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5],
];
const EG: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7],
];
const VERTS_PER_NODE = EG.length * 2; // 24

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
  coreNode: number; // designated CORE / ALPHA CORE node — premium objective glow
  homeNode: number | null; // the private-grid HOME node (once unlocked) — structured cool frame
  enhanced: boolean; // VISUAL MODE: ENHANCED = premium look (bright cores, strong edge shell, structural shells); CLASSIC = flat baseline
}

// unit cube-edge geometry for the ENHANCED structural shells (CORE layered shell / HOME frame)
function unitCubeEdges(): THREE.BufferGeometry {
  const v = new Float32Array(EG.length * 2 * 3);
  let o = 0;
  for (const [a, b] of EG) {
    v[o++] = CR[a][0]; v[o++] = CR[a][1]; v[o++] = CR[a][2];
    v[o++] = CR[b][0]; v[o++] = CR[b][1]; v[o++] = CR[b][2];
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(v, 3));
  return g;
}
const posOf = (i: number): [number, number, number] => [
  NETWORK.positions[i * 3], NETWORK.positions[i * 3 + 1], NETWORK.positions[i * 3 + 2],
];

/**
 * The clickable nodes. Each renders as a soft translucent core cube inside a crisp additive
 * hollow-edge frame, distance-faded (sharp near → fading into the void far) so the field reads as
 * a deep 3D volume, not a flat star map. The selected node renders nothing here (collapsed) — the
 * AR focus frame in SelectedNodeFocus is its visual; the rest dim while focused. Raycasting is on a
 * separate hit-proxy mesh, so this layer is purely visual.
 *
 * State colour language (gameplay-readable, recognizable): ACTIVE white/gray · EXTRACTED secured
 * green (glowing, matches panel edges) · ISOLATED muted slate · LOCKED dim/blocked cool · tripped DECOY muted red ·
 * CORE premium teal-ice glow · HOME / GATEWAY subtle structured cool tints. The look is HOW the
 * cube renders + a light per-identity tint — not a change to WHAT any state means.
 */
export default function InteractiveNodes({ meshRef, selected, focused, statuses, depth, introStep, coreNode, homeNode, enhanced }: Props) {
  const preset = getPreset(enhanced); // VISUAL MODE — drives core/edge opacity, brightness, breath, structural shells
  const shellGeo = useMemo(() => unitCubeEdges(), []);
  const bright = useRef<Float32Array>(new Float32Array(INTERACTIVE_COUNT));
  const edgeRef = useRef<THREE.LineSegments>(null!); // live handle to the frame mesh (mutate via ref, not the memo)
  // Mission 00 reveal gate: while `introStep` is set, only TUTORIAL_NODES[0..introStep] are shown.
  const revealed = introStep == null ? null : new Set(TUTORIAL_NODES.slice(0, introStep + 1));

  // soft translucent core — normal-blended so it reads as a calm volume (no additive blowout in
  // dense clusters), depth-faded so far cores melt into the fog.
  const coreMat = useMemo(() => {
    const m = new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: 0.66, depthWrite: false });
    patchNodeDepthFade(m, FADE_NEAR, FADE_FAR);
    return m;
  }, []);

  // crisp hollow edge frame — additive thin lines (the outline the bloom turns into a clean glow);
  // black-coloured verts vanish (additive), which is how a selected/unrevealed node's frame hides.
  const edgeMat = useMemo(
    () => createFadeLineMaterial({ opacity: 0.5, near: FADE_NEAR, far: FADE_FAR, blending: THREE.AdditiveBlending }),
    [],
  );

  // one merged LineSegments holding every node's 12 edges baked at its position (one draw call).
  const edgeGeo = useMemo(() => {
    const verts = new Float32Array(INTERACTIVE_COUNT * VERTS_PER_NODE * 3);
    let o = 0;
    for (let i = 0; i < INTERACTIVE_COUNT; i++) {
      const px = NETWORK.positions[i * 3], py = NETWORK.positions[i * 3 + 1], pz = NETWORK.positions[i * 3 + 2];
      for (const [a, b] of EG) {
        verts[o++] = px + CR[a][0] * FRAME_SCALE; verts[o++] = py + CR[a][1] * FRAME_SCALE; verts[o++] = pz + CR[a][2] * FRAME_SCALE;
        verts[o++] = px + CR[b][0] * FRAME_SCALE; verts[o++] = py + CR[b][1] * FRAME_SCALE; verts[o++] = pz + CR[b][2] * FRAME_SCALE;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(INTERACTIVE_COUNT * VERTS_PER_NODE * 3), 3));
    return g;
  }, []);

  // the node's state colour (gameplay-readable palette — unchanged). `b` is the depth/focus-scaled
  // base brightness; returns the RGB to use for BOTH the core and the edge frame (edges glow via
  // additive blending + bloom). `hidden` collapses the core + blacks-out the frame.
  // STATE takes precedence over node-identity styling: extracted/isolated/locked/tripped-decoy win,
  // then the designated CORE / HOME / GATEWAY get their resting look, else plain ACTIVE white.
  const colorOf = (i: number, brightArr: Float32Array): { r: number; g: number; b: number; hidden: boolean } => {
    if ((revealed && !revealed.has(i)) || i === selected) return { r: 0, g: 0, b: 0, hidden: true };
    // when a node is FOCUSED the surrounding nodes recede (declutter — the selected node + its panel
    // read clearly); otherwise full brightness.
    const b = (focused ? brightArr[i] * 0.45 : brightArr[i]) * preset.nodeBrightness;
    const st = statuses[i];
    const type = nodeType(i, depth);
    if (type === 'DECOY' && st?.extracted) return { r: 0.86, g: 0.27, b: 0.28, hidden: false }; // tripped decoy — muted red
    if (st?.extracted) return { r: 0.16, g: 1.45, b: 0.5, hidden: false }; // EXTRACTED — secured GREEN (matches the panel edges), overdriven so it blooms into a strong glow
    if (st?.isolated) { const d = b * 0.4; return { r: d * 0.85, g: d * 0.92, b: d * 1.06, hidden: false }; } // ISOLATED — muted slate
    if (type === 'LOCKED' && !st?.unlocked) { const d = b * 0.48; return { r: d * 0.9, g: d * 0.95, b: d * 1.1, hidden: false }; } // LOCKED — dim/blocked cool
    if (i === coreNode) { const c = Math.min(1.2, b * 1.05); return { r: c * 0.6, g: c * 0.98, b: c * 1.2, hidden: false }; } // CORE — premium teal-ice glow (controlled)
    if (homeNode != null && i === homeNode) return { r: b * 0.72, g: b * 0.92, b: b * 1.08, hidden: false }; // HOME — structured cool frame
    if (type === 'GATEWAY') return { r: b * 0.78, g: b * 0.9, b: b * 1.04, hidden: false }; // GATEWAY — route tint (not too bright)
    return { r: b, g: b, b: b, hidden: false }; // ACTIVE (also conceals dormant DECOY traps)
  };

  // write one node into the core instanced mesh + the edge frame colour buffer
  const writeNode = (i: number, mesh: THREE.InstancedMesh, edgeCol: Float32Array, brightArr: Float32Array) => {
    const { r, g, b, hidden } = colorOf(i, brightArr);
    _c.setRGB(r, g, b);
    mesh.setColorAt(i, _c);
    _p.set(NETWORK.positions[i * 3], NETWORK.positions[i * 3 + 1], NETWORK.positions[i * 3 + 2]);
    _s.setScalar(hidden ? 0 : CORE_SCALE);
    _m.compose(_p, _q, _s);
    mesh.setMatrixAt(i, _m);
    let o = i * VERTS_PER_NODE * 3;
    for (let v = 0; v < VERTS_PER_NODE; v++) { edgeCol[o++] = r; edgeCol[o++] = g; edgeCol[o++] = b; }
  };

  useLayoutEffect(() => {
    const mesh = meshRef.current!;
    _q.identity();
    for (let i = 0; i < INTERACTIVE_COUNT; i++) {
      // base brightness from the node's signal stat (deterministic) — same formula as before
      bright.current[i] = 0.7 + (NETWORK.meta[i].signal - 78) / 60;
    }
    const colAttr = edgeRef.current.geometry.getAttribute('color') as THREE.BufferAttribute;
    const edgeCol = colAttr.array as Float32Array;
    for (let i = 0; i < INTERACTIVE_COUNT; i++) writeNode(i, mesh, edgeCol, bright.current);
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    colAttr.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time init; live updates run in useFrame
  }, [meshRef]);

  // the node look is fully determined by (selected, focused, statuses, depth, introStep); only
  // rebuild + re-upload the buffers when one of those changes. Idle frames just breathe two uniforms.
  const last = useRef<{ sel: number | null; focused: boolean; statuses: Record<number, NodeStatus> | null; depth: number; intro: number | null; enh: boolean | null }>({
    sel: null, focused: false, statuses: null, depth: -1, intro: -2, enh: null,
  });

  useFrame((state) => {
    const mesh = meshRef.current;
    const edge = edgeRef.current;
    if (!mesh || !mesh.instanceColor || !edge) return;

    // VISUAL MODE drives the look: ENHANCED = bright defined core + strong glowing edge shell with a
    // slow breath; CLASSIC = dim flat core + faint frame, no breath. Mutated via the live refs (not
    // the memoized material objects) to stay React-Compiler safe.
    const breath = preset.breath * (0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 0.55));
    (mesh.material as THREE.MeshBasicMaterial).opacity = preset.nodeCoreOpacity + 0.07 * breath;
    (edge.material as THREE.ShaderMaterial).uniforms.uOpacity.value = preset.nodeEdgeOpacity + 0.12 * breath;

    const L = last.current;
    if (L.statuses === statuses && L.sel === selected && L.focused === focused && L.depth === depth && L.intro === introStep && L.enh === enhanced) {
      return; // nothing changed — skip the per-node rewrite + GPU upload
    }
    L.statuses = statuses; L.sel = selected; L.focused = focused; L.depth = depth; L.intro = introStep; L.enh = enhanced;
    _q.identity();
    const colAttr = edge.geometry.getAttribute('color') as THREE.BufferAttribute;
    const edgeCol = colAttr.array as Float32Array;
    for (let i = 0; i < INTERACTIVE_COUNT; i++) writeNode(i, mesh, edgeCol, bright.current);
    mesh.instanceColor.needsUpdate = true;
    mesh.instanceMatrix.needsUpdate = true;
    colAttr.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={meshRef} args={[undefined, undefined, INTERACTIVE_COUNT]} material={coreMat} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
      <lineSegments ref={edgeRef} geometry={edgeGeo} material={edgeMat} frustumCulled={false} />

      {/* ENHANCED-only STRUCTURAL shells — shape cues (not just colour) on the key designated nodes.
          CORE: a layered double-frame shell (premium objective). HOME: a larger structured frame.
          Cheap: ≤3 static additive line frames for ≤2 nodes; the network's slow rotation animates them. */}
      {preset.structural && introStep == null && (
        <group position={posOf(coreNode)}>
          <lineSegments geometry={shellGeo} scale={1.9} frustumCulled={false}>
            <lineBasicMaterial color="#7fe6ff" transparent opacity={0.5} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
          </lineSegments>
          <lineSegments geometry={shellGeo} scale={2.7} frustumCulled={false}>
            <lineBasicMaterial color="#7fe6ff" transparent opacity={0.26} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
          </lineSegments>
        </group>
      )}
      {preset.structural && introStep == null && homeNode != null && (
        <group position={posOf(homeNode)}>
          <lineSegments geometry={shellGeo} scale={2.2} frustumCulled={false}>
            <lineBasicMaterial color="#b6d2ff" transparent opacity={0.4} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
          </lineSegments>
        </group>
      )}
    </>
  );
}
