import { useMemo, useState } from 'react';
import type { GameState } from '../game';
import {
  NOTE_CATEGORIES,
  QUICK_NOTES,
  capturePlaytestContext,
  copyNotesSummary,
  exportNotes,
  type PlaytestCategory,
  type PlaytestNote,
} from '../playtest';

/**
 * NEVA // PLAYTEST NOTES — a compact, docked QA logger for the manual Mission 00 → 20
 * playthrough (toggled with P). Non-modal: it never captures the keyboard or blocks play.
 * Purely presentational — the notes array + persistence live in GameApp; this component only
 * snapshots the live context for display and calls back to add / clear / export.
 */
export default function PlaytestNotesPanel({
  game,
  selected,
  checkpointLabel,
  notes,
  onAddNote,
  onClear,
  onClose,
}: {
  game: GameState;
  selected: number | null;
  checkpointLabel: string;
  notes: PlaytestNote[];
  onAddNote: (category: PlaytestCategory, message: string) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const [category, setCategory] = useState<PlaytestCategory>('OTHER');
  const [draft, setDraft] = useState('');
  const [copied, setCopied] = useState(false);

  // live context for the readout (recomputed on every render — GameApp re-renders on state change)
  const ctx = useMemo(() => capturePlaytestContext(game, selected, checkpointLabel), [game, selected, checkpointLabel]);

  const addManual = () => {
    onAddNote(category, draft);
    setDraft('');
  };
  const doCopy = async () => {
    const ok = await copyNotesSummary(notes);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    }
  };

  return (
    <div className="pt" role="dialog" aria-label="Playtest notes QA logger">
      <div className="pt__head">
        <div>
          <div className="pt__name">NEVA // PLAYTEST NOTES</div>
          <div className="pt__sub">MISSION 00 → 20 · QA LOGGER · LOCAL ONLY</div>
        </div>
        <button className="pt__x" type="button" onClick={onClose} title="Close [P]">✕</button>
      </div>

      {/* live game context — auto-attached to every note */}
      <div className="pt__ctx">
        <div className="pt__row"><span>MISSION</span><b>M{String(ctx.missionId).padStart(2, '0')} · {ctx.missionName}</b></div>
        <div className="pt__row"><span>OBJECTIVE</span><b>{ctx.objective}</b></div>
        <div className="pt__row"><span>SECTOR / DEPTH</span><b>{ctx.sector} · D{String(ctx.depth).padStart(2, '0')}</b></div>
        <div className="pt__row"><span>TRACE</span><b>{ctx.trace}%</b></div>
        <div className="pt__row"><span>NODE</span><b>{ctx.selectedNodeId ? `${ctx.selectedNodeId} · ${ctx.selectedNodeType}` : '—'}</b></div>
        <div className="pt__row"><span>RESOURCES</span><b>{ctx.resources}</b></div>
        <div className="pt__row"><span>CHECKPOINT</span><b>{ctx.checkpoint}</b></div>
      </div>

      {/* one-click quick notes */}
      <div className="pt__quick">
        {QUICK_NOTES.map((q) => (
          <button key={q.label} type="button" className="pt__qbtn" onClick={() => onAddNote(q.category, '')}>
            {q.label}
          </button>
        ))}
      </div>

      {/* manual note: category + text */}
      <div className="pt__add">
        <select
          className="pt__select"
          value={category}
          onChange={(e) => setCategory(e.target.value as PlaytestCategory)}
          aria-label="Note category"
        >
          {NOTE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          className="pt__input"
          type="text"
          value={draft}
          placeholder="Write quick note…"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addManual(); }}
        />
        <button type="button" className="pt__qbtn pt__qbtn--go" onClick={addManual}>ADD NOTE</button>
      </div>

      {/* recorded notes (newest first) */}
      <div className="pt__list">
        {notes.length === 0 ? (
          <div className="pt__empty">No notes yet. Use a quick button or ADD NOTE.</div>
        ) : (
          notes.map((n) => (
            <div key={n.id} className="pt__note">
              <div className="pt__note-top">
                <span className="pt__cat">{n.category}</span>
                <span className="pt__time">{new Date(n.createdAt).toLocaleTimeString()}</span>
              </div>
              <div className="pt__note-ctx">M{String(n.missionId).padStart(2, '0')} {n.missionName} · D{String(n.depth).padStart(2, '0')} · TRACE {n.trace}%{n.selectedNodeId ? ` · ${n.selectedNodeId}` : ''}</div>
              {n.message && <div className="pt__note-msg">{n.message}</div>}
            </div>
          ))
        )}
      </div>

      {/* actions */}
      <div className="pt__foot">
        <span className="pt__count">{notes.length} NOTE{notes.length === 1 ? '' : 'S'}</span>
        <div className="pt__actions">
          <button type="button" className="pt__qbtn" onClick={() => exportNotes(notes)} disabled={notes.length === 0}>EXPORT NOTES</button>
          <button type="button" className="pt__qbtn" onClick={doCopy} disabled={notes.length === 0}>{copied ? 'COPIED ✓' : 'COPY SUMMARY'}</button>
          <button type="button" className="pt__qbtn pt__qbtn--danger" onClick={onClear} disabled={notes.length === 0}>CLEAR NOTES</button>
        </div>
      </div>
      <div className="pt__note-foot">Local dev tool · does not change the game · stored in {`'neva_playtest_notes_v1'`}</div>
    </div>
  );
}
