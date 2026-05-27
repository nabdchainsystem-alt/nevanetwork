/**
 * Session persistence — a single versioned autosave slot in localStorage so a reload
 * resumes the run (mission, depth, trace, extracted data, node statuses) instead of
 * restarting at Mission 01. JSON-safe state only (the reducer uses plain objects/Records,
 * no Map/Set). Keeps one `.bak` for corruption recovery; tolerates added fields by merging
 * the saved values over a fresh `initGame()`.
 */
import { initGame, type GameState } from './game';

const KEY = 'neva:save:v1';
const BAK = 'neva:save:v1:bak';
// checkpoint = the latest SAFE milestone snapshot (mission start / depth reached / continue),
// used to retry after a trace lock instead of restarting at Mission 01. Separate slot + .bak so
// a failed (locked) state never overwrites the recoverable checkpoint.
const CP_KEY = 'neva:checkpoint:v1';
const CP_BAK = 'neva:checkpoint:v1:bak';
const VERSION = 1;

interface SaveBlob {
  version: number;
  continued: boolean; // App-side: whether the mission-complete overlay was dismissed
  game: GameState;
}

interface CheckpointBlob {
  version: number;
  game: GameState; // a safe milestone snapshot (never a locked/failed state)
}

export interface LoadedSave {
  game: GameState;
  continued: boolean;
}

/**
 * Save-schema migration seam. v1 is the current baseline (identity — no transform). When a future
 * schema needs a real change, add an ordered step here, e.g.
 *   if (v < 2) { g = { ...g, someNewShape: derive(g) }; v = 2; }
 * and bump VERSION — old saves then UPGRADE in place instead of being discarded. NOTE: purely
 * ADDITIVE fields never need a step here — loadSave/loadCheckpoint already merge saved data over a
 * fresh initGame(), so new optional fields default safely at v1. Returns null only for a version
 * this build cannot handle (e.g. a newer save written by a future build).
 */
function migrateSaveData(version: number, game: GameState): { version: number; game: GameState } | null {
  const v = version;
  const g = game;
  // (future migrations go here, lowest version first)
  if (v !== VERSION) return null; // unknown / newer version → ignore safely (caller starts fresh)
  return { version: VERSION, game: g };
}

function parse(raw: string | null): SaveBlob | null {
  if (!raw) return null;
  try {
    const blob = JSON.parse(raw) as SaveBlob;
    if (!blob || typeof blob.version !== 'number' || !blob.game) return null;
    const migrated = migrateSaveData(blob.version, blob.game);
    return migrated ? { ...blob, version: migrated.version, game: migrated.game } : null;
  } catch {
    return null;
  }
}

/** Read the autosave (falling back to the `.bak`), or null if none/corrupt. */
export function loadSave(): LoadedSave | null {
  let blob: SaveBlob | null;
  try {
    blob = parse(localStorage.getItem(KEY)) ?? parse(localStorage.getItem(BAK));
  } catch {
    return null;
  }
  if (!blob) return null;
  const base = initGame();
  // Mission 00 intro: a PRE-INTRO save (no `mission00` field) belongs to an existing player —
  // never force them back through onboarding. A save made DURING the intro keeps its step/reveal
  // so a refresh resumes the tutorial where it left off.
  const hadIntro = blob.game.mission00 !== undefined;
  // merge saved over defaults (tolerates new fields in future patches), then clear the
  // transient runtime bits so a resumed session starts clean (no stuck pulse / stale panel)
  const game: GameState = {
    ...base,
    ...blob.game,
    missionBase: { ...base.missionBase, ...(blob.game.missionBase ?? {}) },
    resources: { ...base.resources, ...(blob.game.resources ?? {}) }, // tolerate pre-resource saves
    upgrades: { ...base.upgrades, ...(blob.game.upgrades ?? {}) }, // tolerate pre-upgrade saves
    playerSubnetwork: {
      // tolerate pre-subnetwork saves (field absent → defaults); deep-merge modules
      ...base.playerSubnetwork,
      ...(blob.game.playerSubnetwork ?? {}),
      modules: { ...base.playerSubnetwork.modules, ...(blob.game.playerSubnetwork?.modules ?? {}) },
    },
    mission00: hadIntro
      ? { ...base.mission00, ...blob.game.mission00 }
      : { complete: true, step: 99 }, // pre-intro save = existing player → skip onboarding
    networkRevealed: hadIntro ? (blob.game.networkRevealed ?? true) : true,
    statuses: blob.game.statuses ?? {},
    linkStabilized: blob.game.linkStabilized ?? {},
    pulseActive: false,
    streamNode: null,
    tracedFrom: null,
    message: null,
    msgNode: null,
    lastGain: null, // transient — don't flash a stale resource gain on resume
  };
  // `continued` = the FINAL mission-complete overlay was dismissed. With the 20-mission chain, an
  // OLD save that finished an earlier final mission (e.g. Mission 07 or 12 complete + continued) must
  // NOT stay "continued" — otherwise the CONTINUE overlay never re-shows and they can't reach the
  // later missions. Only keep it for the genuinely-final state (missionId ≥ 20) or no mission complete.
  const continued = !!blob.continued && !(game.missionComplete && game.missionId < 20);
  return { game, continued };
}

/** Write the autosave (validates round-trip, keeps one `.bak`). Safe to call often. */
export function writeSave(game: GameState, continued: boolean): void {
  try {
    const json = JSON.stringify({ version: VERSION, continued, game } as SaveBlob);
    JSON.parse(json); // round-trip validation before touching the live slot
    const existing = localStorage.getItem(KEY);
    if (existing) localStorage.setItem(BAK, existing);
    localStorage.setItem(KEY, json);
  } catch {
    /* quota exceeded / storage disabled / serialization issue — skip this autosave */
  }
}

/** Remove the autosave entirely (not currently wired — a full RESET just overwrites it). */
export function clearSave(): void {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(BAK);
  } catch {
    /* ignore */
  }
}

// ----------------------------------------------------- checkpoint slot ---

/** Read the latest checkpoint snapshot (falling back to its `.bak`), or null if none/corrupt. */
export function loadCheckpoint(): GameState | null {
  let raw: string | null;
  let bak: string | null;
  try {
    raw = localStorage.getItem(CP_KEY);
    bak = localStorage.getItem(CP_BAK);
  } catch {
    return null;
  }
  for (const r of [raw, bak]) {
    if (!r) continue;
    try {
      const blob = JSON.parse(r) as CheckpointBlob;
      if (blob && typeof blob.version === 'number' && blob.game) {
        const migrated = migrateSaveData(blob.version, blob.game);
        // never hand back a locked/failed snapshot — checkpoints are always recoverable
        if (migrated) return { ...migrated.game, locked: false };
      }
    } catch {
      /* try the next source */
    }
  }
  return null;
}

/** Write a checkpoint snapshot (validates round-trip, keeps one `.bak`). Caller guarantees the
 * state is a SAFE milestone (not locked); we also defensively refuse a locked snapshot. */
export function writeCheckpoint(game: GameState): void {
  if (game.locked) return; // never overwrite the recoverable checkpoint with a failed state
  try {
    const json = JSON.stringify({ version: VERSION, game } as CheckpointBlob);
    JSON.parse(json); // round-trip validation before touching the live slot
    const existing = localStorage.getItem(CP_KEY);
    if (existing) localStorage.setItem(CP_BAK, existing);
    localStorage.setItem(CP_KEY, json);
  } catch {
    /* quota / storage disabled — skip */
  }
}

/** Remove the checkpoint slot (used on a full session reset). */
export function clearCheckpoint(): void {
  try {
    localStorage.removeItem(CP_KEY);
    localStorage.removeItem(CP_BAK);
  } catch {
    /* ignore */
  }
}
