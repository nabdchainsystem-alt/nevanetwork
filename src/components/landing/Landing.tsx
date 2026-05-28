import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { loadEarlyAccess, saveEarlyAccess } from '../../earlyAccess';
import './landing.css';

/** Per-item reveal stagger — sets the `--rd` delay CSS var used by `.lp-reveal`. */
const rd = (i: number): CSSProperties => ({ ['--rd' as string]: `${i * 70}ms` });

interface Props {
  onEnter: () => void;
}

/**
 * NEVA NETWORK — public landing / identity page (Phase 5). A premium, dark holographic marketing
 * page that explains the game, world, gameplay loop, sectors, Private Grid, a careful future-coin
 * UTILITY CONCEPT (not live — no sale), the roadmap, and a waitlist call-to-action.
 *
 * It is the public entry (`/`); pressing PLAY ALPHA PROTOTYPE calls `onEnter`, which App swaps the
 * landing for the game (the prototype route is unchanged). Pure CSS visuals — no heavy 3D / assets.
 * No gameplay, economy, save, contracts, or token sale here; this is identity only.
 */

const NAV: { label: string; href: string }[] = [
  { label: 'Game', href: '#concept' },
  { label: 'Sectors', href: '#sectors' },
  { label: 'Private Grid', href: '#grid' },
  { label: 'Roadmap', href: '#roadmap' },
  { label: 'Coin Concept', href: '#coin' },
  { label: 'Waitlist', href: '#waitlist' },
];

const CONCEPT = [
  { k: 'DATA', d: 'Extract data from memory and vault nodes to raise your access level and fund your grid.' },
  { k: 'TRACE', d: 'Every action leaves trace. Push too hard and the network locks you out — manage the pressure.' },
  { k: 'KEYS', d: 'Recover access keys to open locked firewalls and force secured routes.' },
  { k: 'PRIVATE GRID', d: 'Build a private home grid of modules that strengthen every run you make.' },
  { k: 'CORE', d: 'Trace, open and secure the deep core systems at the heart of each sector.' },
  { k: 'SECTORS', d: 'Each sector is a hand-built network with its own nodes, threats and objective arc.' },
];

const LOOP = ['EXPLORE', 'LOCATE', 'EXTRACT', 'MANAGE TRACE', 'UNLOCK', 'SECURE CORE', 'OPEN NEXT SECTOR'];

const ALPHA = [
  'Sector A01 — Memory Grid · Missions 00–07',
  'Sector A02 — Deep Network · Missions 08–20',
  'Alpha Core objective arc',
  'Mission guidance + objective targeting',
  'Private Grid modules & upgrades',
  'Trace / corruption pressure systems',
];

const SECTORS = [
  { id: 'A01', name: 'MEMORY GRID', status: 'LIVE', d: 'The surface grid. Learn to breach, trace, extract and descend.' },
  { id: 'A02', name: 'DEEP NETWORK', status: 'LIVE', d: 'Deeper layers, higher trace, the firewalls, the relay collapse and the Alpha Core arc.' },
  { id: 'A03', name: 'CORRUPTION FIELD', status: 'PLANNED', d: 'A corrupted frontier — containment under sustained pressure. In design.' },
];

const MODULES = [
  { k: 'DATA VAULT', d: 'More data retention + a bonus on every export.' },
  { k: 'TRACE SHIELD', d: 'Softens the trace pressure of your actions.' },
  { k: 'KEY CACHE', d: 'Improves access-key yield and handling.' },
  { k: 'SIGNAL RELAY', d: 'Signal resistance + wider route repair.' },
];

const COIN_UTILITY = [
  'Access to premium / future sectors',
  'Cosmetic identity & visual upgrades',
  'Player profile progression',
  'Community events & seasons',
  'Creator / player challenges',
  'Marketplace-style in-game assets — only if later approved',
  'Community feedback / governance-style input — only if legally safe later',
];

const ROADMAP: { phase: string; name: string; status: 'DONE' | 'CURRENT' | 'NEXT' | 'PLANNED'; items: string[] }[] = [
  { phase: 'PHASE 1', name: 'Prototype Foundation', status: 'DONE', items: ['Missions 00–07', 'Core gameplay loop'] },
  { phase: 'PHASE 2', name: 'Playtest Patch', status: 'DONE', items: ['Onboarding clarity', 'Mission guidance', 'Save / load stability'] },
  { phase: 'PHASE 3', name: 'Gameplay Expansion', status: 'DONE', items: ['Missions 08–20', 'Sector A02', 'Alpha Core arc'] },
  { phase: 'PHASE 4', name: 'Cinematic Upgrade', status: 'DONE', items: ['Sector visuals', 'Core moments', 'Target markers', 'HUD readability'] },
  { phase: 'PHASE 5', name: 'Public Identity', status: 'CURRENT', items: ['Landing page', 'Waitlist', 'Community'] },
  { phase: 'PHASE 6', name: 'Gameplay Variety / Alpha Polish', status: 'NEXT', items: ['Action variety', 'Per-mission depth'] },
  { phase: 'PHASE 7', name: 'Backend / Accounts / Waitlist', status: 'PLANNED', items: ['Accounts', 'Live waitlist'] },
  { phase: 'PHASE 8', name: 'Token Utility Design + Legal / Sharia Review', status: 'PLANNED', items: ['Utility design', 'Legal + Sharia review'] },
  { phase: 'PHASE 9', name: 'Testnet / Presale Infrastructure', status: 'PLANNED', items: ['Only after approval'] },
];

/** A small, purely-decorative network constellation for the hero (CSS-animated SVG, no JS loop). */
function HeroNet() {
  const nodes = [
    [40, 70], [120, 40], [108, 120], [185, 86], [60, 150],
    [160, 160], [220, 130], [95, 195], [200, 200],
  ];
  const edges: [number, number][] = [
    [0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [3, 6], [2, 5], [5, 7], [5, 6], [6, 8], [7, 8], [4, 7],
  ];
  return (
    <svg className="lp-net" viewBox="0 0 260 240" aria-hidden>
      <g className="lp-net__edges">
        {edges.map(([a, b], i) => (
          <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} />
        ))}
      </g>
      <g className="lp-net__nodes">
        {nodes.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i === 3 ? 5.5 : 3} style={{ animationDelay: `${(i * 0.37).toFixed(2)}s` }} />
        ))}
      </g>
    </svg>
  );
}

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="lp-section">
      <div className="lp-section__head lp-reveal">
        <span className="lp-eyebrow">{eyebrow}</span>
        <h2 className="lp-h2">{title}</h2>
      </div>
      {children}
    </section>
  );
}

type WaitState = 'idle' | 'submitting' | 'success' | 'duplicate' | 'error';
type RedeemState = 'idle' | 'submitting' | 'success' | 'error';

export default function Landing({ onEnter }: Props) {
  const [wait, setWait] = useState<WaitState>('idle');
  const [waitlistNotice, setWaitlistNotice] = useState<string | null>(null);
  // Phase 8 — invite-code redemption (early access). Local-only success flag; never gates the game.
  const [redeem, setRedeem] = useState<RedeemState>(() => (loadEarlyAccess() ? 'success' : 'idle'));
  const [redeemNotice, setRedeemNotice] = useState<string | null>(() => (loadEarlyAccess() ? 'EARLY ACCESS UNLOCKED' : null));
  const rootRef = useRef<HTMLDivElement>(null);

  // Real submission → POST /api/waitlist (server stores it). We ONLY show success after the API
  // confirms — never fake it. Dev/preview proxy `/api` to the Node server (see vite.config.ts);
  // if the server isn't running the catch shows the error state honestly.
  const onWaitlistSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (wait === 'submitting' || wait === 'success') return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get('email') ?? '').trim();
    const callsign = String(fd.get('name') ?? '').trim();
    const role = String(fd.get('role') ?? 'Player');
    if (!email) {
      setWait('error');
      setWaitlistNotice('Valid email is required.');
      return;
    }
    setWait('submitting');
    setWaitlistNotice(null);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, callsign, role, source: 'landing' }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; duplicate?: boolean; error?: string };
      if (data.duplicate) {
        setWait('duplicate');
        setWaitlistNotice('You are already on the waitlist.');
      } else if (res.ok && data.ok) {
        setWait('success');
        setWaitlistNotice('Signal received. You are on the NEVA Network waitlist.');
        form.reset();
      } else {
        setWait('error');
        setWaitlistNotice(data.error ?? 'Could not submit. Please try again.');
      }
    } catch {
      setWait('error');
      setWaitlistNotice('Could not submit. Please try again.');
    }
  }, [wait]);

  // Redeem an invite code → POST /api/invite/redeem. On success we store a LOCAL-ONLY early-access
  // flag (earlyAccess.ts) — it never touches the game save, the profile, or progression, and the
  // alpha stays open to everyone. Failure shows the spec's "INVALID OR USED CODE" message.
  const onRedeemSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (redeem === 'submitting' || redeem === 'success') return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const inviteCode = String(fd.get('inviteCode') ?? '').trim().toUpperCase();
    const callsign = String(fd.get('callsign') ?? '').trim();
    if (!inviteCode) {
      setRedeem('error');
      setRedeemNotice('INVALID OR USED CODE');
      return;
    }
    setRedeem('submitting');
    setRedeemNotice(null);
    try {
      const res = await fetch('/api/invite/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode, callsign: callsign || undefined }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; accessStatus?: string };
      if (res.ok && data.ok) {
        saveEarlyAccess({ earlyAccess: true, code: inviteCode, callsign: callsign || null, redeemedAt: new Date().toISOString() });
        setRedeem('success');
        setRedeemNotice('EARLY ACCESS UNLOCKED');
        form.reset();
      } else {
        setRedeem('error');
        setRedeemNotice('INVALID OR USED CODE');
      }
    } catch {
      setRedeem('error');
      setRedeemNotice('Could not reach the network. Please try again.');
    }
  }, [redeem]);

  // Panel reveal — each `.lp-reveal` panel fades/slides in WITH its text as it scrolls into view
  // (replays on every reload since the component remounts). Above-the-fold panels trip immediately.
  // Honors reduced-motion (and lacks-IntersectionObserver) by showing everything at once.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>('.lp-reveal'));
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const reveal = (el: HTMLElement) => {
      el.classList.add('is-in');
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            reveal(e.target as HTMLElement);
            io.unobserve(e.target);
          }
        }
      },
      { root, threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="lp" ref={rootRef}>
      <div className="lp__bg" aria-hidden />

      {/* ---- sticky nav ---- */}
      <header className="lp-nav">
        <a className="lp-nav__brand" href="#top">
          <span className="lp-nav__mark" aria-hidden />
          NEVA<span className="lp-nav__brand-dim"> NETWORK</span>
        </a>
        <nav className="lp-nav__links">
          {NAV.map((n) => (
            <a key={n.href} href={n.href}>{n.label}</a>
          ))}
        </nav>
        <button className="lp-btn lp-btn--primary lp-nav__cta" type="button" onClick={onEnter}>
          Play Prototype
        </button>
      </header>

      {/* ---- hero ---- */}
      <section id="top" className="lp-hero">
        <div className="lp-hero__net" aria-hidden><HeroNet /></div>
        <div className="lp-hero__scrim" aria-hidden />
        <div className="lp-hero__center">
          <span className="lp-hero__eyebrow">SPATIAL MEMORY INTERFACE · ALPHA PROTOTYPE</span>
          <h1 className="lp-hero__title"><span>NEVA</span><span>NETWORK</span></h1>
          <div className="lp-hero__rule" aria-hidden />
          <p className="lp-hero__tag">Breach the Memory Grid. Enter the network, secure the core.</p>
          <p className="lp-hero__sub">
            A cinematic strategy-puzzle network game — explore hidden sectors, extract data,
            manage trace pressure, unlock private-grid modules, and secure the deeper core systems.
          </p>
          <div className="lp-hero__ctas">
            <button className="lp-btn lp-btn--primary" type="button" onClick={onEnter}>Play Alpha Prototype</button>
            <a className="lp-btn lp-btn--ghost" href="#waitlist">Join Waitlist</a>
            <a className="lp-btn lp-btn--ghost" href="#roadmap">View Roadmap</a>
          </div>
          <span className="lp-hero__coord">// SYSTEM ONLINE · SECTOR A01 · DEPTH 01</span>
        </div>
      </section>

      {/* ---- game concept ---- */}
      <Section id="concept" eyebrow="THE NETWORK" title="A world made of nodes">
        <p className="lp-lead lp-reveal">
          NEVA Network is a deterministic 3D grid of glowing nodes. You fly through it, focus a node,
          and decide how to breach it — without letting trace lock you out.
        </p>
        <div className="lp-cards">
          {CONCEPT.map((c, i) => (
            <div className="lp-card lp-reveal" style={rd(i)} key={c.k}>
              <span className="lp-card__tag">{c.k}</span>
              <p className="lp-card__d">{c.d}</p>
            </div>
          ))}
        </div>
        <div className="lp-loop lp-reveal">
          {LOOP.map((s, i) => (
            <span className="lp-loop__step" key={s}>
              {s}{i < LOOP.length - 1 && <i className="lp-loop__arrow" aria-hidden>→</i>}
            </span>
          ))}
        </div>
      </Section>

      {/* ---- current alpha ---- */}
      <Section id="alpha" eyebrow="WHAT EXISTS NOW" title="Current alpha prototype">
        <div className="lp-alpha">
          <ul className="lp-list lp-reveal">
            {ALPHA.map((a) => <li key={a}>{a}</li>)}
          </ul>
          <div className="lp-alpha__note lp-reveal" style={rd(1)}>
            <span className="lp-chip lp-chip--alpha">ALPHA</span>
            <p>
              This is a playable alpha prototype — not a finished, launched game. The arc runs from
              Mission 00 to Mission 20 across two sectors, and is expanding.
            </p>
          </div>
        </div>
      </Section>

      {/* ---- sectors ---- */}
      <Section id="sectors" eyebrow="THE WORLD" title="Sector map">
        <div className="lp-sectors">
          {SECTORS.map((s, i) => (
            <div className={`lp-sector lp-reveal lp-sector--${s.status.toLowerCase()}`} style={rd(i)} key={s.id}>
              <div className="lp-sector__top">
                <span className="lp-sector__id">SECTOR {s.id}</span>
                <span className={`lp-chip lp-chip--${s.status.toLowerCase()}`}>{s.status}</span>
              </div>
              <div className="lp-sector__name">{s.name}</div>
              <p className="lp-sector__d">{s.d}</p>
            </div>
          ))}
        </div>
        <p className="lp-note lp-reveal">More sectors and deeper systems are planned. Phases are directional, not dated.</p>
      </Section>

      {/* ---- private grid ---- */}
      <Section id="grid" eyebrow="PROGRESSION" title="Build your private grid">
        <p className="lp-lead lp-reveal">
          Between breaches you build your own internal network — a private grid of modules that
          compound across every mission. Your grid only gets stronger the deeper you go.
        </p>
        <div className="lp-cards lp-cards--4">
          {MODULES.map((m, i) => (
            <div className="lp-card lp-card--mod lp-reveal" style={rd(i)} key={m.k}>
              <span className="lp-card__tag">{m.k}</span>
              <p className="lp-card__d">{m.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ---- coin utility concept (careful) ---- */}
      <Section id="coin" eyebrow="FUTURE LAYER" title="NEVA Coin — future utility concept">
        <div className="lp-coin lp-reveal">
          <div className="lp-coin__chips">
            <span className="lp-chip lp-chip--warn">FUTURE UTILITY CONCEPT</span>
            <span className="lp-chip lp-chip--warn">NOT LIVE</span>
            <span className="lp-chip lp-chip--warn">NO PUBLIC SALE</span>
          </div>
          <p className="lp-lead">
            NEVA Coin is an early, planned ecosystem layer — a concept only. It is <b>not live</b>, and
            there is <b>no public sale, presale, or ICO</b> at this stage. Any future token-related
            feature will require legal, technical, and Sharia review before launch.
          </p>
          <div className="lp-coin__cols">
            <div>
              <h3 className="lp-h3">Directions being explored</h3>
              <ul className="lp-list lp-list--mini">
                {COIN_UTILITY.map((u) => <li key={u}>{u}</li>)}
              </ul>
            </div>
            <div className="lp-coin__safe">
              <h3 className="lp-h3">What this is not</h3>
              <p>
                We make <b>no financial or profit promises</b>. NEVA Coin is not an investment, not
                passive income, and not a staking product. Nothing here is a buy/sell offer. Utility
                directions may change or be dropped after review.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ---- roadmap ---- */}
      <Section id="roadmap" eyebrow="THE PLAN" title="Roadmap">
        <div className="lp-roadmap">
          {ROADMAP.map((p, i) => (
            <div className={`lp-phase lp-reveal lp-phase--${p.status.toLowerCase()}`} style={rd(i)} key={p.phase}>
              <div className="lp-phase__head">
                <span className="lp-phase__id">{p.phase}</span>
                <span className={`lp-chip lp-chip--${p.status.toLowerCase()}`}>{p.status}</span>
              </div>
              <div className="lp-phase__name">{p.name}</div>
              <ul className="lp-phase__items">
                {p.items.map((it) => <li key={it}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* ---- waitlist / community ---- */}
      <Section id="waitlist" eyebrow="EARLY ACCESS" title="Join the First Signal">
        <p className="lp-lead lp-reveal">
          Be among the first operators on the network. Leave a signal and we'll reach out as accounts
          and early access come online.
        </p>
        <form className="lp-form lp-reveal" style={rd(1)} onSubmit={onWaitlistSubmit}>
          <div className="lp-form__row">
            <input className="lp-input" type="email" name="email" placeholder="you@signal.net" aria-label="Email" maxLength={254} required disabled={wait === 'submitting' || wait === 'success'} />
            <input className="lp-input" type="text" name="name" placeholder="Callsign (optional)" aria-label="Name (optional)" maxLength={80} disabled={wait === 'submitting' || wait === 'success'} />
            <select className="lp-input lp-input--select" name="role" aria-label="Role" defaultValue="Player" disabled={wait === 'submitting' || wait === 'success'}>
              <option>Player</option>
              <option>Builder</option>
              <option>Investor</option>
              <option>Community</option>
              <option>Other</option>
            </select>
          </div>
          <div className="lp-form__ctas">
            <button className="lp-btn lp-btn--primary" type="submit" disabled={wait === 'submitting' || wait === 'success'}>
              {wait === 'submitting' ? 'Joining…' : wait === 'success' ? 'Joined' : 'Join Waitlist'}
            </button>
            <button className="lp-btn lp-btn--ghost" type="submit" disabled={wait === 'submitting' || wait === 'success'}>Follow Development</button>
            <button className="lp-btn lp-btn--ghost" type="submit" disabled={wait === 'submitting' || wait === 'success'}>Request Early Access</button>
          </div>
          {waitlistNotice && (
            <p className={`lp-form__notice lp-form__notice--${wait}`} role="status">{waitlistNotice}</p>
          )}
          <p className="lp-form__fine">We only use your email for NEVA Network alpha updates. No token sale is active.</p>
        </form>

        {/* ---- invite code redemption (early access) ---- */}
        <div className="lp-ea lp-reveal" style={rd(2)}>
          <h3 className="lp-h3">Have an invite code?</h3>
          <p className="lp-ea__lead">
            Redeem an early-access code to flag this device with the EARLY ACCESS badge. The alpha is
            open to everyone — this just prepares your client for the accounts phase. No login or
            payment, and your code can be redeemed once.
          </p>
          {redeem === 'success' ? (
            <div className="lp-ea__ok" role="status">
              <span className="lp-chip lp-chip--done">EARLY ACCESS UNLOCKED</span>
              <span className="lp-ea__ok-note">Stored locally on this device.</span>
            </div>
          ) : (
            <form className="lp-form lp-ea__form" onSubmit={onRedeemSubmit}>
              <div className="lp-form__row">
                <input className="lp-input" type="text" name="inviteCode" placeholder="NEVA-XXXX-XXXX" aria-label="Invite code" maxLength={20} required disabled={redeem === 'submitting'} />
                <input className="lp-input" type="text" name="callsign" placeholder="Callsign (optional)" aria-label="Callsign (optional)" maxLength={80} disabled={redeem === 'submitting'} />
              </div>
              <div className="lp-form__ctas">
                <button className="lp-btn lp-btn--primary" type="submit" disabled={redeem === 'submitting'}>
                  {redeem === 'submitting' ? 'Redeeming…' : 'REDEEM ACCESS'}
                </button>
              </div>
              {redeemNotice && (
                <p className={`lp-form__notice lp-form__notice--${redeem}`} role="status">{redeemNotice}</p>
              )}
            </form>
          )}
        </div>
      </Section>

      {/* ---- footer ---- */}
      <footer className="lp-footer">
        <div className="lp-footer__top lp-reveal">
          <div className="lp-footer__brand">
            <span className="lp-nav__mark" aria-hidden />
            NEVA NETWORK
            <span className="lp-footer__tagline">Breach the Memory Grid.</span>
          </div>
          <nav className="lp-footer__links">
            {NAV.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}
            <button className="lp-footer__play" type="button" onClick={onEnter}>Play Alpha Prototype</button>
          </nav>
        </div>
        <div className="lp-footer__disc">
          <p>
            NEVA Coin is a future utility concept and is not currently available for purchase. No token
            sale, ICO, or presale is live at this stage. Any future token-related feature will require
            legal, technical, and Sharia review before launch.
          </p>
          <p>NEVA Network is currently an alpha prototype.</p>
        </div>
        <div className="lp-footer__base">© {new Date().getFullYear()} NEVA NETWORK · Alpha Prototype · Not financial advice.</div>
      </footer>
    </div>
  );
}
