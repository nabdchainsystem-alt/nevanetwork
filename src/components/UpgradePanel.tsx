import {
  IconShieldCheck,
  IconShieldOff,
  IconScan,
  IconKey,
  IconAntennaBars5,
  IconDatabase,
  IconBrain,
  IconHexagon,
  IconActivity,
  IconCpu,
} from '@tabler/icons-react';
import HudIcon from './HudIcon';
import { type TablerIconComp } from './hudTokens';
import {
  UPGRADE_DEFS,
  canAffordUpgrade,
  traceTier,
  type GameState,
  type GameAction,
  type Resources,
  type UpgradeCost,
  type UpgradeId,
} from '../game';

const pad = (n: number) => String(n).padStart(2, '0');

// a distinct glyph per upgrade so each module reads at a glance (monochrome AR — same icon set
// the HUD uses)
const UP_ICON: Record<UpgradeId, TablerIconComp> = {
  traceDampener: IconShieldCheck,
  exportEfficiency: IconDatabase,
  scanResolution: IconScan,
  isolationCore: IconShieldOff,
  keyForge: IconKey,
  signalStabilizer: IconAntennaBars5,
};

// break a cost into chips so the UI can dim the resource you can't afford yet
function costChips(cost: UpgradeCost, r: Resources): { k: string; v: number; ok: boolean }[] {
  const out: { k: string; v: number; ok: boolean }[] = [];
  if (cost.signal) out.push({ k: 'SIGNAL', v: cost.signal, ok: r.signalEnergy >= cost.signal });
  if (cost.mem) out.push({ k: 'MEM', v: cost.mem, ok: r.memoryShards >= cost.mem });
  if (cost.keys) out.push({ k: cost.keys === 1 ? 'KEY' : 'KEYS', v: cost.keys, ok: r.accessKeys >= cost.keys });
  if (cost.core) out.push({ k: 'CORE', v: cost.core, ok: r.coreFragments >= cost.core });
  return out;
}

/**
 * NEVA // UPGRADES — the network-augmentation console (toggled with U / the HUD button).
 * Presentation only: purchases still dispatch BUY_UPGRADE to the unchanged pure reducer.
 */
export default function UpgradePanel({
  game,
  dispatch,
  onClose,
  closing = false,
}: {
  game: GameState;
  dispatch: React.Dispatch<GameAction>;
  onClose: () => void;
  closing?: boolean; // playing the retract animation before unmount
}) {
  const r = game.resources;
  const tr = Math.round(game.traceLevel);
  const tier = traceTier(game.traceLevel); // surface + gauge colour follow the live trace meter
  const status = tier === 'crit' ? 'CRITICAL' : tier === 'warn' ? 'CAUTION' : 'OPTIMAL';

  const resources: { icon: TablerIconComp; label: string; value: string | number; sub: string }[] = [
    { icon: IconDatabase, label: 'DATA', value: game.extractedData, sub: 'EXTRACTED' },
    { icon: IconBrain, label: 'MEMORY', value: pad(r.memoryShards), sub: 'SHARDS' },
    { icon: IconKey, label: 'KEYS', value: pad(r.accessKeys), sub: 'ACCESS' },
    { icon: IconAntennaBars5, label: 'SIGNAL', value: pad(r.signalEnergy), sub: 'ENERGY' },
    { icon: IconHexagon, label: 'CORE', value: pad(r.coreFragments), sub: 'FRAGS' },
  ];

  const owned = UPGRADE_DEFS.reduce((n, d) => n + game.upgrades[d.id], 0);
  const totalLevels = UPGRADE_DEFS.reduce((n, d) => n + d.max, 0);
  const ownedPct = totalLevels ? Math.round((owned / totalLevels) * 100) : 0;

  return (
    // backdrop dims the network behind; clicking it closes the panel
    <div className={`up-backdrop${closing ? ' is-closing' : ''}`} onClick={onClose}>
      <div
        className={`up up--upgrade${closing ? ' up--closing' : ''}${tier !== 'ok' ? ` up--trace-${tier}` : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* four AR corner brackets — assemble at centre, glide out to the corners */}
        <span className="up__corner up__corner--tl" />
        <span className="up__corner up__corner--tr" />
        <span className="up__corner up__corner--br" />
        <span className="up__corner up__corner--bl" />

        {/* the translucent surface lives on .up::before; this is the content layer */}
        <div className="up__inner">
          <span className="up__scan" />

          <div className="up__head">
            <div className="up__titles">
              <span className="up__title">NEVA // UPGRADES</span>
              <span className="up__sub">AUGMENTATION CONTROL</span>
            </div>
            <div className="up__head-right">
              <span className={`up__state is-${tier}`}>{status}</span>
              <button className="up__x" type="button" onClick={onClose}>✕ CLOSE</button>
            </div>
          </div>
          <div className="up__rule" />

          <div className="up__layout">
            <aside className="up__side" aria-label="Upgrade system status">
              <div className={`up__trace is-${tier}`}>
                <span className="up__trace-ring" style={{ '--p': tr } as unknown as React.CSSProperties} />
                <span className="up__trace-core">
                  <HudIcon icon={IconActivity} size={15} />
                  <b>{pad(tr)}%</b>
                  <i>TRACE</i>
                </span>
              </div>

              <div className="up__install">
                <div className="up__install-row">
                  <span>INSTALLED</span>
                  <b>{pad(owned)} / {pad(totalLevels)}</b>
                </div>
                <span className="up__bar" aria-hidden="true">
                  <span style={{ width: `${ownedPct}%` }} />
                </span>
              </div>

              <div className="up__access">
                <span><HudIcon icon={IconCpu} size={12} /> ACCESS</span>
                <b>LV {game.accessLevel}</b>
                <i>DEPTH {pad(game.currentDepth)}</i>
              </div>

              <div className="up__resources">
                {resources.map((s) => (
                  <div className="up__resource" key={s.label}>
                    <span><HudIcon icon={s.icon} size={12} /> {s.label}</span>
                    <b>{s.value}</b>
                    <i>{s.sub}</i>
                  </div>
                ))}
              </div>
            </aside>

            <div className="up__main">
              <div className="up__section-h">
                <span>MODULE STACK</span>
                <b>{ownedPct}% SYNCHRONIZED</b>
              </div>

              <div className="up__grid">
                {UPGRADE_DEFS.map((def) => {
                  const lvl = game.upgrades[def.id];
                  const maxed = lvl >= def.max;
                  const nextCost = maxed ? null : def.costs[lvl];
                  const afford = nextCost ? canAffordUpgrade(r, nextCost) : false;
                  const chips = nextCost ? costChips(nextCost, r) : [];
                  const cls = `up__item${maxed ? ' is-max' : afford ? ' is-afford' : ''}`;
                  return (
                    <div className={cls} key={def.id}>
                      <div className="up__item-main">
                        <span className="up__glyph"><HudIcon icon={UP_ICON[def.id]} size={17} /></span>
                        <div className="up__item-copy">
                          <div className="up__item-top">
                            <span className="up__name">{def.name}</span>
                            <span className="up__level">LV {lvl}/{def.max}</span>
                          </div>

                          <div className="up__effect">
                            <span>{lvl > 0 ? def.effect(lvl) : def.effect(0)}</span>
                            <b>{maxed ? 'MAXIMUM OUTPUT' : def.effect(lvl + 1)}</b>
                          </div>
                        </div>
                      </div>

                      <div className="up__item-bot">
                        {maxed ? (
                          <span className="up__maxtag">FULLY UPGRADED</span>
                        ) : (
                          <span className="up__chips">
                            {chips.map((c) => (
                              <span className={`up__chip${c.ok ? '' : ' is-short'}`} key={c.k}>
                                {c.v} {c.k}
                              </span>
                            ))}
                          </span>
                        )}
                        <button
                          className={`up__buy${afford && !maxed ? ' is-afford' : ''}`}
                          type="button"
                          disabled={maxed || !afford}
                          onClick={() => dispatch({ type: 'BUY_UPGRADE', id: def.id })}
                        >
                          {maxed ? 'MAX' : 'UPGRADE'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="up__rule" />
          <div className="up__foot">
            {game.message ? (
              <span className={`up__msg up__msg--${game.message.kind}`} key={game.msgId}>
                ▸ {game.message.text}
              </span>
            ) : (
              <span className="up__msg up__msg--idle">NETWORK AUGMENTATION ONLINE</span>
            )}
            <span className="up__hint">U / ESC TO CLOSE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
