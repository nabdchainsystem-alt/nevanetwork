/**
 * Playtest Notes / QA logger — a lightweight, local-only developer tool for the manual
 * Mission 00 → Mission 20 playthrough. It captures friction points (with the live game
 * context auto-attached) into localStorage so they can be reviewed / exported later.
 *
 * It is read-only with respect to the game: nothing here ever mutates GameState, the save,
 * resources, missions, or the backend. Notes live in their OWN localStorage key
 * (`neva_playtest_notes_v1`) — completely separate from the game autosave / checkpoint.
 */
import { nodeType, type GameState } from './game';
import { getMissionHudState, missionName } from './missions';
import { NETWORK } from './network';

/** localStorage slot for the QA notes (separate from the game save). */
export const PLAYTEST_NOTES_KEY = 'neva_playtest_notes_v1';

/** Note categories shown in the manual add dropdown. */
export const NOTE_CATEGORIES = [
  'OBJECTIVE UNCLEAR',
  'NODE HARD TO FIND',
  'ACTION UNCLEAR',
  'UI TOO CROWDED',
  'TRACE TOO HARSH',
  'REWARD UNCLEAR',
  'SAVE/CHECKPOINT ISSUE',
  'BUG',
  'VISUAL ISSUE',
  'BALANCE ISSUE',
  'GOOD MOMENT',
  'OTHER',
] as const;

export type PlaytestCategory = (typeof NOTE_CATEGORIES)[number];

/** One-click quick-note buttons → their canonical category. */
export const QUICK_NOTES: { label: string; category: PlaytestCategory }[] = [
  { label: 'OBJECTIVE UNCLEAR', category: 'OBJECTIVE UNCLEAR' },
  { label: 'NODE HARD TO FIND', category: 'NODE HARD TO FIND' },
  { label: 'TRACE TOO HIGH', category: 'TRACE TOO HARSH' },
  { label: 'UI CLUTTER', category: 'UI TOO CROWDED' },
  { label: 'SAVE ISSUE', category: 'SAVE/CHECKPOINT ISSUE' },
  { label: 'BUG', category: 'BUG' },
  { label: 'GOOD MOMENT', category: 'GOOD MOMENT' },
];

/** The live game context auto-attached to every note (pure / read-only snapshot). */
export interface PlaytestContext {
  missionId: number;
  missionName: string;
  objective: string;
  depth: number;
  sector: string;
  trace: number;
  selectedNodeId: string | null;
  selectedNodeType: string | null;
  checkpoint: string;
  resources: string;
}

/** A stored QA note = the context snapshot + id / timestamp / category / message. */
export interface PlaytestNote extends PlaytestContext {
  id: string;
  createdAt: number; // epoch ms
  category: PlaytestCategory;
  message: string;
}

/** Compact human-readable checkpoint summary (the QA panel shows it; notes store it). */
export function checkpointSummary(cp: GameState | null): string {
  if (!cp) return 'NONE';
  return `M${String(cp.missionId).padStart(2, '0')} ${missionName(cp.missionId)} · DEPTH ${String(cp.currentDepth).padStart(2, '0')}`;
}

/**
 * Snapshot the current game context for a note. Pure — reads state, never writes it.
 * `checkpoint` is the already-summarized label (see `checkpointSummary`) so this stays free of
 * ref/state access concerns at the call site.
 */
export function capturePlaytestContext(
  g: GameState,
  selected: number | null,
  checkpoint: string,
): PlaytestContext {
  const hud = getMissionHudState(g, selected);
  const r = g.resources;
  return {
    missionId: g.missionId,
    missionName: missionName(g.missionId),
    objective: hud.objective,
    depth: g.currentDepth,
    sector: g.missionId >= 8 ? 'A02 DEEP NETWORK' : 'A01 MEMORY GRID',
    trace: Math.round(g.traceLevel),
    selectedNodeId: selected != null ? (NETWORK.meta[selected]?.id ?? `#${selected}`) : null,
    selectedNodeType: selected != null ? nodeType(selected, g.currentDepth) : null,
    checkpoint,
    resources: `DATA ${g.extractedData} · MEM ${r.memoryShards} · KEYS ${r.accessKeys} · SIGNAL ${r.signalEnergy} · CORE ${r.coreFragments}`,
  };
}

/** Build a complete note (id + timestamp) from a category, message, and context snapshot. */
export function makeNote(category: PlaytestCategory, message: string, ctx: PlaytestContext): PlaytestNote {
  return {
    id: `pt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    category,
    message: message.trim(),
    ...ctx,
  };
}

// --- localStorage (resilient — this is a dev tool, it must never throw into gameplay) ---

export function loadPlaytestNotes(): PlaytestNote[] {
  try {
    const raw = localStorage.getItem(PLAYTEST_NOTES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PlaytestNote[]) : [];
  } catch {
    return [];
  }
}

export function savePlaytestNotes(notes: PlaytestNote[]): void {
  try {
    localStorage.setItem(PLAYTEST_NOTES_KEY, JSON.stringify(notes));
  } catch {
    /* storage unavailable / over quota — silently skip; QA tool only */
  }
}

export function clearStoredPlaytestNotes(): void {
  try {
    localStorage.removeItem(PLAYTEST_NOTES_KEY);
  } catch {
    /* ignore */
  }
}

// --- export / copy (read-only; no backend) ---

/** Download the notes as `neva-playtest-notes.json`. */
export function exportNotes(notes: PlaytestNote[]): void {
  try {
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'neva-playtest-notes.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch {
    /* download blocked — non-fatal for a dev tool */
  }
}

/** A plain-text digest of all notes (for COPY SUMMARY). */
export function notesSummaryText(notes: PlaytestNote[]): string {
  if (notes.length === 0) return 'NEVA // PLAYTEST NOTES\n(no notes recorded)';
  const lines: string[] = [`NEVA // PLAYTEST NOTES · ${notes.length} ENTR${notes.length === 1 ? 'Y' : 'IES'}`, ''];
  for (const n of notes) {
    const t = new Date(n.createdAt).toISOString().replace('T', ' ').slice(0, 19);
    lines.push(`[${t}] M${String(n.missionId).padStart(2, '0')} ${n.missionName} · ${n.category}`);
    lines.push(`  OBJ: ${n.objective}`);
    lines.push(`  DEPTH ${n.depth} · ${n.sector} · TRACE ${n.trace}%`);
    if (n.selectedNodeId) lines.push(`  NODE: ${n.selectedNodeId} (${n.selectedNodeType})`);
    lines.push(`  RES: ${n.resources}`);
    lines.push(`  CHECKPOINT: ${n.checkpoint}`);
    if (n.message) lines.push(`  > ${n.message}`);
    lines.push('');
  }
  return lines.join('\n');
}

/** Copy the summary to the clipboard. Resolves to whether it succeeded. */
export async function copyNotesSummary(notes: PlaytestNote[]): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(notesSummaryText(notes));
    return true;
  } catch {
    return false;
  }
}
