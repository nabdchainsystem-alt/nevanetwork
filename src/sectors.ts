/**
 * Sector registry — each sector's node coordinates in ONE place ("the sectors file").
 *
 * Every sector has its own node set + coordinates:
 *  - A01 (MEMORY GRID): the 220 mission nodes + appended hidden-trap DECOY nodes (network.ts).
 *  - A02 (DEEP GRID):   the larger procedural deep grid (sectorGen.ts).
 *
 * Coordinates are DETERMINISTIC from the world seed, so this module is the canonical, reproducible
 * coordinate set for each sector — the same seed always rebuilds the same layout. Read-only; nothing
 * here changes gameplay. Use `SECTORS[id].net.positions` (3 floats per node) for a sector's coords.
 */
import { NETWORK, INTERACTIVE_COUNT, MISSION_NODE_COUNT, DECOY_NODE_COUNT, type Network } from './network';
import { SECTOR_A02, A02_SEED, A02_SEED_ID } from './sectorGen';
import { WORLD_SEED } from './world';

export type SectorId = 'A01' | 'A02';

export interface SectorCoords {
  id: SectorId;
  name: string;
  seedId: string; // human-readable seed source
  seed: number; // numeric seed the layout derives from (deterministic / reproducible)
  net: Network; // positions (3 floats per node) · edges · neighbours · meta — the coordinates
  nodeCount: number;
  edgeCount: number;
  missionNodeCount: number; // A01: the mission graph; A02: all nodes (no decoy split)
  decoyNodeCount: number; // A01: appended hidden-trap decoys; A02: 0
}

/** The canonical per-sector coordinate registry. */
export const SECTORS: Record<SectorId, SectorCoords> = {
  A01: {
    id: 'A01',
    name: 'MEMORY GRID',
    seedId: 'WORLD_SEED',
    seed: WORLD_SEED >>> 0,
    net: NETWORK,
    nodeCount: INTERACTIVE_COUNT,
    edgeCount: NETWORK.edges.length,
    missionNodeCount: MISSION_NODE_COUNT,
    decoyNodeCount: DECOY_NODE_COUNT,
  },
  A02: {
    id: 'A02',
    name: 'DEEP GRID',
    seedId: A02_SEED_ID,
    seed: A02_SEED >>> 0,
    net: SECTOR_A02.net,
    nodeCount: SECTOR_A02.net.positions.length / 3,
    edgeCount: SECTOR_A02.net.edges.length,
    missionNodeCount: SECTOR_A02.net.positions.length / 3,
    decoyNodeCount: 0,
  },
};

/** A node's [x, y, z] coordinate within a sector. */
export function sectorNodePos(sector: SectorId, i: number): [number, number, number] {
  const p = SECTORS[sector].net.positions;
  return [p[i * 3], p[i * 3 + 1], p[i * 3 + 2]];
}

/** Serialize a sector's coordinates to a plain JSON-safe object (for export / inspection / a save). */
export function exportSectorCoords(sector: SectorId): {
  id: SectorId;
  name: string;
  seed: number;
  nodeCount: number;
  positions: number[]; // flat [x0,y0,z0, x1,y1,z1, …]
  edges: [number, number][];
} {
  const s = SECTORS[sector];
  return {
    id: s.id,
    name: s.name,
    seed: s.seed,
    nodeCount: s.nodeCount,
    positions: Array.from(s.net.positions),
    edges: s.net.edges,
  };
}
