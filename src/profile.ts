/**
 * Player Profile — a LOCAL-FIRST operator identity layer (Phase 7).
 *
 * Lives in its OWN localStorage slot, fully SEPARATE from the game autosave (`save.ts`) and the
 * checkpoint slot, on purpose:
 *   - a full session reset (Shift+R → RESET → initGame) keeps the operator identity intact,
 *   - a checkpoint retry (LOAD_CHECKPOINT) never rolls the profile back,
 *   - the pure `gameReducer` and the save schema are untouched (no determinism / migration impact).
 *
 * The profile is a persistent HIGH-WATER-MARK snapshot of progression — every numeric stat only
 * ever RISES (we take the max of the stored value and the live game value), so a reset run never
 * regresses your identity. Achievements accumulate and are never removed. Player level + network
 * score are DERIVED from the stored marks (deterministic). For a single continuous run the
 * high-water marks equal the running totals; across resets they keep your best.
 *
 * Identity / advisory ONLY — this layer never changes gameplay, resources, trace, missions,
 * rewards, or completion (it never dispatches a game action).
 *
 * NOT in this layer (intentionally — later backend/account phases): remote accounts, login,
 * email linking, wallet linking, remote save. `accountStatus` stays 'LOCAL_ONLY' and
 * `futureAccountLink` stays null.
 */
import type { GameState } from './game';

export const PROFILE_VERSION = 1 as const;
const KEY = 'neva:profile:v1';
const BAK = 'neva:profile:v1:bak';

export const CALLSIGN_MIN = 3;
export const CALLSIGN_MAX = 18;
const CALLSIGN_RE = /^[A-Za-z0-9_-]+$/;

export type AccountStatus = 'LOCAL_ONLY';

export interface PlayerProfile {
  version: number;
  callsign: string;
  profileCreatedAt: number;
  lastUpdatedAt: number;
  // --- progression high-water marks (monotonic — only ever rise) ---
  highestMissionReached: number; // mission id 1..20 (highest ever started/reached)
  missionsCompleted: number; // 0..20 main missions completed (best)
  mission00Completed: boolean; // the FIRST SIGNAL tutorial finished at least once
  highestDepthReached: number; // best subnetwork depth (>=1)
  totalDataExtracted: number; // best single-run cumulative DATA
  totalNodesInspected: number;
  totalNodesExported: number;
  totalLinksTraced: number;
  totalNodesIsolated: number;
  totalTraceLocks: number; // lifetime trace-lock events (increments, not a high-water mark)
  coreFragments: number; // best Core Fragment count held
  modulesInstalled: number; // best count of distinct private-grid modules online (0..4)
  modulesUpgraded: number; // best total module levels invested
  upgradesInstalled: number; // best count of distinct permanent upgrades owned (0..6)
  // --- identity ---
  achievements: string[]; // unlocked achievement ids (accumulate; never removed)
  accountStatus: AccountStatus; // 'LOCAL_ONLY' for now
  futureAccountLink: null; // placeholder for a later remote account link
}

// ----------------------------------------------------------------- callsign ---

/** Trim + validate a player-entered callsign. Returns the cleaned value, or null if invalid. */
export function sanitizeCallsign(raw: string): string | null {
  const v = raw.trim();
  if (v.length < CALLSIGN_MIN || v.length > CALLSIGN_MAX) return null;
  if (!CALLSIGN_RE.test(v)) return null;
  return v;
}

/** A default device callsign when the player skips the prompt: OPERATOR-XXXX (4 hex chars).
 * Uses Math.random — this is a one-time init side effect (NOT the pure reducer), so it's fine. */
export function generateDefaultCallsign(): string {
  const n = Math.floor(Math.random() * 0x10000);
  return `OPERATOR-${n.toString(16).toUpperCase().padStart(4, '0')}`;
}

// ------------------------------------------------------------- create / load ---

/** A fresh local profile for `callsign`. All progression marks start at their floor. */
export function createProfile(callsign: string, now = Date.now()): PlayerProfile {
  return {
    version: PROFILE_VERSION,
    callsign,
    profileCreatedAt: now,
    lastUpdatedAt: now,
    highestMissionReached: 1,
    missionsCompleted: 0,
    mission00Completed: false,
    highestDepthReached: 1,
    totalDataExtracted: 0,
    totalNodesInspected: 0,
    totalNodesExported: 0,
    totalLinksTraced: 0,
    totalNodesIsolated: 0,
    totalTraceLocks: 0,
    coreFragments: 0,
    modulesInstalled: 0,
    modulesUpgraded: 0,
    upgradesInstalled: 0,
    achievements: [],
    accountStatus: 'LOCAL_ONLY',
    futureAccountLink: null,
  };
}

/**
 * Profile-schema migration seam (mirrors save.ts). v1 is the baseline (identity). Purely ADDITIVE
 * fields never need a step here — loadProfile merges saved values over a fresh createProfile() so
 * new optional fields default safely. Returns null only for a version this build can't handle.
 */
function migrateProfile(version: number, p: PlayerProfile): PlayerProfile | null {
  // (future migrations go here, lowest version first)
  if (version !== PROFILE_VERSION) return null; // unknown / newer → ignore safely (caller starts fresh)
  return p;
}

/** Read the local profile (falling back to the `.bak`), or null if none/corrupt. */
export function loadProfile(): PlayerProfile | null {
  let raw: string | null;
  try {
    raw = localStorage.getItem(KEY) ?? localStorage.getItem(BAK);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as PlayerProfile;
    if (!p || typeof p.version !== 'number' || typeof p.callsign !== 'string') return null;
    const m = migrateProfile(p.version, p);
    if (!m) return null;
    // merge saved over a fresh default so older/partial blobs gain new fields safely
    return { ...createProfile(m.callsign, m.profileCreatedAt || Date.now()), ...m, version: PROFILE_VERSION };
  } catch {
    return null;
  }
}

/** Write the local profile (validates round-trip, keeps one `.bak`). Safe to call often. */
export function writeProfile(p: PlayerProfile): void {
  try {
    const json = JSON.stringify(p);
    JSON.parse(json); // round-trip validation before touching the live slot
    const existing = localStorage.getItem(KEY);
    if (existing) localStorage.setItem(BAK, existing);
    localStorage.setItem(KEY, json);
  } catch {
    /* quota exceeded / storage disabled — skip this write */
  }
}

/** Remove the local profile entirely (RESET PROFILE — gameplay save is left untouched). */
export function clearProfile(): void {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(BAK);
  } catch {
    /* ignore */
  }
}

// ----------------------------------------------- live derivations from GameState ---

/** Main missions (1..20) completed in the CURRENT game state (00 is the tutorial, tracked apart). */
export function missionsCompletedNow(g: GameState): number {
  const done = g.missionId - 1 + (g.missionComplete ? 1 : 0);
  return Math.max(0, Math.min(20, done));
}
/** Count of distinct private-grid modules currently installed (level > 0). */
export function modulesInstalledNow(g: GameState): number {
  return (Object.values(g.playerSubnetwork.modules) as number[]).filter((l) => l > 0).length;
}
/** Total module levels currently invested across the private grid. */
export function moduleLevelsNow(g: GameState): number {
  return (Object.values(g.playerSubnetwork.modules) as number[]).reduce((a, b) => a + b, 0);
}
/** Count of distinct permanent upgrades currently owned (level > 0). */
export function upgradesInstalledNow(g: GameState): number {
  return (Object.values(g.upgrades) as number[]).filter((l) => l > 0).length;
}
/** Count of nodes EXPORTED in the current run (derived from node statuses). */
export function nodesExportedNow(g: GameState): number {
  return Object.values(g.statuses).filter((s) => s && s.extracted).length;
}
/** Whether mission `n` is completed in the current run (n=0 → the tutorial). */
function missionDoneNow(g: GameState, n: number): boolean {
  if (n === 0) return g.mission00.complete;
  return g.missionId > n || (g.missionId === n && g.missionComplete);
}

// ------------------------------------------------------------- achievements ---

export interface AchievementDef {
  id: string;
  label: string;
  desc: string;
}

/** Achievements v1 — lightweight, local, unlock-once. Order = display order. */
export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'FIRST_SIGNAL', label: 'FIRST SIGNAL', desc: 'COMPLETE MISSION 00' },
  { id: 'SURFACE_BREACH', label: 'SURFACE BREACH', desc: 'COMPLETE MISSION 01' },
  { id: 'SIGNAL_SURVIVOR', label: 'SIGNAL SURVIVOR', desc: 'COMPLETE MISSION 03' },
  { id: 'PRIVATE_GRID_ONLINE', label: 'PRIVATE GRID ONLINE', desc: 'UNLOCK THE PRIVATE GRID' },
  { id: 'CORE_BREACH', label: 'CORE BREACH', desc: 'COMPLETE MISSION 07' },
  { id: 'ALPHA_CORE_ONLINE', label: 'ALPHA CORE ONLINE', desc: 'COMPLETE MISSION 20' },
  { id: 'CLEAN_OPERATOR', label: 'CLEAN OPERATOR', desc: 'COMPLETE A MISSION BELOW 50% TRACE' },
  { id: 'KEY_HOLDER', label: 'KEY HOLDER', desc: 'HOLD 3 ACCESS KEYS' },
  { id: 'MODULE_BUILDER', label: 'MODULE BUILDER', desc: 'INSTALL YOUR FIRST MODULE' },
  { id: 'UPGRADED', label: 'UPGRADED', desc: 'BUY YOUR FIRST UPGRADE' },
];

// ----------------------------------------------------------------- scoring ---

export const SCORE_PER_LEVEL = 500;

/** Deterministic network score from the stored high-water marks. */
export function networkScore(p: PlayerProfile): number {
  return (
    p.missionsCompleted * 100 +
    p.highestDepthReached * 50 +
    Math.floor(p.totalDataExtracted / 10) +
    p.upgradesInstalled * 25 +
    p.modulesInstalled * 30 +
    p.coreFragments * 100
  );
}

/** Level 1 to start; every SCORE_PER_LEVEL points = +1 level. */
export function playerLevel(score: number): number {
  return 1 + Math.floor(score / SCORE_PER_LEVEL);
}

/** Progress within the current level → { into, span } points. */
export function levelProgress(score: number): { into: number; span: number } {
  return { into: score % SCORE_PER_LEVEL, span: SCORE_PER_LEVEL };
}

// --------------------------------------------------------------- sync (pure) ---

/** Edge events the caller detects from successive game states (the profile can't see them itself). */
export interface ProfileEvents {
  traceLockedEdge: boolean; // a fresh trace lock just happened (rising edge of game.locked)
  cleanCompleteEdge: boolean; // a mission just completed with trace < 50 (rising edge)
}

/**
 * Fold the live game state into the profile: raise every high-water mark, increment lifetime
 * trace-locks on the edge, and unlock any newly-earned achievements. PURE — returns the SAME
 * profile reference when nothing changed (so callers can skip the setState + localStorage write),
 * or a new object otherwise. Never lowers a value and never removes an achievement.
 */
export function syncProfile(profile: PlayerProfile, g: GameState, ev: ProfileEvents): PlayerProfile {
  const next: PlayerProfile = { ...profile };
  let changed = false;

  type NumKey =
    | 'highestMissionReached'
    | 'missionsCompleted'
    | 'highestDepthReached'
    | 'totalDataExtracted'
    | 'totalNodesInspected'
    | 'totalNodesExported'
    | 'totalLinksTraced'
    | 'totalNodesIsolated'
    | 'coreFragments'
    | 'modulesInstalled'
    | 'modulesUpgraded'
    | 'upgradesInstalled';
  const up = (key: NumKey, val: number) => {
    if (val > next[key]) {
      next[key] = val;
      changed = true;
    }
  };

  up('highestMissionReached', g.missionId);
  up('missionsCompleted', missionsCompletedNow(g));
  up('highestDepthReached', g.maxDepthReached);
  up('totalDataExtracted', g.extractedData);
  up('totalNodesInspected', g.inspectedCount);
  up('totalNodesExported', nodesExportedNow(g));
  up('totalLinksTraced', g.revealedLinks);
  up('totalNodesIsolated', g.isolatedNodes);
  up('coreFragments', g.resources.coreFragments);
  up('modulesInstalled', modulesInstalledNow(g));
  up('modulesUpgraded', moduleLevelsNow(g));
  up('upgradesInstalled', upgradesInstalledNow(g));

  if (!next.mission00Completed && g.mission00.complete) {
    next.mission00Completed = true;
    changed = true;
  }
  if (ev.traceLockedEdge) {
    next.totalTraceLocks = profile.totalTraceLocks + 1;
    changed = true;
  }

  // achievements — accumulate; never removed
  const unlocked = new Set(profile.achievements);
  const before = unlocked.size;
  const add = (id: string) => unlocked.add(id);
  if (g.mission00.complete) add('FIRST_SIGNAL');
  if (missionDoneNow(g, 1)) add('SURFACE_BREACH');
  if (missionDoneNow(g, 3)) add('SIGNAL_SURVIVOR');
  if (g.playerSubnetwork.unlocked) add('PRIVATE_GRID_ONLINE');
  if (missionDoneNow(g, 7)) add('CORE_BREACH');
  if (missionDoneNow(g, 20) || g.sectorA02Secured) add('ALPHA_CORE_ONLINE');
  if (ev.cleanCompleteEdge) add('CLEAN_OPERATOR');
  if (g.resources.accessKeys >= 3) add('KEY_HOLDER');
  if (modulesInstalledNow(g) >= 1) add('MODULE_BUILDER');
  if (upgradesInstalledNow(g) >= 1) add('UPGRADED');
  if (unlocked.size !== before) {
    // keep canonical order (the ACHIEVEMENTS list) for stable display
    next.achievements = ACHIEVEMENTS.filter((a) => unlocked.has(a.id)).map((a) => a.id);
    changed = true;
  }

  if (!changed) return profile; // no-op → same ref (caller skips persist)
  next.lastUpdatedAt = Date.now();
  return next;
}
