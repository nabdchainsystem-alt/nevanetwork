/**
 * Sector grid generator (Sector Progression — A01 → A02).
 *
 * A01 keeps its existing static `NETWORK` (network.ts) — untouched. A02 is a NEW, larger,
 * DETERMINISTIC procedural grid built here: same data shape as `Network`, but parameterised
 * (major clusters, ~wide spatial spread, LONG bridge routes between clusters, special anchors).
 * Pure data — deterministic from a seed, so the same seed always yields the same A02.
 *
 * This task lays the A02 *foundation* (transition + grid + free-scan). Future missions will wire the
 * `special` anchors (core / gateways / corruption / firewalls) into objective logic.
 */
import { WORLD_SEED, FIELD, mulberry32 } from './world';
import type { Network, NodeMeta } from './network';

/** Deterministic A02 seed from a stable string id (FNV-1a, XOR'd with the world seed). */
function hashSeed(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h ^ WORLD_SEED) >>> 0;
}
export const A02_SEED_ID = 'NEVA_A02_DEEP_GRID';
export const A02_SEED = hashSeed(A02_SEED_ID);

export interface SectorGenOpts {
  seed: number;
  clusterCount: number; // major lobes / constellations
  nodeCount: number; // interactive / free-scan node count (capped for performance)
  clusterRadius: number; // node spread within a lobe
  spreadScale: number; // overall world spread (× FIELD.radius) — A02 is a much larger world than A01
  linkDistance: number; // max LOCAL edge length (nearest-neighbour)
  maxNeighbours: number;
  bridgesPerCluster: number; // long inter-cluster routes from each cluster's representative node
  fillFraction: number; // 0..1 share of nodes scattered UNIFORMLY through the sphere (fills the gaps between lobes)
  corruptionDensity: number; // 0..1 share of nodes flagged corrupted (future objective hook)
  firewallDensity: number; // 0..1 share flagged firewall/locked
}

/** A02 default grid — a large, DENSE deep network: many lobes + a uniform fill so the space between
 *  clusters is populated (no big black gaps) + long bridge routes. */
export const A02_OPTS: SectorGenOpts = {
  seed: A02_SEED,
  clusterCount: 16, // more lobes spread across the sphere → less gap
  nodeCount: 760, // ~2.2× — populate the world densely
  clusterRadius: 38, // bigger lobes overlap/fill more
  spreadScale: 2.6, // same big world — now filled in
  linkDistance: 40, // denser field → shorter neighbours keep links local (less crossing web)
  maxNeighbours: 3,
  bridgesPerCluster: 2, // long routes linking the constellations
  fillFraction: 0.42, // ~42% of nodes scattered uniformly through the sphere → fills the gaps
  corruptionDensity: 0.16,
  firewallDensity: 0.1,
};

/** Deterministic anchor nodes for future A02 missions (not yet wired into gameplay). */
export interface SectorSpecial {
  core: number; // the deep core anchor (farthest from centre)
  gateways: number[]; // route gateways (cluster representatives — bridge hubs)
  corruption: number[]; // corrupted node indices
  firewalls: number[]; // firewall / locked node indices
}

export interface GeneratedSector {
  net: Network;
  special: SectorSpecial;
  opts: SectorGenOpts;
  bounds: { center: [number, number, number]; radius: number }; // for camera framing (establishing shot)
  routeKind: Uint8Array; // per-edge visible-route tier: 0 = STRUCTURAL (faint), 1 = BRIDGE (prominent)
}

const TYPES = ['MEMORY OBJECT', 'DATA RELAY', 'ARCHIVE', 'SENSOR ARRAY', 'GATEWAY', 'CACHE INDEX', 'DEEP NODE'];
const ACCESS = ['LIMITED', 'OPEN', 'SECURE', 'RESTRICTED', 'BLACK'];

/**
 * Build a procedural sector grid. Mirrors network.ts's lobe → scatter → nearest-neighbour approach
 * (so it uses the exact same node/cube/link visual language) but larger, with LONG BRIDGE routes
 * connecting the clusters so the world reads as a linked deep network, not isolated dust.
 */
export function generateSector(opts: SectorGenOpts): GeneratedSector {
  const { seed, clusterCount, nodeCount, clusterRadius, spreadScale, linkDistance, maxNeighbours, bridgesPerCluster, fillFraction } = opts;
  const rng = mulberry32(seed >>> 0);
  const R = FIELD.radius * spreadScale;
  const g = () => rng() + rng() + rng() - 1.5; // ~[-1.5, 1.5] (soft gaussian)

  // major lobe centres inside a wide sphere — flatter on Y so the field reads as a broad spatial slab
  const centers = new Float32Array(clusterCount * 3);
  for (let i = 0; i < clusterCount; i++) {
    const u = rng() * 2 - 1;
    const ang = rng() * Math.PI * 2;
    const rad = Math.cbrt(rng()) * R * 0.82; // fill the whole sphere (no empty core → grid reads from anywhere)
    const s = Math.sqrt(1 - u * u);
    centers[i * 3] = Math.cos(ang) * s * rad;
    centers[i * 3 + 1] = u * rad * 0.6;
    centers[i * 3 + 2] = Math.sin(ang) * s * rad;
  }

  // node positions: most cluster around the lobes; a `fillFraction` share is scattered UNIFORMLY
  // through the sphere so the space BETWEEN the lobes is populated (no big black gaps) — a dense field.
  const positions = new Float32Array(nodeCount * 3);
  for (let i = 0; i < nodeCount; i++) {
    if (rng() < fillFraction) {
      // uniform volume fill — fills the inter-cluster gaps (cbrt → even density by volume)
      const u = rng() * 2 - 1;
      const ang = rng() * Math.PI * 2;
      const rad = Math.cbrt(rng()) * R * 0.85;
      const s = Math.sqrt(1 - u * u);
      positions[i * 3] = Math.cos(ang) * s * rad;
      positions[i * 3 + 1] = u * rad * 0.6;
      positions[i * 3 + 2] = Math.sin(ang) * s * rad;
    } else {
      const c = (rng() * clusterCount) | 0;
      const wide = rng() < 0.1 ? 2.0 : 1; // a few flung wider → fragmented frontier
      const spread = (clusterRadius * 0.55 + rng() * clusterRadius) * wide;
      positions[i * 3] = centers[c * 3] + g() * spread;
      positions[i * 3 + 1] = centers[c * 3 + 1] + g() * spread;
      positions[i * 3 + 2] = centers[c * 3 + 2] + g() * spread;
    }
  }

  // re-centre the whole field on the origin so the overview camera (which orbits the origin) frames
  // the grid dead-on — otherwise the random centroid drifts the establishing shot off-centre.
  {
    let mx = 0, my = 0, mz = 0;
    for (let i = 0; i < nodeCount; i++) { mx += positions[i * 3]; my += positions[i * 3 + 1]; mz += positions[i * 3 + 2]; }
    mx /= nodeCount; my /= nodeCount; mz /= nodeCount;
    for (let i = 0; i < nodeCount; i++) { positions[i * 3] -= mx; positions[i * 3 + 1] -= my; positions[i * 3 + 2] -= mz; }
    for (let i = 0; i < clusterCount; i++) { centers[i * 3] -= mx; centers[i * 3 + 1] -= my; centers[i * 3 + 2] -= mz; }
  }

  const neighbours: number[][] = Array.from({ length: nodeCount }, () => []);
  const edgeSet = new Set<number>();
  const edges: [number, number][] = [];
  const addEdge = (i: number, j: number) => {
    if (i === j) return;
    const key = i < j ? i * nodeCount + j : j * nodeCount + i;
    if (edgeSet.has(key)) return;
    edgeSet.add(key);
    edges.push([i, j]);
    if (!neighbours[i].includes(j)) neighbours[i].push(j);
    if (!neighbours[j].includes(i)) neighbours[j].push(i);
  };

  // local nearest-neighbour edges within a distance threshold (the cluster mesh)
  for (let i = 0; i < nodeCount; i++) {
    const ix = positions[i * 3], iy = positions[i * 3 + 1], iz = positions[i * 3 + 2];
    const cand: { j: number; d: number }[] = [];
    for (let j = 0; j < nodeCount; j++) {
      if (j === i) continue;
      const dx = positions[j * 3] - ix;
      const dy = positions[j * 3 + 1] - iy;
      const dz = positions[j * 3 + 2] - iz;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d < linkDistance) cand.push({ j, d });
    }
    cand.sort((a, b) => a.d - b.d);
    for (let k = 0; k < Math.min(maxNeighbours, cand.length); k++) addEdge(i, cand[k].j);
  }
  const localEdgeCount = edges.length; // edges added after this are the long BRIDGE routes

  // cluster representative = the node nearest each lobe centre (the bridge hub)
  const reps: number[] = [];
  for (let c = 0; c < clusterCount; c++) {
    const cx = centers[c * 3], cy = centers[c * 3 + 1], cz = centers[c * 3 + 2];
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < nodeCount; i++) {
      const dx = positions[i * 3] - cx, dy = positions[i * 3 + 1] - cy, dz = positions[i * 3 + 2] - cz;
      const d = dx * dx + dy * dy + dz * dz;
      if (d < bestD) { bestD = d; best = i; }
    }
    reps.push(best);
  }
  // LONG BRIDGE routes — connect each cluster rep to its nearest other-cluster reps (deduped). These
  // span the whole world (well beyond linkDistance) so the constellations read as one linked network.
  for (let c = 0; c < clusterCount; c++) {
    const order: { o: number; d: number }[] = [];
    for (let o = 0; o < clusterCount; o++) {
      if (o === c) continue;
      const dx = centers[c * 3] - centers[o * 3], dy = centers[c * 3 + 1] - centers[o * 3 + 1], dz = centers[c * 3 + 2] - centers[o * 3 + 2];
      order.push({ o, d: dx * dx + dy * dy + dz * dz });
    }
    order.sort((a, b) => a.d - b.d);
    for (let k = 0; k < Math.min(bridgesPerCluster, order.length); k++) addEdge(reps[c], reps[order[k].o]);
  }

  const meta: NodeMeta[] = [];
  for (let i = 0; i < nodeCount; i++) {
    const idn = (1000 + ((rng() * 8999) | 0)) % 10000;
    const hh = (rng() * 23) | 0;
    const mm = (rng() * 59) | 0;
    const ss = (rng() * 59) | 0;
    meta.push({
      id: `DX-${String(idn).padStart(4, '0')}`,
      type: TYPES[(rng() * TYPES.length) | 0],
      status: rng() > 0.22 ? 'ACTIVE' : 'IDLE',
      links: neighbours[i].length,
      signal: 70 + ((rng() * 29) | 0),
      lastSync: `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`,
      access: ACCESS[(rng() * ACCESS.length) | 0],
    });
  }

  // ---- deterministic special anchors (future objective hooks) ----
  const distSq = (i: number) => positions[i * 3] ** 2 + positions[i * 3 + 1] ** 2 + positions[i * 3 + 2] ** 2;
  let core = 0;
  let coreD = -1;
  for (let i = 0; i < nodeCount; i++) {
    const d = distSq(i);
    if (d > coreD) { coreD = d; core = i; }
  }
  // GATEWAYS = a spread of cluster reps (the bridge hubs) — 3–5 major anchors
  const gateways = reps.filter((r) => r !== core).slice(0, Math.min(5, Math.max(3, Math.floor(clusterCount / 2))));
  // CORRUPTION / FIREWALL = deterministic subsets (own stream so they're stable per seed)
  const flagRng = mulberry32((seed ^ 0x33cc) >>> 0);
  const corruption: number[] = [];
  const firewalls: number[] = [];
  for (let i = 0; i < nodeCount; i++) {
    if (i === core || gateways.includes(i)) continue;
    const r = flagRng();
    if (r < opts.corruptionDensity) corruption.push(i);
    else if (r < opts.corruptionDensity + opts.firewallDensity) firewalls.push(i);
  }

  // bounding center + radius (camera establishing-shot framing)
  let cx = 0, cy = 0, cz = 0;
  for (let i = 0; i < nodeCount; i++) { cx += positions[i * 3]; cy += positions[i * 3 + 1]; cz += positions[i * 3 + 2]; }
  cx /= nodeCount; cy /= nodeCount; cz /= nodeCount;
  let radius = 1;
  for (let i = 0; i < nodeCount; i++) {
    const d = Math.hypot(positions[i * 3] - cx, positions[i * 3 + 1] - cy, positions[i * 3 + 2] - cz);
    if (d > radius) radius = d;
  }

  // per-edge route kind: 0 = STRUCTURAL (faint cluster mesh), 1 = BRIDGE (the meaningful long routes)
  const routeKind = new Uint8Array(edges.length);
  for (let e = localEdgeCount; e < edges.length; e++) routeKind[e] = 1;

  return {
    net: { positions, centers, edges, neighbours, meta },
    special: { core, gateways, corruption, firewalls },
    opts,
    bounds: { center: [cx, cy, cz], radius },
    routeKind,
  };
}

/** The canonical A02 grid — generated once, memoized at module load (deterministic, ~one-time cost). */
export const SECTOR_A02: GeneratedSector = generateSector(A02_OPTS);
