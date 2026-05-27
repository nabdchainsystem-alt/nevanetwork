import type { NevaMode, NevaResponse } from '../nevaCore';

/**
 * NEVA Core Assistant v1 — compact in-game tactical-hint panel (advisory only). Shows the latest
 * hint + a small row of mode buttons to re-ask in a different lens. Not a chat app; no input field
 * (v1). Pure presentational — all state + the fetch live in GameApp.
 */
const MODES: { mode: NevaMode; label: string }[] = [
  { mode: 'MISSION_HINT', label: 'MISSION' },
  { mode: 'NODE_EXPLAIN', label: 'NODE' },
  { mode: 'RISK_WARNING', label: 'RISK' },
  { mode: 'RESOURCE_HELP', label: 'RES' },
  { mode: 'UPGRADE_HELP', label: 'GRID' },
  { mode: 'LORE_LINE', label: 'LORE' },
];

export default function NevaCorePanel({
  loading,
  response,
  mode,
  closing = false,
  onMode,
  onClose,
}: {
  loading: boolean;
  response: NevaResponse | null;
  mode: NevaMode;
  closing?: boolean; // playing the retract animation before unmount
  onMode: (mode: NevaMode) => void;
  onClose: () => void;
}) {
  return (
    <div className={`neva${closing ? ' is-closing' : ''}`} role="dialog" aria-label="NEVA Core assistant">
      {/* AR corner brackets — assemble from centre out on open, combine back on close (like the
          terminal / upgrade / subnetwork panels) */}
      <span className="neva__corner neva__corner--tl" />
      <span className="neva__corner neva__corner--tr" />
      <span className="neva__corner neva__corner--br" />
      <span className="neva__corner neva__corner--bl" />
      <div className="neva__head">
        <div className="neva__title">
          <span className="neva__mark" aria-hidden />
          <div>
            <div className="neva__name">NEVA CORE</div>
            <div className="neva__sub">TACTICAL ASSISTANT{response?.offline ? ' · OFFLINE' : ''}</div>
          </div>
        </div>
        <button className="neva__x" type="button" onClick={onClose} title="Close [N]">✕</button>
      </div>

      <div className="neva__body">
        {loading ? (
          <div className="neva__thinking">NEVA CORE // THINKING<span className="neva__dots" aria-hidden>…</span></div>
        ) : response ? (
          <p className={`neva__text${response.easterEgg ? ' neva__text--egg' : ''}`}>{response.text}</p>
        ) : (
          <p className="neva__text neva__text--idle">Awaiting query. Pick a lens below.</p>
        )}
      </div>

      <div className="neva__modes">
        {MODES.map((m) => (
          <button
            key={m.mode}
            type="button"
            className={`neva__mode${mode === m.mode ? ' is-active' : ''}`}
            onClick={() => onMode(m.mode)}
            disabled={loading}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="neva__foot">Advisory only · NEVA Core does not change the game.</div>
    </div>
  );
}
