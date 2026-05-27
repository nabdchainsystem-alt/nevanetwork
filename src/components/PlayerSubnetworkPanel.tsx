import {
  MODULE_DEFS,
  canAffordModule,
  moduleCostText,
  type GameState,
  type GameAction,
} from '../game';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * NEVA // PLAYER SUBNETWORK — the private home-grid control panel (toggled with B, or by
 * selecting the HOME node). Reuses the Upgrade panel's `.up` chrome + staged open/close
 * animation (`.up--subnet` just trims the size), so it stays visually consistent. Read-only
 * status (level / integrity / storage) + a module grid that installs/upgrades via the pure
 * reducer (`INSTALL_MODULE`). Unlocked only after Mission 03.
 */
export default function PlayerSubnetworkPanel({
  game,
  dispatch,
  onClose,
  closing = false,
}: {
  game: GameState;
  dispatch: React.Dispatch<GameAction>;
  onClose: () => void;
  closing?: boolean;
}) {
  const r = game.resources;
  const sub = game.playerSubnetwork;
  return (
    <div className={`up-backdrop${closing ? ' is-closing' : ''}`} onClick={onClose}>
      <div className={`up up--subnet${closing ? ' up--closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        {/* four AR corner brackets — assemble at centre, glide out to the corners */}
        <span className="up__corner up__corner--tl" />
        <span className="up__corner up__corner--tr" />
        <span className="up__corner up__corner--br" />
        <span className="up__corner up__corner--bl" />

        <div className="up__inner">
          <span className="up__scan" />

          <div className="up__head">
            <div className="up__titles">
              <span className="up__title">NEVA // PLAYER SUBNETWORK</span>
              <span className="up__sub">PRIVATE GRID CONTROL</span>
            </div>
            <button className="up__x" type="button" onClick={onClose}>✕ CLOSE</button>
          </div>
          <div className="up__rule" />

          {/* grid status: level / integrity / storage */}
          <div className="up__res">
            <span><i>LEVEL</i> {pad(sub.level)}</span>
            <span><i>INTEGRITY</i> {sub.integrity}%</span>
            <span><i>STORAGE</i> {sub.storageCapacity}</span>
            <span><i>MODULES</i> {(Object.values(sub.modules) as number[]).filter((l) => l > 0).length}/4</span>
          </div>
          {/* spendable resource totals (DATA = extracted) */}
          <div className="up__res up__res--spend">
            <span><i>DATA</i> {game.extractedData}</span>
            <span><i>MEM</i> {pad(r.memoryShards)}</span>
            <span><i>KEYS</i> {pad(r.accessKeys)}</span>
            <span><i>SIGNAL</i> {pad(r.signalEnergy)}</span>
            <span><i>CORE</i> {pad(r.coreFragments)}</span>
          </div>

          <div className="up__grid">
            {MODULE_DEFS.map((def) => {
              const lvl = sub.modules[def.id];
              const maxed = lvl >= def.max;
              const nextCost = maxed ? null : def.costs[lvl];
              const afford = nextCost ? canAffordModule(game, nextCost) : false;
              return (
                <div className={`up__item${maxed ? ' is-max' : ''}${lvl > 0 ? ' is-installed' : ''}`} key={def.id}>
                  <span className="up__item-c up__item-c--tl" />
                  <span className="up__item-c up__item-c--br" />
                  <div className="up__item-top">
                    <span className="up__name">{def.name}</span>
                    <span className={`up__status${lvl > 0 ? ' is-on' : ''}`}>
                      {lvl > 0 ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <div className="up__sub-line">LV {lvl}/{def.max} · {def.purpose}</div>
                  {lvl > 0 && <div className="up__cur">CURRENT: {def.effect(lvl)}</div>}
                  {!maxed && (
                    <div className="up__next">{lvl > 0 ? 'NEXT' : 'INSTALL'}: {def.effect(lvl + 1)}</div>
                  )}
                  <div className="up__item-bot">
                    <span className="up__cost">
                      {maxed ? 'FULLY INSTALLED' : `${lvl > 0 ? 'UPGRADE' : 'INSTALL'}: ${moduleCostText(nextCost!)}`}
                    </span>
                    <button
                      className={`up__buy${afford && !maxed ? ' is-afford' : ''}`}
                      type="button"
                      disabled={maxed || !afford}
                      onClick={() => dispatch({ type: 'INSTALL_MODULE', id: def.id })}
                    >
                      {maxed ? 'MAX' : lvl > 0 ? 'UPGRADE' : 'INSTALL'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="up__rule" />
          <div className="up__foot">
            {game.message ? (
              <span className={`up__msg up__msg--${game.message.kind}`} key={game.msgId}>
                ▸ {game.message.text}
              </span>
            ) : (
              <span className="up__msg up__msg--idle">PRIVATE GRID ONLINE · BUILD YOUR NETWORK</span>
            )}
            <span className="up__hint">B / ESC TO CLOSE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
