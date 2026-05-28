# NEVA NETWORK — "Six-Month Grid" Design Spec
**Date:** 2026-05-28
**Author:** Max + Claude (Opus 4.7)
**Status:** Approved direction; implementation plan pending
**Scope:** Turn the existing Mission 00–20 base into a 6+ month, event-driven, EVE-inspired
single-player experience with four asymmetric class loops.

---

## 0. Executive Summary (one-page TL;DR)

NEVA Network already ships as a 20-mission narrative puzzle game about decoding a corrupted
data grid. **This spec extends it into a long-lived experience** structured around
**8-week Seasons** (Path of Exile league cadence) where players choose one of **four
asymmetric classes** to act in a shared world of nodes, data, and factions.

- **Months 0–3 (Season 0 — "First Cipher"):** Existing M00–M20 wraps as the **prologue**;
  daily/weekly event layer launches in Sector A02 for the **Operator** class only.
- **Months 3–5 (Season 1):** **Corsair** class ships (breach-and-run).
- **Months 5–7 (Season 2):** **Ghost** class ships (possession / spread).
- **Months 7–10 (Season 3):** **Architect** class ships (build-and-defend, async).
- **Months 10+:** Sandbox-AI faction layer; UGC; eventual token economy (Sharia/legal gated).

Players will be retained by three nested loops:
1. **Daily Contract (≤ 15 min)** — quick, procedural, faction-flavored.
2. **Weekly Anomaly (1–2 h)** — multi-stage, leaderboard, story-bearing.
3. **Seasonal Tentpole (8 weeks)** — narrative arc with permanent reward at finale.

Content is sustained via **hybrid event sourcing**: NEVA Core LLM drafts events from a
template library, you (Max) approve/edit in an admin panel, scheduler pushes to live
players. ~20 minutes per event vs. 2–3 hours hand-authored.

No token in this spec, but the economy is architected as a **token-ready abstraction**
so a future Sharia-and-legal-cleared utility + earn + governance token can plug in.

---

## 1. Vision & Three Pillars

### Vision statement
> NEVA Network is a long-lived single-player "data grid" sandbox. You are an
> **Operator** (or Corsair, Ghost, Architect) acting on a 3D holographic network
> that *changes every week*. The grid has weather. The factions have agendas. The
> finale is never the same season twice.

### Three Pillars (borrowed from EVE Online, adapted)

| # | Pillar | What it means here |
|---|---|---|
| 1 | **Systemic, not scripted** | Build mechanisms that interact. Avoid hand-authored content treadmills. |
| 2 | **Class-asymmetric, world-shared** | Four classes see/do *different things* in the *same grid*. They are complementary, not parallel. |
| 3 | **Seasons over patches** | The 8-week season is the rhythm. Theme, hook, climax, reset. The drumbeat is the product. |

### What we explicitly REJECT
- ❌ "Patch every two weeks" treadmills (Destiny 2 is abandoning this in 2026 — content burnout).
- ❌ Hand-authoring every event (unsustainable for a solo dev).
- ❌ Hard economy resets that wipe player progress (the *base* persists; sector + season buffs reset).
- ❌ Real-money pay-to-win or pay-to-progress mechanics.
- ❌ Premature MMO scope (single-player + async social only, until proven).

---

## 2. Nested Core Loop

NEVA Network is structured as **three loops, nested by time-scale.**

```
            ┌──────────────── Season (8 weeks) ─────────────────┐
            │  Theme · Tentpole story · Meta tilt · Finale       │
            │                                                    │
            │   ┌──────────── Week (7 days) ─────────────┐       │
            │   │  Anomaly (1-2h) · Faction rep · Drop   │       │
            │   │                                         │       │
            │   │   ┌─── Day (15 min) ──────────────┐    │       │
            │   │   │  Daily Contract + Streak       │    │       │
            │   │   └────────────────────────────────┘    │       │
            │   └─────────────────────────────────────────┘       │
            └────────────────────────────────────────────────────┘
```

### Daily loop (≤ 15 min)
1. Login → see **Daily Contract** card on HUD (faction-flavored, class-relevant).
2. Travel to target node → execute class-signature action (Decode / Breach / Possess / Defend).
3. Claim reward (Lore Shards, Black Credits, Coherence, or Grid Power).
4. Streak counter increments (5-, 10-, 20-day streak unlocks).

### Weekly loop (1–2 h)
1. **Anomaly** unlocks each Monday at 00:00 UTC — appears as a glowing event-node on the grid.
2. Multi-stage event (typically 4–7 stages, branching).
3. Earns higher-tier currency + cosmetic + faction reputation + lore page.
4. Asynchronous leaderboard (no real-time PvP — submission-based).

### Seasonal loop (8 weeks)
1. Week 1: **Reveal** — landing page + in-game broadcast + opening cinematic.
2. Weeks 2–4: **Spread** — anomalies escalate in difficulty; faction reputation matters.
3. Week 4: **Twist** — story turns; new mechanic unlocks.
4. Weeks 5–7: **Build** to climax.
5. Week 7: **Finale Tentpole** — limited-time multi-hour mission; permanent unlock granted.
6. Week 8: **Cooldown** — Nightwave-style interim. All rerunnable. No FOMO.

### Soft Reset (between seasons)
What persists vs. what resets:

| Persists (account-wide) | Resets each season |
|---|---|
| Player profile (callsign, level, history) | Sector A02 seed (regenerates) |
| Class XP and unlocked skills | Season-only buffs and modifiers |
| Architect's base / private grid | Season leaderboard |
| Lore unlocks & achievements | Faction reputation (carries 20%) |
| Cosmetics & cipher tools | Daily / Weekly progress |

This is the PoE soft-reset model. Returning players come back to *new* without losing identity.

---

## 3. The Four Classes

### Class summary table

| Class | Signature mechanic | Core tools | Currency | Fantasy | Ship phase |
|---|---|---|---|---|---|
| **Operator** | **DECODE** — cipher puzzles on nodes (Caesar → frequency → pattern → symbolic) | Cipher Tablet, Pattern Lens | **Lore Shards** | Detective / archaeologist / philosopher | Season 0 (existing M00–M20 mechanics reused) |
| **Corsair** | **BREACH-AND-RUN** — timed intrusion; ICE reacts; trace path, dodge alarms, exfil before lockdown | Spoofer, Ghost-tail, Snip | **Black Credits** | Cyberpunk runner — high-tension | Season 1 |
| **Ghost** | **POSSESSION** — become nodes; spread "presence"; each node grants a power; manage Coherence budget | Tendril, Echo, Resonate | **Coherence** | SOMA / Soul Hackers — philosophical | Season 2 |
| **Architect** | **BUILD-AND-DEFEND** — construct private grid; cipher walls, ICE traps; async raids while away | Wall, Trap, Tap (yield node) | **Grid Power** | Factorio + tower defense + Stardew | Season 3 |

### Per-class detail

#### 3.1 Operator (Season 0)
- **Loop:** Locate node → analyze signature → identify cipher type → solve → extract DATA.
- **Skill tree (20 skills):** Cipher-type unlocks (Caesar, Vigenère, frequency, symbol-substitution,
  graph-walk, light-physics, NEVA-whisper interpretation, etc.).
- **Signature ability (Mastery 4):** "Echo Read" — view another operator's solved-path on a node.
- **Reuses:** ~80% of M00–M20 systems. **Lowest engineering risk.**

#### 3.2 Corsair (Season 1)
- **Loop:** Survey target sector → pick entry vector → execute timed breach → exfil → fence data
  on a black market (NPC).
- **Skill tree:** Stealth, route obfuscation, ICE-knowledge, multi-node chaining.
- **Signature ability:** "Cold Trail" — leave a fake path that ICE follows for N seconds.
- **New systems needed:** ICE/timer subsystem, black-market vendor, breach-timer HUD.

#### 3.3 Ghost (Season 2)
- **Loop:** Find resonant nodes → infest (Tendril) → grow Coherence → unlock memory fragments
  → confront SELF (a hallucinated rival operator).
- **Skill tree:** Possession depth, coherence economy, mass-resonance, echo recall.
- **Signature ability:** "Singularity" — collapse a node-cluster into a permanent personal anchor.
- **New systems needed:** Coherence resource, possession graph overlay, lore-fragment system.

#### 3.4 Architect (Season 3)
- **Loop:** Survey personal sector → build (walls, ICE, taps) → defend (async raids) → harvest
  yield → upgrade.
- **Skill tree:** Build economy, ICE design, encryption tiers, raid-defense replays.
- **Signature ability:** "Bastion Mode" — your base broadcasts on the public grid as a notable
  landmark; visiting it grants other players a small reward.
- **New systems needed:** Base persistence, async raid replay system (Clash-of-Clans-style),
  offline yield calculator, leaderboards for "most-attacked / best-defended."

### Cross-class interactions (the "EVE feel")
- **Corsair** steals encrypted data → **Operator** decrypts faster → split rewards.
- **Ghost** can infest an **Architect**'s base → Architect defends (asynchronously).
- **Operator** can read **Ghost**'s past Echo paths.
- Multi-classing is allowed; pick a primary, dabble. There is no exclusivity gate.

### Shared progression layer
- **Operator Profile** (already exists, from the original nevanetwork "Player Profile / Phase 7" work — not to be confused with this spec's roadmap phases) is the account-wide spine. Persists everything.
- **Class Mastery**: 4 tiers per class. Granted by completing a season in that role.
- **Account-wide unlocks:** Cosmetics, lore pages, achievements, NEVA Core ranks.

---

## 4. Season Structure & Event System

### Season anatomy (8-week pacing)

```
Week:  1 ─────── 2 ─────── 3 ─────── 4 ─────── 5 ─────── 6 ─────── 7 ─────── 8
       │  Reveal │ Spread  │ Pressure│  Twist  │  Build  │ Climax  │ Finale  │ Cooldown
       │         │         │         │         │         │         │         │
Story: Tentpole intro          Mid-arc reveal              Tentpole finale       Lore epilogue
Daily: Easy contracts──────Medium──────────────Hard───────────Brutal──────────Mixed
Weekly Anomaly: A1 ──── A2 ──── A3 ──── A4 ──── A5 ──── A6 ──── A7 ──── (rerun)
Modifier:    Season Mechanic active throughout (e.g. "Corruption Tide")
```

### The Four Event Archetypes (the AI generation library)
Every event is one of these. Templates with slots. This is why AI can author them sustainably.

| Archetype | What it is | Daily form (15 min) | Weekly form (1–2 h) |
|---|---|---|---|
| **Breach** | Get IN, get data, get OUT. Combat-of-puzzles. | 1 node, 1 cipher, time limit | Multi-node chain, ICE escalation |
| **Anomaly** | Something weird in the grid — investigate, document. | Single weird node, 1 question | 5-node mystery, branching lore |
| **Faction Op** | One of 4 in-world factions wants something. Reputation outcomes. | "Deliver X data to Faction Y" | Full mission with twist + betrayal option |
| **Tide** | World-wide modifier event. Affects everyone for N days. | N/A | "Corruption Tide for 48h: nodes pulse, decryption costs 2x but loot doubled" |

### Event generation pipeline

```
Archetype template + Season theme + Seed
        ↓
NEVA Core LLM drafts: nodes, cipher type, narration, rewards
        ↓
Admin Event Editor (Max reviews/edits — ~20 min per event)
        ↓
Event Scheduler (cron)
        ↓
/api/events/active served to game client
```

### Event System Architecture

```
                ┌─────────────────────────────────┐
                │  Admin Event Editor (Max)       │
                │   approve / edit AI drafts      │
                │   schedule cron                 │
                │   pin / unpin                   │
                └────────────┬────────────────────┘
                             ▼
   ┌──────────────────────────────────────────────────┐
   │  Backend (extends current Node :8787)            │
   │  ┌──────────────┐  ┌─────────────────┐           │
   │  │ Event Store  │  │ Scheduler (cron)│           │
   │  └──────┬───────┘  └────────┬────────┘           │
   │         │                   │                    │
   │  ┌──────▼───────────────────▼──────┐             │
   │  │ /api/events/active              │             │
   │  │ /api/events/claim               │             │
   │  │ /api/leaderboard/:season        │             │
   │  └──────────────────┬──────────────┘             │
   └─────────────────────┼────────────────────────────┘
                         ▼
              ┌──────────────────────┐
              │  Game client         │
              │  Daily / Weekly HUD  │
              │  Anomaly UI panel    │
              │  Season tracker      │
              └──────────────────────┘
```

**Implementation notes:**
- All event content lives **server-side**, fetched on login.
- Save remains local (`save.ts`); **rewards/claims** ping the server (idempotent).
- Offline players catch up next login — no FOMO. Missed weekly Anomalies always rerun in Cooldown week.
- Backend extends the existing Phase 8 zero-dep server (no DB, JSON stores) for Season 0;
  introduce SQLite at Season 1 when event volume justifies it.

### Sample Season 0 — "First Cipher" (the alpha)
- **Theme:** The grid is waking up. Strange pulses in the deep network.
- **Mechanic:** First exposure to NEVA Core *unreliable* whispers — hints sometimes lie.
- **Tentpole story:** Track the pulse source → discover it is an *older operator's echo* →
  confront and absorb their cipher techniques.
- **Reward at finale:** Permanent **"Pattern Lens"** unlock (visual filter on all future nodes).
- **Reused content:** Existing Missions 00–20 become **Season 0 Prologue** — finishing M20
  unlocks the seasonal layer. Players who already finished M20 skip the prologue.

---

## 5. Economy, Progression, and Token-Ready Architecture

### Currencies (all in-game, no blockchain in this spec)

| Currency | Earned by | Spent on | Persistence |
|---|---|---|---|
| **DATA** (existing) | Decoding nodes | Tool upgrades, base modules | Per season |
| **Memory Shards** (existing) | Mission completion | Cipher analysis, identity | Account-wide |
| **Access Keys** (existing) | Faction Ops | Unlocking firewalls | Per season |
| **Signal Energy** (existing) | Cooldown weeks, streaks | Boosting actions | Per season |
| **Core Fragments** (existing) | Tentpole finales | Permanent class unlocks | Account-wide |
| **Lore Shards** *(new — Operator)* | Daily Contracts | Lore archive | Account-wide |
| **Black Credits** *(new — Corsair)* | Breach exfils, fencing | Tools, contracts | Per season |
| **Coherence** *(new — Ghost)* | Possession | Permanent grid bonds | Account-wide |
| **Grid Power** *(new — Architect)* | Yield taps | Base expansion | Account-wide |

### Progression structure

```
                  ┌──────────────────────────────┐
                  │   Operator Profile (Account) │
                  │   — Callsign, Level, History │
                  │   — Lore pages, Achievements │
                  │   — All Class Masteries      │
                  └──────────────┬───────────────┘
                                 │
        ┌────────────────┬───────┴────────┬────────────────┐
        │                │                │                │
   ┌────▼────┐     ┌────▼────┐     ┌────▼────┐     ┌────▼────┐
   │Operator │     │ Corsair │     │  Ghost  │     │Architect│
   │  Tree   │     │  Tree   │     │  Tree   │     │  Tree   │
   │ 20 skl  │     │ 20 skl  │     │ 20 skl  │     │ 20 skl  │
   │ Mast 1-4│     │ Mast 1-4│     │ Mast 1-4│     │ Mast 1-4│
   └─────────┘     └─────────┘     └─────────┘     └─────────┘
        │                │                │                │
        └────────────────┴────────────────┴────────────────┘
                                 │
                  ┌──────────────▼───────────────┐
                  │   Per-Season Layer            │
                  │   — Season XP, Pass, Leaderbd │
                  │   — Soft-resets per season    │
                  └──────────────────────────────┘
```

### Token-Ready Abstraction

Per the user's long-term intent, the economy is architected so a token can plug in
**after** Sharia + legal review clears.

```
   In-game Currency Wallet (Phase 0)
       │   abstract interface
       ▼
   class WalletProvider {
     balance(currency)
     spend(currency, amount, reason)
     earn(currency, amount, source)
     transferable: bool   ← always false today
   }
       │
       │   later swap-in:
       ▼
   On-Chain Wallet Provider (Phase 7+, after legal)
   — Same interface, real on-chain transfer
   — Token contract address per currency
```

**Architectural rules (enforced from Day 1):**
- All currency mutations go through `WalletProvider` — no direct `state.data += 10`.
- Every `spend`/`earn` carries a **reason code** (audit trail for future on-chain proofs).
- "Transferability" is a per-currency flag, **always false in this spec.**
- No currency-balance UI labels mention "tokens," "coins," "crypto," or wallet addresses.

When the token decision is made (Phase 7+), only the `WalletProvider` implementation changes.
No gameplay code needs rewriting. **No Web3 dependencies added before that decision.**

### Sharia/Legal Pre-Conditions (for future token activation)
Token integration is BLOCKED until ALL of:
- Independent Sharia review (gharar / maisir / qimar analysis).
- Independent legal review (US + EU + KSA + UAE securities law).
- Whitepaper draft + audit-firm pre-screen.
- Clear utility-vs-security classification.

Until then, the abstraction is just clean code hygiene.

---

## 6. Integration with the Existing NEVA Network Base

### What we keep AS-IS
- **Missions 00–20** remain canonical (CLAUDE.md guardrail). They become **Season 0 Prologue**.
- **Sector A01** stays the tutorial / story zone.
- **Sector A02** procedural grid (`sectorGen.ts`) becomes the **Seasonal World** — regenerates
  each season with new seed.
- **NEVA Core AI** (backend OpenAI) gains a second responsibility: drafting event content.
- **Player Profile** (Phase 7, local-only) gains class progression fields.
- **Backend** (`server/`, Phase 8 zero-dep) extends with Event Store + Scheduler.
- **Landing page** gains a "Current Season" tile.

### What we EXTEND
- **Save (`save.ts`)** — additive migration v2: add `classProgression`, `seasonState`, `wallet`.
  Old saves load fine; new fields default-initialized.
- **HUD** — add Daily Contract slot (top-right), Season tracker (top-left), Anomaly indicator (grid).
- **NEVA Terminal** (Space) — new commands: `season status`, `season claim`, `class switch`.
- **Inspection Panel** — gain class-specific action buttons (Decode / Breach / Possess / Defend).

### What we ADD (new modules — see Roadmap §7)
- `seasons.ts` — Season state, soft-reset logic.
- `classes/operator.ts`, `classes/corsair.ts`, `classes/ghost.ts`, `classes/architect.ts`.
- `events/archetype-{breach,anomaly,faction,tide}.ts`.
- `wallet.ts` — currency abstraction.
- `server/events/` — Event Store, Scheduler, Admin Editor backend.
- `server/admin-event-editor/` — minimal admin UI (auth-gated by existing `NEVA_ADMIN_SECRET`).
- `server/ai-event-drafter.ts` — NEVA Core LLM event-template filler.

### Guardrails respected from existing CLAUDE.md
- ✅ Missions 00–20 NOT renumbered or rewritten.
- ✅ HUD QUICK CONTROLS / TARGET NODE NOT reintroduced.
- ✅ No token / Web3 / payments in this spec (abstraction only).
- ✅ NEVA Core stays advisory; never mutates save/missions/rewards.
- ✅ Player Profile remains local-only and identity-only in this spec.
- ✅ Phase 8 backend remains zero-dep until Season 1 (then SQLite).
- ✅ Admin endpoints stay gated by `NEVA_ADMIN_SECRET`.

---

## 7. Roadmap

### Phases (each ~2 months unless noted)

| Phase | Name | Duration | Headline Deliverable | Class added |
|---|---|---|---|---|
| **0** | **Foundation** | 4 weeks | Wallet abstraction, Season state, Daily Contract scaffolding | (Operator only — existing) |
| **1** | **Season 0 — "First Cipher"** | 8 weeks | First playable seasonal alpha; Operator class polished | — |
| **2** | **Season 1 — "Black Routes"** | 8 weeks | Corsair class shipped; ICE + breach-timer | Corsair |
| **3** | **Season 2 — "The Echo Below"** | 8 weeks | Ghost class shipped; Possession graph | Ghost |
| **4** | **Season 3 — "Bastion"** | 12 weeks | Architect class shipped; async base raids | Architect |
| **5** | **Stretch — Sandbox AI Layer** | 12+ weeks | Faction AI (toward Approach A); UGC tools | — |
| **6** | **Stretch — Token Activation** | Gated | After Sharia + legal clear; WalletProvider swap | — |

### Phase 0 milestone gates (the "ship Season 0" checklist)
1. `wallet.ts` exists; all currency mutations route through it. Audit grep passes.
2. `seasons.ts` exists; save migration v2 in place; old saves load green.
3. `/api/events/active` returns at least one daily + one weekly event.
4. Admin Event Editor at `/admin/events` (NEVA_ADMIN_SECRET-gated).
5. Daily Contract HUD card renders + completes + claims reward.
6. Weekly Anomaly opens in Sector A02 + completes + claims reward.
7. Season tracker UI shows weeks 1–8 with current week highlighted.
8. `pnpm build` is green (real typecheck gate).
9. Full M00–M20 still plays (no regression).

### Phase 1 milestone gates (the "Season 0 launch" checklist)
1. Season 0 tentpole arc playable end-to-end.
2. NEVA Core unreliable-whisper system shipped.
3. 7 weekly Anomalies authored (or AI-drafted) and scheduled.
4. ~30 daily Contracts in the rotation pool.
5. Leaderboard for Season 0 weekly Anomalies online.
6. Pattern Lens permanent unlock awarded on finale.
7. Soft-reset transition to Season 1 prep tested in staging.
8. No regressions on M00–M20.

---

## 8. Risks & Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | Content burnout (solo dev can't sustain) | High | Critical | AI-first event drafting; templates; ~20 min/event budget |
| 2 | Soft-reset annoys hoarders | Medium | Medium | Clear messaging; architect base persists; cosmetics persist |
| 3 | Class balancing | Medium | Medium | Ship one class at a time; tune live; no PvP, so imbalance is tolerable |
| 4 | Scope creep into MMO | High | Critical | This spec explicitly forbids it; revisit only after Phase 4 |
| 5 | LLM event drafts low quality | Medium | High | Max approval gate before publish; template constraints |
| 6 | Token decision lock-in too early | Low | High | WalletProvider abstraction; no Web3 deps until Phase 6 |
| 7 | Player session drift (everyone plays once per month) | Medium | Medium | Daily streak rewards; weekly anomaly FOMO-buffer (rerun week 8) |
| 8 | Multi-class confusion | Medium | Low | UI defaults to primary class; switching is explicit in NEVA Terminal |
| 9 | Save migration breaks | Low | Critical | Additive migration only; comprehensive regression test on M00–M20 |
| 10 | NEVA Core OpenAI cost spike | Low | Medium | Server-side cap per day; fallback to template-only mode |

---

## 9. Glossary

| Term | Definition |
|---|---|
| **Operator** | The player. Existing nevanetwork archetype. Also the default class. |
| **Sector A01** | The first sector — Memory Grid. M00–M20 live here (Season 0 prologue). |
| **Sector A02** | The Seasonal World. Procedurally regenerates each season. |
| **Daily Contract** | 15-min daily event. Procedurally generated. |
| **Anomaly** | 1–2h weekly event. Hand-authored or AI-drafted. |
| **Tentpole** | The seasonal climactic story event. Limited-time. |
| **Soft Reset** | End-of-season event: sector regenerates, season buffs expire, account-wide gains persist. |
| **Tide** | World-wide modifier event affecting all players for N hours. |
| **NEVA Core** | The in-game AI assistant. Advisory. Now also drafts event content. |
| **WalletProvider** | Currency abstraction. Token-swap point. |
| **Class Mastery** | 4-tier per-class progression earned by playing a season as that class. |

---

## 10. Implementation Appendix (for /goal execution)

This appendix is structured so a Claude Code `/goal` session can iterate on it.

### Phase 0 Goal candidate

```
/goal Implement Phase 0 foundation modules for the Six-Month Grid plan
(wallet.ts, seasons.ts, save migration v2, /api/events/active, Daily
Contract HUD card).

Done when:
- All Phase 0 milestone gates (§7) pass.
- `pnpm build` exits 0.
- `pnpm lint` exits 0.
- Manual smoke: M00–M20 still completes; Daily Contract appears + completes + claims.
- No new `any` or `@ts-ignore`.
- No Web3 dependencies added (audit `package.json`).

Constraints:
- Do not modify Missions 00–20 logic.
- Do not introduce a token, wallet-connect, or smart-contract module.
- All currency mutations must route through wallet.ts.
- Backend stays zero-dep until SQLite is justified.

Stop after 25 turns max.
```

### Module map (Phase 0)
```
src/
  wallet.ts              ← currency abstraction (NEW)
  seasons.ts             ← season state (NEW)
  save.ts                ← migration v2 (EXTEND)
  events/
    archetype-breach.ts        (NEW)
    archetype-anomaly.ts       (NEW)
    archetype-faction.ts       (NEW)
    archetype-tide.ts          (NEW)
  classes/
    operator.ts                (NEW; existing logic moved here)
  components/
    DailyContractCard.tsx      (NEW)
    SeasonTracker.tsx          (NEW)
server/
  events/
    store.mjs                  (NEW — JSON file-backed)
    scheduler.mjs              (NEW — cron-like)
    routes.mjs                 (NEW — /api/events/*)
  ai-event-drafter.mjs         (NEW — NEVA Core event template fill)
  admin-event-editor.html      (NEW — minimal admin UI)
```

### Subsequent phases will be specified in their own /goal directives once Phase 0 lands.

---

## 11. Open Questions (review before Phase 0 /goal)

1. **Faction names + lore** — 4 in-world factions are needed for Faction Op events. Suggested:
   *The Archive*, *Black Loop*, *Quiet Pattern*, *Severance*. Confirm or rename in review.
2. **Daily reset time** — UTC midnight? Player local-tz? (Suggest UTC for simplicity.)
3. **Streak grace** — does a missed day break the streak immediately, or is there a 24h grace?
   (Suggest 24h grace + 1 per week.)
4. **Anomaly leaderboard scope** — global, friends-only, or both? (Suggest global asynchronous.)
5. **Cosmetic system** — node-trail effects? Class skin tints? UI themes? (All three eventually.)
6. **Steam/itch release** — Phase 4 or Phase 5? (Phase 5 — after Architect ships.)

---

**End of design spec. Implementation plan to follow via writing-plans skill.**
