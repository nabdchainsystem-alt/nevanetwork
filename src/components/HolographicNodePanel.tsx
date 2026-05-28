import { useRef, useState, type MouseEvent } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { NETWORK } from '../network';
import {
  nodeType,
  TYPE_CFG,
  statusLabel,
  exportValueAt,
  accessRequiredFor,
  typeHint,
  recommendedAction,
  corruptedNearby,
  exportYield,
  nodeCategory,
  coreSecured,
  CORE_NODE_INDEX,
  TUTORIAL_NODES,
  TUTORIAL_STEPS,
  type GameState,
  type GameAction,
  type TutorialAction,
} from '../game';
import { deepObjectiveHint } from '../missions';

const pad2 = (n: number) => String(n).padStart(2, '0');
const wrap = (n: number, m: number) => ((Math.round(n) % m) + m) % m;
const hex = (n: number, w: number) =>
  (Math.abs(Math.floor(n)) % 16 ** w).toString(16).toUpperCase().padStart(w, '0');

interface Props {
  selected: number;
  game: GameState;
  dispatch: React.Dispatch<GameAction>;
  onClose: () => void;
  closing?: boolean; // host is playing the retract animation → unmount is imminent
}

const STREAM_KEYS = ['MEMORY FRAGMENT', 'LINK HASH', 'ACCESS TOKEN', 'SIGNAL SOURCE', 'TIMESTAMP'];
const GATEWAY_LINES = ['SUBNETWORK HANDSHAKE', 'DEPTH KEY FOUND', 'ROUTE MAP READY', 'ACCESS TUNNEL ACTIVE'];
// Mission 03 // SIGNAL WAR — a WATCHER (CAMERA) node's stream reads as a signal source.
const WATCHER_LINES = ['SIGNAL SOURCE', 'WATCH FEED', 'UPLINK TRACE', 'PRESSURE NODE'];

/**
 * Floating AR Inspection Panel — node data table + guidance, action buttons
 * wired to the game reducer, an action-result message, and a secondary Data
 * Stream Panel. Gateway nodes get special handling toward Depth progression.
 */
export default function HolographicNodePanel({ selected, game, dispatch, onClose, closing = false }: Props) {
  const [flash, setFlash] = useState<string | null>(null);
  const m = NETWORK.meta[selected];
  const depth = game.currentDepth;
  const type = nodeType(selected, depth);
  const cfg = TYPE_CFG[type];
  const prev = game.statuses[selected] ?? {};
  const x = NETWORK.positions[selected * 3];
  const y = NETWORK.positions[selected * 3 + 1];
  const z = NETWORK.positions[selected * 3 + 2];
  const pos: [number, number, number] = [x, y, z];

  const sector = `${String.fromCharCode(65 + wrap(x / 26, 6))}-${pad2(wrap(z / 20, 24) + 1)}`;
  const layer = pad2(wrap(y / 26, 8) + 1);

  // Mission 03 // SIGNAL WAR: CAMERA nodes read as WATCHERS (signal sources)
  const m3 = game.missionId >= 3;
  const isWatcher = m3 && type === 'CAMERA';
  const hintText = isWatcher ? 'SIGNAL SOURCE DETECTED' : typeHint(type, depth);
  const recText = isWatcher ? 'ISOLATE' : recommendedAction(type, depth);

  // Mission 03: how many corrupted links touching this node are still unstabilized.
  // Drives the "nearby corrupted links" guidance + the TRACE LINKS suggest pulse.
  const corruptNearby = m3 ? corruptedNearby(selected, game.linkStabilized) : 0;

  // Mission 07 // CORE BREACH — when this IS the unsecured CORE node, the panel leads the player
  // to the single action that completes it (TRACE = SECURE CORE; works on ANY node type), labels
  // it clearly, and dims the rest, so they never guess between OPEN / TRACE / ISOLATE / EXTRACT.
  const isCoreObjective = selected === CORE_NODE_INDEX && game.missionId === 7 && !coreSecured(game);
  const coreDim = isCoreObjective ? ' is-dim' : '';
  // Deep / Alpha-Core objective node: which action to emphasize + a banner. The Variety Pass adds
  // OPEN (firewall / route / chamber) and ISOLATE (corruption / storm / cluster) alongside TRACE/EXPORT.
  const deepHint = deepObjectiveHint(game, selected);
  const suggestTrace = corruptNearby > 0 || isCoreObjective || deepHint?.action === 'T';
  const suggestExport = deepHint?.action === 'E';
  const suggestOpen = deepHint?.action === 'O';
  const suggestIsolate = deepHint?.action === 'I';
  const traceLabel = isCoreObjective ? 'SECURE CORE' : deepHint?.action === 'T' && deepHint.label ? deepHint.label : 'TRACE LINKS';
  const openLabel = suggestOpen && deepHint?.label ? deepHint.label : 'OPEN STREAM';
  const isolateLabel = suggestIsolate && deepHint?.label ? deepHint.label : 'ISOLATE';

  // Phase 6 — structured "required action" read for the current objective node: the completing
  // action, a 1/2 → 2/2 step (TRACE analyzes first, the action completes) DERIVED from prev.traced
  // (guidance only — never a hard gate, so the mission stays completable), an optional KEY cost, and
  // the risk of acting before verifying. RESTORE / STABILIZE / SECURE (TRACE) are single-step.
  const OBJ_KEY = { T: 'T', E: 'E', O: 'O', I: 'I' } as const;
  const objTwoStep = !!deepHint && deepHint.action !== 'T';
  const objStep = objTwoStep ? (prev.traced ? 2 : 1) : 0;
  const objStep1 =
    deepHint?.action === 'E' ? 'TRACE TO VERIFY ROUTE'
      : deepHint?.action === 'I' ? 'TRACE TO REVEAL CORRUPTION'
        : 'TRACE TO ANALYZE';
  const objUnverifiedRisk = deepHint?.action === 'E' && type === 'ARCHIVE' && !(prev.traced || prev.unlocked);

  // export access state
  const req = accessRequiredFor(type, depth);
  const noData = type === 'GATEWAY' || type === 'DECOY';
  const exportable =
    type === 'LOCKED'
      ? prev.unlocked || game.accessLevel >= req
      : type === 'ARCHIVE'
        ? prev.traced || prev.unlocked || game.accessLevel >= req
        : !noData;
  const accessReqText = noData ? '—' : exportable ? 'GRANTED' : `LV ${req}`;
  const valueText = noData ? '—' : String(exportValueAt(type, depth));

  // EXPECTED YIELD — deterministic, so it shows exactly what an EXPORT will/did drop. Computed
  // unconditionally so a spent node can also show its gained breakdown (same numbers).
  const ny = exportYield(selected, type, depth, prev);
  const yieldRiskNote = prev.extracted
    ? null
    : type === 'CAMERA'
      ? 'TRACE RISK HIGH'
      : type === 'ARCHIVE' && !(prev.traced || prev.unlocked)
        ? 'VERIFY ROUTE FIRST'
        : null;

  // --- Resource Usage v1: contextual spend actions (shown only when useful) ---
  const res = game.resources;
  const isRisk =
    type === 'CAMERA' || type === 'DECOY' || type === 'LOCKED' ||
    (type === 'ARCHIVE' && !(prev.traced || prev.unlocked));
  const canUseKey = type === 'LOCKED' && !exportable; // LOCKED with access denied (not unlocked)
  const canBoostIsolate = isRisk && !prev.extracted && res.signalEnergy > 0;
  const canStabilize = corruptNearby > 0 && res.signalEnergy > 0;
  const canAnalyze =
    (type === 'DECOY' || type === 'ARCHIVE' || type === 'LOCKED') &&
    !prev.analyzed && !prev.extracted && res.memoryShards > 0;
  const showResActions = canUseKey || canBoostIsolate || canStabilize || canAnalyze;

  // Mission 00 — spotlight the EXACT action this step teaches and dim the rest, so the player is
  // never unsure which control to press. Active only while this node IS the current tutorial step.
  const tutIdx = !game.mission00.complete ? TUTORIAL_NODES.indexOf(selected) : -1;
  const guideAction: TutorialAction | null =
    tutIdx >= 0 && tutIdx === game.mission00.step ? TUTORIAL_STEPS[tutIdx].action : null;
  const tutCls = (a: TutorialAction) =>
    guideAction == null ? '' : guideAction === a ? ' is-guide' : ' is-dim';

  const rows: [string, string][] = [
    ['NODE ID', m.id],
    ['TYPE', type],
    ['CLASS', nodeCategory(selected, type)],
    ['STATUS', statusLabel(game, selected)],
    ['DEPTH', pad2(depth)],
    ['ACCESS REQ', accessReqText],
    ['RECOMMENDED', recText],
    ['RISK', cfg.risk],
    ['VALUE', valueText],
    ['SIGNAL', `${m.signal}%`],
    ['LINKS', pad2(m.links)],
    ['SECTOR', sector],
    ['LAYER', layer],
  ];

  const act = (label: string, action: GameAction) => (e: MouseEvent) => {
    e.stopPropagation();
    setFlash(label);
    window.setTimeout(() => setFlash((f) => (f === label ? null : f)), 360);
    dispatch(action);
  };

  const streamOpen = game.streamNode === selected;
  const isGateway = type === 'GATEWAY';
  const streamLines = isGateway ? GATEWAY_LINES : isWatcher ? WATCHER_LINES : STREAM_KEYS;

  // VIEWPORT CLAMP — the panel is anchored to the node's projected screen point (drei <Html>), which
  // can place a tall panel partly below the viewport (the FREE SCAN button gets clipped). Each frame
  // we measure the frame and translate the whole panel UP just enough to keep its bottom on-screen
  // (never pushing the header above the top). Imperative (no React re-render on the hot path).
  const npRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const appliedDy = useRef(0);
  useFrame(() => {
    const np = npRef.current;
    const frame = frameRef.current;
    if (!np || !frame) return;
    const rect = frame.getBoundingClientRect();
    if (rect.height === 0) return; // not laid out yet
    const margin = 16;
    const vh = window.innerHeight;
    // strip the currently-applied offset to get the panel's natural top/bottom
    const naturalTop = rect.top - appliedDy.current;
    const naturalBottom = rect.bottom - appliedDy.current;
    let dy = 0;
    if (naturalBottom > vh - margin) dy = vh - margin - naturalBottom; // overflows bottom → shift up
    if (naturalTop + dy < margin) dy = margin - naturalTop; // but keep the header on-screen
    dy = Math.round(dy);
    if (dy !== appliedDy.current) {
      appliedDy.current = dy;
      np.style.transform = dy ? `translateY(${dy}px)` : '';
    }
  });

  return (
    <Html position={pos} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div className="np-anchor" key={selected}>
        <div className="np-target">
          <span className="np-target__c np-target__c--tl" />
          <span className="np-target__c np-target__c--tr" />
          <span className="np-target__c np-target__c--bl" />
          <span className="np-target__c np-target__c--br" />
        </div>

        <div ref={npRef} className={`np${closing ? ' is-closing' : ''}`} onClick={(e) => e.stopPropagation()}>
          {/* AR corner brackets — assemble out from centre on open, combine back on close */}
          <span className="np__corner np__corner--tl" />
          <span className="np__corner np__corner--tr" />
          <span className="np__corner np__corner--br" />
          <span className="np__corner np__corner--bl" />
          <div ref={frameRef} className={`np__frame${prev.extracted ? ' is-extracted' : ''}`}>
            <span className="np__scan" />

            <div className="np__head">
              <div className="np__title">
                <span className="np__name">NODE INSPECTION</span>
              </div>
              <span className="np__dot" />
            </div>

            <div className="np__sweep" />

            {/* scrollable middle — header above + action buttons below stay pinned, so a tall
                panel never hides the actions or runs off the bottom of the screen */}
            <div className="np__scrollbody">
            <div className="np__hint">▹ {hintText}</div>

            {game.pulseActive && (
              <div className="np__pulse">SIGNAL PULSE ACTIVE · ACTION TRACE COST INCREASED</div>
            )}

            {isWatcher && !prev.extracted && (
              <div className="np__gateway np__gateway--warn">
                <div className="np__gateway-t">WATCHER NODE</div>
                <div className="np__gateway-s">SIGNAL SOURCE DETECTED</div>
                <div className="np__gateway-c">RECOMMENDED: ISOLATE</div>
              </div>
            )}

            <div className="np__rows">
              {rows.map(([k, v], i) => (
                <div className="np__row" style={{ animationDelay: `${240 + i * 36}ms` }} key={k}>
                  <span className="np__k">{k}</span>
                  <span className="np__v">{v}</span>
                </div>
              ))}
            </div>

            {/* EXPECTED YIELD — always visible while a node is selected (below stats, above
                actions). Deterministic, so it matches the real reward exactly. */}
            <div className="np__yield">
              <div className="np__yield-h">{prev.extracted ? 'YIELD STATUS' : 'EXPECTED YIELD'}</div>
              {prev.extracted ? (
                type === 'DECOY' ? (
                  <>
                    <div className="np__yield-row is-warn"><span>DECOY TRIGGERED</span></div>
                    <div className="np__yield-row"><span>NO VALID DATA</span></div>
                  </>
                ) : (
                  <>
                    <div className="np__yield-row is-spent"><span>EXTRACTED · SPENT</span></div>
                    <div className="np__yield-row"><span>DATA</span><b>+{ny.data}</b></div>
                    {ny.shards > 0 && <div className="np__yield-row"><span>MEMORY</span><b>+{ny.shards}</b></div>}
                    {ny.keys > 0 && <div className="np__yield-row"><span>ACCESS KEY</span><b>+{ny.keys}</b></div>}
                    {ny.signal > 0 && <div className="np__yield-row"><span>SIGNAL</span><b>+{ny.signal}</b></div>}
                    {ny.core > 0 && <div className="np__yield-row"><span>CORE</span><b>+{ny.core}</b></div>}
                  </>
                )
              ) : type === 'GATEWAY' ? (
                <>
                  <div className="np__yield-row"><span>ROUTE ACCESS</span></div>
                  <div className="np__yield-row"><span>SUBNETWORK LINK</span></div>
                </>
              ) : type === 'DECOY' ? (
                <>
                  <div className="np__yield-row"><span>NO VALID DATA</span></div>
                  <div className="np__yield-row is-warn"><span>TRACE SPIKE RISK</span></div>
                </>
              ) : !exportable ? (
                <>
                  <div className="np__yield-row is-warn"><span>ACCESS REQUIRED</span></div>
                  <div className="np__yield-row"><span>UNKNOWN UNTIL UNLOCKED</span></div>
                </>
              ) : (
                <>
                  <div className="np__yield-row"><span>DATA</span><b>+{ny.data}</b></div>
                  {ny.shards > 0 && <div className="np__yield-row"><span>MEMORY</span><b>+{ny.shards}</b></div>}
                  {ny.keys > 0 && <div className="np__yield-row"><span>ACCESS KEY</span><b>+{ny.keys}</b></div>}
                  {ny.signal > 0 && <div className="np__yield-row"><span>SIGNAL</span><b>+{ny.signal}</b></div>}
                  {ny.core > 0 && <div className="np__yield-row"><span>CORE</span><b>+{ny.core}</b></div>}
                  {yieldRiskNote && <div className="np__yield-row is-warn"><span>{yieldRiskNote}</span></div>}
                </>
              )}
            </div>

            {isGateway && !streamOpen && (
              <div className="np__gateway">
                <div className="np__gateway-t">GATEWAY NODE DETECTED</div>
                <div className="np__gateway-s">OPEN STREAM TO ACCESS SUBNETWORK</div>
              </div>
            )}

            {type === 'ARCHIVE' && !prev.extracted && (
              <div className={`np__gateway${prev.traced || prev.unlocked ? '' : ' np__gateway--warn'}`}>
                <div className="np__gateway-t">
                  {prev.traced || prev.unlocked ? 'ARCHIVE ROUTE VERIFIED' : 'ARCHIVE ROUTE UNVERIFIED'}
                </div>
                <div className="np__gateway-s">
                  {prev.traced || prev.unlocked ? 'EXPORT IS CLEAN' : 'TRACE LINKS TO VERIFY ROUTE'}
                </div>
              </div>
            )}

            {/* ANALYZE result — a persistent confirmation once a MEMORY_SHARD has been spent */}
            {prev.analyzed && !prev.extracted && (
              <div className={`np__gateway${type === 'DECOY' ? ' np__gateway--warn' : ''}`}>
                <div className="np__gateway-t">
                  {type === 'DECOY'
                    ? 'DECOY SIGNATURE CONFIRMED'
                    : type === 'ARCHIVE'
                      ? 'ARCHIVE ROUTE MAP REVEALED'
                      : type === 'LOCKED'
                        ? 'LOCK SIGNATURE IDENTIFIED'
                        : 'NODE ANALYZED'}
                </div>
                <div className="np__gateway-s">
                  {type === 'DECOY'
                    ? 'DO NOT EXPORT'
                    : type === 'ARCHIVE'
                      ? 'ROUTE CLEAR · TRACE OR EXPORT'
                      : type === 'LOCKED'
                        ? 'USE KEY OR TRACE TO OPEN'
                        : 'ANALYSIS COMPLETE'}
                </div>
              </div>
            )}

            {/* Mission 03: corrupted routes touch this node — point the player at TRACE LINKS */}
            {corruptNearby > 0 && (
              <div className="np__gateway np__gateway--warn">
                <div className="np__gateway-t">CORRUPTED LINKS NEARBY</div>
                <div className="np__gateway-s">RECOMMENDED: TRACE LINKS</div>
                <div className="np__gateway-c">CORRUPTED LINKS: {pad2(corruptNearby)}</div>
              </div>
            )}

            {/* RESOURCE ACTIONS — spend KEYS / SIGNAL / MEM (shown only when useful) */}
            {showResActions && (
              <div className="np__resact">
                <div className="np__resact-h">RESOURCE ACTIONS</div>
                {canUseKey && (
                  <button className={`np__resact-btn${guideAction === 'USE_KEY' ? ' is-guide' : ''}`} onClick={act('K', { type: 'USE_KEY', node: selected })}>
                    <span>USE KEY</span><b>1 KEY</b>
                  </button>
                )}
                {canAnalyze && (
                  <button className="np__resact-btn" onClick={act('Z', { type: 'ANALYZE', node: selected })}>
                    <span>ANALYZE NODE</span><b>1 MEM</b>
                  </button>
                )}
                {canBoostIsolate && (
                  <button className="np__resact-btn" onClick={act('BI', { type: 'ISOLATE', node: selected, boost: true })}>
                    <span>BOOST ISOLATE</span><b>1 SIGNAL</b>
                  </button>
                )}
                {canStabilize && (
                  <button className="np__resact-btn" onClick={act('BT', { type: 'TRACE', node: selected, boost: true })}>
                    <span>STABILIZE ROUTE</span><b>1 SIGNAL</b>
                  </button>
                )}
              </div>
            )}

            {game.message && game.msgNode === selected && (
              <div className={`np__msg np__msg--${game.message.kind}`} key={game.msgId}>
                ▸ {game.message.text}
              </div>
            )}
            </div>{/* /.np__scrollbody */}

            <div className="np__btns">
              <button className={`np__btn${flash === 'O' ? ' is-active' : ''}${(suggestOpen || (isGateway && !streamOpen && !isCoreObjective)) ? ' is-suggest' : ''}${tutCls('OPEN_STREAM')}${coreDim}`} onClick={act('O', { type: 'OPEN_STREAM', node: selected })}>{openLabel}</button>
              <button className={`np__btn${flash === 'T' ? ' is-active' : ''}${suggestTrace ? ' is-suggest' : ''}${tutCls('TRACE')}`} onClick={act('T', { type: 'TRACE', node: selected })}>{traceLabel}</button>
              <button className={`np__btn${flash === 'I' ? ' is-active' : ''}${(suggestIsolate || (isWatcher && !prev.extracted && !isCoreObjective)) ? ' is-suggest' : ''}${tutCls('ISOLATE')}${coreDim}`} onClick={act('I', { type: 'ISOLATE', node: selected })}>{isolateLabel}</button>
              <button
                className={`np__btn${flash === 'E' ? ' is-active' : ''}${suggestExport ? ' is-suggest' : ''}${tutCls('EXPORT')}${coreDim}`}
                disabled={prev.extracted}
                onClick={act('E', { type: 'EXPORT', node: selected })}
              >
                {prev.extracted ? 'EXTRACTED' : suggestExport && deepHint?.label ? deepHint.label : 'EXTRACT'}
              </button>
            </div>

            {/* keyboard shortcuts for the actions above (the top action bar was retired) */}
            <div className="np__act-keys">ACTIONS: OPEN [O] · TRACE [T] · ISOLATE [I] · EXTRACT [E]</div>

            {/* small guidance under the actions when corrupted routes are reachable here */}
            {corruptNearby > 0 && (
              <div className="np__corrupt-hint">▹ TRACE LINKS TO STABILIZE ROUTE</div>
            )}

            {/* Mission objective — the REQUIRED action spelled out: which action completes it, the
                two-step read (TRACE analyzes → action completes), any KEY cost, and the risk. */}
            {deepHint && (
              <div className="np__req">
                <div className="np__req-h">REQUIRED ACTION</div>
                {objTwoStep ? (
                  <>
                    <div className={`np__req-step${objStep > 1 ? ' is-done' : ' is-now'}`}>
                      <span className="np__req-n">STEP 1/2</span> {objStep1} [T]
                    </div>
                    <div className={`np__req-step${objStep === 2 ? ' is-now' : ''}`}>
                      <span className="np__req-n">STEP 2/2</span> {deepHint.label} [{OBJ_KEY[deepHint.action]}]
                    </div>
                  </>
                ) : (
                  <div className="np__req-step is-now">{deepHint.label} [{OBJ_KEY[deepHint.action]}]</div>
                )}
                {canUseKey && <div className="np__req-cost">OPTION · USE KEY [K] · COST 1 KEY</div>}
                {objUnverifiedRisk && <div className="np__req-risk">RISK · HIGHER TRACE UNTIL ROUTE VERIFIED</div>}
                {objTwoStep && <div className="np__req-why">TRACE only analyzes — {deepHint.label} completes the objective.</div>}
              </div>
            )}

            {/* Mission 07 // CORE BREACH — the one action that completes the prototype, spelled out */}
            {isCoreObjective && (
              <div className="np__core-hint">▸ CORE OBJECTIVE · PRESS SECURE CORE TO COMPLETE PROTOTYPE v1</div>
            )}

            {/* Gateway: the actionable ENTER lives in the main panel so it is
                always on-screen and clickable (the side stream can overflow). */}
            {isGateway && streamOpen && (
              <button
                className="np__enter"
                onClick={(e) => { e.stopPropagation(); dispatch({ type: 'ENTER_SUB', node: selected }); }}
              >
                ↳ ENTER SUBNETWORK · DEPTH {pad2(depth + 1)}
              </button>
            )}

            <button className="np__close" onClick={(e) => { e.stopPropagation(); onClose(); }}>
              FREE SCAN <span>[ESC]</span>
            </button>
          </div>

          {/* secondary Data Stream Panel */}
          {streamOpen && (
            <div className={`np-stream${isGateway ? ' np-stream--gateway' : ''}`} key={`s-${selected}`}>
              <div className="np-stream__frame">
                <div className="np-stream__head">
                  {isGateway ? 'SUBNETWORK' : 'STREAM'} // {m.id}
                  <button
                    className="np-stream__x"
                    onClick={(e) => { e.stopPropagation(); dispatch({ type: 'CLOSE_STREAM' }); }}
                  >
                    ✕
                  </button>
                </div>
                <div className="np-stream__lines">
                  {streamLines.map((k, i) => (
                    <div className="np-stream__line" style={{ animationDelay: `${i * 72}ms` }} key={k}>
                      <span>{k}</span>
                      <b>{isGateway ? 'OK' : `0x${hex(selected * 977 + i * 131, 4)}`}</b>
                    </div>
                  ))}
                  <div className="np-stream__cursor">▌</div>
                </div>
                {isGateway && (
                  <div className="np-stream__depth">
                    {m3
                      ? 'DEPTH 03 ROUTE DETECTED · SIGNAL WAR ZONE BREACHED'
                      : depth >= 2
                        ? `NEXT SUBNETWORK ROUTE DETECTED · DEPTH ${pad2(depth + 1)} ROUTE PARTIAL`
                        : 'ROUTE READY · USE ENTER SUBNETWORK'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Html>
  );
}
