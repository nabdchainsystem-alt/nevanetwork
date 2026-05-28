/**
 * NEVA Network — interface-game layer. Pure local frontend state.
 * Node game-types are derived deterministically from the node index (the base
 * network generation in network.ts is left untouched). The reducer is pure
 * (no Date.now / Math.random) so it is React-StrictMode safe.
 */
import { WORLD_SEED, mulberry32 } from './world';
import { NETWORK, INTERACTIVE_COUNT, MISSION_NODE_COUNT } from './network';
import { A02_SEED } from './sectorGen';

export type NodeType =
  | 'MEMORY'
  | 'CAMERA'
  | 'IDENTITY'
  | 'MESSAGE'
  | 'ARCHIVE'
  | 'GATEWAY'
  | 'DECOY'
  | 'LOCKED';

interface TypeCfg {
  exportValue: number; // data gained on EXPORT
  openTrace: number; // trace added on OPEN STREAM
  exportTrace: number; // trace added on EXPORT
  risk: 'LOW' | 'MED' | 'HIGH' | 'CRIT';
}

export const TYPE_CFG: Record<NodeType, TypeCfg> = {
  MEMORY: { exportValue: 10, openTrace: 3, exportTrace: 6, risk: 'LOW' },
  CAMERA: { exportValue: 6, openTrace: 6, exportTrace: 8, risk: 'MED' },
  IDENTITY: { exportValue: 20, openTrace: 4, exportTrace: 12, risk: 'HIGH' },
  MESSAGE: { exportValue: 8, openTrace: 3, exportTrace: 6, risk: 'LOW' },
  ARCHIVE: { exportValue: 15, openTrace: 3, exportTrace: 10, risk: 'MED' },
  GATEWAY: { exportValue: 0, openTrace: 4, exportTrace: 8, risk: 'HIGH' },
  DECOY: { exportValue: 0, openTrace: 6, exportTrace: 0, risk: 'CRIT' },
  LOCKED: { exportValue: 12, openTrace: 4, exportTrace: 10, risk: 'HIGH' },
};

// Weighted type assignment, deterministic per node — PER DEPTH.
//  Depth 01 = surface / learning layer: lots of safe MEMORY/MESSAGE, modest risk.
//  Depth 02+ = deeper subnetwork: fewer plain MEMORY, more ARCHIVE/CAMERA/LOCKED and
//  more DECOY (not overwhelming), and a rarer — therefore more valuable — GATEWAY.
const WEIGHTS_D1: [NodeType, number][] = [
  ['MEMORY', 22],
  ['CAMERA', 14],
  ['MESSAGE', 14],
  ['ARCHIVE', 12],
  ['IDENTITY', 10],
  ['GATEWAY', 8],
  ['DECOY', 20],
  ['LOCKED', 10],
];
const WEIGHTS_D2: [NodeType, number][] = [
  ['MEMORY', 12],
  ['CAMERA', 20],
  ['MESSAGE', 14],
  ['ARCHIVE', 20],
  ['IDENTITY', 10],
  ['GATEWAY', 6],
  ['DECOY', 24],
  ['LOCKED', 12],
];

function buildTypes(weights: [NodeType, number][], seed: number): NodeType[] {
  const rng = mulberry32(seed >>> 0);
  const total = weights.reduce((s, [, w]) => s + w, 0);
  const out: NodeType[] = [];
  // only the MISSION nodes get a rolled type — appended decoy nodes are forced DECOY in `nodeType`.
  // (Same per-node RNG draws in order, so the mission types are byte-identical to before.)
  for (let i = 0; i < MISSION_NODE_COUNT; i++) {
    let r = rng() * total;
    let pick: NodeType = 'MEMORY';
    for (const [t, w] of weights) {
      if (r < w) {
        pick = t;
        break;
      }
      r -= w;
    }
    out.push(pick);
  }
  return out;
}

// Guarantee a minimum number of GATEWAY nodes so progression never depends purely on
// the random roll. (With the weights above this is already satisfied — this is a safety
// net that only flips a few nodes if a layer ever rolled too few.)
function ensureGateways(types: NodeType[], min: number, seed: number): void {
  let count = types.reduce((n, t) => n + (t === 'GATEWAY' ? 1 : 0), 0);
  if (count >= min) return;
  const rng = mulberry32(seed >>> 0);
  let guard = 0;
  while (count < min && guard++ < types.length * 2) {
    const i = Math.floor(rng() * types.length);
    if (types[i] !== 'GATEWAY') {
      types[i] = 'GATEWAY';
      count++;
    }
  }
}

// Depth 01 keeps the EXACT original stream (seed unchanged); deeper layers re-roll from
// their own sub-seed, so the same node index can present as a different, riskier type.
const TYPES_D1 = buildTypes(WEIGHTS_D1, (WORLD_SEED ^ 0x6a3e11) >>> 0);
const TYPES_DEEP = buildTypes(WEIGHTS_D2, (WORLD_SEED ^ 0x6a3e11 ^ 0x00d2) >>> 0);
ensureGateways(TYPES_D1, 2, (WORLD_SEED ^ 0x6a3e11 ^ 0x6a71) >>> 0); // Depth 01 ≥ 2 gateways
ensureGateways(TYPES_DEEP, 1, (WORLD_SEED ^ 0x6a3e11 ^ 0x6a72) >>> 0); // Depth 02 ≥ 1 gateway

// Mission 03 needs at least 2 WATCHER (CAMERA) nodes to isolate. The deep mix already
// rolls ~40 cameras so this safety net never fires — but it guarantees the mission is
// always completable regardless of seed. Flips a non-camera node to CAMERA only if short.
function ensureType(types: NodeType[], kind: NodeType, min: number, seed: number): void {
  let count = types.reduce((n, t) => n + (t === kind ? 1 : 0), 0);
  if (count >= min) return;
  const rng = mulberry32(seed >>> 0);
  let guard = 0;
  while (count < min && guard++ < types.length * 2) {
    const i = Math.floor(rng() * types.length);
    if (types[i] !== kind && types[i] !== 'GATEWAY') {
      types[i] = kind;
      count++;
    }
  }
}
ensureType(TYPES_DEEP, 'CAMERA', 2, (WORLD_SEED ^ 0x6a3e11 ^ 0x0ca3) >>> 0); // Depth 02 ≥ 2 watchers

/** Retained export = the depth-01 assignment. */
export const NODE_TYPES: NodeType[] = TYPES_D1;

// Appended nodes (index ≥ MISSION_NODE_COUNT) that fill A01: ~40% DECOY hidden traps + ~60% real
// EXTRACTABLE data nodes (MEMORY/MESSAGE/IDENTITY/ARCHIVE) so scanning the dense field earns yields,
// not just trips traps. Deterministic per index (own RNG stream) → a node is always the same type.
const APPENDED_TYPES: NodeType[] = (() => {
  const n = Math.max(0, INTERACTIVE_COUNT - MISSION_NODE_COUNT);
  const rng = mulberry32((WORLD_SEED ^ 0x0dec0a) >>> 0);
  const out: NodeType[] = [];
  for (let i = 0; i < n; i++) {
    if (rng() < 0.4) {
      out.push('DECOY'); // ~40% hidden traps
    } else {
      const r = rng(); // ~60% extractable DATA nodes (yield on EXPORT)
      out.push(r < 0.42 ? 'MEMORY' : r < 0.72 ? 'MESSAGE' : r < 0.9 ? 'IDENTITY' : 'ARCHIVE');
    }
  }
  return out;
})();

/** A node's game-type at a given depth (depth ≥ 2 uses the deeper, riskier mix). Appended nodes
 * (index ≥ MISSION_NODE_COUNT) use the fixed APPENDED_TYPES mix (mostly extractable, some DECOY). */
export const nodeType = (i: number, depth = 1): NodeType =>
  i >= MISSION_NODE_COUNT
    ? APPENDED_TYPES[i - MISSION_NODE_COUNT] ?? 'DECOY'
    : (depth >= 2 ? TYPES_DEEP : TYPES_D1)[i] ?? 'MEMORY';

// Precomputed GATEWAY index lists per layer (for the dev gateway locator / G shortcut).
const GATEWAYS_D1 = TYPES_D1.flatMap((t, i) => (t === 'GATEWAY' ? [i] : []));
const GATEWAYS_DEEP = TYPES_DEEP.flatMap((t, i) => (t === 'GATEWAY' ? [i] : []));
/** All GATEWAY node indices at the given depth. */
export const gatewaysAtDepth = (depth: number): number[] =>
  depth >= 2 ? GATEWAYS_DEEP : GATEWAYS_D1;

// Precomputed CAMERA (= Mission 03 WATCHER) index lists per layer — for the dev count readout.
const WATCHERS_D1 = TYPES_D1.flatMap((t, i) => (t === 'CAMERA' ? [i] : []));
const WATCHERS_DEEP = TYPES_DEEP.flatMap((t, i) => (t === 'CAMERA' ? [i] : []));
/** All WATCHER (CAMERA) node indices at the given depth (Mission 03 signal sources). */
export const watchersAtDepth = (depth: number): number[] =>
  depth >= 2 ? WATCHERS_DEEP : WATCHERS_D1;

/** All node indices of a given type at the given depth — drives the terminal's `go to`
 * cycling so repeated commands visit different nodes (deterministic index order). */
export const nodesOfType = (type: NodeType, depth: number): number[] => {
  const out: number[] = [];
  for (let i = 0; i < MISSION_NODE_COUNT; i++) if (nodeType(i, depth) === type) out.push(i);
  return out;
};

// ---------------------------------------------- Mission 03 corrupted links ---
// A deterministic ~32% of edges are "corrupted" in the Signal War layer. TRACE LINKS on a
// node stabilises the corrupted edges touching it (Mission 03 task). Computed once.
const corruptRng = mulberry32((WORLD_SEED ^ 0x5197a1) >>> 0);
export const EDGE_CORRUPT: boolean[] = NETWORK.edges.map(() => corruptRng() < 0.32);
export const CORRUPT_EDGE_COUNT = EDGE_CORRUPT.reduce((n, c) => n + (c ? 1 : 0), 0);
// node index → indices of corrupted edges incident to it
const NODE_CORRUPT_EDGES: number[][] = Array.from({ length: INTERACTIVE_COUNT }, () => []);
NETWORK.edges.forEach(([a, b], e) => {
  if (EDGE_CORRUPT[e]) {
    NODE_CORRUPT_EDGES[a]?.push(e);
    NODE_CORRUPT_EDGES[b]?.push(e);
  }
});

/** Corrupted edge indices incident to a node (empty for an unknown / clean node). Read-only. */
export const corruptEdgesAt = (node: number): readonly number[] => NODE_CORRUPT_EDGES[node] ?? [];

/**
 * How many corrupted edges touching `node` are still UNSTABILIZED — i.e. how many
 * TRACE LINKS on this node would repair. Pure read helper (drives the panel/HUD/objective
 * guidance); changes no game rules. Returns 0 outside the Signal War layer's edge set.
 */
export function corruptedNearby(node: number, linkStabilized: Record<number, boolean>): number {
  const inc = NODE_CORRUPT_EDGES[node];
  if (!inc) return 0;
  let n = 0;
  for (const e of inc) if (!linkStabilized[e]) n++;
  return n;
}

// ------------------------------------------------- depth / level scaling ---
// Deterministic: Depth 01 is the baseline; deeper layers raise data value and trace
// cost, and reveal a few more links on TRACE.
const depthTraceMul = (d: number) => 1 + (d - 1) * 0.25; // d2=1.25, d3=1.5

// Explicit export values for the deeper layer (the panel shows the depth-resolved
// number). Depth 02 per design; depth 03+ scales gently from the depth-02 value.
const EXPORT_VALUE_D2: Partial<Record<NodeType, number>> = {
  MEMORY: 14,
  MESSAGE: 12,
  IDENTITY: 28,
  ARCHIVE: 24,
  CAMERA: 10,
  LOCKED: 18,
};

/** Export data value of a node at the given depth (rounded). */
export function exportValueAt(type: NodeType, depth: number): number {
  const base = TYPE_CFG[type].exportValue;
  if (base === 0) return 0; // GATEWAY / DECOY → no useful data
  if (depth <= 1) return base;
  const d2 = EXPORT_VALUE_D2[type] ?? Math.round(base * 1.4);
  if (depth === 2) return d2;
  return Math.round(d2 * (1 + (depth - 2) * 0.35)); // depth 03+ (future)
}

/** Access level required to EXPORT this node kind (deeper = stricter). */
export function accessRequiredFor(type: NodeType, depth: number): number {
  if (type === 'LOCKED') return depth >= 3 ? 3 : 2;
  if (type === 'ARCHIVE') return depth >= 3 ? 3 : 2; // OR trace it instead
  return 1;
}

// ----------------------------------------------------- resource yields ---
// "Chance" rewards must stay DETERMINISTIC (the reducer is pure — no Math.random). Each
// (node, salt) hashes to a stable [0,1) via mulberry32, so a node always drops the same bonus
// and the panel can preview it exactly. A node exports once, so per-node rolls are fine.
const roll = (node: number, salt: number): number =>
  mulberry32(((WORLD_SEED ^ 0x9e37) + node * 0x9e3779b1 + salt * 0x85ebca6b) >>> 0)();
// ACCESS_KEY drop chance on ARCHIVE / LOCKED, rising with depth (KEY_FORGE adds +12%/level)
// KEY_FORGE (upgrade) and the KEY CACHE subnetwork module both nudge the key-drop chance up.
const keyChance = (depth: number, forge = 0, cache = 0): number =>
  Math.min(0.95, (depth >= 3 ? 0.5 : depth >= 2 ? 0.35 : 0.15) + 0.12 * forge + 0.06 * cache);

const NO_GAIN: ResourceGain = { data: 0, shards: 0, keys: 0, signal: 0, core: 0 };

/**
 * The full reward for EXPORTING a node — DATA plus the extra resources. Pure + deterministic,
 * so it doubles as the panel's expected-yield preview. (DATA is applied via extractedData; the
 * `data` field here is for display.) Reward scales lightly with depth; CORE_FRAGMENTS only
 * appear at Depth 03+. GATEWAY / DECOY return no data (handled separately by the reducer).
 */
export function exportYield(
  node: number,
  type: NodeType,
  depth: number,
  prev: NodeStatus | undefined,
  up?: Upgrades, // EXPORT_EFFICIENCY scales DATA; KEY_FORGE raises key chance
  cache = 0, // KEY CACHE subnetwork module level — nudges key-drop chance
): ResourceGain {
  const exportEff = up?.exportEfficiency ?? 0;
  const forge = up?.keyForge ?? 0;
  let data = exportValueAt(type, depth);
  if (data > 0 && exportEff > 0) data = Math.round(data * (1 + 0.1 * exportEff)); // +10%/level
  // DEEP VAULT (Mission 09): the designated vault yields markedly more DATA (the higher-reward
  // node). Applied here so the panel's expected-yield preview matches the actual export.
  if (node === VAULT_NODE_INDEX && data > 0) data = Math.round(data * 1.5);
  let shards = 0;
  let keys = 0;
  let signal = 0;
  let core = 0;
  switch (type) {
    case 'MEMORY':
      shards = depth >= 2 ? 2 : 1;
      break;
    case 'ARCHIVE':
      shards = depth >= 2 ? 3 : 2;
      if (roll(node, 1) < keyChance(depth, forge, cache)) keys = 1;
      if (depth >= 3 && roll(node, 2) < 0.15) core = 1;
      break;
    case 'IDENTITY':
      keys = 1; // high-value record → guaranteed key (kept simple/deterministic)
      if (depth >= 3 && roll(node, 3) < 0.2) core = 1;
      break;
    case 'LOCKED':
      if (roll(node, 4) < keyChance(depth, forge, cache)) keys = 1;
      break;
    case 'CAMERA':
      // a watcher exported only AFTER being handled safely (isolated or traced) yields signal
      if (prev?.isolated || prev?.traced) signal = 1;
      break;
    default:
      break; // MESSAGE etc → DATA only
  }
  // CORE FRAGMENT node (Mission 14): a guaranteed Core Fragment on export. Node-gated (like the
  // DEEP VAULT data bonus) so the panel's expected-yield preview matches the real export exactly.
  if (node === FRAGMENT_NODE_INDEX) core += 1;
  return { data, shards, keys, signal, core };
}

/** Merge a resource gain into state + record it for the HUD feedback (only if non-zero). DATA
 * is NOT added here — callers apply it via extractedData; `gain.data` is for the readout. */
function addResources(s: GameState, gain: ResourceGain): GameState {
  if (!gain.data && !gain.shards && !gain.keys && !gain.signal && !gain.core) return s;
  return {
    ...s,
    resources: {
      memoryShards: s.resources.memoryShards + gain.shards,
      accessKeys: s.resources.accessKeys + gain.keys,
      signalEnergy: s.resources.signalEnergy + gain.signal,
      coreFragments: s.resources.coreFragments + gain.core,
    },
    lastGain: gain,
    gainId: s.gainId + 1,
  };
}

// ----------------------------------------------------- upgrade system ---
// Permanent session upgrades bought with resources. Effects are applied lightly across the
// reducer; the definitions (costs + display) live here so the reducer and the UI agree.
export interface UpgradeCost {
  data?: number; // DATA (= extractedData) — used by Player Subnetwork module costs (upgrades omit it)
  signal?: number;
  mem?: number;
  keys?: number;
  core?: number; // reserved for future high-tier upgrades — unused for now
}
export interface UpgradeDef {
  id: UpgradeId;
  name: string;
  max: number;
  effect: (level: number) => string; // human-readable effect AT the given level
  costs: UpgradeCost[]; // costs[i] = cost to go from level i → i+1 (length === max)
}

export const UPGRADE_DEFS: UpgradeDef[] = [
  {
    id: 'traceDampener',
    name: 'TRACE DAMPENER',
    max: 3,
    effect: (l) => (l ? `TRACE GAIN -${l * 8}%` : 'REDUCES ACTION TRACE'),
    costs: [{ signal: 2 }, { signal: 4, keys: 1 }, { signal: 6, keys: 2 }],
  },
  {
    id: 'exportEfficiency',
    name: 'EXPORT EFFICIENCY',
    max: 3,
    effect: (l) => (l ? `DATA REWARD +${l * 10}%` : 'BOOSTS DATA EXPORTS'),
    costs: [{ mem: 4 }, { mem: 8, keys: 1 }, { mem: 12, keys: 2 }],
  },
  {
    id: 'scanResolution',
    name: 'SCAN RESOLUTION',
    max: 3,
    effect: (l) => (l ? `NODE INTEL +${l}` : 'CLEARER NODE INTEL'),
    costs: [{ mem: 3 }, { mem: 6, signal: 1 }, { mem: 10, signal: 2 }],
  },
  {
    id: 'isolationCore',
    name: 'ISOLATION CORE',
    max: 3,
    effect: (l) => (l ? `ISOLATE -${l * 15}% MORE TRACE` : 'STRONGER ISOLATION'),
    costs: [{ signal: 3 }, { signal: 6 }, { signal: 9, keys: 1 }],
  },
  {
    id: 'keyForge',
    name: 'KEY FORGE',
    max: 3,
    effect: (l) => (l ? `KEY DROP CHANCE +${l * 12}%` : 'BETTER KEY YIELD'),
    costs: [{ keys: 1, mem: 5 }, { keys: 2, mem: 8 }, { keys: 3, mem: 12 }],
  },
  {
    id: 'signalStabilizer',
    name: 'SIGNAL STABILIZER',
    max: 3,
    effect: (l) => (l ? `PULSE -${l * 7}% · WIDER REPAIR` : 'PULSE RESIST · REPAIR'),
    costs: [{ signal: 4 }, { signal: 8, keys: 1 }, { signal: 12, keys: 2 }],
  },
];

export const UPGRADE_BY_ID: Record<UpgradeId, UpgradeDef> = UPGRADE_DEFS.reduce(
  (m, d) => ((m[d.id] = d), m),
  {} as Record<UpgradeId, UpgradeDef>,
);

/** Can the player afford this cost right now? */
export function canAffordUpgrade(r: Resources, cost: UpgradeCost): boolean {
  return (
    r.signalEnergy >= (cost.signal ?? 0) &&
    r.memoryShards >= (cost.mem ?? 0) &&
    r.accessKeys >= (cost.keys ?? 0) &&
    r.coreFragments >= (cost.core ?? 0)
  );
}

/** "4 SIGNAL · 1 KEY" — compact cost string. */
export function upgradeCostText(cost: UpgradeCost): string {
  const parts: string[] = [];
  if (cost.signal) parts.push(`${cost.signal} SIGNAL`);
  if (cost.mem) parts.push(`${cost.mem} MEM`);
  if (cost.keys) parts.push(`${cost.keys} ${cost.keys === 1 ? 'KEY' : 'KEYS'}`);
  if (cost.core) parts.push(`${cost.core} CORE`);
  return parts.join(' · ');
}

// ------------------------------------------- Player Subnetwork v1 (home grid) ---
// A private "home grid" that unlocks after Mission 03. A SECOND, lightweight progression layer
// on top of upgrades: install MODULES (paid with existing resources incl. DATA) that gently
// improve the run. Persisted in the save; cleared only by a full reset. Not a mission.
export type ModuleId = 'VAULT' | 'SHIELD' | 'CACHE' | 'RELAY';
export type SubnetModules = Record<ModuleId, number>; // installed level 0–3 per module

export interface ModuleDef {
  id: ModuleId;
  name: string;
  marker: string; // short label shown on the in-world module node
  max: number;
  purpose: string;
  effect: (level: number) => string; // human-readable effect AT the given level
  costs: UpgradeCost[]; // costs[i] = level i → i+1 (DATA + resources), length === max
}

export const MODULE_DEFS: ModuleDef[] = [
  {
    id: 'VAULT', name: 'DATA VAULT', marker: 'VAULT', max: 3,
    purpose: 'INCREASES STORAGE / DATA RETENTION',
    effect: (l) => (l ? `DATA EXPORT +${l * 8}% · STORAGE +${l * 250}` : 'EXPANDS STORAGE · DATA BONUS'),
    costs: [{ data: 100, mem: 5 }, { data: 220, mem: 9 }, { data: 380, mem: 14 }],
  },
  {
    id: 'SHIELD', name: 'TRACE SHIELD', marker: 'SHIELD', max: 3,
    purpose: 'REDUCES TRACE PRESSURE WHILE ACTIVE',
    effect: (l) => (l ? `ACTION TRACE -${l * 4}%` : 'SOFTENS TRACE GAINS'),
    costs: [{ data: 80, signal: 4 }, { data: 170, signal: 7 }, { data: 300, signal: 11 }],
  },
  {
    id: 'CACHE', name: 'KEY CACHE', marker: 'CACHE', max: 3,
    purpose: 'IMPROVES ACCESS KEY HANDLING',
    effect: (l) => (l ? `KEY DROP +${l * 6}%` : 'BETTER KEY YIELD'),
    costs: [{ data: 120, keys: 1, mem: 4 }, { data: 240, keys: 2, mem: 7 }, { data: 400, keys: 3, mem: 11 }],
  },
  {
    id: 'RELAY', name: 'SIGNAL RELAY', marker: 'RELAY', max: 3,
    purpose: 'IMPROVES SIGNAL RESISTANCE / REPAIR',
    effect: (l) => (l ? `PULSE -${l * 4}% · WIDER REPAIR` : 'PULSE RESIST · REPAIR'),
    costs: [{ data: 100, signal: 5, mem: 3 }, { data: 210, signal: 8, mem: 6 }, { data: 360, signal: 12, mem: 9 }],
  },
];
export const MODULE_BY_ID: Record<ModuleId, ModuleDef> = MODULE_DEFS.reduce(
  (m, d) => ((m[d.id] = d), m),
  {} as Record<ModuleId, ModuleDef>,
);

export const STORAGE_BASE = 500; // private-grid base storage; DATA VAULT raises it (display/strategy)

/** The deterministic HOME node = the interactive node nearest the cloud centre (the "heart"
 * of the network). Same every reload (positions derive from WORLD_SEED). */
export const HOME_NODE_INDEX: number = (() => {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < MISSION_NODE_COUNT; i++) {
    const x = NETWORK.positions[i * 3];
    const y = NETWORK.positions[i * 3 + 1];
    const z = NETWORK.positions[i * 3 + 2];
    const d = x * x + y * y + z * z;
    if (d < bestD) { bestD = d; best = i; }
  }
  return best;
})();

/** The deterministic CORE node = the interactive node FARTHEST from the cloud centre (the deep
 * frontier — the Mission 07 objective). Distinct from HOME (nearest centre). Same every reload. */
export const CORE_NODE_INDEX: number = (() => {
  let best = 0;
  let bestD = -1;
  for (let i = 0; i < MISSION_NODE_COUNT; i++) {
    const x = NETWORK.positions[i * 3];
    const y = NETWORK.positions[i * 3 + 1];
    const z = NETWORK.positions[i * 3 + 2];
    const d = x * x + y * y + z * z;
    if (d > bestD) { bestD = d; best = i; }
  }
  return best;
})();

// --------------------------------------------- Phase 3A — designated deep objective nodes ---
// Missions 08–12 each lead the player to ONE deterministic node, chosen as the farthest node of
// the matching deep-type (depth ≥ 2 type table) so it sits out on the deep frontier near the CORE.
// No new NodeType is introduced — these reuse the existing types/rendering; only the mission layer
// treats them specially (and the panel shows their CLASS purpose, which already exists).
const farthestOfType = (deepType: NodeType, exclude: ReadonlySet<number>): number => {
  let best = -1;
  let bestD = -1;
  for (let i = 0; i < MISSION_NODE_COUNT; i++) {
    if (exclude.has(i) || nodeType(i, 2) !== deepType) continue;
    const x = NETWORK.positions[i * 3];
    const y = NETWORK.positions[i * 3 + 1];
    const z = NETWORK.positions[i * 3 + 2];
    const d = x * x + y * y + z * z;
    if (d > bestD) { bestD = d; best = i; }
  }
  return best === -1 ? CORE_NODE_INDEX : best; // fallback keeps the objective a real, reachable node
};
/** DEEP VAULT (Mission 09) — high-value DATA, higher trace. Farthest ARCHIVE. */
export const VAULT_NODE_INDEX: number = farthestOfType('ARCHIVE', new Set([CORE_NODE_INDEX, HOME_NODE_INDEX]));
/** BLACK FIREWALL (Mission 10) — needs a KEY / TRACE to open. Farthest LOCKED. */
export const FIREWALL_NODE_INDEX: number = farthestOfType('LOCKED', new Set([CORE_NODE_INDEX, HOME_NODE_INDEX, VAULT_NODE_INDEX]));
/** CORRUPTION focus (Mission 11) — the corruption-wave node to stabilize. Farthest DECOY. */
export const CORRUPTION_NODE_INDEX: number = farthestOfType('DECOY', new Set([CORE_NODE_INDEX, HOME_NODE_INDEX, VAULT_NODE_INDEX, FIREWALL_NODE_INDEX]));
/** BROKEN RELAY (Mission 12) — route node to restore. Farthest GATEWAY. */
export const RELAY_NODE_INDEX: number = farthestOfType('GATEWAY', new Set([CORE_NODE_INDEX, HOME_NODE_INDEX, VAULT_NODE_INDEX, FIREWALL_NODE_INDEX, CORRUPTION_NODE_INDEX]));

// --------------------------------------------- Phase 3B — Sector A02 Alpha Core arc (Missions 13–20) ---
// Six more designated deep-frontier nodes, chosen with the SAME `farthestOfType` picker as Phase 3A
// and a growing exclusion set so every objective targets a DISTINCT node. No new NodeType / rendering —
// the mission layer treats these indices specially (TRACE always works → every objective is reachable
// and always completable). The final two missions reuse the deep CORE node itself as the ALPHA CORE.
const A02B_USED = new Set<number>([CORE_NODE_INDEX, HOME_NODE_INDEX, VAULT_NODE_INDEX, FIREWALL_NODE_INDEX, CORRUPTION_NODE_INDEX, RELAY_NODE_INDEX]);
/** SIGNAL STORM focus (Mission 13) — farthest CAMERA (signal source). TRACE/ISOLATE stabilizes it. */
export const STORM_NODE_INDEX: number = farthestOfType('CAMERA', A02B_USED);
A02B_USED.add(STORM_NODE_INDEX);
/** CORE FRAGMENT node (Mission 14) — farthest IDENTITY. EXPORT recovers a guaranteed Core Fragment. */
export const FRAGMENT_NODE_INDEX: number = farthestOfType('IDENTITY', A02B_USED);
A02B_USED.add(FRAGMENT_NODE_INDEX);
/** PRIVATE GRID relay (Mission 15) — farthest MEMORY. TRACE restores the overloaded grid route. */
export const GRID_NODE_INDEX: number = farthestOfType('MEMORY', A02B_USED);
A02B_USED.add(GRID_NODE_INDEX);
/** CORRUPTED CLUSTER (Mission 16) — next farthest DECOY (distinct from the M11 corruption node). */
export const CLUSTER_NODE_INDEX: number = farthestOfType('DECOY', A02B_USED);
A02B_USED.add(CLUSTER_NODE_INDEX);
/** BLACK ROUTE (Mission 17) — next farthest LOCKED (distinct from the BLACK FIREWALL). KEY/TRACE opens. */
export const BLACKROUTE_NODE_INDEX: number = farthestOfType('LOCKED', A02B_USED);
A02B_USED.add(BLACKROUTE_NODE_INDEX);
/** CORE CHAMBER (Mission 18) — next farthest GATEWAY (distinct from the BROKEN RELAY). TRACE opens it. */
export const CHAMBER_NODE_INDEX: number = farthestOfType('GATEWAY', A02B_USED);
A02B_USED.add(CHAMBER_NODE_INDEX);
/** ALPHA CORE (Missions 19–20) — the deep frontier CORE node itself: stabilize it, then secure it. */
export const ALPHA_CORE_NODE_INDEX: number = CORE_NODE_INDEX;

/** Player-facing node CLASS — the prototype taxonomy surfaced over the existing deterministic
 * node types (no regeneration). HOME / CORE are the two designated objective nodes. */
export type NodeCategory = 'HOME' | 'CORE' | 'DATA' | 'KEY' | 'VAULT' | 'FIREWALL' | 'CORRUPTED' | 'WATCHER' | 'GATEWAY';
export function nodeCategory(index: number, type: NodeType): NodeCategory {
  if (index === HOME_NODE_INDEX) return 'HOME';
  if (index === CORE_NODE_INDEX) return 'CORE';
  switch (type) {
    case 'MEMORY':
    case 'MESSAGE': return 'DATA';
    case 'IDENTITY': return 'KEY';
    case 'ARCHIVE': return 'VAULT';
    case 'LOCKED': return 'FIREWALL';
    case 'DECOY': return 'CORRUPTED';
    case 'CAMERA': return 'WATCHER';
    case 'GATEWAY': return 'GATEWAY';
  }
}

/** One-line purpose per node CLASS (shown in the inspection panel for at-a-glance clarity). */
export const CATEGORY_PURPOSE: Record<NodeCategory, string> = {
  HOME: 'PRIVATE GRID HUB',
  CORE: 'PROTOTYPE OBJECTIVE · SECURE IT',
  DATA: 'EXPORTS DATA',
  KEY: 'YIELDS ACCESS KEYS',
  VAULT: 'HIGH-VALUE DATA · HIGHER TRACE',
  FIREWALL: 'NEEDS A KEY / ACCESS LEVEL',
  CORRUPTED: 'HIGH RISK · STABILIZE OR AVOID',
  WATCHER: 'SIGNAL SOURCE · HIGH TRACE',
  GATEWAY: 'OPENS A DEEPER ROUTE',
};

// =====================================================================================
// MISSION 00 — FIRST SIGNAL (guided onboarding intro)
// A deterministic 9-node path revealed one-by-one BEFORE the full network opens. Each step is
// bound to a REAL node of the named type, and its taught action is that type's CORRECT play —
// so the guide can never mislabel a node (no fake roles). The reducer lets the normal action
// run and advances the step when the right action lands, so the player learns real mechanics.
// =====================================================================================

export type TutorialAction = 'INSPECT' | 'EXPORT' | 'TRACE' | 'USE_KEY' | 'ISOLATE' | 'OPEN_STREAM';

export interface TutorialStep {
  want: NodeType | 'CORE'; // the REAL node type this step is bound to ('CORE' = designated core node)
  action: TutorialAction; // the correct action that advances this step
  title: string;     // bar / panel heading
  button: string;    // guided-button label
  objective: string; // HUD / bar objective line
  what: string;      // what this node is
  why: string;       // why it matters / what the action does
  remember: string;  // the one-line takeaway
}

/** The 9 onboarding beats — one real node of each named type, taught with its correct action. */
export const TUTORIAL_STEPS: TutorialStep[] = [
  { want: 'MEMORY', action: 'INSPECT', title: 'FIRST SIGNAL', button: 'SYNCHRONIZE',
    objective: 'APPROACH THE FIRST SIGNAL',
    what: 'An unknown node — the network begins as one weak signal.',
    why: 'Synchronize it to come online and reveal the route ahead.',
    remember: 'Every route starts from a single signal.' },
  { want: 'MEMORY', action: 'EXPORT', title: 'DATA NODE', button: 'EXTRACT DATA',
    objective: 'EXTRACT DATA FROM THE NODE',
    what: 'A DATA node holds raw network material.',
    why: 'EXPORT it for DATA — the currency for upgrades and your grid.',
    remember: 'Careful: every export leaves TRACE behind.' },
  { want: 'IDENTITY', action: 'EXPORT', title: 'KEY NODE', button: 'EXTRACT KEY',
    objective: 'EXTRACT A KEY FROM THE IDENTITY NODE',
    what: 'An IDENTITY node yields an ACCESS KEY when exported.',
    why: 'Keys open firewalls and secured routes.',
    remember: 'Save keys for locked nodes.' },
  { want: 'ARCHIVE', action: 'TRACE', title: 'ARCHIVE NODE', button: 'TRACE ROUTE',
    objective: 'TRACE THE ARCHIVE ROUTE',
    what: 'An ARCHIVE holds high-value data behind an unverified route.',
    why: 'TRACE its links first — a verified route exports far cleaner.',
    remember: 'Trace a vault before you extract it.' },
  { want: 'LOCKED', action: 'USE_KEY', title: 'FIREWALL NODE', button: 'USE KEY',
    objective: 'USE A KEY TO OPEN THE FIREWALL',
    what: 'A FIREWALL (locked) node blocks access until unlocked.',
    why: 'Spend an ACCESS KEY to open it (or raise your access level).',
    remember: 'Firewalls need a KEY or access level.' },
  { want: 'CAMERA', action: 'ISOLATE', title: 'WATCHER NODE', button: 'ISOLATE',
    objective: 'ISOLATE THE WATCHER',
    what: 'A WATCHER (camera) is a signal source that drives TRACE up.',
    why: 'ISOLATE it to cut the signal and lower your trace.',
    remember: 'Isolate watchers before they raise pressure.' },
  { want: 'DECOY', action: 'ISOLATE', title: 'DECOY NODE', button: 'NEUTRALIZE',
    objective: 'NEUTRALIZE THE DECOY',
    what: 'A DECOY looks normal but is a trap — exporting it spikes TRACE.',
    why: 'Never export a decoy. ISOLATE it to neutralize the trap.',
    remember: 'Decoy = trap · isolate it, never export.' },
  { want: 'GATEWAY', action: 'OPEN_STREAM', title: 'GATEWAY NODE', button: 'OPEN STREAM',
    objective: 'OPEN THE GATEWAY STREAM',
    what: 'A GATEWAY opens a route to a deeper network layer.',
    why: 'OPEN STREAM to expose the route — entering it dives a layer down.',
    remember: 'Gateways lead deeper into the network.' },
  { want: 'CORE', action: 'INSPECT', title: 'CORE SIGNAL', button: 'SYNC CORE',
    objective: 'REACH THE CORE SIGNAL',
    what: 'CORE nodes are major network objectives.',
    why: 'Securing a core expands your control and opens the network.',
    remember: 'The core is the prize — the full grid awaits.' },
];

/** Per-step correct action (matched against the dispatched action's type to advance the intro). */
export const TUTORIAL_ACTIONS: TutorialAction[] = TUTORIAL_STEPS.map((s) => s.action);

/** The 9 intro node indices — one REAL node per step's `want` type, chosen as a greedy nearest
 * path from the cloud centre (the CORE step uses the designated CORE node). Deterministic, since
 * positions and node types both derive from WORLD_SEED. */
export const TUTORIAL_NODES: number[] = (() => {
  const pos = NETWORK.positions;
  const d2 = (a: number, b: number) => {
    const dx = pos[a * 3] - pos[b * 3];
    const dy = pos[a * 3 + 1] - pos[b * 3 + 1];
    const dz = pos[a * 3 + 2] - pos[b * 3 + 2];
    return dx * dx + dy * dy + dz * dz;
  };
  const fromOrigin = (i: number) => pos[i * 3] ** 2 + pos[i * 3 + 1] ** 2 + pos[i * 3 + 2] ** 2;
  const used = new Set<number>([CORE_NODE_INDEX]); // reserve CORE for its own step
  const out: number[] = [];
  let prev = -1;
  for (const step of TUTORIAL_STEPS) {
    if (step.want === 'CORE') { out.push(CORE_NODE_INDEX); prev = CORE_NODE_INDEX; continue; }
    let pick = -1, best = Infinity;
    for (let i = 0; i < MISSION_NODE_COUNT; i++) {
      if (used.has(i) || nodeType(i, 1) !== step.want) continue;
      const d = prev < 0 ? fromOrigin(i) : d2(prev, i);
      if (d < best) { best = d; pick = i; }
    }
    if (pick < 0) {
      // type absent (shouldn't happen at depth 1 — every type has weight): nearest unused node
      for (let i = 0; i < MISSION_NODE_COUNT; i++) {
        if (used.has(i)) continue;
        const d = prev < 0 ? fromOrigin(i) : d2(prev, i);
        if (d < best) { best = d; pick = i; }
      }
    }
    out.push(pick);
    used.add(pick);
    prev = pick;
  }
  return out;
})();

/** Network CORRUPTION risk (0–100) — share of corrupted links still UNSTABILIZED (Signal-War
 * layer onward). A clear "how dirty is the net" reading alongside the trace meter. Pure derive. */
export function corruptionRisk(s: GameState): number {
  if (s.missionId < 3 || CORRUPT_EDGE_COUNT === 0) return 0;
  let unstab = 0;
  for (let e = 0; e < EDGE_CORRUPT.length; e++) if (EDGE_CORRUPT[e] && !s.linkStabilized[e]) unstab++;
  return Math.round((100 * unstab) / CORRUPT_EDGE_COUNT);
}

/** Installed level of a subnetwork module (0 if not installed / not unlocked). */
export const moduleLvl = (s: GameState, id: ModuleId): number => s.playerSubnetwork.modules[id] ?? 0;

/** DATA VAULT bonus DATA on an export (+8% per level). Deterministic; shown in the feedback. */
export const vaultDataBonus = (data: number, vaultLvl: number): number =>
  data > 0 && vaultLvl > 0 ? Math.round(data * 0.08 * vaultLvl) : 0;

/** Can the player afford a module cost (DATA + resources) right now? */
export function canAffordModule(s: GameState, cost: UpgradeCost): boolean {
  return s.extractedData >= (cost.data ?? 0) && canAffordUpgrade(s.resources, cost);
}

/** "100 DATA · 5 MEM" — compact module cost string. */
export function moduleCostText(cost: UpgradeCost): string {
  const parts: string[] = [];
  if (cost.data) parts.push(`${cost.data} DATA`);
  if (cost.signal) parts.push(`${cost.signal} SIGNAL`);
  if (cost.mem) parts.push(`${cost.mem} MEM`);
  if (cost.keys) parts.push(`${cost.keys} ${cost.keys === 1 ? 'KEY' : 'KEYS'}`);
  if (cost.core) parts.push(`${cost.core} CORE`);
  return parts.join(' · ');
}

/** Small contextual guidance shown in the panel per node type (Depth 01 wording). */
export const TYPE_HINT: Record<NodeType, string> = {
  MEMORY: 'SAFE EXPORT TARGET',
  MESSAGE: 'TRACE LINKS RECOMMENDED',
  ARCHIVE: 'TRACE LINKS BEFORE EXPORT',
  CAMERA: 'HIGH TRACE RISK',
  DECOY: 'UNSTABLE SIGNAL — EXPORT DANGEROUS',
  GATEWAY: 'OPEN STREAM TO ENTER SUBNETWORK',
  IDENTITY: 'HIGH VALUE — HIGH TRACE',
  LOCKED: 'ACCESS REQUIRED OR TRACE LINKS NEEDED',
};

/** Suggested next action per node type (Depth 01 wording). */
export const RECOMMENDED_ACTION: Record<NodeType, string> = {
  MEMORY: 'EXPORT',
  MESSAGE: 'TRACE LINKS',
  ARCHIVE: 'TRACE LINKS',
  CAMERA: 'EXPORT · CAREFUL',
  DECOY: 'ISOLATE',
  GATEWAY: 'OPEN STREAM',
  IDENTITY: 'EXPORT',
  LOCKED: 'TRACE LINKS',
};

// Depth 02+ sharpens the guidance — riskier nodes read as clearer warnings.
const TYPE_HINT_D2: Record<NodeType, string> = {
  MEMORY: 'SAFE DATA OBJECT',
  MESSAGE: 'MAY REVEAL ROUTES',
  ARCHIVE: 'HIGH VALUE ARCHIVE',
  CAMERA: 'HIGH TRACE RISK',
  DECOY: 'UNSTABLE SIGNAL',
  GATEWAY: 'SUBNETWORK ROUTE',
  IDENTITY: 'HIGH VALUE IDENTITY',
  LOCKED: 'LOCKED OBJECT',
};
const RECOMMENDED_ACTION_D2: Record<NodeType, string> = {
  MEMORY: 'EXPORT',
  MESSAGE: 'TRACE LINKS',
  ARCHIVE: 'TRACE LINKS BEFORE EXPORT',
  CAMERA: 'ISOLATE OR AVOID',
  DECOY: 'DO NOT EXPORT',
  GATEWAY: 'OPEN STREAM',
  IDENTITY: 'EXPORT · CAREFUL',
  LOCKED: 'TRACE LINKS / ACCESS REQUIRED',
};

/** Depth-aware panel guidance (depth ≥ 2 uses the sharper deeper-layer wording). */
export const typeHint = (type: NodeType, depth = 1): string =>
  (depth >= 2 ? TYPE_HINT_D2 : TYPE_HINT)[type];
export const recommendedAction = (type: NodeType, depth = 1): string =>
  (depth >= 2 ? RECOMMENDED_ACTION_D2 : RECOMMENDED_ACTION)[type];

// -------------------------------------------------------------- game state ---
export interface NodeStatus {
  extracted?: boolean;
  isolated?: boolean;
  traced?: boolean;
  unlocked?: boolean;
  inspected?: boolean; // selected/focused at least once (mission "inspect" tracking)
  analyzed?: boolean; // ANALYZE NODE run (spent 1 MEMORY_SHARD) — reveals clearer info
}

export interface GameMessage {
  text: string;
  kind: 'ok' | 'warn' | 'fail';
}

export interface GameState {
  traceLevel: number; // 0..100
  extractedData: number;
  isolatedNodes: number;
  revealedLinks: number;
  currentDepth: number;
  accessLevel: number;
  locked: boolean; // trace-locked / session compromised
  statuses: Record<number, NodeStatus>;
  streamNode: number | null; // node whose OPEN STREAM panel is open
  tracedFrom: number | null; // node whose links are highlighted
  gatewayNode: number | null; // last gateway entered
  depthSeed: number; // bumps on ENTER_SUB (drives sub-cluster + camera dive)
  // counters snapshotted on ENTER_SUB so the deeper layer's task checklist starts fresh
  deepBaseExtracted: number;
  deepBaseLinks: number;
  deepBaseIsolated: number;
  nextGatewayFound: boolean; // opened a GATEWAY stream at depth ≥ 2 (deeper route found)
  // --- Phase 3A — Deep Network (Missions 08–12). Additive flags; the save merge defaults these
  //     to false/0 for old saves, so a Mission-07-complete save continues straight into Mission 08. ---
  maxDepthReached: number; // deepest layer ever reached (monotonic; survives a camera reset)
  deepSignalDetected: boolean; // M08: opened a GATEWAY stream at depth ≥ 3 (the deep signal)
  vaultBreached: boolean; // M09: exported the DEEP VAULT node
  blackFirewallOpened: boolean; // M10: opened the BLACK FIREWALL (traced / keyed / unlocked)
  corruptionWaveCleared: boolean; // M11: stabilized the corruption-wave node
  brokenRelayRestored: boolean; // M12: restored the BROKEN RELAY node
  // --- Phase 3B — Sector A02 Alpha Core arc (Missions 13–20). Additive flags; old saves default
  //     them to false via initGame merge, so a Mission-12-complete save continues into Mission 13. ---
  signalStormCleared: boolean; // M13: stabilized the SIGNAL STORM route
  coreFragmentRecovered: boolean; // M14: recovered the CORE FRAGMENT (export)
  privateGridStabilized: boolean; // M15: restored the overloaded PRIVATE GRID route
  corruptionContained: boolean; // M16: contained the CORRUPTED CLUSTER
  blackRouteOpened: boolean; // M17: opened the BLACK ROUTE
  coreChamberOpened: boolean; // M18: opened the SECTOR A02 CORE CHAMBER
  alphaCoreStabilized: boolean; // M19: stabilized the ALPHA CORE
  sectorA02Secured: boolean; // M20: secured the ALPHA CORE — Sector A02 complete
  threatEventsSeen: number; // count of threat-event cues shown (metadata / pacing)
  // --- Missions (reuses existing counters where possible) ---
  missionId: number; // 1 = SURFACE BREACH, 2 = ARCHIVE HUNT, 3 = SIGNAL WAR
  missionStarted: boolean; // player dismissed the briefing overlay
  missionComplete: boolean; // latched once the current mission's tasks are satisfied
  inspectedCount: number; // distinct nodes inspected this session
  riskIsolated: number; // risk nodes isolated this session (DECOY/CAMERA/LOCKED/unverified ARCHIVE)
  archiveExports: number; // ARCHIVE nodes successfully exported this session
  decoyExports: number; // DECOY nodes tripped this session
  // --- Mission 03 // SIGNAL WAR (network resistance) ---
  pulseActive: boolean; // a signal pulse is currently raising pressure
  signalPulsesSurvived: number; // completed signal pulses this session
  corruptedLinksStabilized: number; // corrupted links repaired via TRACE this session
  watcherIsolated: number; // CAMERA (watcher) nodes isolated this session
  linkStabilized: Record<number, boolean>; // which corrupted edge indices are repaired
  // counters captured at MISSION_START so each mission measures fresh progress
  missionBase: {
    extracted: number;
    revealed: number;
    riskIsolated: number;
    archiveExports: number;
    decoyExports: number;
    survived: number;
    stabilized: number;
    watcher: number;
  };
  message: GameMessage | null;
  msgId: number; // bumps per message (re-triggers UI animation)
  msgNode: number | null; // node the current message concerns (so it only shows there)
  // last action's trace change (signed) + a bumping id so the HUD can flash "TRACE ±N" once
  // per action (idle decay does not count — only deliberate actions surface a readout).
  traceDelta: number;
  traceDeltaId: number;
  traceShielded: boolean; // the last trace GAIN was softened by the TRACE SHIELD module (HUD badge)
  // --- Resource / mining layer (DATA = extractedData; these are the extra resources) ---
  resources: Resources;
  lastGain: ResourceGain | null; // the most recent reward breakdown (drives the HUD feedback)
  gainId: number; // bumps each time a resource gain happens (re-triggers the readout)
  // --- Upgrade layer (permanent session improvements bought with resources) ---
  upgrades: Upgrades;
  // --- Player Subnetwork v1 (private home grid; unlocks after Mission 03) ---
  playerSubnetwork: PlayerSubnetwork;
  // --- Mission 00 // FIRST SIGNAL (guided onboarding intro; gates the network reveal) ---
  networkRevealed: boolean; // false during the intro — only the revealed tutorial nodes show
  mission00: Mission00State;
  // --- Sector progression (A01 = Missions 00–20; A02 = the new procedural grid, post-M20) ---
  sectorProgress: SectorProgress;
}

/** Mission 00 — the guided onboarding intro. `complete` ends it; `step` is the current beat
 * (0..TUTORIAL_STEPS.length-1; advancing past the last sets `complete` + reveals the network). */
export interface Mission00State {
  complete: boolean;
  step: number;
}

/**
 * Sector progression. Missions 00–20 ARE Sector A01 (the existing game, gameplay unchanged).
 * Completing Mission 20 secures A01 and UNLOCKS the route to Sector A02 — a new, larger procedural
 * grid (free-scan; future missions). `a02Entered` flips after the A01→A02 cinematic transition.
 * Additive + save-merged, so old saves default to A01 (not entered).
 */
export interface SectorProgress {
  currentSector: 'A01' | 'A02';
  completedSectors: string[]; // e.g. ['A01'] once Mission 20 is done
  a02Unlocked: boolean; // Mission 20 complete → route open
  a02Entered: boolean; // player has crossed into Sector A02
  a02Seed: number; // deterministic seed of the generated A02 grid (0 until assigned)
}

/** The player's private home grid — a second progression layer (see MODULE_DEFS). */
export interface PlayerSubnetwork {
  unlocked: boolean;
  level: number; // 1 + number of installed modules
  integrity: number; // 0–100 (static at 100 in v1)
  storageCapacity: number; // STORAGE_BASE + DATA VAULT bonus (display / strategy)
  modules: SubnetModules; // installed level 0–3 per module
  lastVisitedDepth: number; // depth the player was at when last in the grid
  homeNodeId: number | null; // the HOME node index (set on unlock)
}

/** Mineable resources beyond DATA (= extractedData). All persisted in the save. */
export interface Resources {
  memoryShards: number; // mostly from MEMORY / ARCHIVE exports
  accessKeys: number; // rare — future LOCKED / deep-system unlocks
  signalEnergy: number; // from isolating watchers / stabilizing corrupted links
  coreFragments: number; // very rare — Depth 03+ (gateway / archive / identity)
}

/** Permanent upgrade levels (0–3 each). See `UPGRADE_DEFS` for costs/effects. */
export type UpgradeId =
  | 'traceDampener'
  | 'exportEfficiency'
  | 'scanResolution'
  | 'isolationCore'
  | 'keyForge'
  | 'signalStabilizer';
export type Upgrades = Record<UpgradeId, number>;

/** A single action's reward breakdown (also used by the panel's expected-yield preview). */
export interface ResourceGain {
  data: number; // DATA gained (display only — applied via extractedData)
  shards: number;
  keys: number;
  signal: number;
  core: number;
}

export type GameAction =
  | { type: 'TICK'; dt: number }
  | { type: 'OPEN_STREAM'; node: number }
  | { type: 'CLOSE_STREAM' }
  | { type: 'TRACE'; node: number; boost?: boolean } // boost = spend 1 SIGNAL to stabilize more
  | { type: 'ISOLATE'; node: number; boost?: boolean } // boost = spend 1 SIGNAL for a stronger cut
  | { type: 'EXPORT'; node: number }
  | { type: 'USE_KEY'; node: number } // spend 1 ACCESS_KEY to unlock a LOCKED node
  | { type: 'ANALYZE'; node: number } // spend 1 MEMORY_SHARD to reveal clearer info
  | { type: 'BUY_UPGRADE'; id: UpgradeId } // spend resources to raise an upgrade level
  | { type: 'INSTALL_MODULE'; id: ModuleId } // Player Subnetwork — install / upgrade a module
  | { type: 'ENTER_SUB'; node: number }
  | { type: 'INSPECT'; node: number }
  | { type: 'MISSION_START' }
  | { type: 'MISSION_ADVANCE' } // current mission complete → begin the next (keep network state)
  | { type: 'ENTER_SECTOR_A02' } // cross into Sector A02 (the new grid) after the A01→A02 transition
  | { type: 'FORCE_COMPLETE' } // DEV: "finish mission" terminal command — latch complete for fast testing
  | { type: 'GOTO_MISSION'; mission: number } // DEV: "mission N" terminal command — jump to a mission (1..20)
  | { type: 'PULSE_START' } // a signal pulse begins (Mission 03 network resistance)
  | { type: 'PULSE_END' } // the pulse ends (survived +1)
  | { type: 'LOAD_GAME'; game: GameState } // switch to another local profile's saved run
  | { type: 'LOAD_CHECKPOINT'; checkpoint: GameState | null } // recover from a trace lock
  | { type: 'RESET' };

export function initGame(): GameState {
  return {
    traceLevel: 0,
    extractedData: 0,
    isolatedNodes: 0,
    revealedLinks: 0,
    currentDepth: 1,
    accessLevel: 1,
    locked: false,
    statuses: {},
    streamNode: null,
    tracedFrom: null,
    gatewayNode: null,
    depthSeed: 0,
    deepBaseExtracted: 0,
    deepBaseLinks: 0,
    deepBaseIsolated: 0,
    nextGatewayFound: false,
    maxDepthReached: 1,
    deepSignalDetected: false,
    vaultBreached: false,
    blackFirewallOpened: false,
    corruptionWaveCleared: false,
    brokenRelayRestored: false,
    signalStormCleared: false,
    coreFragmentRecovered: false,
    privateGridStabilized: false,
    corruptionContained: false,
    blackRouteOpened: false,
    coreChamberOpened: false,
    alphaCoreStabilized: false,
    sectorA02Secured: false,
    threatEventsSeen: 0,
    missionId: 1,
    missionStarted: false,
    missionComplete: false,
    inspectedCount: 0,
    riskIsolated: 0,
    archiveExports: 0,
    decoyExports: 0,
    pulseActive: false,
    signalPulsesSurvived: 0,
    corruptedLinksStabilized: 0,
    watcherIsolated: 0,
    linkStabilized: {},
    missionBase: {
      extracted: 0,
      revealed: 0,
      riskIsolated: 0,
      archiveExports: 0,
      decoyExports: 0,
      survived: 0,
      stabilized: 0,
      watcher: 0,
    },
    message: null,
    msgId: 0,
    msgNode: null,
    traceDelta: 0,
    traceDeltaId: 0,
    traceShielded: false,
    resources: { memoryShards: 0, accessKeys: 0, signalEnergy: 0, coreFragments: 0 },
    lastGain: null,
    gainId: 0,
    upgrades: {
      traceDampener: 0,
      exportEfficiency: 0,
      scanResolution: 0,
      isolationCore: 0,
      keyForge: 0,
      signalStabilizer: 0,
    },
    playerSubnetwork: {
      unlocked: false,
      level: 1,
      integrity: 100,
      storageCapacity: STORAGE_BASE,
      modules: { VAULT: 0, SHIELD: 0, CACHE: 0, RELAY: 0 },
      lastVisitedDepth: 1,
      homeNodeId: null,
    },
    networkRevealed: false,
    mission00: { complete: false, step: 0 },
    sectorProgress: {
      currentSector: 'A01',
      completedSectors: [],
      a02Unlocked: false,
      a02Entered: false,
      a02Seed: 0,
    },
  };
}

// progress within the current mission, measured from the baseline captured at MISSION_START
export const missionProgress = (s: GameState) => ({
  extracted: s.extractedData - s.missionBase.extracted,
  traced: s.revealedLinks - s.missionBase.revealed,
  riskIsolated: s.riskIsolated - s.missionBase.riskIsolated,
  archiveExports: s.archiveExports - s.missionBase.archiveExports,
  decoyExports: s.decoyExports - s.missionBase.decoyExports,
  survived: s.signalPulsesSurvived - s.missionBase.survived,
  stabilized: s.corruptedLinksStabilized - s.missionBase.stabilized,
  watcher: s.watcherIsolated - s.missionBase.watcher,
});

/** Whether the Depth 03 route has been detected/opened (gateway stream at depth ≥ 2, or already deeper). */
export const depth03Detected = (s: GameState): boolean => s.nextGatewayFound || s.currentDepth >= 3;

/** Network threat tier derived from the trace meter — a clearer reading than a bare %.
 * STABLE (calm) → WATCHED → TRACED → CRITICAL (near lock). Pure; no state change. */
export type ThreatState = 'STABLE' | 'WATCHED' | 'TRACED' | 'CRITICAL';
export const threatState = (trace: number): ThreatState =>
  trace >= 85 ? 'CRITICAL' : trace >= 60 ? 'TRACED' : trace >= 30 ? 'WATCHED' : 'STABLE';

/** Whether the CORE node has been SECURED (any of extract / unlock / trace / isolate). The single
 * source of truth for the Mission 07 gate, the HUD checklist, and the panel's SECURE CORE prompt. */
export const coreSecured = (s: GameState): boolean => {
  const c = s.statuses[CORE_NODE_INDEX];
  return !!(c?.extracted || c?.unlocked || c?.traced || c?.isolated);
};

/** The GATEWAY at `depth` sitting closest to the CORE — the route that leads "down toward" the
 * objective. Deterministic (positions are seed-derived); null if no gateway exists at this depth. */
function deepRouteGateway(depth: number): number | null {
  const gws = gatewaysAtDepth(depth);
  if (gws.length === 0) return null;
  const cx = NETWORK.positions[CORE_NODE_INDEX * 3];
  const cy = NETWORK.positions[CORE_NODE_INDEX * 3 + 1];
  const cz = NETWORK.positions[CORE_NODE_INDEX * 3 + 2];
  let best = gws[0];
  let bestD = Infinity;
  for (const g of gws) {
    const dx = NETWORK.positions[g * 3] - cx;
    const dy = NETWORK.positions[g * 3 + 1] - cy;
    const dz = NETWORK.positions[g * 3 + 2] - cz;
    const d = dx * dx + dy * dy + dz * dz;
    if (d < bestD) { bestD = d; best = g; }
  }
  return best;
}

/**
 * The node the ACTIVE objective points at, or `null` for an overview phase. Used by the camera
 * transition handler to focus the right place when an objective/step/depth advances.
 *   1. Mission 00: the current tutorial node.
 *   2. Mission 07 (CORE BREACH): the one main mission with a single target node — aim at a deep
 *      route down while depth < 3, then at the CORE itself, so the player is led straight to it.
 *   3. Missions 01–06: aggregate goals (counts) with NO single node → `null` (network overview).
 */
export function getCurrentObjectiveNodeId(s: GameState): number | null {
  if (!s.mission00.complete) {
    return s.mission00.step < TUTORIAL_NODES.length ? TUTORIAL_NODES[s.mission00.step] : null;
  }
  // Phase 3A/3B — each deep mission leads to its one designated node (null once its flag is set, so
  // the camera releases to overview). Mission 08 leads to a deeper route until depth 04 is reached.
  if (s.missionId >= 20) return s.sectorA02Secured ? null : ALPHA_CORE_NODE_INDEX;
  if (s.missionId === 19) return s.alphaCoreStabilized ? null : ALPHA_CORE_NODE_INDEX;
  if (s.missionId === 18) return s.coreChamberOpened ? null : CHAMBER_NODE_INDEX;
  if (s.missionId === 17) return s.blackRouteOpened ? null : BLACKROUTE_NODE_INDEX;
  if (s.missionId === 16) return s.corruptionContained ? null : CLUSTER_NODE_INDEX;
  if (s.missionId === 15) return null; // Variety Pass — Private Grid Overload is an UPGRADE objective (no node target)
  if (s.missionId === 14) return s.coreFragmentRecovered ? null : FRAGMENT_NODE_INDEX;
  if (s.missionId === 13) return s.signalStormCleared ? null : STORM_NODE_INDEX;
  if (s.missionId >= 12) return s.brokenRelayRestored ? null : RELAY_NODE_INDEX;
  if (s.missionId === 11) return s.corruptionWaveCleared ? null : CORRUPTION_NODE_INDEX;
  if (s.missionId === 10) return s.blackFirewallOpened ? null : FIREWALL_NODE_INDEX;
  if (s.missionId === 9) return s.vaultBreached ? null : VAULT_NODE_INDEX;
  if (s.missionId === 8) return s.currentDepth >= 4 ? null : deepRouteGateway(s.currentDepth);
  if (s.missionId === 7) {
    if (coreSecured(s)) return null; // done — release to overview
    if (s.currentDepth >= 3) return CORE_NODE_INDEX; // deepest layer reached → aim at the CORE
    return deepRouteGateway(s.currentDepth); // not deep enough → aim at a route down (may be null)
  }
  return null;
}

/** A stable key for the active objective phase — changes exactly once per objective / tutorial-step
 * / depth / mission transition, so the camera transition runs once (and never every frame). */
export function objectiveKey(s: GameState): string {
  return `${s.missionId}:${s.mission00.complete ? 'X' : s.mission00.step}:${s.currentDepth}`;
}

/**
 * Mission 04 "install a module" is satisfied by raising EITHER a Player Subnetwork module
 * (INSTALL_MODULE, the [B] grid) OR any permanent upgrade (BUY_UPGRADE, the [U] UPGRADES
 * panel) to level > 0 — both read "installed" to the player. Pure; derived only from state,
 * so a save that already owns one completes the task the moment Mission 04 evaluates.
 */
export const hasInstalledModule = (s: GameState): boolean =>
  (Object.values(s.playerSubnetwork.modules) as number[]).some((l) => l > 0) ||
  (Object.values(s.upgrades) as number[]).some((l) => l > 0);

/**
 * Whether the current mission's required (completion-gating) tasks are satisfied. Soft
 * tasks (avoid decoy / keep trace below 100) are informational — they warn but never block
 * completion (the sole hard fail is trace lock).
 */
export function missionTasksDone(s: GameState): boolean {
  if (!s.missionStarted || s.locked) return false;
  const p = missionProgress(s);
  // --- Phase 3A/3B — Deep Network + Alpha Core (Missions 08–20). Each latches on a single
  //     deterministic flag set by acting on its designated node (TRACE always works → always
  //     completable). Old M12-complete saves continue into M13 (flags default false). ---
  if (s.missionId >= 20) return s.sectorA02Secured; // MISSION 20 // SECTOR A02 SECURED
  if (s.missionId === 19) return s.alphaCoreStabilized; // MISSION 19 // ALPHA CORE STABILIZATION
  if (s.missionId === 18) return s.coreChamberOpened; // MISSION 18 // CORE CHAMBER
  if (s.missionId === 17) return s.blackRouteOpened; // MISSION 17 // BLACK ROUTE ACCESS
  if (s.missionId === 16) return s.corruptionContained; // MISSION 16 // CORRUPTION CONTAINMENT
  if (s.missionId === 15) return s.privateGridStabilized; // MISSION 15 // PRIVATE GRID OVERLOAD
  if (s.missionId === 14) return s.coreFragmentRecovered; // MISSION 14 // CORE FRAGMENT RECOVERY
  if (s.missionId === 13) return s.signalStormCleared; // MISSION 13 // SIGNAL STORM
  if (s.missionId >= 12) return s.brokenRelayRestored; // MISSION 12 // RELAY COLLAPSE
  if (s.missionId === 11) return s.corruptionWaveCleared; // MISSION 11 // CORRUPTION WAVE
  if (s.missionId === 10) return s.blackFirewallOpened; // MISSION 10 // FIREWALL SURGE
  if (s.missionId === 9) return s.vaultBreached; // MISSION 09 // VAULT BREACH
  // MISSION 08 // DEEP SIGNAL — the descend is the final step: latch on actually ENTERING depth 04
  // (currentDepth only rises via ENTER_SUB). Gating also on `deepSignalDetected` was wrong — that
  // flag flips on OPEN STREAM, so it could complete the mission the instant you opened a gateway
  // while already at depth ≥ 4 (e.g. a pre-Phase-3A save). Detecting the signal stays a shown task.
  if (s.missionId === 8) return s.currentDepth >= 4;
  if (s.missionId === 7) {
    // MISSION 07 // CORE BREACH — reach the deepest layer and SECURE the CORE node (extract,
    // trace, unlock or isolate it — TRACE works on any node type, so this is always completable)
    return s.currentDepth >= 3 && coreSecured(s);
  }
  if (s.missionId === 6) {
    // MISSION 06 // DEEP EXTRACTION — pull serious DATA from the network
    return p.extracted >= 250;
  }
  if (s.missionId === 5) {
    // MISSION 05 // SECURE ROUTES — isolate risk + trace clean routes
    return p.riskIsolated >= 2 && p.traced >= 4;
  }
  if (s.missionId === 4) {
    // MISSION 04 // PRIVATE GRID — install your first module OR any permanent upgrade
    return hasInstalledModule(s);
  }
  if (s.missionId === 3) {
    // MISSION 03 // SIGNAL WAR
    return (
      p.survived >= 3 &&
      p.stabilized >= 5 &&
      p.watcher >= 2 &&
      p.extracted >= 250 &&
      // descend = final step: the mission latches complete only once you actually
      // ENTER SUBNETWORK to depth 03 (not merely once the route is detected).
      s.currentDepth >= 3
    );
  }
  if (s.missionId >= 2) {
    // MISSION 02 // ARCHIVE HUNT
    // Descend = final step: latch complete only once you actually ENTER SUBNETWORK to Depth 03
    // (currentDepth only rises via ENTER_SUB), NOT merely when the gateway stream is OPENED. Gating
    // on `nextGatewayFound` (set on OPEN STREAM) completed the mission the instant you opened the
    // gateway, before the player could enter — confusing next to the ENTER SUBNETWORK button.
    // Same pattern as Mission 08 (gated on currentDepth ≥ 4, not on the detect flag). Locating the
    // gateway is implicit: ENTER_SUB requires its stream to be open first.
    return (
      p.extracted >= 200 &&
      p.traced >= 6 &&
      p.archiveExports >= 2 &&
      p.riskIsolated >= 2 &&
      s.currentDepth >= 3
    );
  }
  // MISSION 01 // SURFACE BREACH
  return (
    s.inspectedCount >= 3 &&
    p.extracted >= 100 &&
    p.traced >= 3 &&
    p.riskIsolated >= 1 &&
    s.currentDepth >= 2
  );
}

// during a signal pulse, action trace costs rise slightly (network resistance pressure).
// SIGNAL_STABILIZER (upgrade, −7%/lvl) + SIGNAL RELAY (subnetwork module, −4%/lvl) soften that
// extra pressure (floored at 1.0).
const pulseMul = (s: GameState): number =>
  s.pulseActive
    ? Math.max(1, 1.3 - 0.07 * s.upgrades.signalStabilizer - 0.04 * s.playerSubnetwork.modules.RELAY)
    : 1;

// A node counts as a "risk" node for isolation when it is a DECOY / CAMERA / LOCKED, or an
// ARCHIVE whose route is still unverified (not yet traced/unlocked).
export function isRiskNode(type: NodeType, st: NodeStatus | undefined): boolean {
  if (type === 'DECOY' || type === 'CAMERA' || type === 'LOCKED') return true;
  if (type === 'ARCHIVE') return !(st?.traced || st?.unlocked);
  return false;
}

const clamp100 = (x: number) => Math.max(0, Math.min(100, x));
const pad2 = (n: number) => String(n).padStart(2, '0');

function withMsg(s: GameState, text: string, kind: GameMessage['kind']): GameState {
  return { ...s, message: { text, kind }, msgId: s.msgId + 1 };
}
function withTrace(s: GameState, next: number): GameState {
  // TRACE_DAMPENER softens trace GAINS (−8%/level), never reductions, with a ≥1 floor so risky
  // actions always cost something. Centralised here so every positive-trace action benefits.
  let target = next;
  const rawGain = next - s.traceLevel;
  // TRACE_DAMPENER (upgrade, −8%/lvl) + TRACE SHIELD (subnetwork module, −4%/lvl) both soften
  // trace GAINS. Combined reduction is capped so risky actions always cost ≥1.
  const reduce = Math.min(0.6, 0.08 * s.upgrades.traceDampener + 0.04 * s.playerSubnetwork.modules.SHIELD);
  if (rawGain > 0 && reduce > 0) {
    const damped = Math.max(1, Math.round(rawGain * (1 - reduce)));
    target = s.traceLevel + damped;
  }
  const t = clamp100(target);
  const delta = t - s.traceLevel;
  // the TRACE SHIELD module softened this change if it was a GAIN and the module is installed
  const shielded = rawGain > 0 && s.playerSubnetwork.modules.SHIELD > 0;
  const base = { ...s, traceLevel: t, locked: s.locked || t >= 100, traceShielded: shielded };
  // record the (clamped) change so the HUD can flash a "TRACE ±N" readout — actions only
  // reach withTrace, so idle decay (TICK) never triggers a readout. Skip a no-op delta.
  return delta === 0 ? base : { ...base, traceDelta: delta, traceDeltaId: s.traceDeltaId + 1 };
}

export function statusLabel(s: GameState, node: number | null): string {
  if (node == null) return '----';
  const st = s.statuses[node];
  if (!st) return 'ACTIVE';
  if (st.extracted) return 'EXTRACTED';
  if (st.isolated) return 'ISOLATED';
  if (st.traced) return 'TRACED';
  return 'ACTIVE';
}

/** Trace danger tier — drives the trace meter colour and any surface that follows it
 * (terminal / upgrade panel): monochrome until it matters, amber at ≥70%, red at ≥90%. */
export type TraceTier = 'ok' | 'warn' | 'crit';
export const traceTier = (trace: number): TraceTier =>
  trace >= 90 ? 'crit' : trace >= 70 ? 'warn' : 'ok';

function applyAction(s: GameState, a: GameAction): GameState {
  // when compromised, freeze everything except a reset / checkpoint recovery (PULSE_END may
  // still clear a pulse that was active at the moment of lock, so the signal cue doesn't stick)
  if (s.locked && a.type !== 'RESET' && a.type !== 'LOAD_GAME' && a.type !== 'LOAD_CHECKPOINT' && a.type !== 'PULSE_END')
    return s;

  switch (a.type) {
    case 'TICK': {
      const t = Math.max(0, s.traceLevel - 1.4 * a.dt);
      return t === s.traceLevel ? s : { ...s, traceLevel: t };
    }

    case 'OPEN_STREAM': {
      const type = nodeType(a.node, s.currentDepth);
      let mul = depthTraceMul(s.currentDepth) * pulseMul(s);
      if (s.pulseActive && type === 'CAMERA') mul *= 1.5; // watcher opened during a pulse
      const gain = Math.round(TYPE_CFG[type].openTrace * mul);
      // opening a deeper-layer GATEWAY counts as finding the next subnetwork route
      const nextGatewayFound =
        s.nextGatewayFound || (type === 'GATEWAY' && s.currentDepth >= 2);
      // Mission 08 // DEEP SIGNAL — opening a GATEWAY stream at depth ≥ 3 surfaces the deep route.
      const deepSignalDetected = s.deepSignalDetected || (type === 'GATEWAY' && s.currentDepth >= 3);
      const newDeepSignal = deepSignalDetected && !s.deepSignalDetected;
      // Variety Pass — OPEN is the completing action for the firewall (M10), black route (M17) and
      // core chamber (M18): opening the route's stream unlocks/opens it. (TRACE on these now only
      // analyzes — it no longer completes them.) Latched by node index, like the other objectives.
      const next: GameState = {
        ...s,
        streamNode: a.node,
        nextGatewayFound,
        deepSignalDetected,
        blackFirewallOpened: s.blackFirewallOpened || a.node === FIREWALL_NODE_INDEX,
        blackRouteOpened: s.blackRouteOpened || a.node === BLACKROUTE_NODE_INDEX,
        coreChamberOpened: s.coreChamberOpened || a.node === CHAMBER_NODE_INDEX,
      };
      const openMsg =
        a.node === FIREWALL_NODE_INDEX && s.missionId === 10 && !s.blackFirewallOpened ? 'BLACK FIREWALL OPENED · ROUTE CLEAR'
          : a.node === BLACKROUTE_NODE_INDEX && s.missionId === 17 && !s.blackRouteOpened ? 'BLACK ROUTE OPENED'
            : a.node === CHAMBER_NODE_INDEX && s.missionId === 18 && !s.coreChamberOpened ? 'CORE CHAMBER OPENED'
              : newDeepSignal ? 'DEEP SIGNAL DETECTED'
                : 'STREAM OPENED';
      return withMsg(withTrace(next, s.traceLevel + gain), openMsg, 'ok');
    }

    case 'CLOSE_STREAM':
      return { ...s, streamNode: null };

    case 'TRACE': {
      const type = nodeType(a.node, s.currentDepth);
      // reveal 3–8 nearby links; deeper layers surface a few more per trace
      const rawReveal = (NETWORK.neighbours[a.node]?.length ?? 0) + 3 + (s.currentDepth - 1) * 2;
      const reveal = Math.max(3, Math.min(8, rawReveal));
      const gain = Math.round(3 * depthTraceMul(s.currentDepth) * pulseMul(s));
      const prev = s.statuses[a.node] ?? {};
      const unlocked = type === 'ARCHIVE' || type === 'LOCKED' ? true : prev.unlocked;
      // Mission 03: TRACE stabilises the corrupted links touching this node. STABILIZE ROUTE
      // (boost) spends 1 SIGNAL to also repair the corrupted links on this node's neighbours.
      const boostStab = !!a.boost && s.missionId >= 3 && s.resources.signalEnergy > 0;
      // SIGNAL_STABILIZER ≥ 2 widens a NORMAL trace to also repair neighbour links (free)
      const wideStab = boostStab || s.upgrades.signalStabilizer >= 2 || s.playerSubnetwork.modules.RELAY >= 2;
      let linkStabilized = s.linkStabilized;
      let corruptedLinksStabilized = s.corruptedLinksStabilized;
      let stabilizedNow = 0;
      if (s.missionId >= 3) {
        const set = new Set<number>(NODE_CORRUPT_EDGES[a.node] ?? []);
        if (wideStab) {
          for (const nb of NETWORK.neighbours[a.node] ?? [])
            for (const e of NODE_CORRUPT_EDGES[nb] ?? []) set.add(e);
        }
        const fresh = [...set].filter((e) => !s.linkStabilized[e]);
        if (fresh.length) {
          linkStabilized = { ...s.linkStabilized };
          for (const e of fresh) linkStabilized[e] = true;
          corruptedLinksStabilized += fresh.length;
          stabilizedNow = fresh.length;
        }
      }
      const next: GameState = {
        ...s,
        statuses: { ...s.statuses, [a.node]: { ...prev, traced: true, unlocked } },
        revealedLinks: s.revealedLinks + reveal,
        tracedFrom: a.node,
        linkStabilized,
        corruptedLinksStabilized,
        // Variety Pass — TRACE completes ONLY the diagnose/restore/stabilize/secure objectives:
        // RESTORE the broken relay (M12), STABILIZE the Alpha Core (M19), SECURE Sector A02 (M20).
        // The two ALPHA CORE missions reuse the deep CORE node, so they gate on the active mission id
        // (M07's core-secure never pre-latches them). The firewall/route/chamber now complete on OPEN,
        // the corruption/storm/cluster on ISOLATE, and the private grid on UPGRADE — so TRACE on those
        // nodes now only DIAGNOSES (reveals links / unlocks), it no longer marks them complete.
        brokenRelayRestored: s.brokenRelayRestored || a.node === RELAY_NODE_INDEX,
        alphaCoreStabilized: s.alphaCoreStabilized || (a.node === ALPHA_CORE_NODE_INDEX && s.missionId === 19),
        sectorA02Secured: s.sectorA02Secured || (a.node === ALPHA_CORE_NODE_INDEX && s.missionId >= 20),
      };
      // SIGNAL: a normal stabilize batch yields +1; a boost is a clear spend of −1 (does more work)
      const signalDelta = boostStab ? -1 : stabilizedNow > 0 ? 1 : 0;
      const withRes = signalDelta !== 0 ? addResources(next, { ...NO_GAIN, signal: signalDelta }) : next;
      // SIGNAL RELAY assists route stabilization (it widens the repair at lvl ≥ 2)
      const relayAssist = stabilizedNow > 0 && s.playerSubnetwork.modules.RELAY > 0;
      // Variety Pass — TRACE on a RESTORE/STABILIZE/SECURE objective node gives that action its own
      // clear feedback the moment it completes (overrides the generic trace line).
      const traceObjMsg =
        a.node === RELAY_NODE_INDEX && s.missionId === 12 && !s.brokenRelayRestored ? 'RELAY RESTORED · SIGNAL FLOW ONLINE'
          : a.node === ALPHA_CORE_NODE_INDEX && s.missionId === 19 && !s.alphaCoreStabilized ? 'ALPHA CORE STABILIZED'
            : a.node === ALPHA_CORE_NODE_INDEX && s.missionId >= 20 && !s.sectorA02Secured ? 'SECTOR A02 SECURED · ALPHA CORE ONLINE'
              : null;
      const msg = traceObjMsg
        ? traceObjMsg
        : boostStab
          ? 'SIGNAL ENERGY SPENT · ROUTE STABILIZED'
          : stabilizedNow > 0
            ? `CORRUPTED LINK STABILIZED${relayAssist ? ' · SIGNAL RELAY ASSIST' : ' · ROUTE INTEGRITY RESTORED'}`
            : 'LINK TRACE COMPLETE';
      return withMsg(withTrace(withRes, s.traceLevel + gain), msg, 'ok');
    }

    case 'ISOLATE': {
      const type = nodeType(a.node, s.currentDepth);
      const prev = s.statuses[a.node] ?? {};
      if (type === 'GATEWAY') {
        return withMsg(
          withTrace(s, s.traceLevel + 8),
          'ISOLATION FAILED · TRACE +8',
          'fail',
        );
      }
      // BOOST ISOLATE spends 1 SIGNAL for a stronger cut (≈double trace reduction).
      const boostIso = !!a.boost && s.resources.signalEnergy > 0;
      // isolation stays meaningful as deeper layers raise trace gains; ISOLATION_CORE adds
      // +15%/level to the reduction.
      const isoMul = (1 + 0.15 * s.upgrades.isolationCore) * (boostIso ? 2 : 1);
      const reduce = Math.round(7 * depthTraceMul(s.currentDepth) * isoMul); // base d1 −7, d2 −9
      const newly = !prev.isolated;
      const next: GameState = {
        ...s,
        statuses: { ...s.statuses, [a.node]: { ...prev, isolated: true } },
        isolatedNodes: s.isolatedNodes + (newly ? 1 : 0),
        // mission: count isolating a risk node (DECOY/CAMERA/LOCKED/unverified ARCHIVE)
        riskIsolated: s.riskIsolated + (newly && isRiskNode(type, prev) ? 1 : 0),
        // Mission 03: CAMERA nodes act as watchers (signal sources)
        watcherIsolated: s.watcherIsolated + (newly && type === 'CAMERA' ? 1 : 0),
        // Mission 11: isolating the corruption-wave node also stabilizes it
        corruptionWaveCleared: s.corruptionWaveCleared || a.node === CORRUPTION_NODE_INDEX,
        // Phase 3B: isolating the storm (M13) / corrupted cluster (M16) also clears them — so either
        // TRACE or ISOLATE completes the objective (lenient: teach pressure, never punish).
        signalStormCleared: s.signalStormCleared || a.node === STORM_NODE_INDEX,
        corruptionContained: s.corruptionContained || a.node === CLUSTER_NODE_INDEX,
      };
      // resource reward (first isolation only): watchers/decoys → SIGNAL_ENERGY, locked →
      // a chance at an ACCESS_KEY, unverified archive → a MEMORY_SHARD
      let g: ResourceGain = { ...NO_GAIN };
      if (newly) {
        const d = s.currentDepth;
        if (type === 'CAMERA' || type === 'DECOY') g = { ...NO_GAIN, signal: d >= 3 ? 2 : 1 };
        else if (type === 'LOCKED') {
          if (roll(a.node, 5) < keyChance(d, s.upgrades.keyForge)) g = { ...NO_GAIN, keys: 1 };
        } else if (type === 'ARCHIVE' && !(prev.traced || prev.unlocked)) {
          g = { ...NO_GAIN, shards: 1 };
        }
      }
      if (boostIso) g = { ...NO_GAIN, signal: -1 }; // boost = a clear spend (overrides the harvest)
      // Variety Pass — ISOLATE is the completing action for the corruption wave (M11), signal storm
      // (M13) and corrupted cluster (M16); give each its own clear feedback the moment it completes.
      const isoObjMsg =
        a.node === CORRUPTION_NODE_INDEX && s.missionId === 11 && !s.corruptionWaveCleared ? 'CORRUPTION CONTAINED'
          : a.node === CLUSTER_NODE_INDEX && s.missionId === 16 && !s.corruptionContained ? 'CORRUPTION CONTAINED · CLUSTER SEALED'
            : a.node === STORM_NODE_INDEX && s.missionId === 13 && !s.signalStormCleared ? 'SIGNAL STORM STABILIZED'
              : null;
      const isoMsg = isoObjMsg
        ? isoObjMsg
        : boostIso
          ? 'SIGNAL ENERGY SPENT · ISOLATION BOOSTED'
          : type === 'CAMERA'
            ? 'WATCHER ISOLATED'
            : 'NODE ISOLATED';
      return withMsg(withTrace(addResources(next, g), s.traceLevel - reduce), isoMsg, 'ok');
    }

    case 'EXPORT': {
      const type = nodeType(a.node, s.currentDepth);
      const cfg = TYPE_CFG[type];
      const prev = s.statuses[a.node] ?? {};
      if (prev.extracted) return withMsg(s, 'ALREADY EXTRACTED', 'warn');

      if (type === 'DECOY') {
        const spike = Math.round(18 * depthTraceMul(s.currentDepth) * pulseMul(s));
        const next: GameState = {
          ...s,
          statuses: { ...s.statuses, [a.node]: { ...prev, extracted: true } },
          decoyExports: s.decoyExports + 1, // mission: a decoy mistake (warns, never hard-fails)
        };
        return withMsg(withTrace(next, s.traceLevel + spike), 'DECOY TRIGGERED — TRACE SPIKE', 'fail');
      }
      if (type === 'GATEWAY') {
        return withMsg(s, 'GATEWAY · OPEN STREAM TO ENTER', 'warn');
      }
      const req = accessRequiredFor(type, s.currentDepth);
      if (type === 'LOCKED' && !prev.unlocked && s.accessLevel < req) {
        return withMsg(withTrace(s, s.traceLevel + 5), `ACCESS REQUIRED · LV ${req}`, 'fail');
      }
      if (type === 'ARCHIVE' && !prev.traced && !prev.unlocked && s.accessLevel < req) {
        return withMsg(withTrace(s, s.traceLevel + 4), 'ACCESS DENIED · TRACE REQUIRED', 'fail');
      }

      // DATA + extra resources (deterministic per node) — one source of truth for the panel preview
      const yieldGain = exportYield(a.node, type, s.currentDepth, prev, s.upgrades, s.playerSubnetwork.modules.CACHE);
      // DATA VAULT adds a small DATA bonus on top (so the module is felt on every export)
      const vBonus = vaultDataBonus(yieldGain.data, s.playerSubnetwork.modules.VAULT);
      const value = yieldGain.data + vBonus;
      let gain = Math.round(cfg.exportTrace * depthTraceMul(s.currentDepth) * pulseMul(s));
      // ARCHIVE route: tracing first verifies the route (cleaner export); exporting an
      // unverified archive is messier and costs noticeably more trace.
      let suffix = '';
      const verified = prev.traced || prev.unlocked;
      if (type === 'ARCHIVE') {
        gain = Math.round(gain * (verified ? 0.6 : 1.8));
        suffix = verified ? ' · ROUTE VERIFIED' : ' · ROUTE UNVERIFIED';
      }
      if (s.pulseActive && type === 'CAMERA') gain = Math.round(gain * 1.5); // watcher under pulse
      // DEEP VAULT (Mission 09): higher trace to match the higher DATA reward; a successful vault
      // export trips a TRACE SWEEP cue and latches `vaultBreached` (the mission gate).
      const isVault = a.node === VAULT_NODE_INDEX;
      if (isVault) gain = Math.round(gain * 1.4);
      const extractedData = s.extractedData + value;
      let next: GameState = {
        ...s,
        extractedData,
        accessLevel: 1 + Math.floor(extractedData / 100),
        statuses: { ...s.statuses, [a.node]: { ...prev, extracted: true } },
        archiveExports: s.archiveExports + (type === 'ARCHIVE' ? 1 : 0),
        vaultBreached: s.vaultBreached || isVault,
        // Mission 14 — exporting the CORE FRAGMENT node recovers a Core Fragment (latched here;
        // the +1 CORE itself comes through exportYield above, node-gated).
        coreFragmentRecovered: s.coreFragmentRecovered || a.node === FRAGMENT_NODE_INDEX,
        threatEventsSeen: s.threatEventsSeen + (isVault && !s.vaultBreached ? 1 : 0),
      };
      next = addResources(next, yieldGain); // shards / keys / signal / core + HUD feedback
      const kind = type === 'ARCHIVE' && !verified ? 'warn' : 'ok';
      // module feedback tags so the player feels the subnetwork on each export
      const vaultTag = vBonus > 0 ? ` · VAULT +${vBonus}` : '';
      const cacheTag = yieldGain.keys > 0 && s.playerSubnetwork.modules.CACHE > 0 ? ' · KEY CACHE' : '';
      const sweepTag = isVault ? ' · TRACE SWEEP DETECTED' : '';
      const fragTag = a.node === FRAGMENT_NODE_INDEX ? ' · CORE FRAGMENT RECOVERED' : '';
      return withMsg(withTrace(next, s.traceLevel + gain), `DATA EXTRACTED +${value}${suffix}${vaultTag}${cacheTag}${sweepTag}${fragTag}`, kind);
    }

    case 'ENTER_SUB': {
      const next: GameState = {
        ...s,
        currentDepth: s.currentDepth + 1,
        maxDepthReached: Math.max(s.maxDepthReached, s.currentDepth + 1),
        gatewayNode: a.node,
        depthSeed: s.depthSeed + 1,
        streamNode: null,
        // snapshot counters so the new layer's task checklist measures fresh progress,
        // and reset the "next gateway found" flag for the deeper layer
        deepBaseExtracted: s.extractedData,
        deepBaseLinks: s.revealedLinks,
        deepBaseIsolated: s.isolatedNodes,
        nextGatewayFound: false,
      };
      // breaching a subnetwork grants a little SIGNAL_ENERGY (route reward)
      return withMsg(addResources(next, { ...NO_GAIN, signal: 1 }), `SUBNETWORK · DEPTH ${pad2(next.currentDepth)}`, 'ok');
    }

    case 'INSPECT': {
      // mission: count distinct inspected nodes (no message, no trace)
      const prev = s.statuses[a.node] ?? {};
      if (prev.inspected) return s;
      return {
        ...s,
        statuses: { ...s.statuses, [a.node]: { ...prev, inspected: true } },
        inspectedCount: s.inspectedCount + 1,
      };
    }

    case 'USE_KEY': {
      // spend 1 ACCESS_KEY to unlock a node manually (alternative to Access Level). No trace.
      const prev = s.statuses[a.node] ?? {};
      if (prev.unlocked) return withMsg(s, 'ALREADY UNLOCKED', 'warn');
      if (s.resources.accessKeys <= 0) return withMsg(s, 'NO ACCESS KEYS AVAILABLE', 'warn');
      const next: GameState = {
        ...s,
        statuses: { ...s.statuses, [a.node]: { ...prev, unlocked: true } },
        // Mission 10: using a KEY on the BLACK FIREWALL opens it
        blackFirewallOpened: s.blackFirewallOpened || a.node === FIREWALL_NODE_INDEX,
        // Mission 17: using a KEY on the BLACK ROUTE opens it too (KEY or TRACE)
        blackRouteOpened: s.blackRouteOpened || a.node === BLACKROUTE_NODE_INDEX,
      };
      // Variety Pass — a KEY opens the firewall (M10) / black route (M17) too; name that clearly.
      const keyOpens =
        (a.node === FIREWALL_NODE_INDEX && !s.blackFirewallOpened) ||
        (a.node === BLACKROUTE_NODE_INDEX && !s.blackRouteOpened);
      const keyMsg = keyOpens
        ? 'ROUTE OPENED · ACCESS KEY USED'
        : s.playerSubnetwork.modules.CACHE > 0
          ? 'ACCESS KEY USED · KEY CACHE · ROUTE SECURED'
          : 'ACCESS KEY USED · NODE UNLOCKED';
      return withMsg(addResources(next, { ...NO_GAIN, keys: -1 }), keyMsg, 'ok');
    }

    case 'ANALYZE': {
      // spend 1 MEMORY_SHARD to reveal clearer info on a suspicious node. No trace.
      const type = nodeType(a.node, s.currentDepth);
      const prev = s.statuses[a.node] ?? {};
      if (prev.analyzed) return withMsg(s, 'ALREADY ANALYZED', 'warn');
      if (s.resources.memoryShards <= 0) return withMsg(s, 'NO MEMORY SHARDS AVAILABLE', 'warn');
      const next: GameState = {
        ...s,
        statuses: { ...s.statuses, [a.node]: { ...prev, analyzed: true } },
      };
      const msg =
        type === 'DECOY'
          ? 'DECOY SIGNATURE CONFIRMED'
          : type === 'ARCHIVE'
            ? 'ARCHIVE ROUTE MAP REVEALED'
            : type === 'LOCKED'
              ? 'LOCK SIGNATURE IDENTIFIED'
              : 'NODE ANALYZED';
      return withMsg(addResources(next, { ...NO_GAIN, shards: -1 }), msg, 'ok');
    }

    case 'BUY_UPGRADE': {
      const def = UPGRADE_BY_ID[a.id];
      const level = s.upgrades[a.id];
      if (level >= def.max) return withMsg(s, 'UPGRADE AT MAX', 'warn');
      const cost = def.costs[level]; // cost to reach level+1
      if (!canAffordUpgrade(s.resources, cost)) return withMsg(s, 'INSUFFICIENT RESOURCES', 'warn');
      // Variety Pass — Mission 15 (Private Grid Overload) completes by bringing a module/upgrade
      // online (its own distinct action), not by tracing a node. Latched on the active mission id.
      const gridByUpgrade = s.missionId === 15;
      const next: GameState = {
        ...s,
        upgrades: { ...s.upgrades, [a.id]: level + 1 },
        privateGridStabilized: s.privateGridStabilized || gridByUpgrade,
      };
      // spend the cost (negative gain → also flashes "-N SIGNAL …" beside the resource strip)
      const spent = addResources(next, {
        data: 0,
        shards: -(cost.mem ?? 0),
        keys: -(cost.keys ?? 0),
        signal: -(cost.signal ?? 0),
        core: -(cost.core ?? 0),
      });
      const upMsg = gridByUpgrade && !s.privateGridStabilized
        ? `MODULE ONLINE · PRIVATE GRID STABILIZED`
        : `UPGRADE INSTALLED · ${def.name} LV ${level + 1}`;
      return withMsg(spent, upMsg, 'ok');
    }

    case 'INSTALL_MODULE': {
      if (!s.playerSubnetwork.unlocked) return s; // grid not unlocked yet
      const def = MODULE_BY_ID[a.id];
      const level = s.playerSubnetwork.modules[a.id];
      if (level >= def.max) return withMsg(s, 'MODULE AT MAX', 'warn');
      const cost = def.costs[level]; // cost to reach level+1
      if (!canAffordModule(s, cost)) return withMsg(s, 'INSUFFICIENT RESOURCES', 'warn');
      const modules = { ...s.playerSubnetwork.modules, [a.id]: level + 1 };
      const installedCount = (Object.values(modules) as number[]).filter((l) => l > 0).length;
      const vaultLvl = modules.VAULT;
      // Variety Pass — Mission 15 (Private Grid Overload) completes by bringing a module online.
      const gridByModule = s.missionId === 15;
      const next: GameState = {
        ...s,
        extractedData: s.extractedData - (cost.data ?? 0), // DATA spent directly
        privateGridStabilized: s.privateGridStabilized || gridByModule,
        playerSubnetwork: {
          ...s.playerSubnetwork,
          modules,
          level: 1 + installedCount, // grid level rises with each distinct module installed
          storageCapacity: STORAGE_BASE + vaultLvl * 250, // DATA VAULT expands storage
        },
      };
      // spend the non-DATA resources (negative gain → flashes "-N …" beside the resource strip)
      const spent = addResources(next, {
        data: 0,
        shards: -(cost.mem ?? 0),
        keys: -(cost.keys ?? 0),
        signal: -(cost.signal ?? 0),
        core: -(cost.core ?? 0),
      });
      const msg = gridByModule && !s.privateGridStabilized
        ? `MODULE ONLINE · PRIVATE GRID STABILIZED`
        : level === 0
          ? `MODULE INSTALLED · ${def.name}`
          : `MODULE UPGRADED · ${def.name} LV ${level + 1}`;
      return withMsg(spent, msg, 'ok');
    }

    case 'MISSION_START':
      // begin the current mission and snapshot the baseline so its tasks measure fresh
      // progress from here (Mission 01 starts at 0; Mission 02 starts mid-session)
      return s.missionStarted
        ? s
        : {
            ...s,
            missionStarted: true,
            missionBase: {
              extracted: s.extractedData,
              revealed: s.revealedLinks,
              riskIsolated: s.riskIsolated,
              archiveExports: s.archiveExports,
              decoyExports: s.decoyExports,
              survived: s.signalPulsesSurvived,
              stabilized: s.corruptedLinksStabilized,
              watcher: s.watcherIsolated,
            },
          };

    case 'MISSION_ADVANCE': {
      // current mission complete → begin the next (keep the network/progress), show its
      // briefing. Caps at Mission 20 (the Phase 3B Sector A02 Alpha Core arc finale).
      if (!s.missionComplete || s.missionId >= 20) return s;
      return {
        ...s,
        missionId: s.missionId + 1,
        missionStarted: false, // re-shows the briefing (next mission)
        missionComplete: false,
        nextGatewayFound: false, // the new mission locates its own gateway toward the next depth
        pulseActive: false,
      };
    }

    case 'FORCE_COMPLETE':
      // DEV / TESTING — the "finish mission" terminal command. During the Mission 00 intro it
      // skips straight to a revealed network (so testing isn't gated by the tutorial). Otherwise
      // it latches the current mission complete (also works straight from the briefing) so you can
      // CONTINUE NETWORK without grinding every task; the completion overlay appears as on a real finish.
      if (!s.mission00.complete) {
        return { ...s, networkRevealed: true, mission00: { complete: true, step: TUTORIAL_STEPS.length } };
      }
      return s.missionComplete
        ? s
        : { ...s, missionStarted: true, missionComplete: true, pulseActive: false };

    case 'GOTO_MISSION': {
      // DEV / TESTING — the "mission N" terminal command. A REAL transfer: it sets the mission up the
      // way you'd arrive there in play, not just a label swap. Past the tutorial, network revealed,
      // lock cleared; the mission's OPERATING DEPTH is set (so the layer/types + depth-gated tasks
      // match); the target mission's objective FLAG is reset and its designated node's status cleared
      // (so its objective is FRESH/active, never showing as already-done); and task baselines are
      // snapshotted so the checklist starts at 0. The briefing then shows → BEGIN warps to the
      // objective. Pure/deterministic (no clock/RNG); reuses the fixed designated-node indices.
      const id = Math.max(1, Math.min(20, Math.floor(a.mission)));
      // canonical operating depth per mission (deep missions need depth ≥ 2 for the right node types)
      const DEPTHS: Record<number, number> = {
        1: 1, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 3, 8: 3, 9: 3, 10: 3,
        11: 3, 12: 3, 13: 3, 14: 3, 15: 3, 16: 3, 17: 3, 18: 3, 19: 3, 20: 3,
      };
      const depth = DEPTHS[id] ?? 3;
      // reset the target mission's objective so it's fresh: clear its flag + its designated node state
      const statuses = { ...s.statuses };
      const clearNode = (n: number | null | undefined) => { if (n != null) delete statuses[n]; };
      const flags: Partial<GameState> = {};
      switch (id) {
        case 7: clearNode(CORE_NODE_INDEX); break;
        case 8: flags.deepSignalDetected = false; break;
        case 9: flags.vaultBreached = false; clearNode(VAULT_NODE_INDEX); break;
        case 10: flags.blackFirewallOpened = false; clearNode(FIREWALL_NODE_INDEX); break;
        case 11: flags.corruptionWaveCleared = false; clearNode(CORRUPTION_NODE_INDEX); break;
        case 12: flags.brokenRelayRestored = false; clearNode(RELAY_NODE_INDEX); break;
        case 13: flags.signalStormCleared = false; clearNode(STORM_NODE_INDEX); break;
        case 14: flags.coreFragmentRecovered = false; clearNode(FRAGMENT_NODE_INDEX); break;
        case 15: flags.privateGridStabilized = false; break;
        case 16: flags.corruptionContained = false; clearNode(CLUSTER_NODE_INDEX); break;
        case 17: flags.blackRouteOpened = false; clearNode(BLACKROUTE_NODE_INDEX); break;
        case 18: flags.coreChamberOpened = false; clearNode(CHAMBER_NODE_INDEX); break;
        case 19: flags.alphaCoreStabilized = false; clearNode(ALPHA_CORE_NODE_INDEX); break;
        case 20: flags.sectorA02Secured = false; clearNode(ALPHA_CORE_NODE_INDEX); break;
      }
      return {
        ...s,
        ...flags,
        missionId: id,
        mission00: { complete: true, step: TUTORIAL_STEPS.length },
        networkRevealed: true,
        missionStarted: false, // show the target mission's briefing → BEGIN warps to the objective
        missionComplete: false,
        pulseActive: false,
        nextGatewayFound: false,
        locked: false,
        // Missions 01–20 live in SECTOR A01 — return to it (A02 stays unlocked; re-enter via `enter a02`).
        // Without this, jumping while in A02 left the A02 grid/sector/tasks on screen under a stale label.
        sectorProgress: { ...s.sectorProgress, currentSector: 'A01' },
        streamNode: null,
        tracedFrom: null,
        currentDepth: depth,
        maxDepthReached: Math.max(s.maxDepthReached, depth),
        statuses,
        missionBase: {
          extracted: s.extractedData,
          revealed: s.revealedLinks,
          riskIsolated: s.riskIsolated,
          archiveExports: s.archiveExports,
          decoyExports: s.decoyExports,
          survived: s.signalPulsesSurvived,
          stabilized: s.corruptedLinksStabilized,
          watcher: s.watcherIsolated,
        },
      };
    }

    case 'PULSE_START':
      return s.pulseActive ? s : { ...s, pulseActive: true };

    case 'PULSE_END':
      // surviving a full pulse advances the Mission 03 task
      return { ...s, pulseActive: false, signalPulsesSurvived: s.signalPulsesSurvived + 1 };

    case 'LOAD_GAME':
      return a.game;

    case 'LOAD_CHECKPOINT': {
      // recover from a trace lock: restore the latest milestone snapshot (or, if none exists,
      // recover IN PLACE — keep the current mission/depth/progress). Either way clear the lock
      // and reset trace to a safe value, and drop transient runtime bits.
      const base = a.checkpoint ?? s;
      return {
        ...base,
        traceLevel: 0,
        locked: false,
        missionComplete: false,
        pulseActive: false,
        streamNode: null,
        tracedFrom: null,
        message: null,
        msgNode: null,
      };
    }

    case 'ENTER_SECTOR_A02': {
      // cross into Sector A02 (the new procedural grid). Marks A01 complete + A02 entered and pins
      // the deterministic A02 seed. Preserves ALL player progress (resources/upgrades/subnetwork/
      // statuses/mission) — A02 is a new free-scan field layered on the same session, not a wipe.
      if (s.sectorProgress.currentSector === 'A02') return s;
      const completed = s.sectorProgress.completedSectors.includes('A01')
        ? s.sectorProgress.completedSectors
        : [...s.sectorProgress.completedSectors, 'A01'];
      return {
        ...s,
        streamNode: null,
        tracedFrom: null,
        sectorProgress: {
          ...s.sectorProgress,
          currentSector: 'A02',
          a02Unlocked: true,
          a02Entered: true,
          a02Seed: s.sectorProgress.a02Seed || A02_SEED,
          completedSectors: completed,
        },
      };
    }

    case 'RESET':
      return initGame();

    default:
      return s;
  }
}

/**
 * Mission 00 — after a normal action runs, advance the intro if the player performed the CURRENT
 * step's CORRECT action on its node and it actually took effect. The real reducer already produced
 * the real reward/trace/feedback (so the player learns true mechanics); here we only bump the step,
 * reveal the network on the final beat, and supply a message for the silent INSPECT (sync) beats.
 */
function advanceMission00(prev: GameState, next: GameState, a: GameAction): GameState {
  if (prev.mission00.complete || !('node' in a)) return next;
  const step = prev.mission00.step;
  if (step >= TUTORIAL_STEPS.length) return next;
  const node = TUTORIAL_NODES[step];
  if (a.node !== node || a.type !== TUTORIAL_ACTIONS[step]) return next;

  // verify the correct action actually took effect on this node (a denied action must not advance)
  const p = prev.statuses[node] ?? {};
  const n = next.statuses[node] ?? {};
  let took: boolean;
  switch (a.type) {
    case 'INSPECT': took = !!n.inspected; break;
    case 'EXPORT': took = !!n.extracted && !p.extracted; break;
    case 'TRACE': took = !!n.traced && !p.traced; break;
    case 'USE_KEY': took = !!n.unlocked && !p.unlocked; break;
    case 'ISOLATE': took = !!n.isolated && !p.isolated; break;
    case 'OPEN_STREAM': took = next.streamNode === node && prev.streamNode !== node; break;
    default: took = false;
  }
  if (!took) return next;

  const isLast = step + 1 >= TUTORIAL_STEPS.length;
  let out: GameState = {
    ...next,
    mission00: { complete: isLast, step: step + 1 },
    ...(isLast ? { networkRevealed: true } : {}),
  };
  // INSPECT (sync / core) beats produce no action message of their own — supply a teaching one
  if (a.type === 'INSPECT') {
    out = withMsg(out, isLast ? 'CORE SIGNAL FOUND · NETWORK REVEALED' : 'SIGNAL SYNCHRONIZED · NODE ONLINE', 'ok');
  }
  return out;
}

export function gameReducer(s: GameState, a: GameAction): GameState {
  // Mission 00 intro: never descend a layer (ENTER_SUB) — it would break the reveal gate. The
  // gateway beat is taught with OPEN STREAM only, which stays at depth 01.
  if (!s.mission00.complete && a.type === 'ENTER_SUB') return s;
  // Normal play runs for every action (so the intro teaches REAL mechanics); message tagging and
  // completion checks still apply, then advanceMission00 bumps the intro step if it was earned.
  let next = applyAction(s, a);
  next = advanceMission00(s, next, a);
  // a freshly-produced action message belongs to the node it concerns — tag it so it only
  // renders on that node's panel; a global action (e.g. BUY_UPGRADE) clears the tag so its
  // message never lingers onto a selected node's panel.
  if (next.msgId !== s.msgId) {
    next = { ...next, msgNode: 'node' in a ? a.node : null };
  }
  // latch mission completion once every task is satisfied (failure = trace lock, handled elsewhere)
  if (!next.missionComplete && missionTasksDone(next)) {
    next = { ...next, missionComplete: true };
    // Mission 04 completes by installing a module/upgrade — give that action explicit, immediate
    // feedback (alongside the checklist checkmark) the moment the install lands.
    if (next.missionId === 4 && (a.type === 'BUY_UPGRADE' || a.type === 'INSTALL_MODULE')) {
      next = withMsg(next, 'TASK COMPLETE — MODULE INSTALLED', 'ok');
    }
  }
  // Player Subnetwork unlocks once Mission 03 is complete. One-time (unlocked persists in the
  // save) — and because the check runs every action/TICK, a loaded save that already finished
  // Mission 03 auto-unlocks on its first tick. GameApp shows the unlock toast on the transition.
  if (next.missionId >= 3 && next.missionComplete && !next.playerSubnetwork.unlocked) {
    next = {
      ...next,
      playerSubnetwork: { ...next.playerSubnetwork, unlocked: true, homeNodeId: HOME_NODE_INDEX },
    };
  }
  // Completing Mission 20 SECURES Sector A01 and UNLOCKS the route to Sector A02 (the new grid).
  // One-time + idempotent; a loaded M20-complete save auto-unlocks on its first tick. Does NOT enter
  // A02 (that's the player's ENTER SECTOR A02 choice → ENTER_SECTOR_A02). `sectorA02Secured` stays
  // the internal Mission-20 completion flag — only the player-facing framing is now "A01 complete".
  if (next.missionId >= 20 && next.missionComplete && next.sectorProgress.currentSector === 'A01' && !next.sectorProgress.a02Unlocked) {
    next = {
      ...next,
      sectorProgress: {
        ...next.sectorProgress,
        a02Unlocked: true,
        completedSectors: next.sectorProgress.completedSectors.includes('A01')
          ? next.sectorProgress.completedSectors
          : [...next.sectorProgress.completedSectors, 'A01'],
      },
    };
  }
  return next;
}
