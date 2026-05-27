import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NODE_COUNT, FIELD, WORLD_SEED, mulberry32 } from '../world';
import { NETWORK } from '../network';
import { patchNodeNearFade } from '../fadeMaterials';
import type { BackgroundNoise } from '../uiSettings';

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();
const _c = new THREE.Color();

interface Data {
  positions: Float32Array;
  scales: Float32Array;
  bright: Float32Array;
  phase: Float32Array;
  far: Uint8Array;
}

/**
 * Thousands of tiny dim cubes forming the atmospheric point-cloud the network
 * floats in. One InstancedMesh; clusters around the same lobes as the
 * interactive graph plus a diffuse halo. Near-fade keeps the lens clear; only
 * outer nodes flicker. Dims when a node is focused.
 */
export default function InstancedBackgroundNodes({
  focused,
  backgroundNoise,
}: {
  focused: boolean;
  backgroundNoise: BackgroundNoise;
}) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const dim = useRef(1);

  const material = useMemo(() => {
    const m = new THREE.MeshBasicMaterial({
      toneMapped: false,
      transparent: true,
      opacity: 1,
      depthWrite: false,
    });
    patchNodeNearFade(m, [1.5, 13]);
    return m;
  }, []);

  const data = useMemo<Data>(() => {
    const rng = mulberry32(WORLD_SEED ^ 0xa7005);
    const R = FIELD.radius;
    const centers = NETWORK.centers;
    const nc = centers.length / 3;
    const g = () => rng() + rng() + rng() - 1.5;

    const positions = new Float32Array(NODE_COUNT * 3);
    const scales = new Float32Array(NODE_COUNT);
    const bright = new Float32Array(NODE_COUNT);
    const phase = new Float32Array(NODE_COUNT);
    const far = new Uint8Array(NODE_COUNT);

    for (let i = 0; i < NODE_COUNT; i++) {
      let x: number;
      let y: number;
      let z: number;
      if (rng() < 0.72) {
        const c = (rng() * nc) | 0;
        const spread = 26 + rng() * 34;
        x = centers[c * 3] + g() * spread;
        y = centers[c * 3 + 1] + g() * spread;
        z = centers[c * 3 + 2] + g() * spread;
      } else {
        const u = rng() * 2 - 1;
        const ang = rng() * Math.PI * 2;
        const rad = Math.cbrt(rng()) * R * 1.25;
        const s = Math.sqrt(1 - u * u);
        x = Math.cos(ang) * s * rad;
        y = u * rad;
        z = Math.sin(ang) * s * rad;
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const r2 = x * x + y * y + z * z;
      const isFar = r2 > R * 0.85 * (R * 0.85);
      far[i] = isFar ? 1 : 0;

      scales[i] = 0.04 + rng() * 0.085;
      bright[i] = isFar ? 0.18 + rng() * 0.2 : 0.32 + rng() * 0.34;
      phase[i] = rng() * Math.PI * 2;
    }
    return { positions, scales, bright, phase, far };
  }, []);

  useLayoutEffect(() => {
    const mesh = ref.current;
    _q.identity();
    for (let i = 0; i < NODE_COUNT; i++) {
      _p.set(data.positions[i * 3], data.positions[i * 3 + 1], data.positions[i * 3 + 2]);
      const sc = data.scales[i];
      _s.set(sc, sc, sc);
      _m.compose(_p, _q, _s);
      mesh.setMatrixAt(i, _m);
      const b = data.bright[i];
      _c.setRGB(b, b, b);
      mesh.setColorAt(i, _c);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [data]);

  const cursor = useRef(0);
  useFrame((state, rawDelta) => {
    const mesh = ref.current;
    if (!mesh.instanceColor) return;
    const t = state.clock.elapsedTime;
    const noiseMul = backgroundNoise === 'Low' ? 0.45 : backgroundNoise === 'High' ? 1.18 : 1;
    const target = (focused ? 0.4 : 1) * noiseMul;
    dim.current += (target - dim.current) * (1 - Math.exp(-4 * Math.min(rawDelta, 0.05)));

    const BATCH = 320;
    for (let k = 0; k < BATCH; k++) {
      const i = (cursor.current + k) % NODE_COUNT;
      let b = data.bright[i];
      if (data.far[i]) {
        const flick = 0.5 + 0.5 * Math.sin(t * 2.4 + data.phase[i]);
        b *= 0.45 + 0.55 * flick;
      }
      b *= dim.current;
      _c.setRGB(b, b, b);
      mesh.setColorAt(i, _c);
    }
    cursor.current = (cursor.current + BATCH) % NODE_COUNT;
    mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, NODE_COUNT]}
      material={material}
      frustumCulled={false}
    >
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
}
