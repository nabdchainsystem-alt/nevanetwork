/**
 * The interactive network — a deterministic graph of clickable data nodes built
 * once at module load and shared by every component (renderer, raycaster,
 * connections, camera, panel). Background atmosphere nodes are generated
 * separately; these are the limited set used for interaction.
 *
 * Nodes organise into soft lobes (a floating "data brain") linked to nearby
 * neighbours.
 */
import { FIELD, WORLD_SEED, mulberry32 } from './world';

export const INTERACTIVE_COUNT = 220;
/** Soft clusters the cloud organises into. */
export const CLUSTER_COUNT = 11;
/** Max edge length / neighbours — keeps the mesh from going chaotic. */
const LINK_DISTANCE = 30;
const MAX_NEIGHBOURS = 3;

export interface NodeMeta {
  id: string;
  type: string;
  status: string;
  links: number;
  signal: number; // %
  lastSync: string; // hh:mm:ss
  access: string;
}

export interface Network {
  positions: Float32Array; // INTERACTIVE_COUNT * 3
  centers: Float32Array; // CLUSTER_COUNT * 3 (lobe centres, reused by bg nodes)
  edges: [number, number][];
  neighbours: number[][];
  meta: NodeMeta[];
}

const TYPES = [
  'MEMORY OBJECT',
  'DATA RELAY',
  'ARCHIVE',
  'SENSOR ARRAY',
  'GATEWAY',
  'CACHE INDEX',
];
const ACCESS = ['LIMITED', 'OPEN', 'SECURE', 'RESTRICTED'];

function build(): Network {
  const rng = mulberry32((WORLD_SEED ^ 0x4e70a17) >>> 0);
  const R = FIELD.radius;
  const g = () => rng() + rng() + rng() - 1.5; // ~[-1.5, 1.5]

  // cluster centres inside a sphere
  const centers = new Float32Array(CLUSTER_COUNT * 3);
  for (let i = 0; i < CLUSTER_COUNT; i++) {
    const u = rng() * 2 - 1;
    const ang = rng() * Math.PI * 2;
    const rad = Math.cbrt(rng()) * R * 0.7;
    const s = Math.sqrt(1 - u * u);
    centers[i * 3] = Math.cos(ang) * s * rad;
    centers[i * 3 + 1] = u * rad * 0.7;
    centers[i * 3 + 2] = Math.sin(ang) * s * rad;
  }

  // nodes scattered around the lobes
  const positions = new Float32Array(INTERACTIVE_COUNT * 3);
  for (let i = 0; i < INTERACTIVE_COUNT; i++) {
    const c = (rng() * CLUSTER_COUNT) | 0;
    const spread = 18 + rng() * 16;
    positions[i * 3] = centers[c * 3] + g() * spread;
    positions[i * 3 + 1] = centers[c * 3 + 1] + g() * spread;
    positions[i * 3 + 2] = centers[c * 3 + 2] + g() * spread;
  }

  // nearest-neighbour edges within a distance threshold
  const neighbours: number[][] = Array.from({ length: INTERACTIVE_COUNT }, () => []);
  const edgeSet = new Set<number>();
  const edges: [number, number][] = [];
  for (let i = 0; i < INTERACTIVE_COUNT; i++) {
    const ix = positions[i * 3], iy = positions[i * 3 + 1], iz = positions[i * 3 + 2];
    const cand: { j: number; d: number }[] = [];
    for (let j = 0; j < INTERACTIVE_COUNT; j++) {
      if (j === i) continue;
      const dx = positions[j * 3] - ix;
      const dy = positions[j * 3 + 1] - iy;
      const dz = positions[j * 3 + 2] - iz;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d < LINK_DISTANCE) cand.push({ j, d });
    }
    cand.sort((a, b) => a.d - b.d);
    for (let k = 0; k < Math.min(MAX_NEIGHBOURS, cand.length); k++) {
      const j = cand[k].j;
      const key = i < j ? i * INTERACTIVE_COUNT + j : j * INTERACTIVE_COUNT + i;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push([i, j]);
      }
      if (!neighbours[i].includes(j)) neighbours[i].push(j);
      if (!neighbours[j].includes(i)) neighbours[j].push(i);
    }
  }

  const meta: NodeMeta[] = [];
  for (let i = 0; i < INTERACTIVE_COUNT; i++) {
    const idn = (1000 + ((rng() * 8999) | 0)) % 10000;
    const hh = (rng() * 23) | 0;
    const mm = (rng() * 59) | 0;
    const ss = (rng() * 59) | 0;
    meta.push({
      id: `NX-${String(idn).padStart(4, '0')}`,
      type: TYPES[(rng() * TYPES.length) | 0],
      status: rng() > 0.18 ? 'ACTIVE' : 'IDLE',
      links: neighbours[i].length,
      signal: 78 + ((rng() * 21) | 0),
      lastSync: `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`,
      access: ACCESS[(rng() * ACCESS.length) | 0],
    });
  }

  return { positions, centers, edges, neighbours, meta };
}

export const NETWORK: Network = build();
