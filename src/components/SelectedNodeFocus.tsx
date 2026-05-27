import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NETWORK } from '../network';

const C: [number, number, number][] = [
  [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5],
  [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5],
];
const E: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
];

// state tints — clean white active, a glowing green for extracted (the saturated
// colour + additive edges bloom into a luminous green crystal — the "secured"
// signal), and a muted cool slate for isolated.
const COL_ACTIVE = new THREE.Color(1, 1, 1);
const COL_EXTRACTED = new THREE.Color(0.18, 1.25, 0.5); // overdriven glowing green (secured) — blooms hard
const COL_ISOLATED = new THREE.Color(0.5, 0.55, 0.68); // muted cool slate
const COL_DECOY = new THREE.Color(1.0, 0.28, 0.3); // muted danger red (not arcade)

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

// AR corner brackets: at each of the 8 cube corners, three short arms pointing
// inward along x/y/z — the hollow tracking signature of the outer frame.
function cubeBrackets(len = 0.24): THREE.BufferGeometry {
  const segs: number[] = [];
  for (const c of C) {
    for (let axis = 0; axis < 3; axis++) {
      const dir = c[axis] > 0 ? -1 : 1; // toward the cube centre
      const e = [c[0], c[1], c[2]];
      e[axis] = c[axis] + dir * len;
      segs.push(c[0], c[1], c[2], e[0], e[1], e[2]);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(segs), 3));
  return g;
}

const posOf = (i: number): [number, number, number] => [
  NETWORK.positions[i * 3], NETWORK.positions[i * 3 + 1], NETWORK.positions[i * 3 + 2],
];

interface Props {
  selected: number | null;
  hovered: number | null;
  tracedFrom: number | null;
  msgId: number;
  msgKind: 'ok' | 'warn' | 'fail' | null;
  extracted: boolean;
  isolated: boolean;
  decoy: boolean;
  depth: number; // deeper layers get slightly brighter trace links
}

/**
 * The SELECTED node's AR visual: a small semi-solid core cube (low-opacity fill
 * + thin glowing outline) nested inside a subtle outer tracking frame (faint
 * wireframe cage + bright corner brackets), plus bright pulsing trace links. It
 * reads as active and tracked — never an empty box, never a burned-out solid
 * block. A successful action pulses the outline/frame (an expanding outline, not
 * a fill). The core tints to the node's state colour (extracted = glowing green,
 * isolated = muted gray). The HOVERED node gets a lighter wireframe cage.
 */
export default function SelectedNodeFocus({
  selected, hovered, tracedFrom, msgId, msgKind, extracted, isolated, decoy, depth,
}: Props) {
  const outerRef = useRef<THREE.Group>(null!);
  const coreRef = useRef<THREE.Group>(null!);
  const cageMat = useRef<THREE.LineBasicMaterial>(null!);
  const brkMat = useRef<THREE.LineBasicMaterial>(null!);
  const fillMat = useRef<THREE.MeshBasicMaterial>(null!);
  const edgeMat = useRef<THREE.LineBasicMaterial>(null!);
  const hoverRef = useRef<THREE.LineSegments>(null!);
  const linkRef = useRef<THREE.LineSegments>(null!);
  const pulse = useRef(0); // success pulse 1 -> 0 (drives the expanding outline)
  const lastMsg = useRef(msgId);

  const cageGeo = useMemo(() => cubeEdges(), []);
  const bracketGeo = useMemo(() => cubeBrackets(), []);

  const tint = decoy
    ? COL_DECOY
    : extracted
      ? COL_EXTRACTED
      : isolated
        ? COL_ISOLATED
        : COL_ACTIVE;

  const linkMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        uniforms: { uTime: { value: 0 }, uBoost: { value: 1 } },
        vertexShader: /* glsl */ `
          attribute float aParam;
          varying float vParam;
          void main() {
            vParam = aParam;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          precision mediump float;
          uniform float uTime;
          uniform float uBoost;
          varying float vParam;
          void main() {
            float p = fract(uTime * 0.6);
            float band = smoothstep(0.16, 0.0, abs(vParam - p));
            float a = (0.22 + band * 0.4) * uBoost;
            gl_FragColor = vec4(vec3(1.0), a);
          }
        `,
      }),
    [],
  );

  const link = useMemo(() => {
    if (selected == null) return null;
    const p = NETWORK.positions;
    const ni = NETWORK.neighbours[selected];
    const sx = p[selected * 3], sy = p[selected * 3 + 1], sz = p[selected * 3 + 2];
    const verts = new Float32Array(ni.length * 2 * 3);
    const params = new Float32Array(ni.length * 2);
    let o = 0, pi = 0;
    for (const j of ni) {
      verts[o++] = sx; verts[o++] = sy; verts[o++] = sz;
      verts[o++] = p[j * 3]; verts[o++] = p[j * 3 + 1]; verts[o++] = p[j * 3 + 2];
      params[pi++] = 0; params[pi++] = 1;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    g.setAttribute('aParam', new THREE.BufferAttribute(params, 1));
    return g;
  }, [selected]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    // a new "ok" action message triggers a brief success pulse
    if (msgId !== lastMsg.current) {
      lastMsg.current = msgId;
      if (msgKind === 'ok') pulse.current = 1;
    }
    pulse.current = Math.max(0, pulse.current - Math.min(delta, 0.05) * 2.4);
    const pl = pulse.current;

    if (selected != null && outerRef.current && coreRef.current) {
      // very slow breath (period ~10s) drives the node's own glow, not its size
      const slow = 0.5 + 0.5 * Math.sin(t * 0.6); // 0 -> 1
      // outer frame holds steady size; still SWELLS on success
      outerRef.current.scale.setScalar(2.3 + 0.05 * Math.sin(t * 0.6) + pl * 0.9);
      // the core cube stays a steady size — it's the brightness that pulses
      coreRef.current.scale.setScalar(1.3 + 0.03 * Math.sin(t * 0.6) + pl * 0.06);

      // state tint across the whole selected visual
      cageMat.current?.color.copy(tint);
      brkMat.current?.color.copy(tint);
      edgeMat.current?.color.copy(tint);
      fillMat.current?.color.copy(tint);

      // The node cube ITSELF glows: the additive fill brightens and dims on the
      // slow breath, so the whole box reads as a softly pulsing light source.
      // isolated stays muted; extracted/decoy carry their saturated colour.
      const fillBase = isolated ? 0.14 : 0.3;
      const fillAmp = isolated ? 0.1 : 0.32;
      const edgeBase = isolated ? 0.42 : 0.7;
      const brkBase = isolated ? 0.34 : 0.5;
      if (fillMat.current) fillMat.current.opacity = fillBase + fillAmp * slow + pl * 0.3;
      if (edgeMat.current) edgeMat.current.opacity = edgeBase + 0.18 * slow + pl * 0.22;
      if (brkMat.current) brkMat.current.opacity = brkBase + 0.12 * slow + pl * 0.45;
      if (cageMat.current) cageMat.current.opacity = 0.09 + 0.03 * slow + pl * 0.08;

      const lm = linkRef.current?.material as THREE.ShaderMaterial | undefined;
      if (lm) {
        lm.uniforms.uTime.value = t;
        const base = tracedFrom === selected ? 1.9 : 1;
        const depthBoost = 1 + (depth - 1) * 0.25; // deeper links read a touch brighter
        lm.uniforms.uBoost.value = (base + pl * 0.8) * depthBoost;
      }
    }
    if (hovered != null && hovered !== selected && hoverRef.current) {
      hoverRef.current.scale.setScalar(2.0 + 0.16 * Math.sin(t * 5));
    }
  });

  return (
    <group>
      {selected != null && (
        <>
          <group position={posOf(selected)}>
            {/* outer tracking frame: subtle cage + bright corner brackets */}
            <group ref={outerRef}>
              <lineSegments geometry={cageGeo} frustumCulled={false}>
                <lineBasicMaterial
                  ref={cageMat}
                  color="#ffffff"
                  transparent
                  opacity={0.09}
                  toneMapped={false}
                  depthWrite={false}
                />
              </lineSegments>
              <lineSegments geometry={bracketGeo} frustumCulled={false}>
                <lineBasicMaterial
                  ref={brkMat}
                  color="#ffffff"
                  transparent
                  opacity={0.46}
                  toneMapped={false}
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                />
              </lineSegments>
            </group>

            {/* semi-solid core: low-opacity fill + thin glowing outline */}
            <group ref={coreRef}>
              <mesh frustumCulled={false}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial
                  ref={fillMat}
                  color="#ffffff"
                  transparent
                  opacity={0.32}
                  toneMapped={false}
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
              <lineSegments geometry={cageGeo} frustumCulled={false}>
                <lineBasicMaterial
                  ref={edgeMat}
                  color="#ffffff"
                  transparent
                  opacity={0.72}
                  toneMapped={false}
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                />
              </lineSegments>
            </group>
          </group>

          {link && <lineSegments ref={linkRef} geometry={link} material={linkMat} frustumCulled={false} />}
        </>
      )}
      {hovered != null && hovered !== selected && (
        <lineSegments ref={hoverRef} geometry={cageGeo} position={posOf(hovered)} frustumCulled={false}>
          <lineBasicMaterial color="#ffffff" transparent opacity={0.55} toneMapped={false} depthWrite={false} />
        </lineSegments>
      )}
    </group>
  );
}
