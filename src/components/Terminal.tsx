import { useEffect, useRef, useState } from 'react';
import { parseCommand, type TerminalEffect } from '../terminal';

const BOOT = ['NEVA TERMINAL v1.0', "TYPE 'HELP' FOR COMMANDS", 'SPACE (EMPTY) OR ESC TO CLOSE'];

const CHAR_MS = 22; // typewriter tick
const LINE_TICKS = 10; // ticks to fully type one line — length-independent pacing (~0.22s / line)
const START_DELAY = 520; // let the panel surface fade in before the boot text types

/**
 * The techy command console (opened with Space). A compact, translucent AR surface with a
 * scrollback log and a `neva>` prompt. Command parsing is pure (`terminal.ts`); game/world
 * effects (route to a node, toggle scan) are delegated to `runEffect`, which returns extra
 * result lines to print. `clear` / `close` are handled locally.
 *
 * Output TYPES IN like a real terminal: a reveal "frontier" walks the log line-by-line,
 * character-by-character. Echo lines (`neva> …`) appear instantly; issuing a new command
 * flushes anything still typing. Honors prefers-reduced-motion (everything shown at once).
 */
export default function Terminal({
  onClose,
  runEffect,
  closing = false,
  traceTier = 'ok',
  pinned = false,
  onTogglePin,
}: {
  onClose: () => void;
  runEffect: (e: TerminalEffect) => string[];
  closing?: boolean; // host is playing the retract animation → unmount is imminent
  traceTier?: 'ok' | 'warn' | 'crit'; // live trace tier → surface colour follows the trace meter
  pinned?: boolean; // docked to the right edge (stays open while you keep playing)
  onTogglePin?: () => void;
}) {
  const [lines, setLines] = useState<string[]>(BOOT);
  const [frontier, setFrontier] = useState({ line: 0, ch: 0 }); // reveal cursor: line index + chars shown
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef(lines);
  const [reduced] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    linesRef.current = lines; // mirror for the typewriter interval (read at tick time, not render)
  }, [lines]);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  // keep the latest line pinned in view as it types
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines, frontier]);

  // typewriter engine — advance the reveal frontier toward the end of the log. Starts after the
  // surface has faded in; idle ticks return the same frontier so React skips the re-render.
  useEffect(() => {
    if (reduced) return;
    let interval: number | undefined;
    const startId = window.setTimeout(() => {
      interval = window.setInterval(() => {
        setFrontier((f) => {
          const L = linesRef.current;
          if (f.line >= L.length) return f; // caught up — no-op
          const cur = L[f.line] ?? '';
          // echo (`neva> …`) and blank lines appear instantly; everything else types out
          if (cur.startsWith('neva>') || cur.length === 0) return { line: f.line + 1, ch: 0 };
          const chunk = Math.max(1, Math.ceil(cur.length / LINE_TICKS));
          const ch = f.ch + chunk;
          return ch >= cur.length ? { line: f.line + 1, ch: 0 } : { line: f.line, ch };
        });
      }, CHAR_MS);
    }, START_DELAY);
    return () => {
      window.clearTimeout(startId);
      if (interval) window.clearInterval(interval);
    };
  }, [reduced]);

  const submit = () => {
    const trimmed = input.trim();
    setInput('');
    if (!trimmed) return;
    const { lines: out, effect } = parseCommand(trimmed);
    if (effect?.kind === 'clear') {
      setLines([]);
      setFrontier({ line: 0, ch: 0 });
      return;
    }
    if (effect?.kind === 'close') {
      onClose();
      return;
    }
    // clear/close handled above; every remaining effect (goto / scan / finishMission) is a
    // world/game action carried out by the host and may return extra result lines to print
    const extra = effect ? runEffect(effect) : [];
    const start = linesRef.current.length; // flush anything still typing, then resume at the echo
    setLines((l) => [...l, `neva> ${trimmed}`, ...out, ...extra]);
    setFrontier({ line: start, ch: 0 });
  };

  const f = frontier;
  return (
    <div
      className={`term${closing ? ' term--closing' : ''}${pinned ? ' term--pinned' : ''}${traceTier !== 'ok' ? ` term--trace-${traceTier}` : ''}`}
      onClick={() => inputRef.current?.focus()}
    >
      {/* open: the 4 corner brackets appear together at center, then fly out to their
          places while the inside fades in. close: they combine back to center + vanish. */}
      <span className="term__corner term__corner--tl" />
      <span className="term__corner term__corner--tr" />
      <span className="term__corner term__corner--br" />
      <span className="term__corner term__corner--bl" />

      <div className="term__inner">
        <div className="term__bar">
          <span className="term__title">NEVA // TERMINAL</span>
          <span className="term__bar-actions">
            {onTogglePin && (
              <button
                className={`term__pin${pinned ? ' is-pinned' : ''}`}
                onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
                type="button"
                title={pinned ? 'Unpin — return to centre' : 'Pin — dock to the right'}
              >
                {pinned ? '⇤ UNPIN' : 'PIN ⇥'}
              </button>
            )}
            <button className="term__x" onClick={onClose} type="button">✕ CLOSE</button>
          </span>
        </div>
        <div className="term__body" ref={bodyRef}>
          {lines.map((line, i) => {
            if (!reduced && i > f.line) return null; // not revealed yet
            const isEcho = line.startsWith('neva>');
            const full = reduced || i < f.line || isEcho; // echo + past lines show in full
            const text = full ? line : line.slice(0, f.ch);
            const typing = !full && i === f.line;
            return (
              <div
                className={`term__line${isEcho ? ' is-echo' : line.startsWith('▸') ? ' is-out' : ''}`}
                key={i}
              >
                {text}
                {typing && <span className="term__caret">▌</span>}
              </div>
            );
          })}
        </div>
        <div className="term__prompt">
          <span className="term__ps">neva&gt;</span>
          <input
            ref={inputRef}
            className="term__input"
            value={input}
            spellCheck={false}
            autoComplete="off"
            aria-label="terminal command"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              // keep keystrokes in the field — never let them reach the camera/game handlers
              e.stopPropagation();
              if (e.code === 'Enter' || e.code === 'NumpadEnter') submit();
              else if (e.code === 'Escape') onClose();
              // Space on an EMPTY prompt closes the terminal — a reliable keyboard exit since
              // Esc is swallowed by the browser to leave fullscreen. (Mid-command, Space types
              // a normal space, so "go to archive" is unaffected.)
              else if (e.code === 'Space' && input.trim() === '') {
                e.preventDefault();
                onClose();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
