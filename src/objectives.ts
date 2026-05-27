/**
 * NEVA Network — reusable Mission Objective Guidance System.
 *
 * One declarative place that answers "what is the player's current mission target, and what
 * should they do about it?" — so missions never force the player to inspect nodes one-by-one to
 * find an objective. It is PURE (no React, no side effects) and it WRAPS the existing authoritative
 * logic rather than duplicating it:
 *
 *   - the live target NODE comes from `getCurrentObjectiveNodeId(game)` (game.ts) — already
 *     depth-aware (M07 aims at a deep route until depth 03, then the CORE; M08 at a deeper route),
 *   - completion comes from the same latched flags the HUD checklist + `missionTasksDone` use,
 *     so this system can never disagree with whether a mission is actually complete.
 *
 * Each guided mission supplies a small metadata row in `OBJECTIVE_META` (objective type, target
 * node class, required depth, the action to take, and the guidance copy). Adding guidance to a
 * NEW mission (Phase 3B / missions 13–20) is just adding one row here — no per-mission UI code.
 *
 * Surfaced by: the HUD mission panel (status hint + FOCUS OBJECTIVE button), the in-world
 * ObjectiveMarker (a subtle pulse on the target), and NodeInfoPanel (the MISSION OBJECTIVE badge).
 */
import {
  nodeType,
  getCurrentObjectiveNodeId,
  coreSecured,
  hasInstalledModule,
  type GameState,
  type NodeType,
} from './game';

/** The kinds of objective the resolver understands. Mostly maps to a node + an action; a few
 *  (reach_depth / install_module / survive_threat / clear_event) are node-less / aggregate. */
export type ObjectiveType =
  | 'locate_node'
  | 'reach_depth'
  | 'extract_from_node'
  | 'secure_node'
  | 'stabilize_node'
  | 'open_firewall'
  | 'inspect_node'
  | 'acquire_key'
  | 'install_module'
  | 'survive_threat'
  | 'clear_event';

/** Where the objective is in its lifecycle (drives the hint + the in-world marker). */
export type ObjectiveStatus = 'unavailable' | 'hidden' | 'available' | 'selected' | 'completed';

/** The action the player performs on the target. Each maps to a REAL in-game action + shortcut
 *  (no invented keys). SECURE_CORE / STABILIZE are TRACE relabelled by the panel. */
export type ObjectiveAction =
  | 'OPEN'
  | 'TRACE'
  | 'ISOLATE'
  | 'EXTRACT'
  | 'USE_KEY'
  | 'SECURE_CORE'
  | 'STABILIZE'
  | 'RESTORE'
  | 'UPGRADE'
  | 'INSTALL';

/** Real action label + keyboard shortcut for each ObjectiveAction (existing controls only — every
 *  shortcut below is a real in-game key; the panel relabels the shared button where noted). */
const ACTION_INFO: Record<ObjectiveAction, { label: string; key: string }> = {
  OPEN: { label: 'OPEN', key: 'O' }, // OPEN STREAM opens the firewall / route / chamber
  TRACE: { label: 'TRACE', key: 'T' },
  ISOLATE: { label: 'ISOLATE', key: 'I' },
  EXTRACT: { label: 'EXTRACT', key: 'E' },
  USE_KEY: { label: 'USE KEY', key: 'K' },
  SECURE_CORE: { label: 'SECURE CORE', key: 'T' }, // panel relabels TRACE → SECURE CORE
  STABILIZE: { label: 'STABILIZE', key: 'T' }, // panel relabels TRACE → STABILIZE
  RESTORE: { label: 'RESTORE RELAY', key: 'T' }, // panel relabels TRACE → RESTORE RELAY
  UPGRADE: { label: 'UPGRADE', key: 'U' }, // open the UPGRADES panel (or the [B] grid)
  INSTALL: { label: 'INSTALL MODULE', key: 'B' }, // open the PLAYER SUBNETWORK grid
};

/** "EXTRACT [E]" — the required-action string shown in the NodeInfo badge / HUD. */
export function actionDisplay(action: ObjectiveAction | null): string {
  if (action == null) return '—';
  const a = ACTION_INFO[action];
  return `${a.label} [${a.key}]`;
}

/** A guided mission's metadata. Everything here is presentational / declarative — the node and
 *  completion truth still come from game.ts (see `resolveObjectiveTarget`). */
export interface ObjectiveDef {
  objectiveType: ObjectiveType;
  /** Player-facing noun for the target, e.g. 'DEEP VAULT'. Used across hints + the badge. */
  noun: string;
  /** Badge label shown in NodeInfo, e.g. 'DEEP VAULT OBJECTIVE'. */
  label: string;
  /** The action the player should take on the target (null for pure locate/reach objectives). */
  targetAction?: ObjectiveAction;
  /** Short verb phrase for the "selected" hint, e.g. 'export DATA'. */
  actionVerb?: string;
  /** The target node's expected class/type (metadata + display; the live node still wins). */
  targetNodeType?: NodeType;
  /** Depth the objective lives at (informational — drives the "reach DEPTH N first" hint). */
  requiredDepth?: number;
  /** One-shot cue flashed when the objective becomes active, e.g. 'DEEP VAULT SIGNAL DETECTED'. */
  signalText?: string;
  /** Briefing-style locate / action copy (kept for completeness + future briefings). */
  locateText: string;
  actionText: string;
  /** Has this objective been satisfied? Reuses the SAME latched flags as the HUD checklist /
   *  `missionTasksDone`, so the two can never disagree. */
  done: (g: GameState) => boolean;
  /** Optional explicit node resolver for future missions whose target isn't covered by
   *  `getCurrentObjectiveNodeId`. When omitted, that function is the source of truth. */
  resolveNode?: (g: GameState) => number | null;
}

/**
 * Guidance metadata per mission id. Only missions that lead the player to a specific target /
 * depth / action have a row — aggregate missions (01/02/03/05/06, measured by counts) keep their
 * existing HUD checklist and intentionally resolve to `null` here.
 *
 * To guide a FUTURE mission, add a row: objective type, target noun/type, required depth, action,
 * and a `done` predicate built from that mission's latched flag. The HUD hint, in-world marker,
 * NodeInfo badge, located cue and FOCUS OBJECTIVE button all follow automatically.
 */
export const OBJECTIVE_META: Record<number, ObjectiveDef> = {
  // MISSION 00 — guided onboarding. Target is the current tutorial step's node (resolved live).
  // The intro keeps its own guided bar / light-path; this row makes the resolver consistent.
  0: {
    objectiveType: 'inspect_node',
    noun: 'GUIDED SIGNAL',
    label: 'TUTORIAL OBJECTIVE',
    locateText: 'Follow the guided signal.',
    actionText: 'Complete the guided action on the highlighted node.',
    done: (g) => g.mission00.complete,
  },
  // MISSION 04 — install your first module (or any upgrade). Node-less: acted on via the grid [B].
  4: {
    objectiveType: 'install_module',
    noun: 'FIRST MODULE',
    label: 'PRIVATE GRID OBJECTIVE',
    targetAction: 'INSTALL',
    actionVerb: 'install a module',
    locateText: 'Open the private grid (B).',
    actionText: 'Install a module (B) — or buy any upgrade (U).',
    done: (g) => hasInstalledModule(g),
  },
  // MISSION 07 — reach Depth 03, then secure the CORE. Target aims at a deep route until depth 03.
  7: {
    objectiveType: 'secure_node',
    noun: 'CORE',
    label: 'CORE OBJECTIVE',
    targetAction: 'SECURE_CORE',
    actionVerb: 'secure the core',
    requiredDepth: 3,
    signalText: 'CORE SIGNAL DETECTED',
    locateText: 'Reach DEPTH 03 and follow the CORE signal.',
    actionText: 'Select the CORE node and press SECURE CORE.',
    done: (g) => g.currentDepth >= 3 && coreSecured(g),
  },
  // MISSION 08 — descend to Depth 04 along the deep route.
  8: {
    objectiveType: 'reach_depth',
    noun: 'DEEP ROUTE',
    label: 'DEEP SIGNAL OBJECTIVE',
    targetAction: 'OPEN',
    actionVerb: 'open a deeper route',
    requiredDepth: 4,
    signalText: 'DEEP SIGNAL ROUTE',
    locateText: 'Open a deep gateway route to descend.',
    actionText: 'Open a deep route and ENTER to reach DEPTH 04.',
    done: (g) => g.maxDepthReached >= 4,
  },
  // MISSION 09 — extract the DEEP VAULT.
  9: {
    objectiveType: 'extract_from_node',
    noun: 'DEEP VAULT',
    label: 'DEEP VAULT OBJECTIVE',
    targetAction: 'EXTRACT',
    actionVerb: 'export DATA',
    targetNodeType: 'ARCHIVE',
    requiredDepth: 4,
    signalText: 'DEEP VAULT SIGNAL LOCATED',
    locateText: 'Locate the Deep Vault.',
    actionText: 'Export DATA from the Deep Vault.',
    done: (g) => g.vaultBreached,
  },
  // MISSION 10 — OPEN the BLACK FIREWALL (open its route, or use a key). TRACE only analyzes it.
  10: {
    objectiveType: 'open_firewall',
    noun: 'BLACK FIREWALL',
    label: 'BLACK FIREWALL OBJECTIVE',
    targetAction: 'OPEN',
    actionVerb: 'open the firewall route',
    targetNodeType: 'LOCKED',
    signalText: 'BLACK FIREWALL LOCATED',
    locateText: 'Locate the Black Firewall.',
    actionText: 'Trace to analyze if needed, then OPEN [O] (or USE KEY) to unlock it.',
    done: (g) => g.blackFirewallOpened,
  },
  // MISSION 11 — ISOLATE (contain) the corrupted node / corruption wave.
  11: {
    objectiveType: 'stabilize_node',
    noun: 'CORRUPTED NODE',
    label: 'CORRUPTED SIGNAL OBJECTIVE',
    targetAction: 'ISOLATE',
    actionVerb: 'contain the corruption',
    targetNodeType: 'DECOY',
    signalText: 'CORRUPTION WAVE ACTIVE',
    locateText: 'Locate the corrupted node.',
    actionText: 'Press ISOLATE [I] to contain the corrupted node.',
    done: (g) => g.corruptionWaveCleared,
  },
  // MISSION 12 — RESTORE the BROKEN RELAY (diagnose + restore the route via TRACE).
  12: {
    objectiveType: 'stabilize_node',
    noun: 'BROKEN RELAY',
    label: 'BROKEN RELAY OBJECTIVE',
    targetAction: 'RESTORE',
    actionVerb: 'restore signal flow',
    targetNodeType: 'GATEWAY',
    signalText: 'BROKEN RELAY DETECTED',
    locateText: 'Find the Broken Relay.',
    actionText: 'Press RESTORE RELAY [T] to restore signal flow.',
    done: (g) => g.brokenRelayRestored,
  },
  // ===================== Phase 3B — Sector A02 // Alpha Core arc (Missions 13–20) =====================
  // MISSION 13 — ISOLATE the SIGNAL STORM source to stabilize the route.
  13: {
    objectiveType: 'stabilize_node',
    noun: 'SIGNAL STORM',
    label: 'SIGNAL STORM OBJECTIVE',
    targetAction: 'ISOLATE',
    actionVerb: 'stabilize the storm',
    targetNodeType: 'CAMERA',
    signalText: 'SIGNAL STORM DETECTED',
    locateText: 'Detect the Signal Storm.',
    actionText: 'Press ISOLATE [I] to cut the storm source and stabilize the route.',
    done: (g) => g.signalStormCleared,
  },
  // MISSION 14 — recover a CORE FRAGMENT (export).
  14: {
    objectiveType: 'extract_from_node',
    noun: 'CORE FRAGMENT',
    label: 'CORE FRAGMENT OBJECTIVE',
    targetAction: 'EXTRACT',
    actionVerb: 'recover the fragment',
    targetNodeType: 'IDENTITY',
    signalText: 'CORE FRAGMENT SIGNAL',
    locateText: 'Locate a Core Fragment node.',
    actionText: 'Export the node to recover the Core Fragment.',
    done: (g) => g.coreFragmentRecovered,
  },
  // MISSION 15 — clear the PRIVATE GRID overload by bringing a module/upgrade online (node-less).
  15: {
    objectiveType: 'install_module',
    noun: 'PRIVATE GRID',
    label: 'PRIVATE GRID OBJECTIVE',
    targetAction: 'UPGRADE',
    actionVerb: 'bring a module online',
    signalText: 'PRIVATE GRID OVERLOAD',
    locateText: 'Clear the Private Grid overload.',
    actionText: 'Open UPGRADES [U] (or the grid [B]) and upgrade or install one module.',
    done: (g) => g.privateGridStabilized,
  },
  // MISSION 16 — ISOLATE (contain) the CORRUPTED CLUSTER.
  16: {
    objectiveType: 'stabilize_node',
    noun: 'CORRUPTED CLUSTER',
    label: 'CORRUPTED CLUSTER OBJECTIVE',
    targetAction: 'ISOLATE',
    actionVerb: 'contain the cluster',
    targetNodeType: 'DECOY',
    signalText: 'CORRUPTED CLUSTER DETECTED',
    locateText: 'Locate the corrupted cluster.',
    actionText: 'Press ISOLATE [I] to contain the corrupted cluster.',
    done: (g) => g.corruptionContained,
  },
  // MISSION 17 — TRACE to analyze, then OPEN the BLACK ROUTE (or USE KEY).
  17: {
    objectiveType: 'open_firewall',
    noun: 'BLACK ROUTE',
    label: 'BLACK ROUTE OBJECTIVE',
    targetAction: 'OPEN',
    actionVerb: 'open the route',
    targetNodeType: 'LOCKED',
    signalText: 'BLACK ROUTE LOCATED',
    locateText: 'Locate the Black Route.',
    actionText: 'Trace to analyze, then OPEN [O] (or USE KEY) to open the Black Route.',
    done: (g) => g.blackRouteOpened,
  },
  // MISSION 18 — OPEN the SECTOR A02 CORE CHAMBER route.
  18: {
    objectiveType: 'open_firewall',
    noun: 'CORE CHAMBER',
    label: 'CORE CHAMBER OBJECTIVE',
    targetAction: 'OPEN',
    actionVerb: 'open the chamber',
    targetNodeType: 'GATEWAY',
    signalText: 'CORE CHAMBER LOCATED',
    locateText: 'Locate the Sector A02 Core Chamber.',
    actionText: 'Press OPEN [O] to open the Core Chamber route.',
    done: (g) => g.coreChamberOpened,
  },
  // MISSION 19 — stabilize the ALPHA CORE (the deep CORE node itself).
  19: {
    objectiveType: 'stabilize_node',
    noun: 'ALPHA CORE',
    label: 'ALPHA CORE OBJECTIVE',
    targetAction: 'STABILIZE',
    actionVerb: 'stabilize the core',
    signalText: 'ALPHA CORE SIGNAL',
    locateText: 'Locate the Alpha Core.',
    actionText: 'Trace to stabilize the Alpha Core.',
    done: (g) => g.alphaCoreStabilized,
  },
  // MISSION 20 — secure the ALPHA CORE → Sector A02 complete (final).
  20: {
    objectiveType: 'secure_node',
    noun: 'ALPHA CORE',
    label: 'ALPHA CORE OBJECTIVE',
    targetAction: 'SECURE_CORE',
    actionVerb: 'secure the sector',
    signalText: 'ALPHA CORE · FINAL SECURE',
    locateText: 'Secure the Alpha Core.',
    actionText: 'Trace to secure the Alpha Core and lock Sector A02.',
    done: (g) => g.sectorA02Secured,
  },
};

/** Whether a mission has dedicated objective guidance (vs an aggregate count-based mission). */
export const hasObjectiveGuidance = (missionId: number): boolean => missionId in OBJECTIVE_META;

/** The structured target the rest of the game reads. See the section docs above. */
export interface MissionObjectiveTarget {
  missionId: number;
  objectiveId: string; // stable per (mission, objective type)
  objectiveType: ObjectiveType;
  targetNodeId: number | null;
  targetNodeType: NodeType | null;
  targetAction: ObjectiveAction | null;
  requiredDepth: number | null;
  label: string; // badge label, e.g. 'DEEP VAULT OBJECTIVE'
  noun: string; // 'DEEP VAULT'
  hint: string; // status-aware one-line guidance
  status: ObjectiveStatus;
  /** True only in the defensive case where a node objective could not be resolved at all. */
  unresolved: boolean;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Status of the objective — purely derived from state, the live node, and completion. */
function computeStatus(
  g: GameState,
  def: ObjectiveDef,
  targetNodeId: number | null,
  completed: boolean,
  selected: number | null,
): ObjectiveStatus {
  if (completed) return 'completed';
  const needsNode =
    def.objectiveType !== 'install_module' &&
    def.objectiveType !== 'survive_threat' &&
    def.objectiveType !== 'clear_event';
  // depth-gated objective whose node isn't reachable yet → unavailable (reach the depth first)
  if (def.requiredDepth != null && g.currentDepth < def.requiredDepth && targetNodeId == null)
    return 'unavailable';
  if (targetNodeId == null) {
    // node-less objective (install/survive) is actionable now; otherwise it's not yet revealed
    return needsNode ? 'hidden' : 'available';
  }
  if (selected != null && selected === targetNodeId) return 'selected';
  return 'available';
}

/** Generic, reusable status → guidance line. Parameterised entirely by the mission metadata. */
function objectiveHint(
  g: GameState,
  def: ObjectiveDef,
  status: ObjectiveStatus,
  unresolved: boolean,
): string {
  switch (status) {
    case 'completed':
      return 'Objective complete.';
    case 'unavailable':
      if (unresolved) return 'Objective target unavailable — open nearby route nodes.';
      if (def.requiredDepth != null && g.currentDepth < def.requiredDepth)
        return def.objectiveType === 'reach_depth'
          ? `Open a deeper route to reach DEPTH ${pad2(def.requiredDepth)}.`
          : `Reach DEPTH ${pad2(def.requiredDepth)} first to reveal the ${def.noun}.`;
      return `Open nearby route nodes to reveal the ${def.noun}.`;
    case 'hidden':
      return 'Follow deeper route signals to reveal the target.';
    case 'selected':
      return def.targetAction
        ? `Press ${actionDisplay(def.targetAction)} to ${def.actionVerb ?? 'continue'}.`
        : `Act on the highlighted ${def.noun}.`;
    case 'available':
    default:
      return def.objectiveType === 'install_module'
        ? def.actionText
        : `Select the highlighted ${def.noun}.`;
  }
}

/**
 * Resolve the player's CURRENT mission objective into a structured target. Returns `null` for
 * missions with no single-target guidance (the aggregate count missions). `selected` lets the
 * resolver report the `selected` status + drive the NodeInfo badge; pass the current selection.
 *
 * This is the single entry point the HUD, the in-world marker, the NodeInfo badge and the
 * FOCUS OBJECTIVE button all call. Exposed under both names from the spec.
 */
export function resolveObjectiveTarget(
  g: GameState,
  selected: number | null = null,
): MissionObjectiveTarget | null {
  const def = OBJECTIVE_META[g.missionId];
  if (!def) return null;
  const targetNodeId = def.resolveNode ? def.resolveNode(g) : getCurrentObjectiveNodeId(g);
  const completed = def.done(g);
  // a node objective that can't resolve a node AND isn't merely depth-gated is a genuine failure
  const needsNode =
    def.objectiveType !== 'install_module' &&
    def.objectiveType !== 'survive_threat' &&
    def.objectiveType !== 'clear_event';
  const depthGated = def.requiredDepth != null && g.currentDepth < def.requiredDepth;
  const unresolved = !completed && needsNode && targetNodeId == null && !depthGated;
  const status = unresolved
    ? 'unavailable'
    : computeStatus(g, def, targetNodeId, completed, selected);
  const targetNodeType =
    targetNodeId != null ? nodeType(targetNodeId, g.currentDepth) : def.targetNodeType ?? null;
  return {
    missionId: g.missionId,
    objectiveId: `${g.missionId}:${def.objectiveType}`,
    objectiveType: def.objectiveType,
    targetNodeId,
    targetNodeType,
    targetAction: def.targetAction ?? null,
    requiredDepth: def.requiredDepth ?? null,
    label: def.label,
    noun: def.noun,
    hint: objectiveHint(g, def, status, unresolved),
    status,
    unresolved,
  };
}

/** Spec alias — identical to `resolveObjectiveTarget`. */
export const getMissionTarget = resolveObjectiveTarget;

/**
 * Visual category for the in-world objective marker / accent (Phase 4 cinematic pass). Purely
 * presentational — maps the existing objective metadata to a marker style; changes no logic:
 *   data       — DATA / VAULT / fragment / deep route (stable cyan glow)
 *   firewall   — BLACK FIREWALL / BLACK ROUTE / CORE CHAMBER (sharp angular border)
 *   corruption — SIGNAL STORM / CORRUPTION WAVE / CLUSTER (red glitch pulse)
 *   relay      — BROKEN RELAY / PRIVATE GRID route (signal-wave pulse)
 *   core       — CORE / ALPHA CORE (stronger central glow)
 */
export type ObjectiveVisualKind = 'data' | 'firewall' | 'corruption' | 'relay' | 'core';
export function objectiveVisualKind(t: MissionObjectiveTarget | null): ObjectiveVisualKind {
  if (!t) return 'data';
  const noun = t.noun;
  if (/ALPHA CORE|\bCORE\b/.test(noun) && t.objectiveType !== 'open_firewall') return 'core';
  switch (t.objectiveType) {
    case 'secure_node':
      return 'core';
    case 'open_firewall':
      return 'firewall';
    case 'extract_from_node':
    case 'reach_depth':
      return 'data';
    case 'stabilize_node':
      if (/STORM|CORRUPT|CLUSTER/.test(noun)) return 'corruption';
      if (/RELAY|GRID/.test(noun)) return 'relay';
      return 'relay';
    default:
      return 'data';
  }
}

/**
 * A stable key for "which objective phase are we in?" — changes once per mission / target / status
 * transition. Used to focus the target camera ONCE per transition (never every frame). Mirrors the
 * shape `missionId:objectiveId:targetNodeId:status` from the spec.
 */
export function objectiveTargetKey(t: MissionObjectiveTarget | null): string {
  if (!t) return 'none';
  return `${t.missionId}:${t.objectiveId}:${t.targetNodeId ?? 'x'}:${t.status}`;
}

/** The one-shot "signal located" cue for a mission's objective (metadata-driven; null if none). */
export const objectiveSignalText = (missionId: number): string | null =>
  OBJECTIVE_META[missionId]?.signalText ?? null;

/**
 * The NodeInfo "MISSION OBJECTIVE" badge for the currently-selected node — non-null only when the
 * selection IS the active (incomplete) objective target. Returns the specific label + the required
 * action string (real shortcut). Pure.
 */
export interface ObjectiveBadge {
  label: string; // e.g. 'DEEP VAULT OBJECTIVE'
  action: string; // e.g. 'EXTRACT [E]'
}
export function objectiveBadge(g: GameState, selected: number | null): ObjectiveBadge | null {
  if (selected == null) return null;
  const t = resolveObjectiveTarget(g, selected);
  if (!t || t.status !== 'selected') return null;
  return { label: t.label, action: actionDisplay(t.targetAction) };
}

/**
 * A context-relevant PRIVATE GRID suggestion (Phase 6) — makes the grid feel useful instead of
 * decorative. Advisory only: a one-line nudge toward the module/upgrade that helps the CURRENT
 * situation (high trace → trace reduction; firewall + low keys → key yield; relay/data objective →
 * the matching module). Returns null pre-grid (before Mission 03) or when nothing is relevant.
 * Pure — changes no state, costs nothing, never blocks anything.
 */
export function gridTip(g: GameState): string | null {
  if (!g.playerSubnetwork.unlocked || g.locked) return null;
  if (g.traceLevel >= 70) return 'GRID · TRACE SHIELD / DAMPENER cuts action trace — UPGRADES [U]';
  const t = resolveObjectiveTarget(g);
  if (!t || t.status === 'completed') return null;
  if (t.objectiveType === 'open_firewall' && g.resources.accessKeys < 1)
    return 'GRID · KEY CACHE / KEY FORGE improves key yield — UPGRADES [U]';
  const kind = objectiveVisualKind(t);
  if (kind === 'relay' || kind === 'corruption') return 'GRID · SIGNAL RELAY / STABILIZER aids signal routes — UPGRADES [U]';
  if (kind === 'data') return 'GRID · DATA VAULT / EXPORT EFFICIENCY boosts data — UPGRADES [U]';
  return null;
}
