import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NETWORK } from '../network';
import { EDGE_CORRUPT } from '../game';

/**
 * Mission 03 // SIGNAL WAR — the "make corrupted links readable" overlay.
 *
 * Draws ONLY the still-unstabilized corrupted edges on top of the resting link
 * mesh (NodeConnections), so the player can actually see which routes to TRACE.
 * Style stays inside the NEVA monochrome-first language: a muted red-gray, thin,
 * broken/dashed line with a faint flicker and small glitch gaps (low but readable
 * glow), plus tiny perpendicular AR warning ticks at each corrupted segment's
 * midpoint. Nothing here changes game rules — TRACE stabilising the edges (game.ts)
 * simply removes them from this overlay, and they revert to the normal stable lines.
 */

const WARN = new THREE.Color(0.66, 0.28, 0.29); // muted danger red (not neon, not arcade)
const TICK_LEN = 0.95;
const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _d = new THREE.Vector3();
const _p1 = new THREE.Vector3();
const _p2 = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _alt = new THREE.Vector3(1, 0, 0);

interface Built {
  line: THREE.BufferGeometry;
  ticks: THREE.BufferGeometry;
  count: number;
}

function build(linkStabilized: Record<number, boolean>): Built {
  const { edges, positions } = NETWORK;
  const live: number[] = [];
  for (let e = 0; e < edges.length; e++) {
    if (EDGE_CORRUPT[e] && !linkStabilized[e]) live.push(e);
  }

  const lv = new Float32Array(live.length * 2 * 3);
  const lp = new Float32Array(live.length * 2); // aParam (0 at a, 1 at b)
  const ll = new Float32Array(live.length * 2); // aLen (edge length, both ends)
  // ticks: a small 3D "+" at the midpoint = 2 segments = 4 verts per edge
  const tv = new Float32Array(live.length * 4 * 3);

  let o = 0;
  let po = 0;
  let to = 0;
  for (let n = 0; n < live.length; n++) {
    const [a, b] = edges[live[n]];
    _a.set(positions[a * 3], positions[a * 3 + 1], positions[a * 3 + 2]);
    _b.set(positions[b * 3], positions[b * 3 + 1], positions[b * 3 + 2]);
    const len = _a.distanceTo(_b);

    lv[o++] = _a.x; lv[o++] = _a.y; lv[o++] = _a.z;
    lv[o++] = _b.x; lv[o++] = _b.y; lv[o++] = _b.z;
    lp[po] = 0; lp[po + 1] = 1;
    ll[po] = len; ll[po + 1] = len;
    po += 2;

    // perpendicular ticks at the midpoint (orientation-stable cross products)
    _d.subVectors(_b, _a).normalize();
    const ref = Math.abs(_d.dot(_up)) > 0.95 ? _alt : _up;
    _p1.crossVectors(_d, ref).normalize().multiplyScalar(TICK_LEN);
    _p2.crossVectors(_d, _p1).normalize().multiplyScalar(TICK_LEN);
    const mx = (_a.x + _b.x) * 0.5;
    const my = (_a.y + _b.y) * 0.5;
    const mz = (_a.z + _b.z) * 0.5;
    tv[to++] = mx - _p1.x; tv[to++] = my - _p1.y; tv[to++] = mz - _p1.z;
    tv[to++] = mx + _p1.x; tv[to++] = my + _p1.y; tv[to++] = mz + _p1.z;
    tv[to++] = mx - _p2.x; tv[to++] = my - _p2.y; tv[to++] = mz - _p2.z;
    tv[to++] = mx + _p2.x; tv[to++] = my + _p2.y; tv[to++] = mz + _p2.z;
  }

  const line = new THREE.BufferGeometry();
  line.setAttribute('position', new THREE.BufferAttribute(lv, 3));
  line.setAttribute('aParam', new THREE.BufferAttribute(lp, 1));
  line.setAttribute('aLen', new THREE.BufferAttribute(ll, 1));
  const ticks = new THREE.BufferGeometry();
  ticks.setAttribute('position', new THREE.BufferAttribute(tv, 3));
  return { line, ticks, count: live.length };
}

export default function CorruptedLinks({
  signalWar,
  linkStabilized,
  pulse,
  focused,
  devScan = false,
}: {
  signalWar: boolean;
  linkStabilized: Record<number, boolean>;
  pulse: boolean;
  focused: boolean;
  devScan?: boolean;
}) {
  const lineRef = useRef<THREE.LineSegments>(null!);
  const tickMat = useRef<THREE.LineBasicMaterial>(null!);
  const glow = useRef(1);

  const lineMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        toneMapped: false,
        uniforms: {
          uTime: { value: 0 },
          uGlow: { value: 1 },
          uColor: { value: WARN.clone() },
          uNear: { value: new THREE.Vector2(3, 18) },
          uFar: { value: new THREE.Vector2(160, 320) },
        },
        vertexShader: /* glsl */ `
          attribute float aParam;
          attribute float aLen;
          varying float vParam;
          varying float vLen;
          varying float vDist;
          void main() {
            vParam = aParam;
            vLen = aLen;
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vDist = distance(wp.xyz, cameraPosition);
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
        fragmentShader: /* glsl */ `
          precision mediump float;
          uniform float uTime;
          uniform float uGlow;
          uniform vec3 uColor;
          uniform vec2 uNear;
          uniform vec2 uFar;
          varying float vParam;
          varying float vLen;
          varying float vDist;
          void main() {
            // broken / dashed line: ~one dash cell per 2 world units, drifting along the edge
            float cells = max(2.0, vLen / 2.0);
            float dash = step(0.42, fract(vParam * cells - uTime * 0.7));
            // sparse larger "glitch gaps" punched through at a slower rate
            float glitch = step(0.1, fract(vParam * 3.0 + uTime * 0.27));
            // faint flicker
            float fl = 0.62 + 0.38 * sin(uTime * 7.0 + vParam * 8.0 + vLen * 1.3);
            // distance fades match the resting link mesh so nothing smears the lens
            float nearF = smoothstep(uNear.x, uNear.y, vDist);
            float farF = 1.0 - smoothstep(uFar.x, uFar.y, vDist);
            float a = 0.5 * dash * glitch * fl * nearF * farF * uGlow;
            if (a < 0.004) discard;
            gl_FragColor = vec4(uColor * (0.85 + 0.25 * uGlow), a);
          }
        `,
      }),
    [],
  );

  const built = useMemo(() => build(linkStabilized), [linkStabilized]);

  useFrame((state, rawDelta) => {
    const t = state.clock.elapsedTime;
    // target glow: brighter during a pulse and under dev scan (still muted)
    const target = (pulse ? 1.5 : 1) * (devScan ? 1.5 : 1) * (focused ? 0.85 : 1);
    glow.current += (target - glow.current) * (1 - Math.exp(-4 * Math.min(rawDelta, 0.05)));
    const lm = lineRef.current?.material as THREE.ShaderMaterial | undefined;
    if (lm) {
      lm.uniforms.uTime.value = t;
      lm.uniforms.uGlow.value = glow.current;
    }
    if (tickMat.current) {
      // ticks flicker on a slightly different beat so the marks read as live annotations
      const fl = 0.5 + 0.32 * Math.sin(t * 5.5 + 1.7);
      tickMat.current.opacity = fl * glow.current * 0.8;
    }
  });

  if (!signalWar || built.count === 0) return null;

  return (
    <group>
      <lineSegments ref={lineRef} geometry={built.line} material={lineMat} frustumCulled={false} />
      <lineSegments geometry={built.ticks} frustumCulled={false}>
        <lineBasicMaterial
          ref={tickMat}
          color={WARN}
          transparent
          opacity={0.6}
          toneMapped={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}
