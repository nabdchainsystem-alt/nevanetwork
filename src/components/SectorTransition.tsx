import { useEffect, useRef, useState } from 'react';
import './sectorTransition.css';

/**
 * Sector A01 → A02 cinematic transition (visual only — no gameplay/state changes; GameApp owns the
 * actual sector switch). A full blackout, then a small glowing boot panel, then a typed narrative,
 * then it fades out so the rebuilt HUD + the forming A02 grid are revealed behind it.
 *
 *   onEnter — called when the narrative finishes: GameApp switches to Sector A02 so the new grid
 *             mounts + begins its reveal BEHIND this (still-black) overlay.
 *   onDone  — called after the fade-out: unmount the overlay so the reveal is fully visible.
 *
 * Enter / Space gracefully fast-forwards (never an ugly cut).
 */
const SCRIPT: string[] = [
  'SECTOR A01 // MEMORY GRID',
  'STATUS: SECURED',
  '',
  'TRACE ROUTES COLLAPSED.',
  'SURFACE NODES STABILIZED.',
  'PRIVATE GRID SIGNAL CONFIRMED.',
  'ALPHA CORE RESPONSE DETECTED.',
  '',
  'A01 WAS ONLY THE OUTER MEMORY LAYER.',
  '',
  'DEEP NETWORK ACCESS IS OPENING.',
  'UNKNOWN ROUTES ARE REBUILDING.',
  'SIGNAL DENSITY RISING.',
  'CORRUPTION PRESSURE UNMAPPED.',
  '',
  'OPERATOR PROFILE SYNCED.',
  'PRIVATE GRID ANCHOR PRESERVED.',
  'MODULE EFFECTS TRANSFERRED.',
  'CORE FRAGMENT CHANNEL STANDBY.',
  '',
  'PREPARE FOR SECTOR A02.',
  'THE NETWORK WILL NOT GUIDE YOU HERE.',
  '',
  'SECTOR A02 // DEEP GRID',
  'BOOTING SPATIAL FIELD...',
];

const CHAR_MS = 22;
const LINE_PAUSE = 320;
const GAP_PAUSE = 680;
const BLACK_MS = 1000;

export default function SectorTransition({ onEnter, onDone }: { onEnter: () => void; onDone: () => void }) {
  const [booted, setBooted] = useState(false);
  const [committed, setCommitted] = useState<string[]>([]);
  const [typing, setTyping] = useState('');
  const [fading, setFading] = useState(false);
  const fast = useRef(false);
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    const tos: number[] = [];
    const wait = (ms: number) =>
      new Promise<void>((res) => { tos.push(window.setTimeout(res, fast.current ? Math.min(ms, 24) : ms)); });

    (async () => {
      await wait(BLACK_MS);
      if (cancelled.current) return;
      setBooted(true);
      await wait(420);
      for (const line of SCRIPT) {
        if (cancelled.current) return;
        if (line === '') { await wait(GAP_PAUSE); continue; }
        if (fast.current) {
          setTyping(line);
          await wait(14);
        } else {
          for (let ci = 1; ci <= line.length; ci++) {
            if (cancelled.current) return;
            if (fast.current) {
              setTyping(line);
              break;
            }
            setTyping(line.slice(0, ci));
            await wait(CHAR_MS);
          }
        }
        if (cancelled.current) return;
        setCommitted((c) => [...c, line]);
        setTyping('');
        await wait(LINE_PAUSE);
      }
      if (cancelled.current) return;
      await wait(700);
      onEnter(); // switch to A02 → the new grid mounts + starts revealing behind the (black) overlay
      if (cancelled.current) return;
      setFading(true);
      await wait(1150);
      if (cancelled.current) return;
      onDone(); // unmount the overlay → the rebuilt HUD + forming A02 grid are revealed
    })();

    return () => {
      cancelled.current = true;
      tos.forEach((id) => clearTimeout(id));
    };
  }, [onEnter, onDone]);

  // Enter / Space → graceful fast-forward
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space') {
        e.preventDefault();
        e.stopImmediatePropagation();
        fast.current = true;
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, []);

  return (
    <div className={`sx${fading ? ' sx--fading' : ''}`} aria-hidden>
      {booted && (
        <div className="sx__boot">
          <span className="sx__corner sx__corner--tl" />
          <span className="sx__corner sx__corner--br" />
          <div className="sx__scan" />
          <div className="sx__lines">
            {committed.map((l, i) => (
              <div className="sx__line" key={`${i}-${l}`}>{l}</div>
            ))}
            <div className="sx__line sx__line--active">
              {typing}
              <span className="sx__cursor" />
            </div>
          </div>
          <div className="sx__hint">ENTER · SKIP</div>
        </div>
      )}
    </div>
  );
}
