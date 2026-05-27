/**
 * Mission data + HUD view-model — the single source of truth for mission metadata and the
 * live objective/checklist derivation. Keeps mission text out of the render components so the
 * Phase-3 expansion (more missions / chapters) edits ONE table instead of several files.
 *
 *  - `MISSION_META`  : static per-mission copy (name/title/subtitle/briefing/done lines).
 *  - `getMissionHudState(game, selected)` : the LIVE objective line + checklist, derived purely
 *    from game state (moved verbatim out of ExplorerHud — same strings, same conditions).
 *
 * The hard completion GATES still live in `game.ts` (`missionTasksDone`) — this module only
 * produces presentational text/flags; it never decides whether a mission is actually complete.
 */
import {
  nodeType,
  missionProgress,
  corruptedNearby,
  depth03Detected,
  hasInstalledModule,
  coreSecured,
  CORE_NODE_INDEX,
  VAULT_NODE_INDEX,
  FIREWALL_NODE_INDEX,
  CORRUPTION_NODE_INDEX,
  RELAY_NODE_INDEX,
  STORM_NODE_INDEX,
  FRAGMENT_NODE_INDEX,
  CLUSTER_NODE_INDEX,
  BLACKROUTE_NODE_INDEX,
  CHAMBER_NODE_INDEX,
  ALPHA_CORE_NODE_INDEX,
  type GameState,
  type NodeType,
} from './game';

/** Live objective line for the Phase 3A deep missions (08–12). Each points at its designated
 *  node, then reads "· CONTINUE" once its flag latches. Pure. */
function deepObjective(s: GameState, selType: NodeType | null, selected: number | null): string {
  const mid = s.missionId;
  if (mid === 8)
    return s.deepSignalDetected
      ? (s.currentDepth >= 4 ? 'DEPTH 04 REACHED · CONTINUE' : 'OPEN A DEEP ROUTE → REACH DEPTH 04')
      : selType === 'GATEWAY' ? 'OPEN STREAM → DETECT DEEP SIGNAL'
        : 'FIND A DEEP GATEWAY (DEPTH ≥ 03)';
  if (mid === 9)
    return s.vaultBreached ? 'VAULT DATA EXTRACTED · CONTINUE'
      : selected === VAULT_NODE_INDEX ? 'EXTRACT [E] THE DEEP VAULT (TRACE FIRST IF DENIED)'
        : 'FOLLOW THE VAULT SIGNAL · SELECT THE DEEP VAULT';
  if (mid === 10)
    return s.blackFirewallOpened ? 'BLACK FIREWALL OPEN · CONTINUE'
      : selected === FIREWALL_NODE_INDEX ? 'OPEN [O] THE BLACK FIREWALL (OR USE KEY)'
        : 'LOCATE THE BLACK FIREWALL';
  if (mid === 11)
    return s.corruptionWaveCleared ? 'CORRUPTION CONTAINED · CONTINUE'
      : selected === CORRUPTION_NODE_INDEX ? 'ISOLATE [I] TO CONTAIN THE CORRUPTED NODE'
        : 'CORRUPTION WAVE ACTIVE · FIND THE CORRUPTED NODE';
  if (mid === 12)
    return s.brokenRelayRestored ? 'RELAY RESTORED · DEEP NETWORK STABILIZED'
      : selected === RELAY_NODE_INDEX ? 'RESTORE RELAY [T] TO RESTORE SIGNAL FLOW'
        : 'SIGNAL COLLAPSE · FIND THE BROKEN RELAY';
  // --- Phase 3B — Sector A02 Alpha Core arc (Missions 13–20) ---
  if (mid === 13)
    return s.signalStormCleared ? 'SIGNAL STORM STABILIZED · CONTINUE'
      : selected === STORM_NODE_INDEX ? 'ISOLATE [I] THE STORM SOURCE TO STABILIZE'
        : 'SIGNAL STORM DETECTED · FIND THE STORM SOURCE';
  if (mid === 14)
    return s.coreFragmentRecovered ? 'CORE FRAGMENT RECOVERED · CONTINUE'
      : selected === FRAGMENT_NODE_INDEX ? 'EXTRACT [E] TO RECOVER THE CORE FRAGMENT'
        : 'CORE FRAGMENT SIGNAL · LOCATE THE FRAGMENT';
  if (mid === 15)
    return s.privateGridStabilized ? 'PRIVATE GRID STABILIZED · CONTINUE'
      : 'PRIVATE GRID OVERLOAD · OPEN UPGRADES [U] · UPGRADE A MODULE';
  if (mid === 16)
    return s.corruptionContained ? 'CORRUPTION CONTAINED · CONTINUE'
      : selected === CLUSTER_NODE_INDEX ? 'ISOLATE [I] TO CONTAIN THE CLUSTER'
        : 'CORRUPTED CLUSTER DETECTED · LOCATE THE CLUSTER';
  if (mid === 17)
    return s.blackRouteOpened ? 'BLACK ROUTE OPENED · CONTINUE'
      : selected === BLACKROUTE_NODE_INDEX ? 'TRACE TO ANALYZE → OPEN [O] THE BLACK ROUTE'
        : 'LOCATE THE BLACK ROUTE';
  if (mid === 18)
    return s.coreChamberOpened ? 'CORE CHAMBER OPENED · CONTINUE'
      : selected === CHAMBER_NODE_INDEX ? 'OPEN [O] THE CORE CHAMBER ROUTE'
        : 'LOCATE THE SECTOR A02 CORE CHAMBER';
  if (mid === 19)
    return s.alphaCoreStabilized ? 'ALPHA CORE STABILIZED · CONTINUE'
      : selected === ALPHA_CORE_NODE_INDEX ? 'STABILIZE [T] THE ALPHA CORE'
        : 'LOCATE THE ALPHA CORE';
  // mid >= 20 // SECTOR A02 SECURED (final)
  return s.sectorA02Secured ? 'SECTOR A02 SECURED · ALPHA CORE ONLINE · NEXT SECTOR LOCKED'
    : selected === ALPHA_CORE_NODE_INDEX ? 'SECURE CORE [T] TO SECURE SECTOR A02'
      : 'SECURE THE ALPHA CORE';
}

/** Lightweight chapter grouping over the mission chain (Phase 3A). Pure metadata — derived from
 *  the mission id, shown in the HUD, never gates anything. */
export const CHAPTER_NAMES: Record<number, string> = {
  0: 'FIRST SIGNAL', // Mission 00
  1: 'NETWORK AWAKENING', // Missions 01–03
  2: 'PRIVATE GRID', // Missions 04–07
  3: 'DEEP NETWORK', // Missions 08–10
  4: 'CORRUPTION PRESSURE', // Missions 11–12
  5: 'ALPHA CORE', // Missions 13–20 (Phase 3B — still Sector A02)
};
/** Chapter index for a mission id. */
export const chapterOf = (missionId: number): number =>
  missionId <= 0 ? 0 : missionId <= 3 ? 1 : missionId <= 7 ? 2 : missionId <= 10 ? 3 : missionId <= 12 ? 4 : 5;
/** Chapter display name for a mission id (e.g. 'DEEP NETWORK'). */
export const chapterName = (missionId: number): string => CHAPTER_NAMES[chapterOf(missionId)] ?? '';

/** Static briefing/identity copy per mission id (01–12). Shapes match what GameApp's mission
 *  briefing + complete overlays and the HUD mission panel already consume. */
export interface MissionMeta {
  name: string; // short HUD name, e.g. 'CORE BREACH'
  brand?: boolean; // mission 01 shows the brand wordmark on its briefing
  title: string; // 'MISSION 0N // NAME'
  sub?: string[]; // briefing subtitle line(s)
  obj: string[]; // briefing objective lines
  done: string[]; // mission-complete overlay lines
}

export const MISSION_META: Record<number, MissionMeta> = {
  1: {
    name: 'SURFACE BREACH',
    brand: true,
    title: 'MISSION 01 // SURFACE BREACH',
    obj: ['EXTRACT DATA', 'TRACE LINKS', 'ISOLATE RISK', 'ENTER DEPTH 02'],
    done: ['MISSION 01 COMPLETE', 'SURFACE BREACH SUCCESSFUL', 'DEPTH 02 UNLOCKED'],
  },
  2: {
    name: 'ARCHIVE HUNT',
    title: 'MISSION 02 // ARCHIVE HUNT',
    sub: ['DEPTH 02 ACTIVE'],
    obj: ['TRACE ARCHIVE ROUTES', 'EXTRACT HIGHER VALUE DATA', 'AVOID DECOY SIGNALS', 'LOCATE NEXT GATEWAY'],
    done: ['MISSION 02 COMPLETE', 'ARCHIVE ROUTES EXTRACTED', 'DEPTH 03 SIGNAL DETECTED'],
  },
  3: {
    name: 'SIGNAL WAR',
    title: 'MISSION 03 // SIGNAL WAR',
    sub: ['NETWORK RESISTANCE DETECTED'],
    obj: ['SURVIVE SIGNAL PRESSURE', 'DISRUPT WATCHER NODES', 'STABILIZE CORRUPTED LINKS', 'REACH DEPTH 03'],
    done: ['MISSION 03 COMPLETE', 'SIGNAL WAR SURVIVED', 'PRIVATE GRID ACCESS GRANTED'],
  },
  4: {
    name: 'PRIVATE GRID',
    title: 'MISSION 04 // PRIVATE GRID',
    sub: ['PRIVATE GRID ONLINE'],
    obj: ['OPEN SUBNETWORK (B)', 'INSTALL YOUR FIRST MODULE', 'ACTIVATE A MODULE EFFECT'],
    done: ['MISSION 04 COMPLETE', 'PRIVATE GRID ACTIVE', 'MODULE EFFECTS ONLINE'],
  },
  5: {
    name: 'SECURE ROUTES',
    title: 'MISSION 05 // SECURE ROUTES',
    sub: ['HARDEN THE NETWORK'],
    obj: ['ISOLATE RISK NODES', 'TRACE CLEAN ROUTES', 'SECURE WITH KEYS / STABILIZE'],
    done: ['MISSION 05 COMPLETE', 'ROUTES SECURED', 'NETWORK HARDENED'],
  },
  6: {
    name: 'DEEP EXTRACTION',
    title: 'MISSION 06 // DEEP EXTRACTION',
    sub: ['PULL SERIOUS DATA'],
    obj: ['EXPORT HIGH-VALUE DATA', 'USE MODULES TO STAY SAFE', 'MANAGE THE THREAT TIER'],
    done: ['MISSION 06 COMPLETE', 'DEEP DATA EXTRACTED', 'CORE SIGNAL LOCATED'],
  },
  7: {
    name: 'CORE BREACH',
    title: 'MISSION 07 // CORE BREACH',
    sub: ['REACH THE CORE NODE'],
    obj: [
      'REACH DEPTH 03 (OPEN DEEPER ROUTES UNTIL THE HUD READS DEPTH 03)',
      'FOLLOW THE HIGHLIGHTED CORE SIGNAL',
      'SELECT THE CORE NODE · PRESS SECURE CORE',
    ],
    done: ['MISSION 07 COMPLETE', 'CORE NODE SECURED', 'PROTOTYPE v1 OBJECTIVE MET'],
  },
  // --- Phase 3A — Deep Network (Chapters 3–4) ---
  8: {
    name: 'DEEP SIGNAL',
    title: 'MISSION 08 // DEEP SIGNAL',
    sub: ['DEEP NETWORK DETECTED'],
    obj: ['DETECT A DEEP SIGNAL (OPEN A GATEWAY AT DEPTH ≥ 03)', 'OPEN A DEEPER ROUTE', 'REACH DEPTH 04'],
    done: ['MISSION 08 COMPLETE', 'DEEP SIGNAL ACQUIRED', 'DEPTH 04 REACHED'],
  },
  9: {
    name: 'VAULT BREACH',
    title: 'MISSION 09 // VAULT BREACH',
    sub: ['HIGH-VALUE DATA · HIGHER TRACE'],
    obj: ['FOLLOW THE DEEP VAULT SIGNAL', 'TRACE THEN EXPORT THE VAULT', 'ACKNOWLEDGE THE TRACE SWEEP'],
    done: ['MISSION 09 COMPLETE', 'VAULT DATA EXTRACTED', 'TRACE SWEEP SURVIVED'],
  },
  10: {
    name: 'FIREWALL SURGE',
    title: 'MISSION 10 // FIREWALL SURGE',
    sub: ['REINFORCED FIREWALL'],
    obj: ['LOCATE THE BLACK FIREWALL', 'TRACE OR USE A KEY TO OPEN IT', 'SECURE THE ROUTE'],
    done: ['MISSION 10 COMPLETE', 'BLACK FIREWALL OPENED', 'ROUTE SECURED'],
  },
  11: {
    name: 'CORRUPTION WAVE',
    title: 'MISSION 11 // CORRUPTION WAVE',
    sub: ['CORRUPTION WAVE ACTIVE'],
    obj: ['LOCATE THE CORRUPTED NODE', 'TRACE / ISOLATE TO STABILIZE', 'KEEP TRACE UNDER CONTROL'],
    done: ['MISSION 11 COMPLETE', 'CORRUPTION WAVE STABILIZED', 'NETWORK INTEGRITY HELD'],
  },
  12: {
    name: 'RELAY COLLAPSE',
    title: 'MISSION 12 // RELAY COLLAPSE',
    sub: ['SIGNAL COLLAPSE DETECTED'],
    obj: ['FIND THE BROKEN RELAY', 'TRACE TO RESTORE SIGNAL FLOW', 'STABILIZE THE DEEP NETWORK'],
    done: ['MISSION 12 COMPLETE', 'RELAY RESTORED', 'ALPHA CORE EXPANSION ONLINE'],
  },
  // --- Phase 3B — Sector A02 // Alpha Core arc (Missions 13–20). The `sub` lines surface the
  //     sector label so the briefing reads SECTOR A02 // DEEP NETWORK for the whole arc. ---
  13: {
    name: 'SIGNAL STORM',
    title: 'MISSION 13 // SIGNAL STORM',
    sub: ['SECTOR A02 // DEEP NETWORK', 'SIGNAL STORM RISING'],
    obj: ['DETECT THE SIGNAL STORM', 'STABILIZE ONE STORM ROUTE', 'KEEP TRACE UNDER CONTROL'],
    done: ['MISSION 13 COMPLETE', 'SIGNAL STORM STABILIZED'],
  },
  14: {
    name: 'CORE FRAGMENT',
    title: 'MISSION 14 // CORE FRAGMENT RECOVERY',
    sub: ['SECTOR A02 // DEEP NETWORK', 'ALPHA CORE FRAGMENT DETECTED'],
    obj: ['LOCATE A CORE FRAGMENT NODE', 'RECOVER THE CORE FRAGMENT', 'CONFIRM FRAGMENT COUNT RISES'],
    done: ['MISSION 14 COMPLETE', 'CORE FRAGMENT RECOVERED'],
  },
  15: {
    name: 'GRID OVERLOAD',
    title: 'MISSION 15 // PRIVATE GRID OVERLOAD',
    sub: ['SECTOR A02 // DEEP NETWORK', 'PRIVATE GRID OVERLOADING'],
    obj: ['CLEAR THE PRIVATE GRID OVERLOAD', 'KEEP A MODULE ACTIVE', 'RESTORE PRIVATE GRID STATUS'],
    done: ['MISSION 15 COMPLETE', 'PRIVATE GRID STABILIZED'],
  },
  16: {
    name: 'CORRUPTION CONTAINMENT',
    title: 'MISSION 16 // CORRUPTION CONTAINMENT',
    sub: ['SECTOR A02 // DEEP NETWORK', 'CORRUPTED CLUSTER SPREADING'],
    obj: ['LOCATE THE CORRUPTED CLUSTER', 'CONTAIN / STABILIZE THE CLUSTER', 'REDUCE CORRUPTION PRESSURE'],
    done: ['MISSION 16 COMPLETE', 'CORRUPTION CONTAINED'],
  },
  17: {
    name: 'BLACK ROUTE',
    title: 'MISSION 17 // BLACK ROUTE ACCESS',
    sub: ['SECTOR A02 // DEEP NETWORK', 'DANGEROUS ROUTE AHEAD'],
    obj: ['LOCATE THE BLACK ROUTE', 'OPEN OR SECURE THE BLACK ROUTE', 'USE KEY / TRACE TO OPEN'],
    done: ['MISSION 17 COMPLETE', 'BLACK ROUTE OPENED'],
  },
  18: {
    name: 'CORE CHAMBER',
    title: 'MISSION 18 // SECTOR A02 CORE CHAMBER',
    sub: ['SECTOR A02 // DEEP NETWORK', 'ALPHA CORE CHAMBER NEARBY'],
    obj: ['LOCATE THE CORE CHAMBER', 'OPEN THE CHAMBER ROUTE', 'INSPECT / ACTIVATE THE CHAMBER'],
    done: ['MISSION 18 COMPLETE', 'CORE CHAMBER OPENED'],
  },
  19: {
    name: 'ALPHA CORE',
    title: 'MISSION 19 // ALPHA CORE STABILIZATION',
    sub: ['SECTOR A02 // DEEP NETWORK', 'ALPHA CORE UNSTABLE'],
    obj: ['LOCATE THE ALPHA CORE', 'STABILIZE THE ALPHA CORE', 'HOLD SYSTEM INTEGRITY'],
    done: ['MISSION 19 COMPLETE', 'ALPHA CORE STABILIZED'],
  },
  20: {
    name: 'SECTOR A02',
    title: 'MISSION 20 // SECTOR A02 SECURED',
    sub: ['SECTOR A02 // DEEP NETWORK', 'FINAL ALPHA CORE SECURE'],
    obj: ['SECURE THE ALPHA CORE', 'CONFIRM SECTOR A02 STABILITY', 'COMPLETE THE ALPHA CORE ARC'],
    done: ['SECTOR A02 SECURED', 'ALPHA CORE ONLINE', 'NEXT SECTOR LOCKED'],
  },
};

/** Short HUD mission name for an id (falls back to the first mission for any out-of-range id). */
export const missionName = (missionId: number): string =>
  (MISSION_META[missionId] ?? MISSION_META[1]).name;

/** One HUD checklist row. */
export interface Task {
  label: string;
  done: boolean;
  warn?: boolean;
  now?: number;
  goal?: number;
}

/** Presentational mission state for the HUD — the live objective line + checklist, plus the
 *  static identity copy. Pure: derived only from game state, so it's safe to call every render. */
export interface MissionHudState {
  name: string;
  chapter: string; // chapter display name (e.g. 'DEEP NETWORK')
  title: string;
  subtitle: string[];
  objective: string;
  tasks: Task[];
  isComplete: boolean;
}

/**
 * Derive the HUD's live objective line and task checklist from game state. Moved verbatim from
 * ExplorerHud (identical strings + conditions) so the displayed objective/checks never change.
 */
export function getMissionHudState(s: GameState, selected: number | null): MissionHudState {
  const mid = s.missionId;
  const m2 = mid === 2;
  const m3 = mid >= 3;
  const tr = Math.round(s.traceLevel);
  const selType = selected != null ? nodeType(selected, s.currentDepth) : null;
  const corruptNearby = m3 && selected != null ? corruptedNearby(selected, s.linkStabilized) : 0;
  const p = missionProgress(s);
  const installedModules = (Object.values(s.playerSubnetwork.modules) as number[]).filter((l) => l > 0).length;
  const moduleInstalled = hasInstalledModule(s);
  const secured = coreSecured(s);
  const coreLocated =
    s.currentDepth >= 3 && (secured || selected === CORE_NODE_INDEX || !!s.statuses[CORE_NODE_INDEX]?.inspected);

  // --- objective line (verbatim from the HUD) ---
  let objective: string;
  if (s.locked) objective = 'MISSION FAILED — PRESS R';
  else if (s.missionComplete)
    objective = mid >= 20 ? 'SECTOR A02 SECURED · ALPHA CORE ONLINE · NEXT SECTOR LOCKED'
      : mid === 12 ? 'ALPHA CORE EXPANSION ONLINE · DEEP NETWORK STABILIZED'
        : 'MISSION COMPLETE · CONTINUE NETWORK';
  else if (tr >= 70) objective = m3 ? 'REDUCE TRACE / ISOLATE SOURCE' : 'REDUCE TRACE / ISOLATE NODE';
  else if (mid >= 4) {
    // Prototype v1 continuation missions (04–07)
    if (mid === 4) objective = !moduleInstalled ? 'OPEN SUBNETWORK (B) · INSTALL A MODULE' : 'MODULE INSTALLED · CONTINUE';
    else if (mid === 5) {
      if (selType === 'DECOY' || selType === 'CAMERA' || selType === 'LOCKED') objective = 'ISOLATE RISK NODE';
      else if (corruptNearby > 0) objective = 'TRACE LINKS TO STABILIZE ROUTE';
      else objective = 'SECURE ROUTES · ISOLATE + TRACE';
    } else if (mid === 6) {
      objective = selType === 'ARCHIVE' ? 'TRACE LINKS BEFORE EXPORT' : 'EXTRACT HIGH-VALUE DATA';
    } else if (mid === 7) {
      // MISSION 07 // CORE BREACH — lead the player down to DEPTH 03, then onto the CORE node.
      if (s.currentDepth < 3)
        objective = selType === 'GATEWAY'
          ? 'OPEN STREAM → ENTER SUBNETWORK (GO DEEPER)'
          : 'OPEN A DEEP ROUTE → REACH DEPTH 03';
      else if (secured) objective = 'CORE SECURED · PROTOTYPE v1 COMPLETE';
      else if (selected === CORE_NODE_INDEX) objective = 'PRESS SECURE CORE TO COMPLETE';
      else objective = 'FOLLOW THE CORE SIGNAL · SELECT THE CORE NODE';
    } else {
      // Phase 3A — Deep Network missions 08–12 (each leads to one designated node)
      objective = deepObjective(s, selType, selected);
    }
  } else if (m3) {
    // MISSION 03 // SIGNAL WAR
    if (s.pulseActive) objective = 'AVOID HIGH-RISK ACTIONS';
    else if (selType === 'GATEWAY')
      objective = s.streamNode === selected ? 'ENTER SUBNETWORK → DEPTH 03' : 'OPEN DEPTH 03 ROUTE';
    else if (selType === 'CAMERA') objective = 'ISOLATE WATCHER NODE';
    else if (selType === 'DECOY') objective = 'AVOID DECOY SIGNAL';
    else if (corruptNearby > 0) objective = 'TRACE LINKS TO STABILIZE ROUTE';
    else if (selType === 'ARCHIVE') objective = 'TRACE LINKS TO STABILIZE ROUTE';
    else if (p.stabilized < 5) objective = 'FIND CORRUPTED ROUTES';
    else if (p.extracted < 250) objective = 'EXTRACT DATA UNDER PRESSURE';
    else if (!depth03Detected(s)) objective = 'LOCATE DEPTH 03 ROUTE';
    else if (s.currentDepth < 3) objective = 'ENTER SUBNETWORK → DEPTH 03';
    else objective = 'MONITOR SIGNAL PRESSURE';
  } else if (selType === 'GATEWAY')
    objective = s.streamNode === selected ? 'ENTER SUBNETWORK' : m2 ? 'OPEN NEXT GATEWAY STREAM' : 'OPEN GATEWAY STREAM';
  else if (m2) {
    // MISSION 02 // ARCHIVE HUNT
    if (selType === 'ARCHIVE') objective = 'TRACE LINKS BEFORE EXPORT';
    else if (selType === 'DECOY') objective = 'AVOID DECOY SIGNAL';
    else if (selType === 'CAMERA') objective = 'ISOLATE HIGH TRACE SOURCE';
    else if (p.traced < 6) objective = 'TRACE ARCHIVE ROUTES';
    else if (p.extracted < 200) objective = 'EXTRACT HIGHER VALUE DATA';
    else if (!s.nextGatewayFound) objective = 'LOCATE NEXT GATEWAY';
    else objective = 'CONTINUE EXTRACTION';
  } else {
    // MISSION 01 // SURFACE BREACH
    const riskSelected =
      selType === 'CAMERA' || selType === 'DECOY' || selType === 'LOCKED' || selType === 'ARCHIVE';
    if (riskSelected && p.riskIsolated < 1) objective = 'ISOLATE RISK NODE';
    else if (s.inspectedCount < 1) objective = 'INSPECT THE NETWORK';
    else if (p.extracted < 100) objective = 'EXPORT DATA';
    else if (p.traced < 3) objective = 'TRACE LINKS TO REVEAL ROUTES';
    else if (s.currentDepth < 2) objective = 'FIND A GATEWAY → ENTER DEPTH 02';
    else if (p.riskIsolated < 1) objective = 'ISOLATE A RISK NODE TO COMPLETE';
    else objective = 'CONTINUE EXTRACTION';
  }

  // --- task checklist (verbatim from the HUD; counts are PER-MISSION) ---
  // "located" = the objective node is selected now or was inspected (GameApp focuses + INSPECTs it).
  const located = (node: number) => selected === node || !!s.statuses[node]?.inspected;
  const tasks: Task[] =
    mid >= 20 ? [
        { label: 'SECURE THE ALPHA CORE', done: s.sectorA02Secured || located(ALPHA_CORE_NODE_INDEX) },
        { label: 'CONFIRM SECTOR A02 STABILITY', done: s.sectorA02Secured },
        { label: 'KEEP TRACE BELOW 100%', done: !s.locked },
      ]
    : mid === 19 ? [
        { label: 'LOCATE THE ALPHA CORE', done: s.alphaCoreStabilized || located(ALPHA_CORE_NODE_INDEX) },
        { label: 'STABILIZE THE ALPHA CORE', done: s.alphaCoreStabilized },
        { label: 'KEEP TRACE BELOW 100%', done: !s.locked },
      ]
    : mid === 18 ? [
        { label: 'LOCATE THE CORE CHAMBER', done: s.coreChamberOpened || located(CHAMBER_NODE_INDEX) },
        { label: 'OPEN THE CHAMBER ROUTE', done: s.coreChamberOpened },
        { label: 'KEEP TRACE BELOW 100%', done: !s.locked },
      ]
    : mid === 17 ? [
        { label: 'LOCATE THE BLACK ROUTE', done: s.blackRouteOpened || located(BLACKROUTE_NODE_INDEX) },
        { label: 'OPEN THE BLACK ROUTE', done: s.blackRouteOpened },
        { label: 'KEEP TRACE BELOW 100%', done: !s.locked },
      ]
    : mid === 16 ? [
        { label: 'LOCATE THE CORRUPTED CLUSTER', done: s.corruptionContained || located(CLUSTER_NODE_INDEX) },
        { label: 'CONTAIN THE CLUSTER', done: s.corruptionContained },
        { label: 'KEEP TRACE BELOW 100%', done: !s.locked },
      ]
    : mid === 15 ? [
        { label: 'OPEN UPGRADES [U] / GRID [B]', done: s.privateGridStabilized },
        { label: 'UPGRADE OR INSTALL A MODULE', done: s.privateGridStabilized },
        { label: 'MODULE ACTIVE', done: installedModules >= 1 },
        { label: 'KEEP TRACE BELOW 100%', done: !s.locked },
      ]
    : mid === 14 ? [
        { label: 'LOCATE A CORE FRAGMENT', done: s.coreFragmentRecovered || located(FRAGMENT_NODE_INDEX) },
        { label: 'RECOVER THE CORE FRAGMENT', done: s.coreFragmentRecovered },
        { label: 'CORE FRAGMENT COUNT', done: s.resources.coreFragments > 0, now: s.resources.coreFragments, goal: 1 },
        { label: 'KEEP TRACE BELOW 100%', done: !s.locked },
      ]
    : mid === 13 ? [
        { label: 'DETECT THE SIGNAL STORM', done: s.signalStormCleared || located(STORM_NODE_INDEX) },
        { label: 'STABILIZE A STORM ROUTE', done: s.signalStormCleared },
        { label: 'KEEP TRACE BELOW 100%', done: !s.locked },
      ]
    : mid === 12 ? [
        { label: 'LOCATE THE BROKEN RELAY', done: s.brokenRelayRestored || located(RELAY_NODE_INDEX) },
        { label: 'RESTORE SIGNAL FLOW', done: s.brokenRelayRestored },
        { label: 'KEEP TRACE BELOW 100%', done: !s.locked },
      ]
    : mid === 11 ? [
        { label: 'CORRUPTION WAVE ACTIVE', done: s.corruptionWaveCleared },
        { label: 'STABILIZE THE CORRUPTED NODE', done: s.corruptionWaveCleared },
        { label: 'KEEP TRACE BELOW 100%', done: !s.locked },
      ]
    : mid === 10 ? [
        { label: 'LOCATE THE BLACK FIREWALL', done: s.blackFirewallOpened || located(FIREWALL_NODE_INDEX) },
        { label: 'OPEN THE FIREWALL', done: s.blackFirewallOpened },
        { label: 'KEEP TRACE BELOW 100%', done: !s.locked },
      ]
    : mid === 9 ? [
        { label: 'LOCATE THE DEEP VAULT', done: s.vaultBreached || located(VAULT_NODE_INDEX) },
        { label: 'EXPORT VAULT DATA', done: s.vaultBreached },
        { label: 'KEEP TRACE BELOW 100%', done: !s.locked },
      ]
    : mid === 8 ? [
        { label: 'DETECT DEEP SIGNAL', done: s.deepSignalDetected },
        { label: 'REACH DEPTH 04', done: s.currentDepth >= 4 },
        { label: 'KEEP TRACE BELOW 100%', done: !s.locked },
      ]
    : mid === 7 ? [
        { label: 'REACH DEPTH 03', done: s.currentDepth >= 3 },
        { label: 'LOCATE THE CORE SIGNAL', done: coreLocated },
        { label: 'SECURE THE CORE NODE', done: secured },
        { label: 'KEEP TRACE BELOW 100%', done: !s.locked },
      ]
    : mid === 6
      ? [
          { label: 'EXTRACT DATA (MISSION)', done: p.extracted >= 250, now: p.extracted, goal: 250 },
          { label: 'MODULE EFFECTS ACTIVE', done: installedModules >= 1 },
          { label: 'KEEP TRACE BELOW 100%', done: !s.locked },
        ]
      : mid === 5
        ? [
            { label: 'ISOLATE RISK NODES', done: p.riskIsolated >= 2, now: p.riskIsolated, goal: 2 },
            { label: 'TRACE CLEAN ROUTES', done: p.traced >= 4, now: p.traced, goal: 4 },
            { label: 'KEEP TRACE BELOW 100%', done: !s.locked },
          ]
        : mid === 4
          ? [
              { label: 'OPEN SUBNETWORK (B)', done: s.playerSubnetwork.unlocked },
              { label: 'INSTALL A MODULE', done: moduleInstalled },
              { label: 'KEEP TRACE BELOW 100%', done: !s.locked },
            ]
          : mid === 3
            ? [
                { label: 'SURVIVE SIGNAL PULSES', done: p.survived >= 3, now: p.survived, goal: 3 },
                { label: 'STABILIZE CORRUPTED LINKS', done: p.stabilized >= 5, now: p.stabilized, goal: 5 },
                { label: 'ISOLATE WATCHER NODES', done: p.watcher >= 2, now: p.watcher, goal: 2 },
                { label: 'EXTRACT DATA (MISSION)', done: p.extracted >= 250, now: p.extracted, goal: 250 },
                { label: 'ENTER DEPTH 03', done: s.currentDepth >= 3 },
                { label: 'KEEP TRACE BELOW 100%', done: !s.locked },
              ]
    : m2
      ? [
          { label: 'EXTRACT DATA (MISSION)', done: p.extracted >= 200, now: p.extracted, goal: 200 },
          { label: 'TRACE LINKS', done: p.traced >= 6, now: p.traced, goal: 6 },
          { label: 'EXPORT ARCHIVES', done: p.archiveExports >= 2, now: p.archiveExports, goal: 2 },
          { label: 'ISOLATE RISK NODES', done: p.riskIsolated >= 2, now: p.riskIsolated, goal: 2 },
          { label: 'LOCATE GATEWAY → DEPTH 03', done: s.nextGatewayFound },
          { label: 'AVOID DECOY EXPORTS', done: p.decoyExports === 0, warn: p.decoyExports > 0 },
        ]
      : [
          { label: 'INSPECT NODES', done: s.inspectedCount >= 3, now: s.inspectedCount, goal: 3 },
          { label: 'EXTRACT DATA (MISSION)', done: p.extracted >= 100, now: p.extracted, goal: 100 },
          { label: 'TRACE LINKS', done: p.traced >= 3, now: p.traced, goal: 3 },
          { label: 'ISOLATE RISK NODE', done: p.riskIsolated >= 1, now: p.riskIsolated, goal: 1 },
          { label: 'ENTER DEPTH 02', done: s.currentDepth >= 2 },
          { label: 'KEEP TRACE BELOW 100%', done: !s.locked },
        ];

  const meta = MISSION_META[mid] ?? MISSION_META[1];
  return { name: meta.name, chapter: chapterName(mid), title: meta.title, subtitle: meta.sub ?? [], objective, tasks, isComplete: s.missionComplete };
}

/**
 * Inspection-panel objective hint for the Phase 3A deep missions (09–12): which action to
 * emphasize on the designated node, a button relabel, and a one-line banner. Returns null when
 * the selected node isn't the current mission's (unsecured) objective node. Pure.
 */
export interface DeepObjectiveHint {
  action: 'T' | 'E' | 'O' | 'I'; // which action button to emphasize (TRACE / EXPORT / OPEN / ISOLATE)
  label?: string; // optional button relabel
  banner: string; // one-line guidance banner
}
export function deepObjectiveHint(s: GameState, selected: number | null): DeepObjectiveHint | null {
  if (selected == null) return null;
  // Variety Pass — the emphasized action now matches the mission's REQUIRED action: EXTRACT a
  // vault/fragment, OPEN a firewall/route/chamber, ISOLATE corruption/storm/cluster, RESTORE/
  // STABILIZE/SECURE via TRACE on the relay/core. (Mission 15 is an UPGRADE objective — no node.)
  if (s.missionId === 9 && selected === VAULT_NODE_INDEX && !s.vaultBreached)
    return { action: 'E', label: 'EXTRACT VAULT', banner: '▸ DEEP VAULT · PRESS EXTRACT [E] (TRACE FIRST IF ACCESS DENIED)' };
  if (s.missionId === 10 && selected === FIREWALL_NODE_INDEX && !s.blackFirewallOpened)
    return { action: 'O', label: 'OPEN FIREWALL', banner: '▸ BLACK FIREWALL · PRESS OPEN [O] (OR USE KEY) TO UNLOCK THE ROUTE' };
  if (s.missionId === 11 && selected === CORRUPTION_NODE_INDEX && !s.corruptionWaveCleared)
    return { action: 'I', label: 'CONTAIN', banner: '▸ CORRUPTION WAVE · PRESS ISOLATE [I] TO CONTAIN THE NODE' };
  if (s.missionId === 12 && selected === RELAY_NODE_INDEX && !s.brokenRelayRestored)
    return { action: 'T', label: 'RESTORE RELAY', banner: '▸ BROKEN RELAY · PRESS RESTORE RELAY [T] TO RESTORE SIGNAL FLOW' };
  // --- Phase 3B — Sector A02 Alpha Core arc (Missions 13–20) ---
  if (s.missionId === 13 && selected === STORM_NODE_INDEX && !s.signalStormCleared)
    return { action: 'I', label: 'STABILIZE STORM', banner: '▸ SIGNAL STORM · PRESS ISOLATE [I] TO CUT THE SOURCE' };
  if (s.missionId === 14 && selected === FRAGMENT_NODE_INDEX && !s.coreFragmentRecovered)
    return { action: 'E', label: 'RECOVER FRAGMENT', banner: '▸ CORE FRAGMENT · PRESS EXTRACT [E] TO RECOVER IT' };
  if (s.missionId === 16 && selected === CLUSTER_NODE_INDEX && !s.corruptionContained)
    return { action: 'I', label: 'CONTAIN CLUSTER', banner: '▸ CORRUPTED CLUSTER · PRESS ISOLATE [I] TO CONTAIN' };
  if (s.missionId === 17 && selected === BLACKROUTE_NODE_INDEX && !s.blackRouteOpened)
    return { action: 'O', label: 'OPEN BLACK ROUTE', banner: '▸ BLACK ROUTE · TRACE TO ANALYZE, THEN OPEN [O] (OR USE KEY)' };
  if (s.missionId === 18 && selected === CHAMBER_NODE_INDEX && !s.coreChamberOpened)
    return { action: 'O', label: 'OPEN CHAMBER', banner: '▸ CORE CHAMBER · PRESS OPEN [O] TO OPEN THE CHAMBER ROUTE' };
  if (s.missionId === 19 && selected === ALPHA_CORE_NODE_INDEX && !s.alphaCoreStabilized)
    return { action: 'T', label: 'STABILIZE CORE', banner: '▸ ALPHA CORE · PRESS STABILIZE [T] TO STABILIZE THE CORE' };
  if (s.missionId >= 20 && selected === ALPHA_CORE_NODE_INDEX && !s.sectorA02Secured)
    return { action: 'T', label: 'SECURE CORE', banner: '▸ ALPHA CORE · PRESS SECURE CORE [T] TO SECURE SECTOR A02' };
  return null;
}
