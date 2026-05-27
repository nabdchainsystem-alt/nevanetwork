import * as THREE from 'three';

/**
 * A line material that fades by distance from the camera:
 *  - NEAR fade: lines closer than `near[0]` are invisible, ramping to full by
 *    `near[1]`. This stops geometry from smearing across the lens and turning
 *    the screen into a flat spiderweb.
 *  - FAR fade: lines fade out between `far[0]` and `far[1]` into the fog.
 * Per-vertex grayscale brightness comes from the geometry's `color` attribute,
 * so key structures can be brighter than background lines.
 */
export function createFadeLineMaterial(opts: {
  opacity?: number;
  near?: [number, number];
  far?: [number, number];
  flicker?: number; // 0 = steady, 1 = strong shimmer
}): THREE.ShaderMaterial {
  const {
    opacity = 0.3,
    near = [2.5, 18],
    far = [170, 330],
    flicker = 0,
  } = opts;

  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    toneMapped: false,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: opacity },
      uNear: { value: new THREE.Vector2(near[0], near[1]) },
      uFar: { value: new THREE.Vector2(far[0], far[1]) },
      uFlicker: { value: flicker },
    },
    vertexShader: /* glsl */ `
      attribute vec3 color;
      varying vec3 vColor;
      varying float vDist;
      void main() {
        vColor = color;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vDist = distance(wp.xyz, cameraPosition);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      precision mediump float;
      uniform float uTime;
      uniform float uOpacity;
      uniform float uFlicker;
      uniform vec2 uNear;
      uniform vec2 uFar;
      varying vec3 vColor;
      varying float vDist;
      void main() {
        float nearF = smoothstep(uNear.x, uNear.y, vDist);
        float farF = 1.0 - smoothstep(uFar.x, uFar.y, vDist);
        float a = uOpacity * nearF * farF;
        if (uFlicker > 0.0) {
          float f = 0.6 + 0.4 * sin(uTime * 6.0 + vDist * 0.35);
          a *= mix(1.0, f, uFlicker);
        }
        if (a < 0.003) discard;
        gl_FragColor = vec4(vColor, a);
      }
    `,
  });
}

/**
 * Adds a NEAR fade to an instanced MeshBasicMaterial (the data nodes) via
 * onBeforeCompile, so nodes right in front of the lens fade out instead of
 * filling the screen. The material's own fog still handles the FAR fade.
 */
export function patchNodeNearFade(
  material: THREE.Material,
  near: [number, number],
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uNodeNear = { value: new THREE.Vector2(near[0], near[1]) };
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying float vCamDist;',
      )
      .replace(
        '#include <project_vertex>',
        '#include <project_vertex>\nvCamDist = -mvPosition.z;',
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nuniform vec2 uNodeNear;\nvarying float vCamDist;',
      )
      .replace(
        '#include <dithering_fragment>',
        '#include <dithering_fragment>\ngl_FragColor.a *= smoothstep(uNodeNear.x, uNodeNear.y, vCamDist);',
      );
  };
  material.needsUpdate = true;
}
