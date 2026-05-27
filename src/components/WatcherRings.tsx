import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NETWORK } from '../network';
import { watchersAtDepth } from '../game';

/**
 * Mission 03 // SIGNAL WAR — a subtle signal-source marker around WATCHER (CAMERA)
 * nodes so the player can recognise them without a tutorial. Two thin, concentric,
 * camera-facing rings per watcher (a small "signal emitter"), monochrome-first with a
 * faint warm-gray tint — never neon. They DISTANCE-FADE: invisible from across the
 * network, readable only when you fly near or select one (selecting pulls the camera
 * close, so the ring fades in). Slow pulse; brighter during a signal pulse.
 *
 * Pure annotation — changes no game rules. Mounted only in Mission 03 (signalWar).
 */

const SEGMENTS = 30;
const RADII = [1.7, 2.5]; // two concentric rings
const RING_COLOR = new THREE.Color(0.82, 0.74, 0.74); // muted warm gray (faint caution, not red)

function build(nodes: number[]): { geo: THREE.BufferGeometry; count: number } {
  // each ring = SEGMENTS line segments (2 verts each); positions hold the UNIT ring point
  // (cos,sin) and aCenter/aRadius drive a camera-facing billboard in the vertex shader.
  const segs = nodes.length * RADII.length * SEGMENTS;
  const pos = new Float32Array(segs * 2 * 3);
  const cen = new Float32Array(segs * 2 * 3);
  const rad = new Float32Array(segs * 2);
  let o = 0;
  let co = 0;
  let ro = 0;
  for (const n of nodes) {
    const cx = NETWORK.positions[n * 3];
    const cy = NETWORK.positions[n * 3 + 1];
    const cz = NETWORK.positions[n * 3 + 2];
    for (const r of RADII) {
      for (let s = 0; s < SEGMENTS; s++) {
        const a0 = (s / SEGMENTS) * Math.PI * 2;
        const a1 = ((s + 1) / SEGMENTS) * Math.PI * 2;
        pos[o++] = Math.cos(a0); pos[o++] = Math.sin(a0); pos[o++] = 0;
        pos[o++] = Math.cos(a1); pos[o++] = Math.sin(a1); pos[o++] = 0;
        for (let v = 0; v < 2; v++) {
          cen[co++] = cx; cen[co++] = cy; cen[co++] = cz;
          rad[ro++] = r;
        }
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aCenter', new THREE.BufferAttribute(cen, 3));
  geo.setAttribute('aRadius', new THREE.BufferAttribute(rad, 1));
  return { geo, count: nodes.length };
}

export default function WatcherRings({
  signalWar,
  depth,
  pulse,
  focused,
}: {
  signalWar: boolean;
  depth: number;
  pulse: boolean;
  focused: boolean;
}) {
  const ref = useRef<THREE.LineSegments>(null!);
  const glow = useRef(1);

  const built = useMemo(() => build(watchersAtDepth(depth)), [depth]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        toneMapped: false,
        uniforms: {
          uTime: { value: 0 },
          uGlow: { value: 1 },
          uColor: { value: RING_COLOR.clone() },
        },
        vertexShader: /* glsl */ `
          attribute vec3 aCenter;
          attribute float aRadius;
          varying float vDist;
          void main() {
            vec3 cw = (modelMatrix * vec4(aCenter, 1.0)).xyz;     // ring centre in world
            vec3 toCam = normalize(cameraPosition - cw);
            vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), toCam));
            vec3 up = cross(toCam, right);                         // camera-facing billboard basis
            vec3 wp = cw + (right * position.x + up * position.y) * aRadius;
            vDist = distance(cw, cameraPosition);
            gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          precision mediump float;
          uniform float uTime;
          uniform float uGlow;
          uniform vec3 uColor;
          varying float vDist;
          void main() {
            // near-only visibility: fully readable when close, faded to nothing far away
            // (so watchers are NOT obvious across the whole network — only when nearby).
            float vis = 1.0 - smoothstep(34.0, 96.0, vDist);
            if (vis <= 0.001) discard;
            float pulse = 0.6 + 0.4 * sin(uTime * 2.0); // slow breathing
            float a = 0.36 * vis * pulse * uGlow;
            if (a < 0.004) discard;
            gl_FragColor = vec4(uColor, a);
          }
        `,
      }),
    [],
  );

  // dispose the geometry when the watcher set changes (depth dive) to avoid GPU leaks
  useEffect(() => () => built.geo.dispose(), [built]);

  useFrame((state, rawDelta) => {
    const m = ref.current?.material as THREE.ShaderMaterial | undefined;
    if (!m) return;
    // brighter during a signal pulse (the watchers "light up" under pressure), dimmer when
    // the player is focused on a single node so it never fights the inspection frame.
    const target = (pulse ? 1.7 : 1) * (focused ? 0.85 : 1);
    glow.current += (target - glow.current) * (1 - Math.exp(-4 * Math.min(rawDelta, 0.05)));
    m.uniforms.uTime.value = state.clock.elapsedTime;
    m.uniforms.uGlow.value = glow.current;
  });

  if (!signalWar || built.count === 0) return null;

  return <lineSegments ref={ref} geometry={built.geo} material={material} frustumCulled={false} />;
}
