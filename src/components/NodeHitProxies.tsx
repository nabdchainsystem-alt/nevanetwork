import { useLayoutEffect, type RefObject } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { INTERACTIVE_COUNT, NETWORK } from '../network';

/**
 * Invisible, enlarged pick targets — one sphere per interactive node, used only
 * for raycasting so the small nodes are easy to click. Each halo is BIG by
 * default (a far, tiny node is still a generous target) and shrinks to 35%
 * (−65%) as the camera gets close, where the node is already large on screen
 * and a big halo would start swallowing its neighbours.
 */
const HALO_RADIUS = 2.8; // far / default hit radius (world units)
const NEAR_MULT = 0.35; // −65% when close
const NEAR_D = 20; // within this distance → fully shrunk
const FAR_D = 78; // beyond this → full size

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();
const _cam = new THREE.Vector3();

interface Props {
  hitRef: RefObject<THREE.InstancedMesh | null>;
}

export default function NodeHitProxies({ hitRef }: Props) {
  const { camera } = useThree();

  useLayoutEffect(() => {
    const mesh = hitRef.current!;
    _q.identity();
    _s.setScalar(HALO_RADIUS);
    for (let i = 0; i < INTERACTIVE_COUNT; i++) {
      _p.set(NETWORK.positions[i * 3], NETWORK.positions[i * 3 + 1], NETWORK.positions[i * 3 + 2]);
      _m.compose(_p, _q, _s);
      mesh.setMatrixAt(i, _m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [hitRef]);

  useFrame(() => {
    const mesh = hitRef.current;
    if (!mesh) return;
    // camera position in the (possibly rotated) network group's local space, so
    // the distance test matches the node coordinates we compose from.
    _cam.copy(camera.position);
    if (mesh.parent) {
      mesh.parent.updateWorldMatrix(true, false);
      mesh.parent.worldToLocal(_cam);
    }
    _q.identity();
    const span = FAR_D - NEAR_D;
    for (let i = 0; i < INTERACTIVE_COUNT; i++) {
      const x = NETWORK.positions[i * 3];
      const y = NETWORK.positions[i * 3 + 1];
      const z = NETWORK.positions[i * 3 + 2];
      const d = Math.hypot(_cam.x - x, _cam.y - y, _cam.z - z);
      const t = Math.max(0, Math.min(1, (d - NEAR_D) / span));
      const mult = NEAR_MULT + (1 - NEAR_MULT) * t;
      _p.set(x, y, z);
      _s.setScalar(HALO_RADIUS * mult);
      _m.compose(_p, _q, _s);
      mesh.setMatrixAt(i, _m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={hitRef}
      args={[undefined, undefined, INTERACTIVE_COUNT]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 8, 6]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
    </instancedMesh>
  );
}
