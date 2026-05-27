import { useState } from 'react';
import { MISSION_META } from '../missions';
import {
  ACHIEVEMENTS,
  networkScore,
  playerLevel,
  levelProgress,
  modulesInstalledNow,
  moduleLevelsNow,
  upgradesInstalledNow,
  type PlayerProfile,
} from '../profile';
import type { GameState } from '../game';
import './profile.css';

const pad2 = (n: number) => String(n).padStart(2, '0');
const fmtDate = (ms: number) => {
  try {
    return new Date(ms).toISOString().slice(0, 10);
  } catch {
    return '----';
  }
};
const missionName = (id: number) => MISSION_META[id]?.name ?? '—';

/**
 * NEVA // PLAYER PROFILE — the local operator-identity panel (opened with L / the PROFILE button).
 * Read-only summary of the persistent profile (high-water progression marks + achievements) plus a
 * live snapshot of the current run's resources / private grid. Identity UI only — it never changes
 * gameplay. The only action is RESET PROFILE (confirmed), which clears the local identity; it does
 * NOT touch the gameplay save. Remote account / login is shown as PLANNED, not implemented.
 */
export default function ProfilePanel({
  game,
  profile,
  closing = false,
  onClose,
  onResetProfile,
}: {
  game: GameState;
  profile: PlayerProfile;
  closing?: boolean;
  onClose: () => void;
  onResetProfile: () => void;
}) {
  const [confirmReset, setConfirmReset] = useState(false);

  const score = networkScore(profile);
  const level = playerLevel(score);
  const { into, span } = levelProgress(score);

  const r = game.resources;
  const sub = game.playerSubnetwork;
  const modsNow = modulesInstalledNow(game);
  const modLevelsNow = moduleLevelsNow(game);
  const upgNow = upgradesInstalledNow(game);
  const unlocked = new Set(profile.achievements);

  // mission status strip — M00..M20 (done from the best-ever marks, current ring from the live run)
  const dots = Array.from({ length: 21 }, (_, n) => {
    const done = n === 0 ? profile.mission00Completed : n <= profile.missionsCompleted;
    const now = n === game.missionId; // current run position
    return { n, done, now };
  });

  return (
    <div className={`pf-backdrop${closing ? ' is-closing' : ''}`} onClick={onClose}>
      <div className={`pf${closing ? ' pf--closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="pf__head">
          <div className="pf__titles">
            <span className="pf__title">NEVA // PLAYER PROFILE</span>
            <span className="pf__sub">LOCAL OPERATOR IDENTITY</span>
          </div>
          <button className="pf__x" type="button" onClick={onClose}>
            ✕ CLOSE
          </button>
        </div>

        <div className="pf__rule" />

        {/* hero — callsign · level · network score */}
        <div className="pf__hero">
          <div className="pf__hero-card">
            <div className="pf__hero-k">CALLSIGN</div>
            <div className="pf__hero-v">{profile.callsign}</div>
          </div>
          <div className="pf__hero-card">
            <div className="pf__hero-k">PLAYER LEVEL</div>
            <div className="pf__hero-v">
              {level} <small>LV</small>
            </div>
            <div className="pf__levelbar">
              <i style={{ width: `${Math.round((into / span) * 100)}%` }} />
            </div>
          </div>
          <div className="pf__hero-card">
            <div className="pf__hero-k">NETWORK SCORE</div>
            <div className="pf__hero-v">{score.toLocaleString()}</div>
          </div>
        </div>

        {/* mission progress */}
        <div className="pf__sh">
          <span>MISSION PROGRESS</span>
          <b>
            {pad2(profile.missionsCompleted)} / 20 COMPLETE
          </b>
        </div>
        <div className="pf__rows">
          <div className="pf__row">
            <span className="pf__row-k">CURRENT</span>
            <span className="pf__row-v">
              M{pad2(game.missionId)} // {missionName(game.missionId)}
            </span>
          </div>
          <div className="pf__row">
            <span className="pf__row-k">HIGHEST REACHED</span>
            <span className="pf__row-v is-ice">
              M{pad2(profile.highestMissionReached)} // {missionName(profile.highestMissionReached)}
            </span>
          </div>
          <div className="pf__row">
            <span className="pf__row-k">HIGHEST DEPTH</span>
            <span className="pf__row-v">DEPTH {pad2(profile.highestDepthReached)}</span>
          </div>
        </div>
        <div className="pf__strip" aria-label="mission status M00 to M20">
          {dots.map((d) => (
            <span
              key={d.n}
              className={`pf__dot${d.done ? ' is-done' : ''}${d.now ? ' is-now' : ''}`}
              title={`M${pad2(d.n)}${d.n > 0 ? ` // ${missionName(d.n)}` : ' // FIRST SIGNAL'}`}
            />
          ))}
        </div>

        {/* resources (live run snapshot) */}
        <div className="pf__sh">
          <span>RESOURCES · CURRENT RUN</span>
          <b>BEST DATA {profile.totalDataExtracted}</b>
        </div>
        <div className="pf__grid">
          <div className="pf__cell">
            <div className="pf__cell-k">DATA</div>
            <div className="pf__cell-v">{game.extractedData}</div>
          </div>
          <div className="pf__cell">
            <div className="pf__cell-k">MEM</div>
            <div className="pf__cell-v">{r.memoryShards}</div>
          </div>
          <div className="pf__cell">
            <div className="pf__cell-k">KEYS</div>
            <div className="pf__cell-v">{r.accessKeys}</div>
          </div>
          <div className="pf__cell">
            <div className="pf__cell-k">SIGNAL</div>
            <div className="pf__cell-v">{r.signalEnergy}</div>
          </div>
          <div className="pf__cell">
            <div className="pf__cell-k">CORE</div>
            <div className="pf__cell-v">{r.coreFragments}</div>
          </div>
          <div className="pf__cell">
            <div className="pf__cell-k">ACCESS</div>
            <div className="pf__cell-v">LV {game.accessLevel}</div>
          </div>
        </div>

        {/* private grid + lifetime activity */}
        <div className="pf__sh">
          <span>PRIVATE GRID</span>
          <b>{sub.unlocked ? 'ONLINE' : 'OFFLINE'}</b>
        </div>
        <div className="pf__rows">
          <div className="pf__row">
            <span className="pf__row-k">GRID STATUS</span>
            <span className={`pf__row-v${sub.unlocked ? ' is-ice' : ' is-off'}`}>
              {sub.unlocked ? `LEVEL ${sub.level}` : 'LOCKED'}
            </span>
          </div>
          <div className="pf__row">
            <span className="pf__row-k">MODULES INSTALLED</span>
            <span className="pf__row-v">
              {modsNow} / 4 · LV {modLevelsNow}
            </span>
          </div>
          <div className="pf__row">
            <span className="pf__row-k">UPGRADES INSTALLED</span>
            <span className="pf__row-v">{upgNow} / 6</span>
          </div>
          <div className="pf__row">
            <span className="pf__row-k">NODES INSPECTED · EXPORTED</span>
            <span className="pf__row-v">
              {profile.totalNodesInspected} · {profile.totalNodesExported}
            </span>
          </div>
          <div className="pf__row">
            <span className="pf__row-k">LINKS TRACED · ISOLATED</span>
            <span className="pf__row-v">
              {profile.totalLinksTraced} · {profile.totalNodesIsolated}
            </span>
          </div>
          <div className="pf__row">
            <span className="pf__row-k">TRACE LOCKS</span>
            <span className="pf__row-v">{profile.totalTraceLocks}</span>
          </div>
        </div>

        {/* achievements */}
        <div className="pf__sh">
          <span>ACHIEVEMENTS</span>
          <b>
            {pad2(profile.achievements.length)} / {pad2(ACHIEVEMENTS.length)}
          </b>
        </div>
        <div className="pf__ach">
          {ACHIEVEMENTS.map((a) => {
            const on = unlocked.has(a.id);
            return (
              <div key={a.id} className={`pf__ach-item${on ? ' is-on' : ''}`}>
                <span className="pf__ach-name">{a.label}</span>
                <span className="pf__ach-desc">{a.desc}</span>
                {on && <span className="pf__ach-tag">◆ UNLOCKED</span>}
              </div>
            );
          })}
        </div>

        {/* account status — local only; remote planned (not implemented) */}
        <div className="pf__sh">
          <span>ACCOUNT STATUS</span>
          <b>LOCAL SAVE ONLY</b>
        </div>
        <div className="pf__acct">
          <div className="pf__acct-line">
            <span>SAVE</span>
            <b>LOCAL SAVE ONLY</b>
          </div>
          <div className="pf__acct-line">
            <span>REMOTE ACCOUNT</span>
            <b className="is-planned">PLANNED</b>
          </div>
          <div className="pf__acct-line">
            <span>FUTURE ACCOUNT LINK</span>
            <b>NOT CONNECTED</b>
          </div>
          <div className="pf__acct-line">
            <span>REMOTE SAVE</span>
            <b className="is-planned">PLANNED</b>
          </div>
          <div className="pf__acct-line">
            <span>EARLY ACCESS ACCOUNT</span>
            <b className="is-planned">PLANNED</b>
          </div>
        </div>

        <div className="pf__rule" />
        <div className="pf__foot">
          <span className="pf__hint">
            CREATED {fmtDate(profile.profileCreatedAt)} · L / ESC TO CLOSE
          </span>
          {confirmReset ? (
            <span className="pf__confirm">
              <span>RESET LOCAL IDENTITY?</span>
              <button className="pf__reset-yes" type="button" onClick={onResetProfile}>
                CONFIRM
              </button>
              <button className="pf__reset-no" type="button" onClick={() => setConfirmReset(false)}>
                CANCEL
              </button>
            </span>
          ) : (
            <button className="pf__reset" type="button" onClick={() => setConfirmReset(true)}>
              RESET PROFILE
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
