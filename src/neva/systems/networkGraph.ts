// LEGACY — UNWIRED PROTOTYPE: parallel node/sector registry, NOT imported by the live app
// (0 external importers as of the P1 audit). Kept for reference only — adopt deliberately or
// remove in Phase 3; do not build new gameplay on it without wiring it in first.
/**
 * NEVA Network — Spatial Memory Graph helpers.
 * Thin accessors over the existing generated network data (src/network.ts) +
 * node kinds (src/game.ts), exposed through the NEVA type vocabulary.
 */
import type {
  NetworkLink,
  NetworkNode,
  NodeId,
  NodeKind,
  NodeStatus,
  Vec3,
} from '../types';
import { NETWORK, INTERACTIVE_COUNT } from '../../network';
import { nodeType } from '../../game';
import { getSectorFromPosition, getDistanceBetween } from './coordinateSystem';

function posOf(id: NodeId): Vec3 {
  return {
    x: NETWORK.positions[id * 3],
    y: NETWORK.positions[id * 3 + 1],
    z: NETWORK.positions[id * 3 + 2],
  };
}

/** Build a NetworkNode view from the current generated data. */
export function getNodeById(id: NodeId): NetworkNode | null {
  if (id < 0 || id >= INTERACTIVE_COUNT) return null;
  const m = NETWORK.meta[id];
  const position = posOf(id);
  return {
    id,
    kind: nodeType(id) as NodeKind,
    status: 'ACTIVE' as NodeStatus,
    position,
    sector: getSectorFromPosition(position),
    links: NETWORK.neighbours[id] ?? [],
    signal: m.signal,
    access: m.access,
    label: m.id,
  };
}

/** Direct neighbours of a node (Link Line endpoints). */
export function getLinkedNodes(id: NodeId): NodeId[] {
  return NETWORK.neighbours[id] ?? [];
}

/** The `count` nearest nodes to a node by distance (excludes itself). */
export function getNearestNodes(id: NodeId, count = 5): NodeId[] {
  const p = posOf(id);
  const out: { j: number; d: number }[] = [];
  for (let j = 0; j < INTERACTIVE_COUNT; j++) {
    if (j === id) continue;
    out.push({ j, d: getDistanceBetween(p, posOf(j)) });
  }
  out.sort((a, b) => a.d - b.d);
  return out.slice(0, count).map((o) => o.j);
}

/** Create a NetworkNode with sensible defaults (for future authored nodes). */
export function createNetworkNode(
  init: { id: NodeId; kind: NodeKind; position: Vec3 } & Partial<NetworkNode>,
): NetworkNode {
  return {
    status: 'ACTIVE',
    sector: getSectorFromPosition(init.position),
    links: [],
    signal: 90,
    access: 'OPEN',
    label: `NX-${String(init.id).padStart(4, '0')}`,
    ...init,
  };
}

export function createNetworkLink(
  a: NodeId,
  b: NodeId,
  kind: NetworkLink['kind'] = 'NORMAL',
): NetworkLink {
  return { a, b, kind };
}
