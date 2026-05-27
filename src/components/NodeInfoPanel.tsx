import { Html } from '@react-three/drei';
import { NETWORK } from '../network';
import {
  nodeType,
  TYPE_CFG,
  statusLabel,
  exportValueAt,
  accessRequiredFor,
  corruptedNearby,
  nodeCategory,
  CATEGORY_PURPOSE,
  TUTORIAL_NODES,
  TUTORIAL_STEPS,
  type GameState,
} from '../game';
import { objectiveBadge } from '../objectives';

const pad = (n: number) => String(n).padStart(2, '0');
const sgn = (n: number, w = 6) => (n >= 0 ? '+' : '-') + Math.abs(n).toFixed(1).padStart(w, '0');

// the rows write in IN STEP with the info panel opening (its surface starts ~0.6s), cascading
// top→bottom — not delayed after it.
const NI_ROW_BASE = 650;
const NI_ROW_STEP = 45;

/**
 * NODE INFO — a compact, read-only twin of the inspection panel, anchored to the SAME node
 * but opening to the LEFT (the inspection panel opens right). Its cinematic is sequenced to
 * play AFTER the inspection panel: silver leader line draws out from the node, then the frame
 * + corners assemble, then the rows cascade. Hard facts only — never mutates the reducer.
 */
export default function NodeInfoPanel({
  selected,
  game,
  closing = false,
}: {
  selected: number;
  game: GameState;
  closing?: boolean;
}) {
  const m = NETWORK.meta[selected];
  const depth = game.currentDepth;
  const type = nodeType(selected, depth);
  const st = game.statuses[selected] ?? {};
  const x = NETWORK.positions[selected * 3];
  const y = NETWORK.positions[selected * 3 + 1];
  const z = NETWORK.positions[selected * 3 + 2];
  const pos: [number, number, number] = [x, y, z];

  // SECTOR = nearest cluster centre (letter) + current depth — matches the top-bar style
  let best = 0, bestD = Infinity;
  const cc = NETWORK.centers;
  for (let c = 0; c < cc.length / 3; c++) {
    const dx = cc[c * 3] - x, dy = cc[c * 3 + 1] - y, dz = cc[c * 3 + 2] - z;
    const dd = dx * dx + dy * dy + dz * dz;
    if (dd < bestD) { bestD = dd; best = c; }
  }
  const sector = `${String.fromCharCode(65 + (best % 26))}${pad(depth)}`;
  const layer = pad((((Math.floor(y / 26) % 8) + 8) % 8) + 1);

  const status = statusLabel(game, selected);
  const corruptNearby = game.missionId >= 3 ? corruptedNearby(selected, game.linkStabilized) : 0;
  const risk = TYPE_CFG[type].risk;
  const value = exportValueAt(type, depth);

  const flags: string[] = [];
  if (st.extracted) flags.push('EXTRACTED');
  if (st.analyzed) flags.push('ANALYZED');
  if (st.unlocked) flags.push('UNLOCKED');
  if (corruptNearby > 0) flags.push('CORRUPTED LINKS NEARBY');
  if (type === 'GATEWAY') flags.push('GATEWAY ROUTE');
  if (
    (type === 'LOCKED' || type === 'ARCHIVE') &&
    !st.unlocked && !st.traced &&
    game.accessLevel < accessRequiredFor(type, depth)
  ) flags.push('ACCESS REQUIRED');

  // MISSION OBJECTIVE badge — shown only when this selected node IS the active objective target
  // (post-intro; the Mission 00 guided bar carries its own role text). Reusable across missions.
  const objBadge = game.mission00.complete ? objectiveBadge(game, selected) : null;

  const cls = nodeCategory(selected, type);
  // Mission 00 intro: if this is a tutorial node, teach its ROLE (what it is + the takeaway)
  // in place of the normal CLASS purpose line.
  const introIdx = !game.mission00.complete ? TUTORIAL_NODES.indexOf(selected) : -1;
  const introStep = introIdx >= 0 ? TUTORIAL_STEPS[introIdx] : null;
  const groups: { seg?: string; rows: [string, string][] }[] = [
    { rows: [['ID', m.id], ['TYPE', type], ['CLASS', cls], ['STATUS', status]] },
    { seg: 'POSITION', rows: [['X', sgn(x)], ['Y', sgn(y)], ['Z', sgn(z)]] },
    { rows: [['SECTOR', sector], ['DEPTH', pad(depth)], ['LAYER', layer], ['LINKS', pad(m.links)]] },
    { rows: [['RISK', risk], ['VALUE', String(value)], ['SIGNAL', `${m.signal}%`]] },
  ];
  let di = 0;

  return (
    <Html position={pos} zIndexRange={[19, 0]} style={{ pointerEvents: 'none' }}>
      <div className="ni-anchor" key={selected}>
        <div className={`ni${closing ? ' is-closing' : ''}`}>
          {/* AR corner brackets — assemble out from centre (reuses the panel's keyframes) */}
          <span className="np__corner np__corner--tl" />
          <span className="np__corner np__corner--tr" />
          <span className="np__corner np__corner--br" />
          <span className="np__corner np__corner--bl" />
          <div className={`np__frame${st.extracted ? ' is-extracted' : ''}`}>
            <span className="np__scan" />
            <div className="np__head">
              <div className="np__title">
                <span className="np__name">NODE INFO</span>
                <span className="np__sub">{m.id}</span>
              </div>
              <span className="np__dot" />
            </div>
            <div className="np__sweep" />
            {introStep ? (
              <div className="ni__intro">
                <div className="ni__intro-role">{introStep.title}</div>
                <div className="ni__purpose">▹ {introStep.what}</div>
                <div className="ni__intro-note">{introStep.remember}</div>
              </div>
            ) : (
              <div className="ni__purpose">▹ {CATEGORY_PURPOSE[cls]}</div>
            )}
            {objBadge && (
              <div className="ni__objective">
                <div className="ni__objective-badge">MISSION OBJECTIVE</div>
                <div className="ni__objective-label">{objBadge.label}</div>
                <div className="ni__objective-act">
                  <span className="ni__objective-act-k">REQUIRED ACTION</span>
                  <span className="ni__objective-act-v">{objBadge.action}</span>
                </div>
              </div>
            )}
            {groups.map((g, gi) => (
              <div className="ni__grp" key={gi}>
                {g.seg && (
                  <div className="ni__seg" style={{ animationDelay: `${NI_ROW_BASE + di++ * NI_ROW_STEP}ms` }}>
                    {g.seg}
                  </div>
                )}
                {g.rows.map(([kk, vv]) => (
                  <div className="np__row" style={{ animationDelay: `${NI_ROW_BASE + di++ * NI_ROW_STEP}ms` }} key={kk}>
                    <span className="np__k">{kk}</span>
                    <span className="np__v">{vv}</span>
                  </div>
                ))}
              </div>
            ))}
            {flags.length > 0 && (
              <div className="ni__flags">
                {flags.map((f) => <span className="ni__flag" key={f}>{f}</span>)}
              </div>
            )}
          </div>
        </div>
      </div>
    </Html>
  );
}
