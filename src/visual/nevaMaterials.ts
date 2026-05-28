import * as THREE from 'three';
import type { ObjectiveVisualKind } from '../objectives';

/**
 * NEVA centralized visual material system — seed (Visual Upgrade Pass v3 · links).
 *
 * This module owns the OBJECTIVE ROUTE-LINK look: the "living route" that flows along the edges
 * leading to the current mission objective node (gateway / core / firewall / corruption / relay).
 * It is PURELY visual — it never changes gameplay, picking, node state, trace, save, or progression.
 *
 * Scope note: the node / selected-node / objective-marker palettes already live centralized with
 * their own components (`InteractiveNodes.colorOf`, `SelectedNodeFocus`, `ObjectiveMarker.KINDS`,
 * `fadeMaterials`). Those are intentionally left as-is; this module is the shared home for the new
 * link-route styling and for any future link/material centralization, so colours/opacities stop
 * being re-derived ad hoc.
 */

// shared distance-fade window for link materials — matches the resting link mesh so route lines
// fade with everything else and never smear the lens.
export const LINK_FADE_NEAR = new THREE.Vector2(3, 18);
export const LINK_FADE_FAR = new THREE.Vector2(150, 320);

// ----------------------------------------------------------------------------------------------
// VISUAL MODE presets (CLASSIC ↔ ENHANCED) — the single source of truth for the look, read by the
// REAL render components (InteractiveNodes, SelectedNodeFocus, NodeConnections, the explorer's
// Bloom). ENHANCED is the premium pass: brighter defined cores, a strong additive edge shell,
// structural rings on the CORE/HOME nodes, pulsing/route links, and stronger (controlled) bloom.
// CLASSIC is a deliberately flat baseline (dim cores, faint frames, near-off bloom) so the K toggle
// proves an obvious before/after. Pure visual — no gameplay/state meaning changes.
export interface VisualPreset {
  nodeCoreOpacity: number; // soft inner core fill
  nodeEdgeOpacity: number; // additive hollow edge-frame
  nodeBrightness: number; // multiplier on each node's base brightness
  breath: number; // 0 = steady, 1 = full glow-breath amount
  structural: boolean; // show CORE/HOME structural shells (shape cues, not just colour)
  linkBaseOpacity: number; // resting link line
  linkFar: [number, number]; // link far-fade window (tighter = less far spiderweb)
  tracedBoost: number; // brightness multiplier on the selected node's traced links
  selFillOpacity: number; // selected node core fill
  selEdgeOpacity: number; // selected node core outline
  selBracketOpacity: number; // selected node corner brackets
  selPulse: number; // success-pulse strength on the selected frame
  bloomIntensity: number;
  bloomThreshold: number;
}

export const VISUAL_PRESETS: { classic: VisualPreset; enhanced: VisualPreset } = {
  // flat baseline — dim, low-glow, near-off bloom (the "before")
  classic: {
    nodeCoreOpacity: 0.36,
    nodeEdgeOpacity: 0.14,
    nodeBrightness: 0.82,
    breath: 0,
    structural: false,
    linkBaseOpacity: 0.24,
    linkFar: [150, 320],
    tracedBoost: 1.3,
    selFillOpacity: 0.18,
    selEdgeOpacity: 0.5,
    selBracketOpacity: 0.34,
    selPulse: 0.45,
    bloomIntensity: 0.34,
    bloomThreshold: 0.46,
  },
  // premium pass — defined glowing cores, strong edge shell, structural cues, stronger bloom
  enhanced: {
    nodeCoreOpacity: 0.74,
    nodeEdgeOpacity: 0.66,
    nodeBrightness: 1.18,
    breath: 1,
    structural: true,
    linkBaseOpacity: 0.18, // calmer normal links
    linkFar: [110, 240], // tighter far-fade → far links melt away (less spiderweb)
    tracedBoost: 2.2,
    selFillOpacity: 0.34,
    selEdgeOpacity: 0.82,
    selBracketOpacity: 0.6,
    selPulse: 0.9,
    bloomIntensity: 1.05,
    bloomThreshold: 0.16,
  },
};

export const getPreset = (enhanced: boolean): VisualPreset =>
  enhanced ? VISUAL_PRESETS.enhanced : VISUAL_PRESETS.classic;

// ----------------------------------------------------------------------------------------------
// SECTOR / DEPTH ATMOSPHERE (Visual Upgrade Pass v6) — per-sector base mood + a depth scale on top.
// Pure data + a pure resolver; the explorer reads it for fog / bloom / background-dust presence.
// Identity preserved (monochrome AR): A01 clean & readable, A02 deeper & more dangerous, A03 a
// FUTURE corrupted sector (defined for later — NOT activated by any current mission range).
export type SectorKey = 'A01' | 'A02' | 'A03';

export interface SectorAtmosphere {
  key: SectorKey;
  name: string; // HUD-consistent sector name
  fogDensity: number; // base exp² fog
  bloomAdd: number; // added to the VISUAL MODE bloom intensity
  thresholdAdd: number; // added to the bloom luminance threshold (A01 higher = cleaner/calmer)
  particleOpacity: number; // background-dust presence (0..~1.1)
  flicker: number; // reserved — A03 unstable ambience (0 for A01/A02)
}

export const SECTOR_ATMOSPHERE: Record<SectorKey, SectorAtmosphere> = {
  // A01 — MEMORY GRID: the clean first layer. Low fog, calm dust, slightly higher bloom threshold so
  // only the brightest cores/edges bloom — readable, mysterious, not hostile.
  A01: { key: 'A01', name: 'MEMORY GRID', fogDensity: 0.0026, bloomAdd: 0, thresholdAdd: 0.02, particleOpacity: 0.82, flicker: 0 },
  // A02 — DEEP GRID: the NEW, ~5× larger procedural sector. Fog is LIGHTER than late-A01 (a big
  // world must read across distance), but it's darker/glowier with a heavier vignette (CSS) + fuller
  // distant dust + more bloom — vast, advanced, more dangerous without fogging the world into soup.
  A02: { key: 'A02', name: 'DEEP GRID', fogDensity: 0.0014, bloomAdd: 0.1, thresholdAdd: -0.02, particleOpacity: 1.05, flicker: 0 },
  // A03 — CORRUPTED SECTOR (FUTURE placeholder; not yet reachable): broken-grid feel, strongest fog,
  // unstable flicker, deeper contrast. Defined so future work has a ready preset — do not activate.
  A03: { key: 'A03', name: 'CORRUPTED SECTOR', fogDensity: 0.0052, bloomAdd: 0.18, thresholdAdd: -0.02, particleOpacity: 1.05, flicker: 1 },
};

/** Which sector a mission belongs to. A03 is reserved — no mission range maps to it yet. */
export function sectorKeyForMission(missionId: number): SectorKey {
  return missionId >= 8 ? 'A02' : 'A01';
}

/** Depth scale layered on the sector base: deeper = thicker fog, a touch more bloom pressure, and
 *  thinner far dust (more depth separation). Subtle but visible. Returns ADDITIVE / multiplicative
 *  adjustments. */
export function depthAtmosphere(depth: number): { fogAdd: number; bloomAdd: number; particleMul: number } {
  const d = Math.max(1, depth);
  return {
    fogAdd: (d - 1) * 0.0006, // d2 +0.0006 · d3 +0.0012 · d4 +0.0018
    bloomAdd: (d - 1) * 0.03,
    particleMul: Math.max(0.7, 1 - (d - 1) * 0.06),
  };
}

export interface ResolvedAtmosphere {
  key: SectorKey;
  name: string;
  fogDensity: number;
  bloomIntensity: number;
  bloomThreshold: number;
  particleOpacity: number;
}

/**
 * Combine the VISUAL MODE bloom base + the sector mood + the depth scale into the live atmosphere.
 * `sector` is the AUTHORITATIVE current sector (A01 for Missions 00–20, A02 for the new grid). Within
 * A01, missions 08+ (the "Deep Network" chapter) still get a deeper bump so late A01 keeps its feel —
 * without mislabelling those missions as a different sector.
 */
export function resolveAtmosphere(sector: SectorKey, missionId: number, depth: number, base: VisualPreset): ResolvedAtmosphere {
  const s = SECTOR_ATMOSPHERE[sector];
  const deepA01 = sector === 'A01' && missionId >= 8; // late-A01 Deep Network chapter
  // depth scaling is an A01 (subnetwork-depth) concept — A02 is one free-scan field, so don't let a
  // leftover A01 depth over-fog the big A02 world.
  const d = sector === 'A02' ? { fogAdd: 0, bloomAdd: 0, particleMul: 1 } : depthAtmosphere(depth);
  return {
    key: s.key,
    name: s.name,
    fogDensity: s.fogDensity + (deepA01 ? 0.0014 : 0) + d.fogAdd,
    bloomIntensity: base.bloomIntensity + s.bloomAdd + (deepA01 ? 0.12 : 0) + d.bloomAdd,
    bloomThreshold: Math.max(0.08, base.bloomThreshold + s.thresholdAdd),
    particleOpacity: Math.min(1.1, s.particleOpacity * d.particleMul),
  };
}

// stable initial fog density (A01 base) so the <fogExp2> is created once and SectorAtmosphere can
// ease scene.fog.density toward the live target without React re-instantiating it.
export const FOG_INITIAL = SECTOR_ATMOSPHERE.A01.fogDensity;

export interface RouteStyle {
  color: THREE.Color; // bloom-friendly (kept below pure white so Bloom stays a crisp halo, not a blob)
  speed: number; // flow speed of the travelling band (toward the node)
  baseOpacity: number; // the steady underlying route line
  flowOpacity: number; // the travelling pulse band added on top
  segmented: boolean; // firewall — a striped / blocked pattern instead of a smooth route
  jitter: number; // corruption — unstable flicker amount (0 = none)
}

/**
 * Route palette per objective kind. Teal-ice flowing routes for gateway/data/core, a slower
 * striped "blocked" route for firewall, a calm relay flow, and an unstable muted-red flow for
 * corruption. Muted on purpose — additive blending + Bloom supply the glow.
 */
export const ROUTE_KINDS: Record<ObjectiveVisualKind, RouteStyle> = {
  data: { color: new THREE.Color(0.6, 0.82, 1.0), speed: 0.75, baseOpacity: 0.16, flowOpacity: 0.5, segmented: false, jitter: 0 },
  core: { color: new THREE.Color(0.55, 0.95, 1.05), speed: 0.6, baseOpacity: 0.22, flowOpacity: 0.64, segmented: false, jitter: 0 },
  firewall: { color: new THREE.Color(0.72, 0.82, 1.05), speed: 0.42, baseOpacity: 0.2, flowOpacity: 0.42, segmented: true, jitter: 0 },
  relay: { color: new THREE.Color(0.6, 0.92, 0.84), speed: 0.85, baseOpacity: 0.16, flowOpacity: 0.5, segmented: false, jitter: 0 },
  corruption: { color: new THREE.Color(1.0, 0.42, 0.42), speed: 0.7, baseOpacity: 0.14, flowOpacity: 0.46, segmented: false, jitter: 0.5 },
};

/**
 * A flowing "route" line material: a steady faint base line + a bright band travelling TOWARD the
 * node (aParam: 0 at the far endpoint → 1 at the objective node). Distance-faded; additive for a
 * clean bloom glow. `segmented` switches to a striped/blocked pattern (firewall); `jitter` adds an
 * unstable flicker (corruption). One material per route group (only the ≤3 edges of one node).
 */
export function createRouteLinkMaterial(style: RouteStyle): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: style.color.clone() },
      uSpeed: { value: style.speed },
      uBase: { value: style.baseOpacity },
      uFlow: { value: style.flowOpacity },
      uSeg: { value: style.segmented ? 1 : 0 },
      uJitter: { value: style.jitter },
      uNear: { value: LINK_FADE_NEAR.clone() },
      uFar: { value: LINK_FADE_FAR.clone() },
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
      uniform vec3 uColor;
      uniform float uSpeed;
      uniform float uBase;
      uniform float uFlow;
      uniform float uSeg;
      uniform float uJitter;
      uniform vec2 uNear;
      uniform vec2 uFar;
      varying float vParam;
      varying float vLen;
      varying float vDist;
      void main() {
        // a bright band travelling toward the node (vParam 0 -> 1)
        float head = fract(uTime * uSpeed);
        float band = smoothstep(0.16, 0.0, abs(vParam - head));
        // firewall: a striped / blocked pattern instead of a smooth route
        float seg = mix(1.0, step(0.5, fract(vParam * max(2.0, vLen / 2.5) - uTime * 0.25)), uSeg);
        // corruption: unstable flicker (bounded)
        float fl = 1.0 - uJitter * (0.5 + 0.5 * sin(uTime * 12.0 + vParam * 9.0));
        // distance fades match the resting link mesh
        float nearF = smoothstep(uNear.x, uNear.y, vDist);
        float farF = 1.0 - smoothstep(uFar.x, uFar.y, vDist);
        float a = (uBase + uFlow * band) * seg * fl * nearF * farF;
        if (a < 0.004) discard;
        gl_FragColor = vec4(uColor, a);
      }
    `,
  });
}
