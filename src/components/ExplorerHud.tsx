import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  IconActivity,
  IconDatabase,
  IconBrain,
  IconKey,
  IconAntennaBars5,
  IconHexagon,
  IconShieldCheck,
  IconLayersIntersect,
  IconShieldOff,
  IconTopologyStar,
  IconCamera,
  IconHome2,
} from '@tabler/icons-react';
import HudIcon from './HudIcon';
import { HUD_TONE, type TablerIconComp } from './hudTokens';
import { telemetry } from '../telemetry';
import { CORE_NODE_INDEX, MODULE_DEFS, threatState, corruptionRisk, type GameState } from '../game';
import { getMissionHudState } from '../missions';
import { resolveObjectiveTarget, gridTip } from '../objectives';

const START = Date.now();
const pad = (n: number) => String(n).padStart(2, '0');
const sgn = (n: number, w = 6) =>
  (n >= 0 ? '+' : '-') + Math.abs(n).toFixed(1).padStart(w, '0');
// grid-sector hex from a coordinate (changes as you move — built for a huge net)
const sec = (n: number) =>
  ((Math.floor(n / 8) & 0xff) >>> 0).toString(16).toUpperCase().padStart(2, '0');


// comb / barcode tick heights — deterministic, taller & denser near the edges
const COMB_TOP_N = 110;
const COMB_TOP = Array.from({ length: COMB_TOP_N }, (_, i) => {
  const edge = Math.min(i, COMB_TOP_N - 1 - i);
  return 3 + (edge < 7 ? 5 : 0) + (i % 4 === 0 ? 3 : 0) + Math.round((Math.sin(i * 1.3) * 0.5 + 0.5) * 3);
});
const COMB_BOT = Array.from({ length: 76 }, (_, i) =>
  2 + (i % 6 === 0 ? 3 : 0) + Math.round((Math.sin(i * 2.1) * 0.5 + 0.5) * 2),
);

// boot type-in cadence: a per-line base delay + a per-word step within each line
const LINE_STEP = 0.07;
const WORD_STEP = 0.045;

/**
 * Renders a string word-by-word: each word is an inline-block `.tw` span that fades/slides
 * in on `base + i*WORD_STEP` seconds, so a line "types" in left → right (see styles.css).
 */
function Words({ text, base }: { text: string; base: number }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={i}>
          {/* real space text node BETWEEN words so spacing survives inline-block + still wraps */}
          {i > 0 ? ' ' : null}
          <span className="tw" style={{ animationDelay: `${(base + i * WORD_STEP).toFixed(3)}s` }}>{w}</span>
        </Fragment>
      ))}
    </>
  );
}

/**
 * One left-HUD readout row: `[glyph] LABEL ……… VALUE`. The glyph and an optional
 * value colour carry muted functional state (see HUD_TONE); purely presentational,
 * no game logic. On mount it types in (glyph → label words → value) from `base`.
 */
function Stat({
  icon,
  label,
  value,
  iconTone,
  valueTone,
  className,
  valueClassName,
  base = 0,
}: {
  icon: TablerIconComp;
  label: string;
  value: ReactNode;
  iconTone?: string;
  valueTone?: string;
  className?: string;
  valueClassName?: string;
  base?: number;
}) {
  const vDelay = base + label.split(' ').length * WORD_STEP;
  return (
    <div className={`hud__stat${className ? ` ${className}` : ''}`}>
      <span className="hud__stat-k">
        <span className="tw" style={{ animationDelay: `${base.toFixed(3)}s` }}>
          <HudIcon icon={icon} color={iconTone} />
        </span>
        <Words text={label} base={base} />
      </span>
      <b
        className={`tw--v${valueClassName ? ` ${valueClassName}` : ''}`}
        style={{ animationDelay: `${vDelay.toFixed(3)}s`, ...(valueTone ? { color: valueTone } : {}) }}
      >
        {value}
      </b>
    </div>
  );
}

function HudSection({
  title,
  right,
  className,
  children,
}: {
  title: string;
  right?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`hud__section${className ? ` ${className}` : ''}`}>
      <div className="hud__section-h">
        <span>{title}</span>
        {right != null && <span className="hud__section-r">{right}</span>}
      </div>
      <div className="hud__section-b">{children}</div>
    </section>
  );
}

interface Props {
  selected: number | null;
  locked: boolean;
  game: GameState;
  devNotice: string | null;
  settingsOpen: boolean;
  onOpenSettings: () => void;
  onRetryCheckpoint: () => void; // failure overlay: RETRY FROM CHECKPOINT
  onResetSession: () => void; // failure overlay: RESET SESSION (full)
  onFocusObjective: () => void; // FOCUS OBJECTIVE fallback — recenters on the current mission target
}

/**
 * NEVA NETWORK explorer + interface-game HUD: a compact session/trace readout,
 * the space-time comb timeline, and trace warning / compromise overlays.
 */
export default function ExplorerHud({
  selected,
  locked,
  game,
  devNotice,
  settingsOpen,
  onOpenSettings,
  onRetryCheckpoint,
  onResetSession,
  onFocusObjective,
}: Props) {
  const [now, setNow] = useState(START);
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 120);
    return () => window.clearInterval(id);
  }, []);

  const focus = selected != null;
  const d = new Date(now);
  const clock = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

  const tr = Math.round(game.traceLevel);
  // TRACE tone: monochrome until it's worth flagging — muted amber at warning, red at critical.
  const traceTone = tr >= 90 ? HUD_TONE.red : tr >= 70 ? HUD_TONE.amber : undefined;
  // network THREAT tier — a clearer reading of the trace meter (STABLE → WATCHED → TRACED → CRITICAL)
  const threat = threatState(tr);
  const threatTone = threat === 'CRITICAL' ? HUD_TONE.red
    : threat === 'TRACED' || threat === 'WATCHED' ? HUD_TONE.amber
      : threat === 'STABLE' ? HUD_TONE.green : undefined;
  // network CORRUPTION risk — share of corrupted links still unstabilized (Signal-War onward)
  const corruption = corruptionRisk(game);

  // mission identity (signal-war mechanics — pulses / corruption / watchers — stay on from M03+)
  const m3 = game.missionId >= 3;
  // Mission 00 onboarding: keep the HUD simple — the guided bar carries the objective, so hide
  // the THREAT readout and the full mission/tasks chain until the intro completes.
  const intro = !game.mission00.complete;
  // mission HUD view-model — objective line + checklist derived centrally (see missions.ts)
  const hud = getMissionHudState(game, selected);
  const missionName = hud.name;
  // reusable objective guidance — the status-aware "what to do now" hint + FOCUS OBJECTIVE button
  // (only for missions with a single resolvable target; aggregate missions resolve to null).
  const objective2 = resolveObjectiveTarget(game, selected);
  const showObjGuide = !game.locked && objective2 != null && objective2.status !== 'completed';
  // Phase 6 — a context-relevant Private Grid suggestion (advisory, no mechanic change).
  const tip = intro ? null : gridTip(game);

  // CORE secured flag — drives the "CORE SECURED" feedback effect below. The live objective line
  // and the task checklist now come from the central view-model (see missions.ts).
  const coreSt = game.statuses[CORE_NODE_INDEX];
  const coreSecured = !!(coreSt?.extracted || coreSt?.unlocked || coreSt?.traced || coreSt?.isolated);

  const objective = hud.objective;
  const tasks = hud.tasks;
  // once the mission is complete (incl. the dev "finish mission" command, which latches it
  // without grinding the counters) every required task reads done — the soft `warn` tasks
  // (e.g. AVOID DECOY EXPORTS) stay truthful so a real mistake still shows.
  const shownTasks = game.missionComplete ? tasks.map((t) => (t.warn ? t : { ...t, done: true })) : tasks;
  const tasksDone = shownTasks.filter((t) => t.done).length;
  const missionState = game.missionComplete ? 'COMPLETE' : 'ACTIVE';

  // THREAT tier-rise feedback — a brief "RISK RISING · <TIER>" flash when the network gets hotter
  const THREAT_RANK = { STABLE: 0, WATCHED: 1, TRACED: 2, CRITICAL: 3 } as const;
  const [riskFx, setRiskFx] = useState<string | null>(null);
  const lastThreatRank = useRef(THREAT_RANK[threat]);
  useEffect(() => {
    const rank = THREAT_RANK[threat];
    if (rank > lastThreatRank.current && !game.locked) {
      setRiskFx(threat === 'CRITICAL' ? 'RISK CRITICAL · REDUCE TRACE' : `RISK RISING · ${threat}`);
      const id = window.setTimeout(() => setRiskFx(null), 2200);
      lastThreatRank.current = rank;
      return () => window.clearTimeout(id);
    }
    lastThreatRank.current = rank;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threat, game.locked]);

  // one-time flash when the CORE node is secured (Mission 07 milestone)
  const [coreFx, setCoreFx] = useState(false);
  const lastCore = useRef(coreSecured);
  useEffect(() => {
    if (coreSecured && !lastCore.current) {
      setCoreFx(true);
      const id = window.setTimeout(() => setCoreFx(false), 2600);
      lastCore.current = coreSecured;
      return () => window.clearTimeout(id);
    }
    lastCore.current = coreSecured;
  }, [coreSecured]);

  // cinematic depth-transition flash when currentDepth increases
  const [depthFlash, setDepthFlash] = useState<number | null>(null);
  const lastDepth = useRef(game.currentDepth);
  useEffect(() => {
    if (game.currentDepth > lastDepth.current) {
      setDepthFlash(game.currentDepth);
      lastDepth.current = game.currentDepth;
      const id = window.setTimeout(() => setDepthFlash(null), 2600);
      return () => window.clearTimeout(id);
    }
    lastDepth.current = game.currentDepth;
  }, [game.currentDepth]);
  const pulse = depthFlash != null;

  // Mission 03: a short HUD message on each signal-pulse edge (DETECTED on start, STABILIZED
  // on end) — distinct from the persistent "SIGNAL PULSE ACTIVE" warning while one is live.
  const [pulseFx, setPulseFx] = useState<string | null>(null);
  const lastPulse = useRef(game.pulseActive);
  useEffect(() => {
    if (game.pulseActive !== lastPulse.current && !game.locked) {
      setPulseFx(game.pulseActive ? 'SIGNAL PULSE DETECTED' : 'SIGNAL STABILIZED');
      lastPulse.current = game.pulseActive;
      const id = window.setTimeout(() => setPulseFx(null), 1900);
      return () => window.clearTimeout(id);
    }
    lastPulse.current = game.pulseActive;
  }, [game.pulseActive, game.locked]);

  // trace-change readout: flash "TRACE ±N" once per action (the reducer bumps traceDeltaId
  // only on a deliberate action, never on idle decay — so this never spams every frame).
  const [traceFx, setTraceFx] = useState<{ id: number; delta: number; shielded: boolean } | null>(null);
  const lastDeltaId = useRef(game.traceDeltaId);
  useEffect(() => {
    if (game.traceDeltaId !== lastDeltaId.current && game.traceDelta !== 0) {
      setTraceFx({ id: game.traceDeltaId, delta: game.traceDelta, shielded: game.traceShielded });
      lastDeltaId.current = game.traceDeltaId;
      const id = window.setTimeout(
        () => setTraceFx((f) => (f && f.id === game.traceDeltaId ? null : f)),
        1400,
      );
      return () => window.clearTimeout(id);
    }
    lastDeltaId.current = game.traceDeltaId;
  }, [game.traceDeltaId, game.traceDelta, game.traceShielded]);
  const traceUp = traceFx ? traceFx.delta > 0 : false;
  const traceSpike = traceFx ? traceFx.delta >= 12 : false; // decoy / pulse-amplified hits
  // TRACE SHIELD badge — appended when the module softened a trace gain (player feels it work)
  const shieldTag = traceFx && traceFx.shielded && traceUp ? ' · SHIELD' : '';
  const traceFxText = traceFx
    ? traceSpike
      ? `TRACE SPIKE +${Math.round(traceFx.delta)}${shieldTag}`
      : `TRACE ${traceUp ? '+' : '-'}${Math.abs(Math.round(traceFx.delta))}${shieldTag}`
    : '';

  // resource-gain feedback: a small "+N DATA · +1 MEM …" line, flashed once per gain
  const [gainFx, setGainFx] = useState<{ id: number; text: string } | null>(null);
  const lastGainId = useRef(game.gainId);
  useEffect(() => {
    if (game.gainId !== lastGainId.current && game.lastGain) {
      const g = game.lastGain;
      const sgn = (v: number, label: string) => (v ? `${v > 0 ? '+' : ''}${v} ${label}` : null);
      const text = [
        sgn(g.data, 'DATA'),
        sgn(g.shards, 'MEM'),
        sgn(g.keys, 'KEY'),
        sgn(g.signal, 'SIGNAL'),
        sgn(g.core, 'CORE'),
      ]
        .filter(Boolean)
        .join(' · ');
      setGainFx({ id: game.gainId, text });
      lastGainId.current = game.gainId;
      const id = window.setTimeout(
        () => setGainFx((f) => (f && f.id === game.gainId ? null : f)),
        1800,
      );
      return () => window.clearTimeout(id);
    }
    lastGainId.current = game.gainId;
  }, [game.gainId, game.lastGain]);

  // fullscreen toggle (real click = the user gesture the Fullscreen API needs)
  const [isFs, setIsFs] = useState(false);
  useEffect(() => {
    const onFs = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);
  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.();
  };

  // ---- top status bar: system health/data + the section you're currently in ----
  const ts = now / 1000;
  // Phase 4 — the SECTOR now reflects the arc: Memory Grid (A01, missions 00–07) → Deep Network
  // (A02, missions 08–20). Drives the top-bar label + the `data-sector` visual-identity class.
  const sectorId = game.missionId >= 8 ? 'A02' : 'A01';
  const sectorName = game.missionId >= 8 ? 'DEEP NETWORK' : 'MEMORY GRID';
  const grid = `${sec(telemetry.x)}-${sec(telemetry.y)}-${sec(telemetry.z)}`;
  const integrity = Math.max(0, 100 - tr);
  const integHue = integrity > 66 ? 'ok' : integrity > 33 ? 'warn' : 'crit';
  const uplink = 93 + Math.round((Math.sin(ts * 1.3) * 0.5 + 0.5) * 6);
  const coreTemp = 36 + Math.round((Math.sin(ts * 0.7) * 0.5 + 0.5) * 6 + tr * 0.08);
  const memory = Math.min(99, 24 + (game.extractedData % 60) + Math.round(Math.sin(ts * 0.9) * 2));
  const latency = 8 + Math.round(Math.abs(Math.sin(ts * 2.1)) * 9 + telemetry.speed * 0.015);
  const dataRate = Math.max(0, telemetry.speed * 1.1 + 6 + Math.sin(ts * 3) * 3);

  const mods = game.playerSubnetwork.modules;
  const activeModules = MODULE_DEFS.filter((d) => mods[d.id] > 0);
  const moduleEffect = (id: string, l: number) =>
    id === 'SHIELD' ? `TRACE SHIELD -${l * 4}%`
      : id === 'VAULT' ? `DATA VAULT +${l * 8}%`
        : id === 'CACHE' ? `KEY CACHE +${l * 6}%`
          : `SIGNAL RELAY -${l * 4}%`;

  // word-by-word boot cascade: each line claims the next base delay (visual order).
  // two independent clocks so the stats panel + mission panel type in together, not in series.
  let _s = 0;
  const atS = () => 0.12 + _s++ * LINE_STEP; // small lead-in so the TRACE row visibly types in
  let _m = 0;
  const atM = () => 0.2 + _m++ * LINE_STEP;

  return (
    <div className={`hud${intro ? ' is-intro' : ''}`} data-sector={sectorId}>
      <div className="hud__noise" />
      <div className="hud__scanlines" />
      <div className="hud__vignette" />

      {/* ============ TOP STATUS BAR: location (with sector icon) + system ===== */}
      <div className="hud__topbar">
        <div className="hud__topbar-left">
          <span className="hud__sector-ico" aria-hidden>
            <svg viewBox="0 0 24 24" width="22" height="22">
              <polygon
                points="12,2 21,7 21,17 12,22 3,17 3,7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <circle cx="12" cy="12" r="2.4" fill="currentColor" />
              <path d="M12 2 V6 M12 18 V22 M3 7 L6.5 9 M21 7 L17.5 9 M3 17 L6.5 15 M21 17 L17.5 15"
                stroke="currentColor" strokeWidth="1" opacity="0.6" />
            </svg>
          </span>
          <div className="hud__loc">
            <span className="hud__loc-name">SECTOR {sectorId}</span>
            <span className="hud__loc-grid">
              {sectorName} · GRID {grid}
            </span>
          </div>
          <span className="hud__led hud__led--ok" title="UPLINK ONLINE" />
        </div>

        <div className="hud__topbar-right">
          {m3 && (
            <span className={`hud__chip hud__chip--signal${game.pulseActive ? ' is-pulse' : ''}`}>
              <span className="hud__chip-k">SIGNAL</span>
              <b>{game.pulseActive ? 'PULSE' : 'CALM'}</b>
            </span>
          )}
          {m3 && game.pulseActive && (
            <span className="hud__chip hud__chip--pressure">
              <span className="hud__chip-k">PRESSURE</span>
              <b>HIGH</b>
            </span>
          )}
          <div className="hud__chip hud__chip--bar">
            <span className="hud__chip-k">INTEGRITY</span>
            <span className="hud__chip-track">
              <span className={`hud__chip-fill is-${integHue}`} style={{ width: `${integrity}%` }} />
            </span>
            <b>{pad(integrity)}%</b>
          </div>
          <span className="hud__chip"><span className="hud__chip-k">UPLINK</span><b>{uplink}%</b></span>
          <span className="hud__chip"><span className="hud__chip-k">CORE</span><b>{coreTemp}°C</b></span>
          <span className="hud__chip"><span className="hud__chip-k">MEM</span><b>{memory}%</b></span>
          <span className="hud__chip"><span className="hud__chip-k">LAT</span><b>{latency}MS</b></span>
          <span className="hud__chip hud__chip--data"><span className="hud__chip-k">DATA</span><b>{dataRate.toFixed(1)} KB/S</b></span>
        </div>
      </div>

      {/* top-center brand: space-font wordmark, glowing light line, action bar */}
      <header className={`hud__brand${pulse ? ' is-pulse' : ''}${game.pulseActive ? ' is-pulse-hide' : ''}`}>
        <h1 className="hud__brand-title">NEVA NETWORK</h1>
        <div className="hud__brand-sub">BREACH THE MEMORY GRID</div>
        <div className="hud__brand-micro">TRACE • EXTRACT • ASCEND</div>
        <div className="hud__brand-line" />
        <nav className="hud__actions">
          {/* Only the two global controls stay in the top row. Per-node actions
              (OPEN/TRACE/ISOLATE/EXTRACT) live in the Node Inspection panel; SOUND,
              RESET VIEW and UPGRADES moved to compact hint lines in the left HUD column. */}
          <button
            className={`hud__act${settingsOpen ? ' is-active' : ''}`}
            title=", · INTERFACE SETTINGS"
            onClick={onOpenSettings}
          >
            SETTINGS <kbd>,</kbd>
          </button>
          <button className="hud__act hud__act--fs" onClick={toggleFullscreen}>
            <span className="hud__act-i">⛶</span> {isFs ? 'WINDOWED' : 'FULLSCREEN'}
          </button>
        </nav>
      </header>

      {/* trace edge flicker (>=70%) */}
      {tr >= 70 && !game.locked && <div className="hud__trace-edge" />}

      {locked && !focus && (
        <div className="hud__reticle">
          <div className="hud__reticle-ring" />
          <div className="hud__reticle-tick hud__reticle-tick--t" />
          <div className="hud__reticle-tick hud__reticle-tick--b" />
        </div>
      )}

      {/* compact session / trace readout */}
      <div className="hud__stats">
        <HudSection title="SYSTEM STATUS" className="hud__section--system">
          {(() => {
            const b = atS();
            return (
              <>
                <div className="hud__stat hud__stat--trace">
                  <span className="hud__stat-k">
                    <span className="tw" style={{ animationDelay: `${b.toFixed(3)}s` }}>
                      <HudIcon icon={IconActivity} color={traceTone} />
                    </span>
                    <Words text="TRACE" base={b} />
                  </span>
                  <b className="tw--v" style={{ animationDelay: `${(b + WORD_STEP).toFixed(3)}s`, ...(traceTone ? { color: traceTone } : {}) }}>{pad(tr)}%</b>
                  {/* per-action trace change — flashes once per action, muted red for spikes */}
                  {traceFx && (
                    <span
                      className={`hud__trace-delta${traceSpike ? ' is-spike' : traceUp ? ' is-up' : ' is-down'}`}
                      key={traceFx.id}
                    >
                      {traceFxText}
                    </span>
                  )}
                </div>
                <div className="hud__trace-bar" style={{ animationDelay: `${(b + 2 * WORD_STEP).toFixed(3)}s` }}>
                  <div
                    className={`hud__trace-fill ${
                      tr >= 90 ? 'is-crit' : tr >= 70 ? 'is-warn' : 'is-safe'
                    }${tr >= 70 ? ' is-hot' : ''}`}
                    style={{ width: `${tr}%` }}
                  />
                </div>
              </>
            );
          })()}
          {!intro && (
            <Stat
              icon={IconShieldCheck}
              label="THREAT"
              value={<span className={`hud__status-badge hud__status-badge--${threat.toLowerCase()}`}>{threat}</span>}
              iconTone={threatTone}
              valueTone={threatTone}
              className="hud__stat--threat"
              base={atS()}
            />
          )}
          {!intro && (
            <Stat
              icon={IconActivity}
              label="CORRUPTION"
              value={`${corruption}%`}
              iconTone={corruption > 50 ? HUD_TONE.amber : undefined}
              valueTone={corruption > 50 ? HUD_TONE.amber : undefined}
              className="hud__stat--threat"
              base={atS()}
            />
          )}
        </HudSection>

        {/* resource / mining readout — DATA (= extracted) + the four mined resources */}
        <HudSection
          title="RESOURCES"
          className="hud__section--resources"
          right={gainFx && <span className="hud__res-gain" key={gainFx.id}>{gainFx.text}</span>}
        >
          <Stat icon={IconDatabase} label="DATA" value={game.extractedData} className="hud__stat--resource" base={atS()} />
          <Stat icon={IconBrain} label="MEM" value={pad(game.resources.memoryShards)} iconTone={HUD_TONE.mem} className="hud__stat--resource" base={atS()} />
          <Stat icon={IconKey} label="KEYS" value={pad(game.resources.accessKeys)} iconTone={HUD_TONE.keys} className="hud__stat--resource" base={atS()} />
          <Stat icon={IconAntennaBars5} label="SIGNAL" value={pad(game.resources.signalEnergy)} iconTone={HUD_TONE.signal} className="hud__stat--resource" base={atS()} />
          <Stat icon={IconHexagon} label="CORE" value={pad(game.resources.coreFragments)} iconTone={HUD_TONE.core} className="hud__stat--resource" base={atS()} />
          {game.resources.coreFragments > 0 && (
            <div className="hud__res-note">CORE FRAGMENTS WILL POWER FUTURE NETWORK UPGRADES</div>
          )}
        </HudSection>

        <HudSection title="NETWORK ACCESS">
          <Stat icon={IconShieldCheck} label="ACCESS" value={`LV ${game.accessLevel}`} iconTone={HUD_TONE.green} base={atS()} />
          <Stat icon={IconLayersIntersect} label="DEPTH" value={pad(game.currentDepth)} base={atS()} />
          <Stat
            icon={IconShieldOff}
            label="ISOLATED"
            value={game.isolatedNodes}
            iconTone={game.isolatedNodes > 0 ? HUD_TONE.slate : undefined}
            base={atS()}
          />
          <Stat icon={IconTopologyStar} label="LINKS" value={game.revealedLinks} base={atS()} />
          <Stat icon={IconCamera} label="CAMERA" value={focus ? 'FOCUS' : 'FREE'} base={atS()} />
        </HudSection>

        <HudSection
          title="PRIVATE GRID"
          className={game.playerSubnetwork.unlocked ? 'hud__section--private is-online' : 'hud__section--private is-offline'}
          right={<span className={`hud__status-badge ${game.playerSubnetwork.unlocked ? 'hud__status-badge--online' : 'hud__status-badge--offline'}`}>{game.playerSubnetwork.unlocked ? 'ONLINE' : 'OFFLINE'}</span>}
        >
          <Stat
            icon={IconHome2}
            label="MODULES"
            value={<span className="hud__status-badge hud__status-badge--modules">{activeModules.length} ACTIVE</span>}
            valueTone={game.playerSubnetwork.unlocked ? HUD_TONE.ice : undefined}
            base={atS()}
          />
          {activeModules.map((d) => (
            <div className="hud__mod" key={d.id}>{moduleEffect(d.id, mods[d.id])}</div>
          ))}
          {game.playerSubnetwork.unlocked && (() => {
            const b = atS();
            return (
              <div className="hud__devkey">
                <span className="tw" style={{ animationDelay: `${b.toFixed(3)}s` }}><HudIcon icon={IconHome2} size={11} /></span>
                <Words text="B SUBNETWORK" base={b} />
              </div>
            );
          })()}
        </HudSection>

      </div>

      {/* NODE INFO is now a node-anchored panel (opens to the LEFT of the node) rendered by
          NodePanelHost — see NodeInfoPanel.tsx. It is no longer a fixed HUD card. */}

      {/* objective + mission checklist — lower-left, ticks green as tasks complete. Hidden during
          the Mission 00 intro (the guided onboarding bar carries the objective instead). */}
      {!intro && (
      // re-keyed per mission (and when it becomes active) so the whole list TYPES IN fresh on a
      // mission change — the old list's "out" is covered by the completion / briefing overlays.
      <div
        className={`hud__mission${game.missionComplete ? ' is-complete' : ''}`}
        key={`m${game.missionId}:${game.missionStarted ? 1 : 0}`}
      >
        {(() => {
          const b = atM();
          return (
            <>
              <div className="hud__chapter"><Words text={hud.chapter} base={b} /></div>
              <div className="hud__mission-h">
                <div className="hud__mission-title">
                  <span className="hud__mission-id"><Words text={`MISSION ${pad(game.missionId)}`} base={b + 0.06} /></span>
                  <span className="hud__mission-name"><Words text={missionName} base={b + 0.18} /></span>
                </div>
                <span className={`hud__mission-state ${game.missionComplete ? 'is-complete' : 'is-active'}`}>
                  <Words text={missionState} base={b + 0.32} />
                </span>
              </div>
            </>
          );
        })()}
        {(() => {
          const b = atM();
          return (
            <div className="hud__objective">
              <span className="hud__obj-label"><Words text="OBJECTIVE" base={b} /></span>
              <span className="hud__obj-text"><Words text={objective} base={b + 0.12} /></span>
            </div>
          );
        })()}
        {/* reusable objective guidance — status-aware hint + FOCUS OBJECTIVE fallback (target missions) */}
        {showObjGuide && objective2 && (
          <div className="hud__obj-guide" key={objective2.objectiveId + objective2.status}>
            <span className="hud__obj-guide-text">▸ {objective2.hint}</span>
            <button className="hud__obj-focus" type="button" onClick={onFocusObjective} title="Recenter on the mission target">
              FOCUS OBJECTIVE
            </button>
          </div>
        )}
        {tip && <div className="hud__grid-tip">▹ {tip}</div>}
        <div className="hud__tasks">
          {(() => {
            const b = atM();
            return (
              <div className="hud__tasks-h">
                <span><Words text="TASKS" base={b} /></span>
                <span className="hud__tasks-count tw--v" style={{ animationDelay: `${(b + WORD_STEP).toFixed(3)}s` }}>{pad(tasksDone)}/{pad(shownTasks.length)}</span>
              </div>
            );
          })()}
          {shownTasks.map((t) => {
            const b = atM();
            return (
            <div
              key={t.label}
              className={`hud__task${t.done ? ' is-done' : ''}${t.warn ? ' is-warn' : ''}`}
            >
              <span className="hud__task-box">{t.done ? '✓' : t.warn ? '✕' : ''}</span>
              <span className="hud__task-label"><Words text={t.label} base={b} /></span>
              {t.goal != null && (
                <span className="hud__task-n tw--v" style={{ animationDelay: `${(b + (t.label.split(' ').length + 1) * WORD_STEP).toFixed(3)}s` }}>{Math.min(Math.max(0, t.now ?? 0), t.goal)}/{t.goal}</span>
              )}
            </div>
          );
          })}
        </div>
      </div>
      )}

      {/* transient dev notice (e.g. NO GATEWAY FOUND IN CURRENT DEPTH) */}
      {devNotice && <div className="hud__dev-notice" key={devNotice}>{devNotice}</div>}

      {/* signal pulse pressure (Mission 03) — subtle, no big flash */}
      {game.pulseActive && !game.locked && (
        <>
          <div className="hud__signal-edge" />
          <div className="hud__signal-warn">SIGNAL PULSE ACTIVE</div>
        </>
      )}

      {/* short edge message on pulse start / end (transient, fades) */}
      {pulseFx && !game.locked && (
        <div className="hud__signal-flash" key={pulseFx}>{pulseFx}</div>
      )}
      {/* THREAT tier-rise flash (RISK RISING / CRITICAL) */}
      {riskFx && !game.locked && (
        <div className="hud__signal-flash hud__signal-flash--risk" key={riskFx}>{riskFx}</div>
      )}
      {/* CORE node secured — Mission 07 milestone flash */}
      {coreFx && (
        <div className="hud__signal-flash hud__signal-flash--core" key="core">CORE NODE SECURED</div>
      )}

      {/* trace lock imminent (>=90%) */}
      {tr >= 90 && !game.locked && (
        <div className="hud__trace-warn">TRACE LOCK IMMINENT</div>
      )}

      {/* full-width space-time comb timeline */}
      <div className={`hud__coords${pulse || game.pulseActive ? ' is-pulse' : ''}`}>
        <div className="hud__coords-graph">
          <div className="hud__comb hud__comb--top">
            {COMB_TOP.map((h, i) => (
              <span key={i} style={{ height: `${h}px` }} />
            ))}
          </div>
          <div className="hud__line" />
          <div className="hud__comb hud__comb--bot">
            {COMB_BOT.map((h, i) => (
              <span key={i} style={{ height: `${h}px` }} />
            ))}
          </div>
          <span className="hud__coords-scan" />
        </div>

        <div className="hud__coords-text">
          <span className="hud__coords-item"><i>X</i><b>{sgn(telemetry.x)}</b></span>
          <span className="hud__coords-item"><i>Y</i><b>{sgn(telemetry.y)}</b></span>
          <span className="hud__coords-item"><i>Z</i><b>{sgn(telemetry.z)}</b></span>
          <span className="hud__coords-sep">|</span>
          <span className="hud__coords-item"><i>TIME</i><b>{clock}</b></span>
          <span className="hud__coords-sep">|</span>
          <span className="hud__coords-item">
            <i>SECTOR</i>
            <b>{sectorId}</b>
          </span>
          <span className="hud__coords-sep">|</span>
          <span className="hud__coords-item"><i>VEL</i><b>{telemetry.speed.toFixed(0).padStart(3, '0')}</b></span>
        </div>
      </div>

      {/* cinematic depth-transition flash */}
      {depthFlash != null && (
        <div className="hud__depth" key={depthFlash}>
          <div className="hud__depth-box">
            <div className="hud__depth-t">DEPTH {pad(depthFlash)} ACCESSED</div>
            <div className="hud__depth-s">SUBNETWORK LINK ESTABLISHED</div>
            <div className="hud__depth-tag">DEPTH {pad(depthFlash)} // SUBNETWORK OPEN</div>
          </div>
        </div>
      )}

      {/* trace locked / session compromised — recover from the latest checkpoint (not a
          full restart) or reset the whole session */}
      {game.locked && (
        <div className="hud__locked">
          <div className="hud__locked-box">
            <div className="hud__locked-fail">MISSION FAILED</div>
            <div className="hud__locked-t">TRACE LOCKED</div>
            <div className="hud__locked-s">SESSION COMPROMISED</div>
            <div className="hud__locked-actions">
              <button className="hud__locked-btn" onClick={onRetryCheckpoint}>
                RETRY FROM CHECKPOINT
              </button>
              <button className="hud__locked-btn hud__locked-btn--alt" onClick={onResetSession}>
                RESET SESSION
              </button>
            </div>
            <div className="hud__locked-r">R = RETRY CHECKPOINT · SHIFT+R = RESET SESSION</div>
          </div>
        </div>
      )}
    </div>
  );
}
