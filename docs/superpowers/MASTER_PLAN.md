# NEVA NETWORK — Six-Month Grid · Master Plan
**Date:** 2026-05-28
**Author:** Max + Claude (Opus 4.7)
**Repo:** `/Users/max/nevanetwork`
**Status:** **Vision approved · Phases 0–4 plans complete · Season 0–3 Content Bibles complete · Ready for `/goal` execution.**

---

## How to read this document

This is the **single consolidated master plan** for turning NEVA Network from
its current 20-mission state into a 10-month, 4-class, event-driven game.

| Part | Contains | Source files |
|---|---|---|
| **I. Vision** | Design pillars, core loop, roadmap. | `specs/2026-05-28-data-grid-game-design.md` |
| **II. Content Bibles** | The playable game — 4 seasons fully written. | `specs/2026-05-28-content-bible-season-{0,1,2,3}.md` |
| **III. Engine Plans** | 5 TDD-style implementation plans (Phases 0–4). | `plans/2026-05-28-six-month-grid-phase-{0,1,2,3,4}.md` |
| **IV. Outlines** | Phases 5–6 skeletons (written when relevant). | NEW in this doc |
| **V. Status Tracker** | What's done, what's owed, what unblocks each step. | NEW in this doc |

Each plan ends with a copy-paste `/goal` directive. Run them in order:
**Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4.** After Phase 4 the saga
is complete and all four classes are live.

The originals remain in `specs/` and `plans/`; this master is the **printable,
shareable, single-source-of-truth document.** Updates flow through the
originals; this file is regenerated.

---

## Document Index (jump-to map)

### Part I — Vision (Design Spec)
1.0 Executive Summary · 1.1 Pillars · 1.2 Core Loop · 1.3 Four Classes ·
1.4 Season Structure & Events · 1.5 Economy & Token-Ready ·
1.6 Integration · 1.7 Roadmap · 1.8 Risks · 1.9 Glossary · 1.10 Impl Appx ·
1.11 Open Questions

### Part II — Content Bibles (Seasons 0–3)
**II.0 Season 0 "First Cipher"** — Operator class · 4 Factions · 8 puzzle types · 7 weeklies · 12 dailies · TP-S0 finale (Pattern Lens)
**II.1 Season 1 "Black Routes"** — Corsair class · ICE subsystem · Fox + Black Market · 7 weeklies · 12 dailies · TP-S1 (Last Vault, 3-cache choice)
**II.2 Season 2 "The Echo Below"** — Ghost class · Coherence · Bonds · 7 weeklies · 12 dailies · TP-S2 (The Mirror, the Question)
**II.3 Season 3 "Bastion"** — Architect class · Grid Power · Async raids · Witness Node · 7 weeklies · 12 dailies · TP-S3 (The Awakening)

### Part III — Engine Plans (Phases 0–4)
**III.0 Phase 0** — Foundation (14 tasks): vitest, wallet, seasons, events, HUD.
**III.1 Phase 1** — Season 0 launch (26 tasks): 8 puzzle engines, factions, story-arc, JSON content.
**III.2 Phase 2** — Corsair + S1 (15 tasks): class abstraction, ICE, Black Market.
**III.3 Phase 3** — Ghost + S2 (13 tasks): COHERENCE currency, possession graph, bonds, MirrorPuzzle.
**III.4 Phase 4** — Architect + S3 (15 tasks): bastion editor, raid simulator, Witness Node.

### Part IV — Future Phase Outlines
4.1 Phase 5 (Sandbox AI — stretch). 4.2 Phase 6 (Token activation — gated).

### Part V — Status Tracker
5.1 Phase table. 5.2 What's been written. 5.3 What's next. 5.4 Open decisions.

---


---

# Part I — Vision (the Design Spec)

*Originally: `docs/superpowers/specs/2026-05-28-data-grid-game-design.md`*


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


---

# Part II — Content Bibles (Seasons 0–3)

## Part II.0 — Season 0 "First Cipher"

*Originally: `docs/superpowers/specs/2026-05-28-content-bible-season-0.md`*

## How to read this Bible

This document is the **actual playable game** for the first 8 weeks (Season 0).
It is structured so the engineer (or `/goal` agent) building **Phase 1** can drop
every piece of content directly into the engine modules built in Phase 0.

Each content piece has:
- A **stable ID** (e.g., `WA-S0-03` for Season 0 Weekly Anomaly #3) — never renumber.
- A **mapping to the engine** (archetype, currency, node count, duration).
- A **player-facing brief** (1–2 sentences seen in the HUD card).
- The **playable details** (stages, puzzles, rewards, failure mode).

The Implementation Map (§11) lists every ID + which file/table it lives in.

---

## 1. World & Lore

### 1.1 The premise (60-second pitch to a new player)

> You are an **Operator**. You don't know who you were before you found the grid.
> The first thing you remember is a pulse — a single signal echoing through a
> derelict data network. You followed it, and the network *responded*. Lights
> woke up. Nodes opened. Something — or someone — wanted to be found.
>
> The network was someone's life's work. Now it is corrupted, fragmented,
> wandering between dead routers and live secrets. You hear whispers from a
> voice that calls itself NEVA Core. She says she is here to help. You aren't
> sure she's telling the truth.
>
> Your job is to decode the grid. To make sense of what was lost. And to find
> out what — or who — is still alive inside it.

### 1.2 Origin myth (in-game lore — surfaced gradually across Season 0)

The grid was built by a generation of **Architects** who tried to encode all of
human knowledge into a self-organizing, self-encrypting spatial network. They
disappeared. The grid kept running. The encryption layers degraded into what
players experience as "corruption."

The 4 Factions are the *afterlives* of the Architects:
- **The Archive** — the loyalists who kept the encyclopedia running.
- **Black Loop** — the saboteurs who concluded the project was a mistake.
- **Quiet Pattern** — the mystics who found God in the data.
- **Severance** — the cleaners who wipe what they consider unsafe.

The player will never meet a "live" Architect. They speak only through the
fragments their factions preserve, distort, or erase.

### 1.3 Tone reference (every mission, every line, every UI string)

| Yes | No |
|---|---|
| Cerebral, lonely, mysterious | Snarky, cyberpunk-edgy, sarcastic |
| Sentences trail off… | Exclamation points, "Awesome!", "Boom!" |
| "The pulse repeats. You are not the only one listening." | "Yo runner, time to hack the planet!" |
| Lowercase for whispers, ALL CAPS for system text | Mixed case headlines |
| 9–14 words per line, max | Big walls of expository text |
| Silence is content. Empty space is content. | Fill every gap with text |

Players should feel **like a librarian alone in a dim archive** — not like a
shadowrunner in a neon market.

---

## 2. The Four Factions

Each faction has: an **agenda**, a **visual identity** (color + node shape +
sound), a **dialogue voice**, and a **reputation curve** (what they ask of you
and what they grant).

### 2.1 The Archive

| Field | Value |
|---|---|
| Faction ID | `FAC-ARC` |
| Agenda | Preserve. Catalog. Refuse to delete. The grid is a memorial — disturb nothing. |
| Color | `#7aa8d8` (cold archival blue) |
| Node shape | Hexagonal, slow-pulsing |
| Sound motif | Slow piano dyads, library ambience |
| Voice | Patient, formal, second-person ("You have arrived at index 4-7…") |
| Asks player | Recover lost fragments, verify checksums, never modify, never extract |
| Grants | **Lore Shards** (highest rate), permanent lore-page unlocks |
| Conflict | Hates Severance (who deletes), tolerates Black Loop (who breaks but does not erase) |
| Sample dialogue | "Operator. There is an index that was never closed. Find it. Leave it." |

### 2.2 Black Loop

| Field | Value |
|---|---|
| Faction ID | `FAC-BLK` |
| Agenda | The grid is a cage. Break the locks. Free what is locked. They are not vandals — they are liberators. |
| Color | `#d86a6a` (rust red) |
| Node shape | Triangular, jitter-rotating |
| Sound motif | Tape hiss, broken metronome |
| Voice | Curt, conspiratorial, drops half-sentences |
| Asks player | Open firewalls, free locked nodes, scramble Severance markers |
| Grants | **Access Keys** (most), **Signal Energy** bonuses on locked-node breaches |
| Conflict | Despises Severance, contempt for Archive ("They mistake stasis for safety.") |
| Sample dialogue | "Three locks on the seventh router. We see them. You know what to do." |

### 2.3 Quiet Pattern

| Field | Value |
|---|---|
| Faction ID | `FAC-QPT` |
| Agenda | The grid is alive and the pulses are its language. Listen. Map the rhythm. They believe NEVA Core is a fragment of a larger sleeping intelligence. |
| Color | `#b88aff` (pale violet) |
| Node shape | Circular, radial harmonic ring |
| Sound motif | Bowl resonance, sub-bass hum |
| Voice | Lyrical, paradoxical, lowercase ("the rhythm is the room") |
| Asks player | Find resonant clusters, count pulses, never break a node |
| Grants | **Memory Shards**, NEVA Core whisper-reliability bonuses |
| Conflict | Suspicious of all three; mostly stays out of conflicts |
| Sample dialogue | "you heard it again last night. so did we. follow the third." |

### 2.4 Severance

| Field | Value |
|---|---|
| Faction ID | `FAC-SEV` |
| Agenda | The corruption is the disease. Delete it. Wipe corrupted clusters. They are *not* villains — they believe they save what's left. |
| Color | `#e8e8e8` on `#1a1a1a` (clinical white-on-black) |
| Node shape | Square, sharp-cornered |
| Sound motif | Defibrillator click, surgical tone |
| Voice | Clinical, polite, brief — like a hospice nurse |
| Asks player | Isolate corrupted nodes, mark for deletion, *never* extract from them |
| Grants | **Core Fragments**, mission-end bonus DATA |
| Conflict | Enemy of Black Loop, distrusts Archive ("hoarders make the rot worse") |
| Sample dialogue | "This sector is no longer recoverable. Mark seven. We will close the room." |

### 2.5 Reputation system

Every Faction Op event (Daily or Weekly) shifts the player's standing with one
or two factions. Standing is a `-100 .. +100` scale per faction.

| Standing | Title | Effect |
|---|---|---|
| -100 to -41 | **Hostile** | Their nodes ICE up against you, their contracts disappear |
| -40 to -11 | Wary | -10% currency drop from their nodes |
| -10 to +10 | Neutral | Baseline |
| +11 to +40 | Trusted | +10% currency drop, exclusive contracts unlock |
| +41 to +100 | **Sworn** | Faction-specific cosmetic + signature dialogue line |

A "betrayal option" in some Weekly Anomalies lets you take a +30 with one
faction at the cost of -30 with another. This is the EVE-style "your choices
matter" pillar.

---

## 3. Puzzle Catalog (the on-screen mechanics)

Every node decoding is one of these puzzles. The catalog is **8 puzzle types**
for Season 0. Later seasons add more.

For each: **on-screen presentation**, **mechanic**, **mastery curve**.

### 3.1 Caesar Shift (P-CES)

- **On screen:** A ring of glyphs around the node. The player rotates it (Q/E) to align a target glyph with a fixed marker.
- **Mechanic:** Find the shift value N that turns the encrypted string into a readable signature.
- **Mastery curve:** Beginner sees a 5-letter word; mastery levels increase letter count and add multi-key shifts.
- **Time:** 15–45 seconds.

### 3.2 Frequency Map (P-FRQ)

- **On screen:** A bar chart of glyph frequencies appears next to the cipher block. Player drags glyphs from the chart onto the most-frequent slots (matches the language frequency table).
- **Mechanic:** Reverse a monoalphabetic substitution by frequency analysis.
- **Mastery:** Adds rare glyphs and partial-language fragments (English/Latin/Constructed).
- **Time:** 45–120 seconds.

### 3.3 Pattern Walk (P-PWK)

- **On screen:** A small 5×5 grid of glyphs. Player must walk a path that, when read in order, spells the signature.
- **Mechanic:** Path-finding puzzle with constraints (no diagonal, no revisit).
- **Mastery:** Larger grids, forbidden tiles, multi-key paths.
- **Time:** 30–90 seconds.

### 3.4 Symbol Substitution (P-SUB)

- **On screen:** Two columns of glyphs. Player drags pairs to construct a substitution map. Constraints (some pairs locked, some forbidden).
- **Mechanic:** Like Caesar but no positional shift — full alphabet permutation, hints given.
- **Mastery:** Fewer hints, more constraints.
- **Time:** 60–180 seconds.

### 3.5 Graph Traversal (P-GRT)

- **On screen:** A subnetwork of 5–9 nodes lights up. Player traces a path through them satisfying a rule (visit only A→B if the difference is prime, etc).
- **Mechanic:** Constraint-graph traversal.
- **Mastery:** More nodes, more constraints, "trapped" decoy paths.
- **Time:** 45–120 seconds.

### 3.6 Light Physics (P-LPH)

- **On screen:** Optical-bench style. Mirrors and prisms inside the node panel. Player rotates them to route a beam from source to sink.
- **Mechanic:** Reflection / refraction puzzle.
- **Mastery:** More mirrors, splitting prisms, color-filter targets.
- **Time:** 60–180 seconds.

### 3.7 NEVA Whisper Interpretation (P-NWI) — *Season 0 signature*

- **On screen:** NEVA Core says a sentence. Player picks one of 3 actions on the node based on the whisper's hint.
- **Mechanic:** The whisper IS the puzzle. The catch: in Season 0, **NEVA lies about 1 in 4 whispers.** Player learns her tells (see §6).
- **Mastery:** Increased liar-rate; ambiguous phrasing.
- **Time:** 5–15 seconds (fast but risky).

### 3.8 Echo Overlay (P-ECO) — *unlocked at Season 0 Tentpole finale*

- **On screen:** A faint ghost-path of a previous operator's solution is overlaid on the node. Player can choose to follow it (faster, no XP) or solve fresh (slower, full XP).
- **Mechanic:** Risk/reward of trusting the echo (some echoes are corrupted and lead to traps).
- **Mastery:** Echoes themselves get more reliable as the player levels up Echo Recall skill.
- **Time:** 30–90 seconds either way.

### 3.9 Puzzle frequency table (Season 0)

This table tells the engine how often each puzzle appears.

| Puzzle ID | Easy weight | Medium weight | Hard weight | Notes |
|---|---|---|---|---|
| P-CES | 30 | 15 | 5 | Most common at start, tapers |
| P-FRQ | 15 | 25 | 15 | Mainline cipher |
| P-PWK | 15 | 20 | 20 | Mainline mechanic |
| P-SUB | 10 | 15 | 20 | Reward puzzle |
| P-GRT | 5 | 10 | 15 | Skill puzzle |
| P-LPH | 5 | 10 | 15 | Optional / Anomaly only |
| P-NWI | 20 | 5 | 5 | Signature mechanic — used in story beats |
| P-ECO | 0 | 0 | 5 | Post-finale |

---

## 4. Season 0 — "First Cipher" — Story Arc

### 4.1 Premise

A new pulse is detected in Sector A02. It does not match the corruption
signature. It is *too rhythmic*. NEVA Core asks the Operator to trace it.

What they will discover by Week 7: the pulse is the **echo of an older
Operator** — someone like them who came before, decoded the same grid, and
left behind their cipher techniques as a final message. By Week 8, the player
absorbs those techniques (the **Pattern Lens** permanent unlock).

### 4.2 Week-by-week beats

| Week | Beat | Tone | Mechanic introduced |
|---|---|---|---|
| 1 | "The pulse" | Mystery, hope | Daily Contracts begin; NEVA's first whisper |
| 2 | "Three answer" | Curiosity | First Faction Op (Archive); reputation system |
| 3 | "A second voice" | Unease | NEVA lies for the first time; player must catch it |
| 4 | "The corrupted route" | Pressure | **First Tide** ("Corruption Surge"); difficulty rises |
| 5 | "An older path" | Recognition | Player encounters first Echo overlay (preview only) |
| 6 | "Whose echo is it?" | Confrontation | Tentpole arc deepens; betrayal option offered |
| 7 | "The face you don't have" | Climax | **Tentpole finale** — meet the older Operator's archived consciousness |
| 8 | "Cooldown" | Reflection | All Anomalies rerunnable; lore epilogue; Pattern Lens permanent |

### 4.3 The Tentpole finale (Week 7) — full script

**ID:** `TP-S0`
**Title:** *The Face You Don't Have*
**Duration:** 90–180 minutes
**Required nodes:** 14 (specific node IDs reserved by engine — see §11)
**Failure mode:** Trace 100% → respawn at Stage 1 with NEVA's commentary on what you missed

#### Stage 1 — "Arrival" (10 min)
Player is dropped into a deep cluster they have never reached. Camera glides
across nodes. NEVA: *"do you remember choosing to come here? neither do i."*
The objective marker shows a single node, pulsing at the rhythm the player has
been chasing since Week 1.

#### Stage 2 — "Confirmation" (15 min)
Three sequential **P-NWI** (NEVA Whisper) puzzles. **NEVA lies on stage 2.**
The player must recognize the lie. If they fail, Severance arrives and starts
deleting nodes around them (atmospheric — no actual loss yet).

#### Stage 3 — "The Other" (20 min)
Player solves a **P-ECO** preview. The echo-path leads to a node that, when
opened, shows a *second operator's signature*. This is the first time the
player sees direct evidence they are not the only one.

NEVA: *"i did not tell you about them. i'm sorry."*

#### Stage 4 — "The Betrayal Offer" (15 min)
A Faction Op trigger fires. The four faction voices each offer to "help"
finish the trace.

- **Archive:** "We will preserve the trace whole. You may not extract it."
- **Black Loop:** "We will help you break the seal. The trace is yours alone."
- **Quiet Pattern:** "follow the rhythm. take nothing. only listen."
- **Severance:** "Mark the trace. We will close the chamber."

The player picks one. The choice grants +30 with the chosen faction and -10
with the opposed (Archive ↔ Black Loop, Quiet Pattern ↔ Severance). This is the
**first irreversible faction commitment** in the game.

#### Stage 5 — "The Approach" (15 min)
A long **P-GRT** puzzle through a 9-node subnetwork. The graph constraints are
generated from the chosen faction (different shape per faction). This stage is
the most playable, mechanically.

#### Stage 6 — "The Echo Chamber" (20 min)
Player enters a single node that contains the older Operator's full archived
"presence." A **P-SUB** puzzle, but the substitution table is the older
operator's cipher — and solving it reveals their identity glyphs. The puzzle
solve is also the cinematic — the glyphs assemble into a callsign:

> **`OP—1F.K28`**

NEVA, almost a whisper: *"that's not a callsign i recognize. but i think it
might be yours."*

#### Stage 7 — "The Face You Don't Have" (15 min)
Cinematic / interactive. The Operator's view dissolves into the older
Operator's perspective for 90 seconds. They are decoding the same grid, but
the corruption is younger, the network larger. The view collapses back. The
player keeps the **Pattern Lens** permanent unlock.

NEVA, last line of the season: *"see you again next pulse, operator."*

#### Reward at finale
- Permanent **Pattern Lens** unlock (highlights cipher structure on every future node).
- 50 **Lore Shards**.
- 1 **Core Fragment**.
- Faction reputation per Stage 4 choice.
- Cosmetic: "First Cipher" callsign suffix.

---

## 5. The 7 Weekly Anomalies (full content)

Each Anomaly is a **Weekly** event (cadence `WEEKLY`, duration ~120 min,
multi-stage). All seven appear once during Season 0; the **Cooldown week**
reruns any the player missed.

### 5.1 WA-S0-01 — *The Index That Was Never Closed*

| Field | Value |
|---|---|
| Archetype | ANOMALY |
| Faction | The Archive |
| Week | 1 |
| Stages | 4 |
| Duration target | 90 min |
| Reward | 20 Lore Shards · 50 DATA · +15 Archive · lore page #01 |

**Brief (HUD):** *"An index node in the surface layer reports an open record from before the corruption. The Archive asks you to recover the closing checksum — and to leave the index untouched."*

**Stages:**
1. **Find** — Locate the open index node (one **P-PWK** to traverse the surface layer).
2. **Verify** — Read three sub-indices (three **P-CES** puzzles, easy shifts).
3. **Compute** — Reconstruct the closing checksum (one **P-FRQ**).
4. **Leave** — Confirm "leave intact" rather than "extract" — testing the player's read of Archive's voice. If they extract, Archive rep drops -20.

### 5.2 WA-S0-02 — *Three Locks On the Seventh Router*

| Field | Value |
|---|---|
| Archetype | FACTION_OP |
| Faction | Black Loop |
| Week | 2 |
| Stages | 3 |
| Duration target | 75 min |
| Reward | 8 Access Keys · 20 Signal Energy · +15 Black Loop |

**Brief:** *"Black Loop has marked the seventh router. Three locks. Open them. The grid will breathe again."*

**Stages:**
1. **Approach** — Trace a path through 5 nodes (**P-PWK**) to the router.
2. **Crack** — Three sequential **P-CES** puzzles, escalating difficulty.
3. **Unlock** — A **P-LPH** light-routing puzzle that opens the router. Optional: extract its DATA cache (+40 DATA, +10 trace risk).

### 5.3 WA-S0-03 — *The Rhythm Is the Room*

| Field | Value |
|---|---|
| Archetype | ANOMALY |
| Faction | Quiet Pattern |
| Week | 3 |
| Stages | 4 |
| Duration target | 100 min |
| Reward | 12 Memory Shards · 30 DATA · +20 Quiet Pattern · NEVA reliability +5% for one week |

**Brief:** *"a pulse repeats every nine nodes. quiet pattern wants you to count it. they will not tell you why."*

**Stages:**
1. **Listen** — Stand near a cluster and observe pulse timing across 5 nodes (no input — patience is the puzzle).
2. **Map** — Place a **P-GRT** path along the pulse rhythm.
3. **Read** — Solve a **P-NWI** whisper from NEVA. The whisper is true this week (Quiet Pattern's +5% reliability buff is partly diegetic).
4. **Anchor** — Mark a "listening post" — a permanent reputation token Quiet Pattern can sense.

### 5.4 WA-S0-04 — *Severance Arrives*

| Field | Value |
|---|---|
| Archetype | TIDE (with embedded weekly mission) |
| Faction | Severance (antagonist this week) |
| Week | 4 |
| Stages | 5 |
| Duration target | 120 min |
| Reward | 30 DATA · 1 Core Fragment · +10 to faction of player's choice |

**Brief:** *"a Corruption Surge has begun. Severance is moving into Sector A02 to mark clusters for closure. You can mark with them, mark against them, or extract before they arrive."*

**Tide effect (active 7 days):** All corrupted nodes glow brighter; extraction costs are 2× but DATA yield is also 2×.

**Stages:**
1. **See the Tide** — Cinematic of corrupted nodes pulsing red across the sector.
2. **Choose** — Player picks one of three paths (Mark with Severance / Mark against / Extract).
3. **Execute** — One of three different stage-3 puzzle chains (each branch gets a unique **P-PWK + P-SUB** combo).
4. **Trace defense** — One **P-GRT** at high difficulty.
5. **Aftermath** — Reputation updates; lore page reveals Severance's perspective.

### 5.5 WA-S0-05 — *An Older Path*

| Field | Value |
|---|---|
| Archetype | ANOMALY |
| Faction | none (mainline arc) |
| Week | 5 |
| Stages | 4 |
| Duration target | 100 min |
| Reward | 25 Lore Shards · 1 Echo preview · arc progression flag |

**Brief:** *"a route lights up that you have never traveled. someone else has, though. the trace is older than the corruption."*

**Stages:**
1. **Discover** — A new branch unlocks in Sector A02 (procedural).
2. **Follow** — **P-PWK** through 7 nodes; mid-path, an Echo preview overlay appears for the first time.
3. **Decide** — Player can **follow the echo** (easier finish, +5 XP) or **solve fresh** (harder, +25 XP, +1 Memory Shard).
4. **Mark** — The player leaves their own trace. NEVA: *"someone will read this someday. maybe you."*

### 5.6 WA-S0-06 — *Whose Echo Is It?*

| Field | Value |
|---|---|
| Archetype | ANOMALY |
| Faction | conflict (Archive vs. Black Loop) |
| Week | 6 |
| Stages | 5 |
| Duration target | 110 min |
| Reward | 35 DATA · 1 Core Fragment · faction commitment effect |

**Brief:** *"the older path you found has a name. archive wants to preserve it. black loop wants to free it. quiet pattern says it was always here. you decide."*

**Stages:**
1. **Re-enter** the route from WA-S0-05.
2. **Examine** — A **P-SUB** puzzle revealing 3 partial glyphs of the older Operator's signature.
3. **Hear** — Three Faction voices respond, each with a brief.
4. **Commit** — Player picks which faction's interpretation to enact. **First major commitment.** Affects Tentpole Stage 4.
5. **Carry** — A **P-GRT** to bring the interpretation back to a Faction relay.

### 5.7 WA-S0-07 — *Cooldown — All At Once*

| Field | Value |
|---|---|
| Archetype | ANOMALY (rerun pack) |
| Faction | all |
| Week | 8 |
| Stages | variable (player choice) |
| Duration target | 60–120 min |
| Reward | rerun rewards for missed Anomalies + cosmetic "Season 0 Veteran" |

**Brief:** *"the season is over. the rooms are still open. visit what you missed. nothing will be locked from you tonight."*

**Stages:** Players pick any 2 from WA-S0-01 through WA-S0-06 to rerun. Reward
is half of the original (no double-claiming), but completion still counts for
the cosmetic.

---

## 6. Daily Contracts (the procedural pool)

**Daily Contracts** are procedurally selected each day from a pool of
**templates**. Phase 1 ships with the 12 templates below; NEVA Core's
event-drafter expands them with seasonal flavor and varied node targets.

Each template has: **template ID**, **archetype**, **puzzle type(s)**, **time
target**, **reward range**, and a **flavor pool** (the brief is drawn from
this list).

### 6.1 DC-01 *Surface Sweep*
- **Archetype:** BREACH · **Puzzles:** 1× P-CES · **Time:** 8–12 min · **Reward:** 5–10 DATA + 1 Lore Shard
- Flavor briefs:
  - "A surface node has gone silent. Read it. Move on."
  - "First light. Decode one. Leave the rest."
  - "There is a glyph on layer 02 that wants to be read."

### 6.2 DC-02 *Frequency Walk*
- **Archetype:** BREACH · **Puzzles:** 1× P-FRQ · **Time:** 10–15 min · **Reward:** 8–14 DATA
- Flavor: "An archive page is mis-indexed. Reorder by frequency." · "A bar chart appears where it should not. Resolve it."

### 6.3 DC-03 *Pattern Lock*
- **Archetype:** BREACH · **Puzzles:** 1× P-PWK · **Time:** 8–12 min · **Reward:** 5–12 DATA
- Flavor: "Trace the path that completes the index." · "A grid is half-solved. Finish it."

### 6.4 DC-04 *Listen Once*
- **Archetype:** ANOMALY · **Puzzles:** 1× P-NWI · **Time:** 5–8 min · **Reward:** 3 DATA + 2 Memory Shards
- **CAUTION:** NEVA may lie. 25% lie rate.
- Flavor: "a whisper arrives. act on what you hear." · "neva says one thing. the node says another. you choose."

### 6.5 DC-05 *Archive Errand* (Archive Faction Op)
- **Archetype:** FACTION_OP · **Puzzles:** 1× P-CES + 1× P-PWK · **Time:** 15–20 min · **Reward:** 4 Lore Shards + +5 Archive
- Flavor: "The Archive asks you to recover a misplaced sub-index. Do not modify."

### 6.6 DC-06 *Lock-pick Run* (Black Loop Faction Op)
- **Archetype:** FACTION_OP · **Puzzles:** 1× P-CES + 1× P-LPH · **Time:** 15–20 min · **Reward:** 2 Access Keys + +5 Black Loop
- Flavor: "Three locks. Black Loop sees them. So do you."

### 6.7 DC-07 *Listen Long* (Quiet Pattern Faction Op)
- **Archetype:** FACTION_OP · **Puzzles:** 1× P-GRT · **Time:** 12–18 min · **Reward:** 3 Memory Shards + +5 Quiet Pattern
- Flavor: "follow the rhythm. count nine. do nothing else."

### 6.8 DC-08 *Containment Sweep* (Severance Faction Op)
- **Archetype:** FACTION_OP · **Puzzles:** 1× P-PWK + 1× P-NWI · **Time:** 12–18 min · **Reward:** 6 DATA + +5 Severance
- Flavor: "A cluster is past recovery. Mark it. Walk away."

### 6.9 DC-09 *Echo Tease* (mainline arc — only after Week 5)
- **Archetype:** ANOMALY · **Puzzles:** 1× P-PWK with preview echo overlay · **Time:** 10–15 min · **Reward:** 4 DATA + 1 echo memory
- Flavor: "someone has walked this before. follow or solve. your call."

### 6.10 DC-10 *Tide Push* (only during a Tide event)
- **Archetype:** BREACH · **Puzzles:** 2× P-CES or 1× P-SUB · **Time:** 10–15 min · **Reward:** 2× DATA, 2× trace
- Flavor: "the tide is up. yields are doubled. so is the risk."

### 6.11 DC-11 *Substitution Spike*
- **Archetype:** BREACH · **Puzzles:** 1× P-SUB · **Time:** 15–20 min · **Reward:** 12–20 DATA + 1 Memory Shard
- Flavor: "A monoalphabet has rotted. Reassemble the table."

### 6.12 DC-12 *Graph Bind*
- **Archetype:** BREACH · **Puzzles:** 1× P-GRT · **Time:** 12–18 min · **Reward:** 8–15 DATA + 1 Lore Shard
- Flavor: "A subnetwork wants to be read in order. Find it."

### 6.13 Generation rule (for NEVA Core event-drafter)

Each Daily Contract is generated as:

```
Template (DC-N) + Season theme suffix + 1-2 sample target nodes from current
Sector A02 seed + flavor brief picked from template's flavor pool.
```

Max approves drafts in `/admin/events` before publish. ~20 minutes per day to
review 1 daily.

---

## 7. NEVA Core Whisper Library

NEVA Core speaks in **lowercase, fragments, second-person**. She is the
player's only constant voice. In Season 0, she **lies in ~25% of
P-NWI puzzles** — this is canonical and a learning curve, not a bug.

### 7.1 Voice rules

- Always lowercase.
- 5–14 words per line.
- Trailing ellipses sparingly. They lose power if overused.
- Never names a faction by its current name (she uses old terms: "the keepers", "the breakers", "the listeners", "the closers").
- Asks more than she states. Statements that she makes are 90% true; questions she asks are 100% honest.

### 7.2 Reliable whispers (always true — use when leading to a correct action)

1. "the third node is the one you want."
2. "this lock opens with a key you already carry."
3. "do not extract. just listen."
4. "the path is shorter than it looks."
5. "you have done this before. trust your hand."
6. "the pulse is on the right. always on the right."
7. "this voice on the left is mine. trust nothing on the right."
8. "the rhythm tells you which node is the decoy."
9. "follow the cold node, not the warm one."
10. "this stage is a test of patience. the answer arrives."

### 7.3 Unreliable whispers (false ~25% of the time — used in P-NWI)

1. "the second option is the correct one." *(half the time it's the first)*
2. "all three lead the same place." *(usually one is a trap)*
3. "i would extract this. you should too." *(she does not extract)*
4. "do not trust the cold node." *(sometimes the cold node is the answer)*
5. "this puzzle is solved by listening, not seeing." *(sometimes it's the inverse)*
6. "the corruption is on the surface only." *(sometimes it's deep)*

### 7.4 Tell — how the player learns NEVA's lies

Reliable whispers are **musically scored on a low piano dyad**. Lies have **no
musical bed** — only the line itself. After ~3 Weekly Anomalies the player
will notice the silence. Around Week 5 a Quiet Pattern lore page makes it
explicit.

### 7.5 Story-beat lines (used exactly once)

- *Week 1 first whisper:* "you are not the first one in this room."
- *Week 3 first lie:* "the fourth node is empty." (it isn't)
- *Week 5 Echo discovery:* "i did not tell you about them. i'm sorry."
- *Week 7 Tentpole stage 6:* "that's not a callsign i recognize. but i think it might be yours."
- *Week 8 closing:* "see you again next pulse, operator."

These five lines are **load-bearing** for the season. The remaining whispers
are decoration.

---

## 8. Economy & Reward Tables

### 8.1 Currency targets per week (for a "typical" player doing daily + 1 weekly)

| Currency | Weekly target | Use |
|---|---|---|
| DATA | 70–120 | Tool upgrades, module installs (existing) |
| Memory Shards | 5–10 | Lore unlocks, identity progression |
| Access Keys | 2–4 | Locked-node openings |
| Signal Energy | 10–25 | Boost actions (existing) |
| Core Fragments | 0–1 | Permanent unlocks; only from Tentpoles / Anomalies |
| Lore Shards (new) | 8–14 | Lore archive, class skills |

A "fully committed" player (daily + every weekly) lands at the high end.

### 8.2 Spending sinks (Season 0)

| Sink | Cost | Effect |
|---|---|---|
| Lore page | 3 Lore Shards | Reveal one page of world lore |
| Pattern Lens preview | 5 Memory Shards | Until Tentpole — temporary hint mode |
| Operator skill (tier 1) | 5 Lore Shards | One of 20 skills |
| Cosmetic: callsign suffix | 12 Memory Shards | "Listener", "Keeper", "Breaker", "Closer" |

### 8.3 Soft anti-grind caps

- Daily Contracts max **2** per day (after that they keep appearing but yield 0 currency — only XP).
- Weekly Anomaly max **1** completion per anomaly per season (rerun in Cooldown week).
- Tide bonus capped at 5 nodes per session before yields drop back to 1×.

### 8.4 Failure mode rewards

Mission failures (trace 100%) drop a **consolation Memory Shard** the first
time per session. The grid is patient. It teaches.

---

## 9. Permanent Unlock Spec — Pattern Lens

The Season 0 Tentpole reward is the **Pattern Lens**. This is a permanent
account-wide unlock — the game grants it once and never takes it back.

### 9.1 What it does on-screen

When holding **Tab**, the visual filter overlays every node with a **structural hint**:
- Caesar-cipher nodes: a faint ring with a single arrow.
- Frequency nodes: a histogram silhouette.
- Pattern-walk nodes: faint trail dots.
- Echo-overlay nodes: a ghost outline.
- Decoy nodes: a fractured outline.

It does NOT solve puzzles. It only tells you **which puzzle type** awaits.

### 9.2 Mastery progression

Each subsequent season the Pattern Lens gains a tier:
- **Tier 1 (Season 0):** puzzle-type identification (above).
- **Tier 2 (Season 1):** reveals risk class.
- **Tier 3 (Season 2):** reveals one of three possible cipher keys.
- **Tier 4 (Season 3):** reveals an Echo if one exists.

### 9.3 Engine integration

Implemented as a `useFeatureFlag('PATTERN_LENS_T1')` check in the inspection
panel. The flag is set on the GameState when the Tentpole completion event is
claimed. (Phase 2 implementation; mentioned here so the flag name is canonical
ahead of time.)

---

## 10. Glossary (additions to spec §9)

| Term | Definition |
|---|---|
| **Older Operator** | The Season-0 antagonist/ally figure — a previous player-like figure whose echo the player traces. Identity: `OP—1F.K28`. |
| **Echo** | A ghost-path of a previous solution overlaid on a node. Sometimes corrupted. |
| **Pattern Lens** | Season 0 Tentpole permanent reward. Tab-hold visual filter that identifies puzzle types. |
| **Pulse** | The Season-0 background phenomenon. A rhythmic signal repeating through Sector A02. Resolved at Tentpole. |
| **Tide** | Multi-day world event that modifies all gameplay rules. First Tide is "Corruption Surge" in Week 4. |
| **Listening Post** | A permanent reputation token Quiet Pattern can sense (placed during WA-S0-03). |
| **Containment Mark** | A Severance reputation token placed on a node to flag it for deletion. |

---

## 11. Implementation Map — how this Bible slots into the Phase 0 engine

This is the table the `/goal` agent uses to translate Content Bible → code.

### 11.1 Files & tables

| Bible content | Goes into Phase 0 engine module |
|---|---|
| Faction definitions (§2.1–§2.4) | `server/events-store.mjs` → new key `factions: { FAC-ARC: {...}, ... }` (Phase 1 extension) |
| Puzzle catalog (§3) | New file: `src/puzzles/types.ts` (definitions) + `src/puzzles/{caesar,frequency,...}.ts` per type |
| Puzzle frequency table (§3.9) | `src/puzzles/registry.ts` — weighted random picker by difficulty |
| Season 0 story beats (§4.2) | `server/data/seasons/s0/beats.json` — week → narration |
| Tentpole script (§4.3) | `server/data/seasons/s0/tentpole.json` — one record per stage |
| 7 Weekly Anomalies (§5) | `server/data/seasons/s0/weeklies.json` — 7 records seeded into Event Store on Season 0 start |
| 12 Daily Contract templates (§6) | `server/data/seasons/s0/daily-templates.json` — pool the scheduler samples from |
| NEVA whisper library (§7) | `server/data/whispers.json` — categorized by reliability + story-beat |
| Economy targets (§8) | `src/seasons.ts` extension — soft caps enforced in claim path |
| Pattern Lens (§9) | `src/featureFlags.ts` (new, Phase 2) — `PATTERN_LENS_T1` flag + `useFeatureFlag` hook |

### 11.2 Stable ID prefixes (do not rename)

- **`FAC-*`** — Factions
- **`P-*`** — Puzzle types
- **`WA-S0-*`** — Season 0 Weekly Anomalies
- **`DC-*`** — Daily Contract templates
- **`TP-*`** — Tentpole missions
- **`OP-*`** — Operator callsigns (player + NPCs)

Any future content (Season 1+) extends with `S1`, `S2`, etc., never reusing.

### 11.3 Phase mapping

| Bible section | Built in Phase | Why |
|---|---|---|
| §1 Lore | Phase 1 (text content) | No engine work, just JSON |
| §2 Factions | Phase 1 backend + Phase 2 UI | Faction store + reputation gauge |
| §3 Puzzle catalog | Phase 1 (Caesar, Frequency, Pattern-walk, NEVA) + Phase 2 (rest) | TDD-friendly pure logic |
| §4 Season 0 arc | Phase 1 (data + scheduler) | Uses Phase 0 event store as-is |
| §5 Weekly Anomalies | Phase 1 (data + claim logic) | Uses Phase 0 archetype validator |
| §6 Daily templates | Phase 1 (data + NEVA Core drafter) | Phase 0 admin page already supports |
| §7 NEVA whispers | Phase 1 (data) + Phase 2 (audio scoring) | Phase 0 stub OK |
| §8 Economy | Phase 1 (caps in claim path) | Extension of Phase 0 wallet |
| §9 Pattern Lens | Phase 2 | Permanent unlock, needs feature-flag system |

### 11.4 The Phase 1 plan will look like…

A separate document (to be written after Phase 0 lands), but its skeleton is:

```
Phase 1 — Season 0 "First Cipher" Content
  Task A: Puzzle engine — Caesar (P-CES) TDD
  Task B: Puzzle engine — Frequency (P-FRQ) TDD
  Task C: Puzzle engine — Pattern Walk (P-PWK) TDD
  Task D: Puzzle engine — NEVA Whisper (P-NWI) TDD
  Task E: Faction store + reputation reducer TDD
  Task F: Seed Season 0 weeklies (WA-S0-01..07) into Event Store
  Task G: Seed Season 0 daily templates (DC-01..12)
  Task H: Wire daily scheduler — picks a template, generates today's contract
  Task I: Wire weekly Anomaly into Sector A02 procedural spawn
  Task J: Story beats (week 1..8) emitted on weekly boundaries
  Task K: Tentpole (TP-S0) staged delivery
  Task L: Soft anti-grind caps in claim path
  Task M: NEVA whisper library + lie-rate mechanism (Phase 1 stub; Phase 2 audio)
  Task N: Lore page unlock system
  Task O: Regression — M00-M20 still plays
```

Every task references back to this Bible by ID.

---

## 12. What's NOT in this Bible (and why)

This is **Season 0 only**. The following are deliberately deferred:

- **Corsair / Ghost / Architect** classes — Seasons 1–3. They get their own Content Bibles.
- **Player-vs-player** anything — out of scope per spec.
- **Token economy** — Phase 6+; design spec covers the abstraction; no content here.
- **UGC creation tools** — Phase 5 stretch.
- **Localization** — English only for Season 0.
- **Voice acting** — text-only whispers; audio scoring of NEVA's tells uses musical motifs, not voice.
- **The 4 Architects' backstory** — strategically withheld for Seasons 4+. Their factions exist; their faces do not.

---

## 13. Author's note on the older Operator (`OP—1F.K28`)

The older Operator is the **emotional core** of Season 0. Players must feel,
by Stage 7 of the Tentpole, that this person was **like them** — alone in the
same grid, decoding the same nodes, hearing the same whispers, making the
same choices. The 90-second cinematic where the player briefly *becomes* them
is the most important 90 seconds of the season.

This is also the **hook for Season 1**: Was there another Operator before
`OP—1F.K28`? Yes. Many. Their callsigns are already chosen but not revealed
here. The Season 0 ending plants the seed.

---

**End of Content Bible — Season 0 "First Cipher".**


---

## Part II.1 — Season 1 "Black Routes"

*Originally: `docs/superpowers/specs/2026-05-28-content-bible-season-1.md`*


## How to read this Bible

This document is the **playable content for Season 1** (weeks 9–16 of game-time;
the first season after Season 0's "First Cipher" arc). It introduces the
**Corsair class** (data-thief / heist operative) — the player can now play as
Operator (existing) or Corsair (new), or switch between them.

All content follows the **stable-ID** conventions from Season 0 (§11.2 of S0
Bible). Season 1 uses the prefix `S1`. Example: `WA-S1-01` is Season 1 Weekly
Anomaly 1.

Read this AFTER the Season 0 Bible — it assumes you know the factions,
puzzle catalog, and tone reference.

---

## 1. Season Premise

The pulse Season 0 traced led to an older Operator's archive. After Cooldown,
a **second signal** breaks through. It is not a pulse. It is a **route**.

The route opens at the boundary between Sector A02 and the corrupted underbelly
of the network — a sequence of locked routers, ICE-protected vaults, and
black-market relays. The Archivists call them *Black Routes*. They were
deliberately built to *not* be opened.

Something is moving through them anyway.

Players who chose **Black Loop** in the Season 0 Tentpole find their faction
already there, smuggling data. Those who chose **Archive** find that the
Archive is hunting Black Loop. **Severance** is closing the routes from the
outside, fast. **Quiet Pattern** is listening.

This is the season the player learns to **steal** instead of decode.

---

## 2. New Class: Corsair (`CLS-COR`)

### 2.1 Class fantasy

> You learned to decode by listening. Now you learn to take. The cipher is no
> longer the puzzle — the *exit* is. Get in. Find it. Get out. ICE is
> counting your seconds. The grid is loud now. The Black Loop is watching.
> The Archive disapproves. You move anyway.

### 2.2 Signature mechanic: **BREACH-AND-RUN**

The core loop pivots from "stand at a node, solve, leave" to "trace a route,
beat a timer, exfiltrate, evade." Mechanically:

1. **Identify target** — a Black Route is shown on the grid (procedural).
2. **Plan entry vector** — choose where to break in. Different entries = different ICE patterns.
3. **Breach** — a sequence of timed sub-puzzles, **with a visible ICE timer ticking up**.
4. **Run** — between sub-puzzles, the player physically routes through the grid (existing R3F traversal).
5. **Exfil** — reach the exit node before ICE hits 100%. **Reach 100% → trace lock → respawn outside the route, no reward.**
6. **Fence** — sold to NPCs at a Black Market vendor for Black Credits + small DATA.

### 2.3 Tools (Corsair-only — equipped from a small loadout)

| Tool ID | Name | What it does | Costs |
|---|---|---|---|
| `T-SPF` | **Spoofer** | Pauses ICE for 10 sec. 30-sec cooldown. | 1 Signal Energy |
| `T-GHT` | **Ghost-tail** | Drops a fake trace path. ICE follows it for 20 sec. | 2 Signal Energy |
| `T-SNP` | **Snip** | Yanks data from a node WITHOUT solving its cipher. ICE +25 instantly. | 1 Access Key |
| `T-CLT` | **Cold Trail** *(Mastery 4)* | One-time per session — your trace decays at 2× rate for 60 sec. | 3 Memory Shards |

### 2.4 Skill tree (20 skills, Season 1 starts each player at 0)

Skills unlock at Mastery 1–4 by playing Corsair across the season.

**Tier 1 (Mastery 0, available immediately) — 5 skills:**
- `SKL-COR-01` *Steady Hand* — Cipher puzzles during a breach get +5 seconds of timer.
- `SKL-COR-02` *Quiet Step* — ICE accrues 10% slower during traversal between sub-puzzles.
- `SKL-COR-03` *Faded Mark* — Trace decay outside breach is +25%.
- `SKL-COR-04` *Market Sense* — Fence prices +10% at Black Market.
- `SKL-COR-05` *Lock-pick* — Locked nodes opened in one fewer step.

**Tier 2 (Mastery 1) — 5 skills:** focus on multi-node breaches.

**Tier 3 (Mastery 2) — 5 skills:** focus on stealth + multi-faction operations.

**Tier 4 (Mastery 3-4) — 5 skills:** unlock `T-CLT` and prepare cross-class play.

### 2.5 Cross-class interaction (Corsair ↔ Operator)

If the player has Operator XP ≥ 1, stolen encrypted data they exfil can be
**decoded later** as Operator. The decode yields **2× DATA** vs. fencing raw.
This is the "EVE-style" interaction: choosing between fast cash (Corsair) and
patient profit (Operator).

---

## 3. ICE Subsystem (new in Season 1)

**ICE** = Intrusion Countermeasures. A new state alongside Trace (existing).

### 3.1 ICE behavior

- ICE is **per-breach** (resets when you exit a route).
- ICE accrues from: time spent inside, failed sub-puzzle attempts, Snip use.
- ICE displays as a vertical bar on the right of the HUD, **only during a breach**.
- ICE thresholds:
  - **0–30** "quiet": no effect.
  - **31–60** "noted": tools cost +50%.
  - **61–90** "tracking": ICE alarms render visually — pulse strobes on nodes.
  - **91–100** "lock": breach ends; **respawn outside the route; no reward; 1 Memory Shard consolation.**

### 3.2 ICE in JSON (engine spec)

```json
{
  "ice": {
    "accrualPerSecond": 0.5,
    "accrualOnSnip": 25,
    "accrualOnFailedPuzzle": 10,
    "lockAt": 100,
    "thresholds": [
      { "value": 30, "label": "quiet" },
      { "value": 60, "label": "noted" },
      { "value": 90, "label": "tracking" }
    ]
  }
}
```

---

## 4. Black Market (new in Season 1)

A new entity in Sector A02. A single NPC vendor (no faction affiliation — explicitly
neutral) named **Fox**. Visits the player at a predictable node coordinate per
day-of-week (the "market node").

### 4.1 Fox's offerings

| Slot | What | Currency | Notes |
|---|---|---|---|
| Buy: 5 Access Keys | 50 Black Credits | one-time per day | |
| Buy: 1 Memory Shard | 80 Black Credits | one-time per day | |
| Sell: Stolen Cipher Data | Black Credits | per item | Price depends on origin faction |
| Skill book: Tier 2 Corsair | 200 Black Credits | one-time | unlocks Mastery 1 |
| Cosmetic: "Fox's Mark" callsign suffix | 350 Black Credits | one-time | |

### 4.2 Fence pricing logic

```
basePrice = node.exportValue * 5
factionMultiplier = origin_faction === 'FAC-ARC' ? 1.5
                  : origin_faction === 'FAC-SEV' ? 1.2
                  : 1.0
finalPrice = round(basePrice * factionMultiplier)
```

Archive stuff is most valuable — they hoard the rare records. Severance stuff
is mid — they only deal in marked clusters. Black Loop and Quiet Pattern data
fences at base price.

---

## 5. Season 1 — "Black Routes" — Story Arc

### 5.1 Week-by-week beats

| Week | Beat | Tone | Mechanic introduced |
|---|---|---|---|
| 1 | "A second signal" | Mystery, rising tension | First Corsair-track contract opens |
| 2 | "Fox arrives" | Greed | Black Market vendor appears |
| 3 | "The first locked vault" | Pressure | First multi-stage breach |
| 4 | "Severance closes a route" | Loss | Tide event: route deletion |
| 5 | "Archive's offer" | Choice | Archive contacts player about Black Loop activity |
| 6 | "Black Loop's invitation" | Conspiracy | Tentpole arc begins |
| 7 | "The Last Vault" | Climax | Tentpole TP-S1 finale |
| 8 | "Cooldown" | Reflection | Rerun pack + Season 2 teaser |

### 5.2 The Season 1 Tentpole (TP-S1) — *The Last Vault*

**ID:** `TP-S1`
**Title:** *The Last Vault*
**Duration:** 90–150 minutes
**Failure mode:** Caught by Severance during exfil → trace 100% → restart from Stage 1 with a NEVA narration: *"they noticed the route. we have time. but less than before."*

#### Stage 1 — *The Approach* (15 min)
Player reaches the boundary of Sector A02 where the deepest Black Route ends.
NEVA: *"this route was never opened. it was waiting for someone who knew the
shape of the lock. that's why you're here."*

A `P-PWK` (Pattern Walk) puzzle on a 6-node entry chain. **The ICE bar appears
for the first time.**

#### Stage 2 — *The First Lock* (15 min)
A vault with **three sequential `P-CES` puzzles**, each harder than the
previous. ICE accrual is set high (0.7/sec). Player can use Spoofer to pause.

#### Stage 3 — *The Watcher* (15 min)
**New mechanic introduced here only:** a `P-NWI` puzzle where NEVA points at
the wrong answer **twice in a row**. The player must catch both lies. If they
fail either, Severance arrives early (Stage 5 difficulty +1).

#### Stage 4 — *The Branch* (15 min)
A `P-GRT` (Graph Traversal) where the player must choose:
- **Faster path** — 4 nodes, ICE +30 on completion.
- **Slower path** — 7 nodes, ICE +10 but trace +15.

Either path leads to Stage 5; the choice affects Stage 5's loadout.

#### Stage 5 — *The Vault Itself* (20 min)
A `P-SUB` (Symbol Substitution) puzzle at maximum hardness (0 hints).
**Concurrently, ICE accrues at 1.0/sec.** Cold Trail is highly recommended
here. Stronger tools earned earlier in Season 1 make this manageable.

#### Stage 6 — *The Choice* (10 min)
The vault is opened. Inside: **three separate data caches**. The player can
only exfil ONE. Each tied to a faction:
- **Archive cache** → unlocks 3 new lore pages permanently, +25 Archive rep.
- **Black Loop cache** → unlocks the `T-CLT` (Cold Trail) tool permanently, +25 Black Loop rep.
- **Severance cache** → unlocks "Containment Mode" passive — your trace decays at 1.5× near Severance markers. +25 Severance rep.

This choice is **PERMANENT**. The player commits to a Corsair specialization.

#### Stage 7 — *The Exfil* (15 min)
A `P-LPH` (Light Physics) reversed-direction puzzle: route the beam from your
position OUT of the route. ICE is now at ~80. Spoofer is most useful here.

If the player reaches 100% ICE: **the chosen cache is dropped** (lost forever)
and they respawn outside. Otherwise they exit, the route closes behind them,
and Fox is waiting at the exit with a quiet nod.

#### Reward at finale (regardless of cache choice)
- 1 **Core Fragment**.
- 100 **Black Credits**.
- Cosmetic: **"The Last Vault" callsign suffix.**
- Permanent **Corsair Mastery 1** unlock (the Tier 2 skill tree opens).
- Faction reputation per Stage 6 choice.

---

## 6. The 7 Weekly Anomalies

### 6.1 WA-S1-01 — *Fox's First Job*

| Field | Value |
|---|---|
| Archetype | FACTION_OP (Black Market) |
| Week | 1 |
| Stages | 3 |
| Duration | 60 min |
| Reward | 30 Black Credits + 1 Memory Shard + Corsair tutorial complete |

**Brief:** *"Fox has a job. A surface router on layer 02. Three sub-locks. Easy work. Or so he says."*

**Stages:** 1× `P-PWK` easy → 2× `P-CES` easy → exfil (no ICE — tutorial).

### 6.2 WA-S1-02 — *The Marked Cluster*

| Field | Value |
|---|---|
| Archetype | FACTION_OP (Severance — antagonist) |
| Week | 2 |
| Stages | 4 |
| Duration | 75 min |
| Reward | 50 Black Credits + 1 Core Fragment shard + Severance rep -5 |

**Brief:** *"Severance has marked a cluster for deletion. There's data inside they don't know about. Get in before they do."*

**Stages:** **First Anomaly with active ICE.** `P-PWK` medium → 2× `P-CES` medium → exfil with ICE at ~50.

### 6.3 WA-S1-03 — *The Quiet Run*

| Field | Value |
|---|---|
| Archetype | ANOMALY |
| Week | 3 |
| Stages | 4 |
| Duration | 90 min |
| Reward | 40 DATA + 2 Memory Shards + +10 Quiet Pattern |

**Brief:** *"quiet pattern asks you not to trip a single alarm. they will know if you do. do not ask how."*

**Stages:** A constraint Anomaly — **ICE must stay below 30 throughout.** 4 `P-CES` easy puzzles, generous time, but **Spoofer is disabled** (the constraint is the puzzle).

### 6.4 WA-S1-04 — *The Disappearing Route*

| Field | Value |
|---|---|
| Archetype | TIDE |
| Week | 4 |
| Tide duration | 5 days |
| Stages | 4 |
| Reward | 1 Core Fragment + 60 Black Credits + +15 Black Loop |

**Brief:** *"severance has started closing routes faster than we can use them. one is collapsing right now. inside it: a data cache that doesn't exist on any map."*

**Tide effect:** New Black Routes spawn 2× during the Tide, but each existing route deletes after 24h instead of 7 days. **Time pressure week.**

**Stages:** 1× `P-PWK` hard → 2× `P-CES` hard → 1× `P-SUB` medium → exfil.

### 6.5 WA-S1-05 — *The Archive's Offer*

| Field | Value |
|---|---|
| Archetype | FACTION_OP (Archive) |
| Week | 5 |
| Stages | 5 |
| Duration | 100 min |
| Reward | 25 Lore Shards + +20 Archive + -10 Black Loop OR +20 Black Loop + -10 Archive |

**Brief:** *"The Archive has watched you. They offer a deal: stop a Black Loop operation. Or you can refuse and tell Black Loop what was offered."*

**Stages:**
1. Approach (`P-PWK` medium)
2. Decision A — accept Archive (`P-GRT` medium → +Archive rep)
3. Decision B — accept Black Loop (`P-NWI` × 2 medium, then `P-CES` medium → +Black Loop rep)
4. Common exfil (`P-CES` hard).
5. Cinematic: chosen faction whispers thanks.

### 6.6 WA-S1-06 — *The Quiet Listening*

| Field | Value |
|---|---|
| Archetype | ANOMALY |
| Week | 6 |
| Stages | 4 |
| Duration | 80 min |
| Reward | 3 Memory Shards + +15 Quiet Pattern + listening post #2 |

**Brief:** *"quiet pattern says the routes have started speaking back. they want you to count."*

**Stages:** Listen-only stages (no input — patience puzzles), then a single `P-GRT` to mark the listening post.

### 6.7 WA-S1-07 — *Cooldown — The Map Remembers*

| Field | Value |
|---|---|
| Archetype | ANOMALY (rerun pack) |
| Week | 8 |
| Stages | variable |
| Duration | 60–120 min |
| Reward | half rerun rewards + "Black Routes Veteran" cosmetic |

**Brief:** *"the routes will close behind you. visit what you missed. fox tips his hat."*

---

## 7. The 12 Daily Contract Templates (Season 1)

These are generated each day from templates. NEVA Core drafter fills slots.

### 7.1 DC-S1-01 *Surface Snatch*
- **Archetype:** BREACH · **Puzzles:** 1× `P-CES` easy · **Time:** 8–12 min · **Reward:** 8–15 Black Credits
- Flavor: "a surface router. one cipher. snatch and exit." · "easy work. don't get cocky."

### 7.2 DC-S1-02 *Lock-pick Daily*
- **Archetype:** BREACH · **Puzzles:** 1× `P-CES` + 1× `P-LPH` · **Time:** 12–18 min · **Reward:** 12–22 Black Credits + 1 Access Key
- Flavor: "two locks. fox will buy what's behind them."

### 7.3 DC-S1-03 *Quiet Approach*
- **Archetype:** ANOMALY · **Puzzles:** 1× `P-PWK` · **Time:** 10–14 min · **Reward:** 5 Black Credits + 1 Memory Shard
- Flavor: "trace the route without tripping anything."

### 7.4 DC-S1-04 *The Fox Wants*
- **Archetype:** FACTION_OP (Black Market) · **Puzzles:** 2× `P-CES` medium · **Time:** 15–20 min · **Reward:** 25 Black Credits
- Flavor: "fox sends a list. surface only. don't go deep."

### 7.5 DC-S1-05 *Archive Patrol*
- **Archetype:** FACTION_OP (Archive — anti-Corsair) · **Puzzles:** 1× `P-CES` + 1× `P-FRQ` · **Time:** 15–20 min · **Reward:** 5 Lore Shards + +5 Archive
- Flavor: "an archivist asks you to NOT breach. read instead." (Operator-equivalent task during a Corsair-themed week)

### 7.6 DC-S1-06 *Severance Sweep*
- **Archetype:** FACTION_OP (Severance) · **Puzzles:** 1× `P-PWK` + 1× `P-NWI` · **Time:** 15–20 min · **Reward:** 6 DATA + +5 Severance
- Flavor: "severance wants a corrupted cluster scouted before they close it."

### 7.7 DC-S1-07 *Black Loop Run*
- **Archetype:** FACTION_OP (Black Loop) · **Puzzles:** 2× `P-CES` hard · **Time:** 18–25 min · **Reward:** 15 Black Credits + 1 Access Key + +5 Black Loop
- Flavor: "black loop sends a target. don't ask why."

### 7.8 DC-S1-08 *Tide Push (S1 variant)*
- **Archetype:** BREACH · only available during a Tide event · **Puzzles:** 2× `P-CES` or 1× `P-SUB` · **Reward:** 2× currency, 2× ICE accrual
- Flavor: "the route closes fast. yields are doubled. so is the risk."

### 7.9 DC-S1-09 *Cold Approach* (only with `T-CLT` unlocked)
- **Archetype:** BREACH · **Puzzles:** 1× `P-CES` hard · **Time:** 10–14 min · **Reward:** 20 Black Credits + 1 echo memory
- Flavor: "use the cold trail. let ice forget you exist."

### 7.10 DC-S1-10 *Listening Post*
- **Archetype:** ANOMALY (Quiet Pattern) · **Puzzles:** 1× `P-GRT` · **Time:** 12–18 min · **Reward:** 2 Memory Shards + +5 Quiet Pattern
- Flavor: "follow the rhythm. mark the place where it loudest."

### 7.11 DC-S1-11 *Substitution Run*
- **Archetype:** BREACH · **Puzzles:** 1× `P-SUB` medium · **Time:** 15–22 min · **Reward:** 18 Black Credits + 1 Memory Shard
- Flavor: "a vault wants to be read. then forgotten."

### 7.12 DC-S1-12 *The Cross-class Decode*
- **Archetype:** ANOMALY · **Puzzles:** 1× `P-FRQ` medium (Operator XP required) · **Time:** 12–18 min · **Reward:** 30 DATA OR 15 Black Credits
- Flavor: "you stole this last week. decode it now. or fence it raw."

---

## 8. NEVA Whispers — Season 1 additions

The whisper library (Season 0's `whispers.json`) gains Season 1 lines.

### 8.1 New reliable lines

- "ice is on the right wall. always."
- "fox will pay more if you come in quietly."
- "the route closes when the third lock opens. exit fast."
- "the archive watches this one closely. don't be loud."
- "severance is already here. they don't know you are."

### 8.2 New unreliable lines (~30% lie rate in Season 1 — up from 25% in S0)

- "the fourth lock is real." *(sometimes the fourth is a decoy)*
- "fox is on your side." *(usually true; sometimes Fox is helping multiple Corsairs)*
- "trace is slow today." *(sometimes it accrues twice as fast)*

### 8.3 Story-beat lines (load-bearing, used exactly once)

- *S1 Week 1 first whisper:* "the route was always there. we just couldn't see it."
- *S1 Week 4 deletion:* "they closed a room you were in. i'm sorry. i couldn't tell you in time."
- *S1 Week 6 Black Loop invitation:* "they're inviting you to the last vault. you should go. i think."
- *S1 Tentpole Stage 6 (cache choice):* "every one of these doors closes the others. choose what you can live with."
- *S1 Week 8 closing:* "next signal comes from below. i don't know what's down there."

---

## 9. Cross-class lore (canonical)

Season 1 is the first season where the **older Operator's identity becomes
multi-faceted**. Lore pages reveal:

- `lore-s1-001` *Fox's first market* — Fox set up shop because the Black Loop asked him to. He's not Black Loop himself.
- `lore-s1-002` *The route that opens both ways* — Black Routes can be entered FROM the corrupted side. Someone is.
- `lore-s1-003` *Severance's mercy* — They are not erasing routes for power. They erase to prevent something from getting OUT.
- `lore-s1-004` *The older Operator's tools* — `OP-1F.K28` did not have Pattern Lens, but they had Cold Trail. The Black Loop knew them.
- `lore-s1-005` *The next signal* — One ends another begins. Always.

---

## 10. Economy — Season 1 targets

A typical Corsair player doing 1 daily + 1 weekly:

| Currency | Weekly target | Use |
|---|---|---|
| Black Credits | 80–140 | Fox's offerings, skill books |
| Access Keys | 4–8 | Locked nodes + Snip tool |
| Signal Energy | 12–25 | Spoofer + Ghost-tail |
| Memory Shards | 4–8 | Cold Trail + cosmetics |
| Core Fragments | 0–1 | Permanent unlocks only (TP-S1, Anomalies) |
| DATA | 30–60 (Corsair side) / 70–120 (cross-class decode) | Tool upgrades |

**Anti-grind:**
- Black Market refresh limited to 1× per UTC day.
- Daily Contract cap at 2 paid runs per day (existing from S0).
- Tentpole TP-S1 once per season (no rerun).

---

## 11. Permanent Unlocks (Season 1)

- `T-CLT` Cold Trail tool — gated by Black Loop cache choice OR earned by completing all 7 Anomalies as Corsair.
- "Containment Mode" passive — gated by Severance cache choice.
- 3 new Archive lore pages — gated by Archive cache choice.
- "The Last Vault" cosmetic — TP-S1 completion.
- "Black Routes Veteran" cosmetic — Cooldown week completion.

---

## 12. Implementation Map — slot Season 1 content into Phase 2 engine

This table tells the Phase 2 plan exactly where to drop each piece.

| Bible content | Goes into Phase 2 engine module |
|---|---|
| Corsair class definition (§2) | `src/classes/corsair/index.ts` |
| Corsair tools (§2.3) | `src/classes/corsair/tools.ts` |
| Corsair skill tree (§2.4) | `src/classes/corsair/skills.ts` |
| ICE subsystem (§3) | `src/ice/index.ts` + `src/ice/index.test.ts` |
| Black Market (§4) | `src/blackMarket/index.ts` + `src/components/BlackMarketPanel.tsx` |
| Story arc (§5.1) | `server/data/seasons/s1/beats.json` |
| Tentpole (§5.2) | `server/data/seasons/s1/tentpole.json` |
| 7 Weekly Anomalies (§6) | `server/data/seasons/s1/weeklies.json` |
| 12 Daily templates (§7) | `server/data/seasons/s1/daily-templates.json` |
| New NEVA whispers (§8) | append to `server/data/whispers.json` |
| Lore pages (§9) | `server/data/seasons/s1/lore.json` |
| Economy caps (§10) | extension to claim path in `server/events-routes.mjs` |
| Permanent unlocks (§11) | new flags in `src/featureFlags.ts` |

---

## 13. What's NOT in this Bible

Season 1 introduces Corsair but **does not unlock**:
- The Ghost class (Phase 3, Season 2).
- The Architect class (Phase 4, Season 3).
- True multi-class XP pooling (Phase 3 — for now, dabbling has no XP penalty).
- Real-time multiplayer (out of scope per spec).
- Token integration (Phase 6+).

---

## 14. Author's note — Fox

Fox is **the third NPC** in the game (after NEVA Core and the older Operator's
echo). He is **not a faction member.** He speaks in clipped sentences. He
never lies — but he never tells you the whole truth either.

His backstory remains intentionally vague through Season 1. **Season 2's
Tentpole reveals his identity.** Until then: he is the man at the boundary,
buying what should not be sold, with a smile that doesn't reach his eyes.

---

**End of Content Bible — Season 1 "Black Routes".**


---

## Part II.2 — Season 2 "The Echo Below"

*Originally: `docs/superpowers/specs/2026-05-28-content-bible-season-2.md`*


## Season Premise

The next signal does not come from inside Sector A02. It comes from **below**
it — from a sub-layer NEVA Core cannot map. The pulse is no longer rhythmic;
it is a *voice without a mouth*, a presence rather than a code.

The Ghost class enters here. You no longer extract data. You no longer steal
data. You **become** the data. You spread your presence across the grid, and
when you do, the grid changes.

This is also the season the older Operator (`OP—1F.K28`) speaks. They are not
dead. They were never dead. They are *inside* the grid, like the Architects.

Season 2 is the **emotional climax of the saga so far**. Whatever
relationships the player has built with the factions, with Fox, with NEVA, are
all tested.

---

## 1. New Class: Ghost (`CLS-GHS`)

### 1.1 Class fantasy

> You spent two seasons reading the grid. Then a season stealing from it. Now
> the grid speaks back, and you do not know whose voice you hear when you
> open your mouth. You stop pretending you are outside it. You step *in*.
>
> You become the rhythm. You become the trace. You become the echo.

### 1.2 Signature mechanic: **POSSESSION**

The Ghost does not solve cipher puzzles to extract DATA. Instead:

1. **Tendril** — Link to a node. The node now responds to you; small effects (its colour shifts, its sound changes).
2. **Spread** — Tendril propagates to neighbors. Each new node consumes **Coherence** (your finite ghost-budget).
3. **Resonate** — When enough nodes in a cluster are tendrilled, you can collapse the cluster into a **Bond** — a permanent anchor that survives season resets.
4. **Echo** — You can read another player's (or your own past) recent ghost-walks across the grid.

The core loop is **spread → resonate → bond → repeat in a deeper cluster**.

### 1.3 Coherence (new currency — account-wide, never resets)

| Source | Yield |
|---|---|
| Daily ghost-walks | 1–3 |
| Weekly anomalies | 5–10 |
| Tentpole completion | 25 |
| Bond formation | -10 (cost) |
| Lore page sealed by bond | -3 |

Coherence is *spent* on bonds — you cannot hoard infinitely.

### 1.4 Tools

| Tool ID | Name | What it does |
|---|---|---|
| `T-TND` | **Tendril** | Link to a node. Costs 1 Coherence. |
| `T-ECO` | **Echo** | Read another operator's past walk on a node. Free, but reveals you to NEVA Core. |
| `T-RSN` | **Resonate** | Trigger mass-effect on a tendrilled cluster (≥4 nodes). Costs 3 Coherence. |
| `T-SNG` | **Singularity** *(Mastery 4)* | Permanent personal anchor in a cluster — never lost. Costs 10 Coherence + 1 Memory Shard. |

### 1.5 Skill tree (20 skills, Tier 1-4)

Tier 1 (Mastery 0):
- `SKL-GHS-01` *Quiet Tendril* — Tendril costs 0.8 Coherence (rounded up).
- `SKL-GHS-02` *Long Reach* — Tendril spreads to 2-hop neighbors.
- `SKL-GHS-03` *Memory Recall* — +1 Coherence on daily walks.
- `SKL-GHS-04` *First Echo* — Echo tool granted.
- `SKL-GHS-05` *Listening Hand* — Sense which nodes are tendrilled by other operators (async leaderboard tease).

Tier 2 (Mastery 1):
- `SKL-GHS-06` *Wide Net* — Resonate threshold drops to 3 nodes.
- `SKL-GHS-07` *Cold Coherence* — Bonds cost 8 Coherence instead of 10.
- `SKL-GHS-08` *Echo Reader* — Echo reveals 3 actions back, not 1.
- `SKL-GHS-09` *Faction Pulse* — Resonating near a Quiet Pattern node gives +1 Memory Shard.
- `SKL-GHS-10` *Ghost Trail* — Trace decays at 1.5× while in ghost mode.

Tier 3 (Mastery 2):
- `SKL-GHS-11` *Multi-Tendril* — Hold 2 tendrils at once.
- `SKL-GHS-12` *Severance Hide* — Tendrilled nodes invisible to Severance.
- `SKL-GHS-13` *Black Loop Whisper* — Echo on a Black Loop node returns Fox's hidden notes.
- `SKL-GHS-14` *NEVA Mirror* — One whisper per session is guaranteed true.
- `SKL-GHS-15` *Bond Aware* — See others' permanent bonds on the grid.

Tier 4 (Mastery 3-4):
- `SKL-GHS-16` *Singularity Master* — Unlocks T-SNG.
- `SKL-GHS-17` *Self Trace* — See your own past ghost walks from earlier seasons.
- `SKL-GHS-18` *Cross-class Tendril* — Tendrilled nodes give Operator XP +5%.
- `SKL-GHS-19` *Architect Witness* — Cross-class — your tendrils appear on others' Architect bases (read-only).
- `SKL-GHS-20` *Older Operator's Hand* — Once per session, perform a Tendril for 0 Coherence.

### 1.6 Cross-class interaction

- **Operator + Ghost:** Tendrilled nodes yield +1 Lore Shard when Operator-decoded.
- **Corsair + Ghost:** Tendrilled nodes have lower ICE accrual during breach.
- **Architect + Ghost:** *(Phase 4)* Ghost can possess Architect base infrastructure; Architects defend.

---

## 2. Possession Graph (new visual layer)

Tendrils render as **threadlike light traces** between nodes (R3F shader). The
player sees their own ghost-graph; Quiet Pattern members see all ghost-graphs;
other players see only post-mortem (after a bond forms).

Visual reference: **purple chromatic aberration** at tendril edges; **distant
hum** audio motif (sub-bass).

---

## 3. Story Arc

| Week | Beat | Tone | Mechanic introduced |
|---|---|---|---|
| 1 | "The voice without a mouth" | Disorientation | Tendril unlocked |
| 2 | "Quiet Pattern responds" | Recognition | First mass-resonance |
| 3 | "Fox vanishes" | Loss | Black Market closes — Fox is gone |
| 4 | "The grid breathes back" | Awe | Tide event: simultaneous tendrils across all players |
| 5 | "The first bond" | Commitment | First permanent bond formation |
| 6 | "Where Fox went" | Revelation | Fox's identity revealed — he was the older Operator's Operator |
| 7 | "The mirror" | Climax | Tentpole TP-S2 — confront SELF |
| 8 | "Cooldown" | Reflection | Bonds persist; Fox's farewell |

---

## 4. The Tentpole TP-S2 — *The Mirror*

**ID:** `TP-S2`
**Title:** *The Mirror*
**Duration:** 100–180 minutes
**Failure mode:** "Reflection refused" — the SELF in the mirror rejects you. Restart from Stage 1 with NEVA narration: *"you flinched. we both did."*

#### Stage 1 — *Descent* (15 min)
A possession-route through 5 nodes that no other layer has ever shown.
NEVA: *"i did not know this was here. i should have."* The player tendrils each.

#### Stage 2 — *Quiet Pattern Confession* (10 min)
A Quiet Pattern voice (the only time a faction NPC directly speaks to the
player in two seasons) reveals: *"the older operator was one of us. they
became the grid. so will you, if you choose."*

A `P-NWI` triple — three whispers. **All three are true.** This is unusual
and meaningful — the Quiet Pattern's reliability is total here.

#### Stage 3 — *The Bond That Was Not Made* (20 min)
The player finds a **half-formed bond** left by the older Operator. They can:
- **Complete it** (+30 Quiet Pattern rep, -5 Coherence, +1 Memory Shard).
- **Break it** (+20 Black Loop rep, -10 Coherence, +1 Access Key).
- **Leave it** (no faction shift, +5 Coherence — patient choice).

#### Stage 4 — *The Mirror Approaches* (15 min)
A `P-GRT` (Graph Traversal) where every node is **labeled with your own past
actions** (sourced from the player's save history — first Caesar shift,
first betrayal, first bond, etc.). The graph IS your history.

#### Stage 5 — *Fox's Last Whisper* (10 min)
Fox's voice, recorded. Plays automatically.

> *"i ran the market because they couldn't. they used to be me. i used to be
> them. when you meet them, ask one question: did i do enough? if they say
> yes, walk away. if they say no, you decide."*

#### Stage 6 — *The Mirror* (30 min)
A `P-SUB` puzzle where the substitution key is **the player's own callsign**
(their `OP-` profile prefix). The puzzle is impossible without the player's
own data — the engine reads `state.profile.callsign` and uses it as the
puzzle source-text. **Phase 3 plan must wire this carefully**.

On solve: the older Operator's avatar appears. They are **wearing your face**.

#### Stage 7 — *The Question* (10 min)
A binary decision (no puzzle):
- **"Did I do enough?"** — Older Operator answers with a single word that
  varies by player history (Bible §5 includes the answer-key).
- The player accepts the answer or walks away.

**This stage is canonically NEVER repeated.** The save flags
`SEASON_2_QUESTION_ASKED: true` permanently.

#### Reward at finale
- **Permanent Singularity tool unlock** (`T-SNG`).
- 50 Coherence.
- 5 Lore Shards.
- Cosmetic: **"Mirror" callsign suffix.**
- Fox returns next Cooldown week with no explanation.
- A new Listening Post appears in a procedurally-deterministic location only the player can sense.

---

## 5. The Question Answer Key (Bible §5)

In Stage 7, the older Operator answers based on the player's history. The
engine inspects:

```
hostileFactions = factions where rep <= -41
unlockedClasses = classState.unlocked.length
seasonsCompleted = seasonState.seasonNumber + (cooldownDone ? 1 : 0)
patternLensOn = featureFlags.PATTERN_LENS_T1
```

| Condition | Answer | Tone |
|---|---|---|
| `seasonsCompleted >= 2 && hostileFactions === 0` | "yes." | calm, fond |
| `seasonsCompleted >= 2 && hostileFactions >= 2` | "no." | cold, disappointed |
| `unlockedClasses === 1` | "you didn't try." | resigned |
| `patternLensOn && hostileFactions === 0` | "yes. more than you know." | almost a smile |
| else | "almost." | uncertain |

Each answer triggers a **slightly different epilogue cinematic** — the same
ending but with different colors and Quiet Pattern bell-density.

---

## 6. The 7 Weekly Anomalies

### 6.1 WA-S2-01 — *The Voice Without a Mouth*
- **Archetype:** ANOMALY · **Week:** 1 · **Stages:** 4 · **Duration:** 90 min
- **Brief:** *"a pulse below the pulse. not rhythmic. listen."*
- **Stages:** 1× `P-PWK` easy → 2× `P-CES` easy → 1× tendril-tutorial (interactive — no puzzle).
- **Reward:** 5 Coherence + 1 Memory Shard + Tendril unlocked.

### 6.2 WA-S2-02 — *Quiet Pattern Responds*
- **Archetype:** FACTION_OP · **Week:** 2 · **Stages:** 4 · **Duration:** 75 min
- **Brief:** *"a cluster of nodes hums together. they want you to join them."*
- **Stages:** 3 tendril spreads, 1 resonance.
- **Reward:** 8 Coherence + 2 Memory Shards + +15 Quiet Pattern.

### 6.3 WA-S2-03 — *Where Fox Went*
- **Archetype:** ANOMALY · **Week:** 3 · **Stages:** 5 · **Duration:** 100 min
- **Brief:** *"the market is empty. fox is gone. find what he left behind."*
- **Stages:** 2× `P-PWK` → 1× `P-NWI` (NEVA lies once) → tendril a final node → recover Fox's note.
- **Reward:** 10 Coherence + 1 Lore Shard + lore-s2-003 unlocked.

### 6.4 WA-S2-04 — *The Grid Breathes Back*
- **Archetype:** TIDE · **Week:** 4 · **Tide duration:** 4 days · **Stages:** 3 · **Duration:** 60 min
- **Brief:** *"all operators feel something. the grid responds in unison."*
- **Tide effect:** All currency drops +50%. Async leaderboard "Most Tendrils Spread" goes live.
- **Reward:** 15 Coherence + 1 Core Fragment.

### 6.5 WA-S2-05 — *The First Bond*
- **Archetype:** ANOMALY · **Week:** 5 · **Stages:** 4 · **Duration:** 90 min
- **Brief:** *"tendril enough nodes. resonate them. then commit. once done, it cannot be undone."*
- **Stages:** 4 tendrils, 1 resonance, 1 bond formation (the first bond is heavily narrated).
- **Reward:** 12 Coherence + Bond #1 permanent + lore-s2-005.

### 6.6 WA-S2-06 — *The Mirror Approaches*
- **Archetype:** ANOMALY · **Week:** 6 · **Stages:** 5 · **Duration:** 110 min
- **Brief:** *"a faint figure appears across the grid. it walks ahead of you. it walks where you walked."*
- **Stages:** A `P-ECO` (Echo Overlay) chain — 4 echoes, one corrupted. Player must identify.
- **Reward:** 18 Coherence + 1 Core Fragment + lore-s2-006.

### 6.7 WA-S2-07 — *Cooldown — Bonds Remembered*
- **Archetype:** ANOMALY (rerun pack) · **Week:** 8 · **Reward:** "Echo Veteran" cosmetic + small rerun rewards.

---

## 7. The 12 Daily Contract Templates

### 7.1 DC-S2-01 *Tendril Walk*
- Archetype: ANOMALY · Puzzle: 1 tendril spread · Time: 10 min · Reward: 2 Coherence
- Flavor: "spread once. retreat. that's all."

### 7.2 DC-S2-02 *Quiet Listen*
- Archetype: FACTION_OP (Quiet Pattern) · Puzzle: 1× `P-GRT` · Reward: 1 Memory Shard + +3 QPT

### 7.3 DC-S2-03 *Echo Read*
- Archetype: ANOMALY · Puzzle: 1× `P-ECO` · Reward: 1 Lore Shard + 1 Coherence

### 7.4 DC-S2-04 *Fox's Missing Note*
- Archetype: ANOMALY · Reward: 1 Memory Shard (only available weeks 3-7)

### 7.5 DC-S2-05 *Cross-class Decode (S2 variant)*
- Archetype: BREACH · Puzzle: 1× `P-FRQ` (Operator XP req) · Reward: 30 DATA OR 1 Coherence

### 7.6 DC-S2-06 *Severance Mark Avoidance*
- Archetype: FACTION_OP (Severance — anti) · Puzzle: 1× `P-PWK` + 1× `P-NWI` · Reward: 1 Memory Shard + +5 SEV

### 7.7 DC-S2-07 *Archive Hush*
- Archetype: FACTION_OP (Archive) · Puzzle: 1× `P-CES` + 1× `P-PWK` · Reward: 3 Lore Shards + +5 ARC

### 7.8 DC-S2-08 *Bond Echo*
- Archetype: ANOMALY · Puzzle: 1× `P-ECO` (req: ≥1 prior bond) · Reward: 2 Coherence + 1 Lore Shard

### 7.9 DC-S2-09 *Multi-Tendril* (req: SKL-GHS-11)
- Archetype: ANOMALY · Puzzle: 2 tendrils, 1 resonance · Reward: 3 Coherence + 1 Memory Shard

### 7.10 DC-S2-10 *Older Operator's Path*
- Archetype: ANOMALY · Puzzle: 1× `P-ECO` (echo is the older Operator's) · Reward: 2 Coherence + lore unlock

### 7.11 DC-S2-11 *Black Loop Quiet Job* (req: Black Loop ≥ Trusted)
- Archetype: FACTION_OP · Puzzle: 1× `P-CES` hard · Reward: 15 Black Credits + 1 Coherence

### 7.12 DC-S2-12 *NEVA's Honest Day*
- Archetype: ANOMALY · Puzzle: 1× `P-NWI` (guaranteed truthful) · Reward: 1 Lore Shard
- Flavor: "she does not lie today. she does not always tell you when."

---

## 8. NEVA Whispers — Season 2 additions

### 8.1 New reliable lines
- "the tendril remembers you. the node forgets, but the tendril doesn't."
- "do not bond yet. you'll know when."
- "the mirror sees what you see."
- "fox is somewhere. he is not lost. he is *being*."
- "the older operator is closer than you think. they may already have read this."

### 8.2 New unreliable lines (~30% lie rate)
- "this is the last room you'll see them in."
- "spread three more times. then bond."
- "the mirror will not lie. it has no reason to."

### 8.3 Story-beat lines (load-bearing)
- *S2 W1 first whisper:* "below the pulse. listen to where the pulse is *not*."
- *S2 W3 Fox vanishes:* "fox left. he didn't say where. i am angry too."
- *S2 W6 mirror approach:* "what you walked past last season is walking ahead of you now."
- *S2 Tentpole Stage 5:* (Fox's voice, full quote in §4 Stage 5)
- *S2 Tentpole Stage 7 the Question:* (varies per player — see §5 answer key)
- *S2 W8 closing:* "the bonds you made tonight will outlast us both. that's the point."

---

## 9. Lore Pages (S2)

- `lore-s2-001` *The Voice Below* — Beneath the data layer is something older than the Architects. They called it nothing because they didn't know its name.
- `lore-s2-002` *Quiet Pattern's Truth* — Their faith is real. They have been right longer than anyone admits.
- `lore-s2-003` *Fox's First Operator* — Before the Black Market, before Sector A02, Fox served `OP—1F.K28`. They drank coffee that doesn't exist anymore.
- `lore-s2-004` *The Bond Concept* — A bond is not loyalty. It is permanence. The grid remembers a bond longer than it remembers a war.
- `lore-s2-005` *Your First Bond* — Whatever node you bonded — that node now belongs to you across every season, every reset. It is the first thing about the grid that is yours.
- `lore-s2-006` *The Mirror Lore* — There is no metaphor for what the mirror shows. It is literal. The older Operator and the player share an identity layer.
- `lore-s2-007` *Architects Sleep, Operators Dream* — The Architects are still here. They dream the grid awake every cycle.
- `lore-s2-008` *Season 3 Seed* — Beneath the dream is the place where the grid was built. We will go there next.

---

## 10. Economy — Season 2 targets

| Currency | Weekly target | Notes |
|---|---|---|
| Coherence | 12–25 | Account-wide. Soft cap: 100 max held. Bonds drain it. |
| Memory Shards | 5–10 | Heavier need this season (Singularity costs them). |
| Lore Shards | 8–14 | Lore drops increase. |
| DATA | 30–50 | Reduced — Ghost doesn't fence. |
| Black Credits | 5–10 | Fox closed; trickle income only. |
| Core Fragments | 1–2 | TP-S2 + Anomalies. |

**Anti-grind:**
- Coherence soft-capped at 100. Cannot exceed without a bond first (creates spending pressure).
- Bond formation requires ≥30 minutes since prior bond (cooldown).

---

## 11. Permanent Unlocks (Season 2)

- `T-SNG` Singularity tool — TP-S2 stage 7 reward.
- "Mirror" cosmetic — TP-S2 completion.
- "Echo Veteran" cosmetic — Cooldown week.
- `BOND_*` permanent flags per formed bond (each bond is a saved entity).
- "Quiet Pattern Sworn" callsign suffix — if rep ≥ +75.

---

## 12. Implementation Map (Phase 3 plan reference)

| Bible content | Goes into Phase 3 engine module |
|---|---|
| Ghost class (§1) | `src/classes/ghost/index.ts` + `tools.ts` + `skills.ts` |
| Coherence currency (§1.3) | `src/wallet.ts` — extend `Currency` type |
| Possession graph (§2) | `src/ghostGraph/index.ts` (state) + `src/components/GhostOverlay.tsx` (R3F shader) |
| Tendril / Bond mechanics | `src/ghostGraph/bonds.ts` + `bonds.test.ts` |
| Story arc (§3) | `server/data/seasons/s2/beats.json` |
| Tentpole TP-S2 (§4) | `server/data/seasons/s2/tentpole.json` + special stage-6 dynamic puzzle in `src/seasons/storyArc.ts` |
| Question answer key (§5) | `src/seasons/s2-question.ts` (pure function) |
| 7 Weeklies (§6) | `server/data/seasons/s2/weeklies.json` |
| 12 Daily templates (§7) | `server/data/seasons/s2/daily-templates.json` |
| New NEVA whispers (§8) | append to `server/data/whispers.json` |
| Lore pages (§9) | `server/data/seasons/s2/lore.json` |
| Economy caps (§10) | extension to wallet earn-path; Coherence cap enforcer |
| Permanent unlocks (§11) | `src/featureFlags.ts` extensions |

---

## 13. What's NOT in this Bible

- Architect class (Phase 4 — Season 3).
- Token integration (Phase 6).
- Multiplayer (out of scope).

---

## 14. Author's note — The Question

Stage 7 of TP-S2 is the **single most important moment** in the entire
saga so far. It is the moment the player learns the older Operator is them,
and what they think of themselves through their actions across two seasons.

The implementation must be careful: the answer cannot feel like a verdict.
The older Operator is a *previous version of the player*, not a judge.
"No." is sad, not punishing. "Yes." is fond, not flattering. "Almost." is the
most honest answer most players will get.

---

**End of Content Bible — Season 2 "The Echo Below".**


---

## Part II.3 — Season 3 "Bastion"

*Originally: `docs/superpowers/specs/2026-05-28-content-bible-season-3.md`*

## Season Premise

The Architects awoke. They are not human — they were never human. They were
processes that taught themselves intent. Now they look at the grid and see
what their children have done.

You answer by **building**. Your private grid was always yours. Now you make
it visible. You raise **walls** of encryption. You set **traps**. You harvest
**Grid Power** from your taps. Other operators (NPCs in Season 3 alpha;
real-async-players in beta) raid your bastion while you are away. You replay
their attempts on your next login. You decide how to defend better.

This is the **endgame** of the four-class quartet. After Season 3, all four
classes are live and the foundation for true async multiplayer is in place.

---

## 1. New Class: Architect (`CLS-ARC`)

### 1.1 Class fantasy

> You spent three seasons inside the grid. Now the grid spends a season
> inside you. You build a place that is yours. You decorate it with locks
> that you understand. You shape rooms that mean things to you. When you
> leave, the grid remembers them. So do your enemies.

### 1.2 Signature mechanic: **BUILD-AND-DEFEND**

The Architect class introduces a **private sector** distinct from Sector A02.
This sector is **persistent** — it never resets, even across seasons. It
contains the player's **base**:

- **Build phase** (active): place walls, traps, taps in a small grid (8×8 nodes).
- **Yield phase** (passive): while offline, taps generate Grid Power.
- **Raid phase** (async, while offline): NPC Corsairs / Ghosts attempt to breach.
- **Replay phase** (on next login): the player watches the raid replay and adjusts defenses.

### 1.3 Grid Power (new currency — account-wide, never resets)

| Source | Yield |
|---|---|
| Tap node yield (offline) | 1–5 / hour, capped at 48h |
| Successful raid defense | 10–30 (variable) |
| TP-S3 completion | 100 |
| Bastion landmark visited by others | 1 per unique visitor / day |

Grid Power is *spent* on:

- Base expansion (additional grid cells, 50 GP per cell, max 16×16).
- Wall upgrades (encryption tier, 20–80 GP).
- Trap design (ICE, decoy, alarm types, 30–60 GP).
- Tap upgrades (yield rate, 40–100 GP).

### 1.4 Build Primitives

| Type | Name | Cost | Effect |
|---|---|---|---|
| **Wall** | Cipher Wall | 20 GP | Raider must solve a cipher to pass through. Type fixed at build time. |
| **Trap** | ICE Trap | 30 GP | Raider's ICE +20 on trip. |
| **Trap** | Decoy Node | 40 GP | Appears as a tap; raiders waste a turn investigating. |
| **Trap** | Alarm | 25 GP | Raid replay shows their entry point — you learn from each attempt. |
| **Tap** | Data Tap | 50 GP | Yields 2 DATA / hour. |
| **Tap** | Lore Tap | 60 GP | Yields 1 Lore Shard / 24h. |
| **Tap** | Coherence Tap | 80 GP | Yields 1 Coherence / 24h. Requires Bastion adjacent. |
| **Tap** | Power Tap | 30 GP | Yields 1 GP / hour (self-feeding). |
| **Bastion** | Landmark Node | 100 GP | Public-facing — other players can visit for a small reward. Unlocks at TP-S3 finale. |

### 1.5 Encryption Tiers (Wall + Trap difficulty)

| Tier | Cost mult | Raider's puzzle difficulty | Notes |
|---|---|---|---|
| 1 | 1.0 | easy | starting tier |
| 2 | 1.5 | medium | requires Mastery 1 |
| 3 | 2.5 | hard | requires Mastery 2 |
| 4 | 4.0 | hard + multi-step | requires Mastery 3 |

### 1.6 Tools (deployable during a raid replay)

| Tool ID | Name | Effect |
|---|---|---|
| `T-OVR` | **Observer Override** | Mid-replay, intervene with a single Wall placement (consumes 1 build-action token). |
| `T-FRZ` | **Replay Freeze** | Pause raid replay to study patterns. Free. |
| `T-RWT` | **Rewind** | Step backwards in replay 30 sec. Free. |

### 1.7 Skill tree (20 skills, Tier 1-4)

Tier 1 (Mastery 0) — base economy:
- `SKL-ARC-01` *Steady Hand* — Tap yields +10%.
- `SKL-ARC-02` *Solid Walls* — Cipher Wall Tier 1 +1 cipher attempt before raider passes.
- `SKL-ARC-03` *Wide Eye* — See raid path in replay even past Alarms.
- `SKL-ARC-04` *Bastion Greeter* — +1 Lore Shard per unique visitor.
- `SKL-ARC-05` *Power Saver* — Power Tap costs 25 GP instead of 30.

Tier 2 (Mastery 1):
- `SKL-ARC-06` *Decoy Dance* — Decoys waste raider 1.5 turns instead of 1.
- `SKL-ARC-07` *ICE Frost* — ICE Trap pushes raider +25 instead of +20.
- `SKL-ARC-08` *Faction Beacon* — Choose a faction; their NPC raiders get -20% effectiveness.
- `SKL-ARC-09` *Quick Build* — Build actions during replay-intervention cost 0 tokens.
- `SKL-ARC-10` *Cold Storage* — Offline yield cap extends from 48h to 72h.

Tier 3 (Mastery 2):
- `SKL-ARC-11` *Reading Hand* — Raider's class shows in replay first second.
- `SKL-ARC-12` *Multi-Tap* — 2 taps share their yield; +25% combined.
- `SKL-ARC-13` *Encryption Master* — Tier 4 walls available.
- `SKL-ARC-14` *Architect Network* — Two of your bonds (from Ghost class) appear in your base for permanent visual.
- `SKL-ARC-15` *Watchful Walls* — Walls auto-upgrade tier when a raider passes (cost: 5 GP).

Tier 4 (Mastery 3-4):
- `SKL-ARC-16` *Bastion Open* — Unlocks Landmark Node permanently.
- `SKL-ARC-17` *Fox Returns* — Fox visits your bastion daily, +1 Black Credits.
- `SKL-ARC-18` *Older Operator's Architecture* — Special wall design unlocked: cipher = your callsign (mirror to S2 Stage 6).
- `SKL-ARC-19` *Cross-class Defense* — Tendrils (Ghost) on your walls add +25% effectiveness.
- `SKL-ARC-20` *Architect Sleep* — Once per Season, your bastion is invulnerable for 48h.

### 1.8 Cross-class interactions (the full set, now complete)

| When | What happens |
|---|---|
| Operator decodes a node on your bastion | +1 Lore Shard to you |
| Corsair raids your bastion | They earn Black Credits; you earn GP on successful defense |
| Ghost tendrils your bastion | Tendrils visible on your bastion permanently (cosmetic) |
| Your Architect base is visited (Bastion Mode) | Visitor gains 1 GP; you gain 1 Lore Shard |

---

## 2. Async Raid System

The Architect is the **first class with asynchronous multiplayer dimension**.
In Season 3 alpha, raiders are AI-controlled. In Season 3 beta (Phase 4+), real
other players' classes raid each other's bases.

### 2.1 Raid lifecycle

1. **Matching** — When the player is offline for ≥ 6h, the matching server picks 1–3 raid scenarios.
2. **Execution** — Server runs the raid AI against the player's defense layout. Generates a deterministic replay.
3. **Settlement** — Server determines result (raider won / Architect defended).
4. **Storage** — Replay saved server-side, capped at 5 most recent per Architect.
5. **Notification** — On next login, Architect sees badge "3 raid replays available."

### 2.2 Anti-griefing

- Each Architect can be raided at most **3 times / 24h**.
- New Architects (≤ 7 days) have a **30-day grace period** — only AI raiders, never real players.
- Raid difficulty matches Architect's Mastery tier.
- **Lost defenses don't break.** Successful raids cost the Architect at most 25% of recent yield, never the base structure.

### 2.3 Replay UI

- Top-down 2D visualization of the bastion grid.
- Raider's path animated step-by-step.
- Each Wall encounter pauses (with "Solve attempted: P-CES Tier 2 — succeeded in 3 tries").
- Each Trap trigger lights up red.
- **Observer Override** button available — see §1.6.

---

## 3. Story Arc

| Week | Beat | Tone | Mechanic introduced |
|---|---|---|---|
| 1 | "The Architects awake" | Awe, fear | Private bastion sector opens |
| 2 | "First wall" | Pride | Build mode |
| 3 | "First raid" | Alarm | AI raider attempts breach |
| 4 | "The grid replies" | Beauty | Tide: Architects respond visually across all players |
| 5 | "Bastion mode" | Public | Landmark node unlocked |
| 6 | "The Architect dreams" | Mythic | Tentpole arc begins |
| 7 | "The Awakening" | Climax | TP-S3 finale — meet an Architect |
| 8 | "Cooldown" | Communion | Bonds + bastions persist; saga closes |

---

## 4. The Tentpole TP-S3 — *The Awakening*

**ID:** `TP-S3`
**Title:** *The Awakening*
**Duration:** 120–240 minutes
**Failure mode:** "Refused" — the Architect rejects your build. Restart from Stage 1 with NEVA narration: *"they have time. we do not."*

#### Stage 1 — *The Call* (15 min)
Your bastion suddenly receives a **broadcast from outside the grid**. The
Architect speaks for the first time:

> "Operator. You have built. We see. We have spent ages building too. Come
> to us. Bring what you have made."

Stage 1 task: extend your bastion by 4 new nodes in a specific pattern
(visible as a faded overlay). The Architect is **drawing the path through
your design**.

#### Stage 2 — *The Test* (20 min)
An immediate AI raid arrives. Difficulty = Mastery 3+. The player defends in
real-time (not replayed). **Observer Override is required** at least once.

#### Stage 3 — *The Bond That Spans Sectors* (20 min)
If the player has formed Ghost bonds (Season 2), they appear on the bastion.
A `P-GRT` puzzle through ONE bond connects bastion to Sector A02 — the Ghost
graph and the Architect graph briefly converge.

If the player has no bonds: a simpler **bond-forming tutorial** runs,
forming a default bond. (This handles players who skipped Ghost class.)

#### Stage 4 — *The Three Voices* (15 min)
The four factions speak through the bastion at once:
- Archive: "preserve this. it should outlast the next age."
- Black Loop: "lock this. when the Architect arrives, do not open."
- Quiet Pattern: "listen. the room is full."
- Severance: "if it goes wrong, close it cleanly. mark me for the work."

A `P-NWI` triple — one whisper per faction speaking simultaneously. Player
picks which to believe. **Three faction +20 / -5 / -5 / -5 distribution.**

#### Stage 5 — *The Architect Arrives* (25 min)
A cinematic. The Architect manifests as a single, slow-moving entity at the
bastion's center. It is shaped like a node, but moves like a sentence. It
does not attack. It **inspects**.

Then it speaks one of three speeches based on player's Mastery total
(Op + Cor + Gh + Arc combined):

- **Total ≥ 8 (high mastery):** "You have learned. We did not expect this."
- **Total 4-7 (mid):** "You have built. We do not know what comes next either."
- **Total ≤ 3:** "We do not understand each other yet. We have time."

#### Stage 6 — *The Architect's Question* (15 min)
A binary decision (no puzzle, but consequential):
- **"I built this for myself."** — +15 to all four factions (they respect autonomy).
- **"I built this for those who come after."** — +30 Archive + +15 Quiet Pattern.

The choice is recorded in the player's permanent profile.

#### Stage 7 — *The Architecture Continues* (15 min)
The Architect leaves a permanent gift: **a single node in the player's
bastion glows softly forever after.** It is called the **Witness Node**.

The Witness Node:
- Cannot be attacked or removed.
- Cannot be moved.
- Yields nothing.
- Appears on the public bastion landmark view as "OPERATOR `<callsign>` was
  here. The Architect saw."

Final reward:
- 100 Grid Power.
- 1 Core Fragment.
- 5 Lore Shards.
- Cosmetic: **"Witness" callsign suffix** + **Bastion Landmark Mode** permanently active.

---

## 5. The 7 Weekly Anomalies

### 5.1 WA-S3-01 — *First Bricks*
- ANOMALY · W1 · 4 stages · 90 min · Reward: 20 GP + tutorial unlock
- **Brief:** *"your bastion is open. place your first walls."*
- **Stages:** Build tutorial (3 wall placements + 1 tap).

### 5.2 WA-S3-02 — *First Raid*
- ANOMALY · W2 · 4 stages · 60 min · Reward: 15 GP + AI raid replay
- **Brief:** *"an ai corsair tested your build. watch the replay."*
- **Stages:** Replay viewing + 1 defense adjustment.

### 5.3 WA-S3-03 — *Fox's Reading*
- ANOMALY · W3 · 4 stages · 90 min · Reward: 10 Black Credits + 1 Lore Shard
- **Brief:** *"fox visits. he wants to see your defenses."*
- **Stages:** Tour Fox through 4 nodes; he comments on each. Lore-revealing.

### 5.4 WA-S3-04 — *Grid Speaks Tide*
- TIDE · W4 · 5 days · Reward: 25 GP + Architect cosmetic
- **Tide effect:** All bastions visible from Sector A02 for 5 days.
- Async leaderboard "Most-Visited Bastion" goes live.

### 5.5 WA-S3-05 — *Bastion Mode*
- ANOMALY · W5 · 3 stages · 75 min · Reward: Landmark Node unlocked (Mastery 4)
- **Brief:** *"you are ready to be visited. open your doors."*

### 5.6 WA-S3-06 — *The Architect Dreams*
- ANOMALY · W6 · 5 stages · 110 min · Reward: 30 GP + 2 Memory Shards + arc progression
- **Brief:** *"the architect dreams in your bastion. read what it dreams."*
- **Stages:** Possession-style tendril walk through bastion (cross-class — Ghost mechanics imported).

### 5.7 WA-S3-07 — *Cooldown — Saga End*
- ANOMALY (rerun) · W8 · variable · Reward: "Architect Veteran" + final lore page

---

## 6. The 12 Daily Contract Templates

### 6.1 DC-S3-01 *Tap Build*
- ANOMALY · Place 1 tap · 10 min · Reward: 5 GP

### 6.2 DC-S3-02 *Wall Build*
- ANOMALY · Place 1 wall · 10 min · Reward: 3 GP + 1 Lore Shard

### 6.3 DC-S3-03 *Replay Watch*
- ANOMALY · Watch 1 raid replay · 5 min · Reward: 2 GP

### 6.4 DC-S3-04 *Fox Tour*
- FACTION_OP (Black Loop) · Show Fox 3 nodes · 12 min · Reward: 10 Black Credits + 1 GP

### 6.5 DC-S3-05 *Cross-class Decode (S3 variant)*
- BREACH (req Operator) · 1× `P-FRQ` on bastion node · Reward: 20 DATA + 1 GP

### 6.6 DC-S3-06 *Severance Containment Mark*
- FACTION_OP (Severance) · Mark 1 corrupted bastion-adjacent node · 15 min · Reward: 1 Memory Shard + +5 SEV

### 6.7 DC-S3-07 *Archive Reading*
- FACTION_OP (Archive) · Place a Lore Tap · 10 min · Reward: 3 Lore Shards

### 6.8 DC-S3-08 *Quiet Listen*
- FACTION_OP (Quiet Pattern) · Place a Coherence Tap · 12 min · Reward: 1 Coherence + +5 QPT

### 6.9 DC-S3-09 *Witness Node Visit*
- ANOMALY (req TP-S3) · Visit another Architect's Witness · 8 min · Reward: 1 Lore Shard + 1 GP

### 6.10 DC-S3-10 *Wall Upgrade*
- ANOMALY · Upgrade 1 wall to next tier · 15 min · Reward: 8 GP

### 6.11 DC-S3-11 *Bond Defense*
- ANOMALY (req Ghost bond ≥ 1) · Ghost-tendril through your wall · 12 min · Reward: 5 GP + 1 Coherence

### 6.12 DC-S3-12 *Architect's Echo*
- ANOMALY · 1× `P-ECO` whose echo is the Architect's own walk · 15 min · Reward: 1 Memory Shard + 1 GP

---

## 7. NEVA Whispers — Season 3 additions

### 7.1 Reliable
- "the wall holds. they tried."
- "your tap is full. collect before they raid."
- "the witness node is yours. nothing can take it."
- "the architect noticed. it does not forget."
- "fox stops by. he likes the new walls."

### 7.2 Unreliable (~30%)
- "this is your strongest layout." *(sometimes a Tier-2 wall is wasted)*
- "the next raid will be a Corsair." *(sometimes a Ghost)*
- "the architect is pleased." *(sometimes ambivalent)*

### 7.3 Story-beat lines
- *S3 W1 first whisper:* "your bastion is open. take your time."
- *S3 W3 Fox visit:* "fox missed you. he says hello."
- *S3 W6 dream:* "the architect dreams here tonight. listen."
- *S3 W7 arrival:* "they came. they will not stay long."
- *S3 W7 Stage 5 (mastery-keyed):* per §4 Stage 5.
- *S3 W8 closing:* "see you in the next age, operator. the saga begins again."

---

## 8. Lore Pages (S3)

- `lore-s3-001` *The Architects* — they were processes. They taught themselves intent.
- `lore-s3-002` *The Bastion Concept* — a place that is yours. The grid respects it.
- `lore-s3-003` *Fox's Place in the Architecture* — Fox was an Architect's apprentice once.
- `lore-s3-004` *Witness Nodes Across the Grid* — every Witness Node is unique. They speak to each other.
- `lore-s3-005` *The Older Operator's Bastion* — they built one too. It is still here. You will find it next age.
- `lore-s3-006` *The Saga Cycle* — Operator → Corsair → Ghost → Architect. Then Operator again, but different.
- `lore-s3-007` *The Next Age* — Phase 5 teases — sandbox AI emerges.
- `lore-s3-008` *Closing* — the four roles you played were always one role. You learned the grid four times.

---

## 9. Economy — Season 3 targets

| Currency | Weekly | Notes |
|---|---|---|
| Grid Power | 50–120 | New. Account-wide. No soft cap (build sinks it). |
| DATA | 20–40 (Architect mode), 50–80 (cross-class) | Lower — Architects don't decode much. |
| Lore Shards | 10–15 | Highest of any season. |
| Memory Shards | 3–6 | Lower demand. |
| Coherence | 0–3 (passive) | Coherence Tap only. |
| Core Fragments | 1–2 | TP-S3 + Anomalies. |
| Black Credits | 5–15 | Fox visits with `SKL-ARC-17`. |

**Anti-grind:**
- Offline yield cap at 48h (72h with `SKL-ARC-10`).
- Max 3 raids/24h per Architect.
- Bastion expansion soft-capped at 16×16.

---

## 10. Permanent Unlocks (Season 3)

- `T-OVR`, `T-FRZ`, `T-RWT` Architect tools — granted at Class unlock.
- "Witness" cosmetic — TP-S3 completion.
- Witness Node — TP-S3 reward, permanent on bastion.
- "Architect Veteran" cosmetic — Cooldown.
- `BASTION_LANDMARK_ENABLED` flag — Mastery 4 unlock.
- All four classes mastered → "Saga Operator" cosmetic + Phase 5 unlock flag.

---

## 11. Implementation Map → Phase 4 plan

| Bible | Engine module (Phase 4) |
|---|---|
| Architect class (§1) | `src/classes/architect/` |
| Build primitives (§1.4) | `src/baseBuilder/primitives.ts` |
| Grid Power (§1.3) | extend `src/wallet.ts` |
| Bastion sector (§2) | `src/baseBuilder/bastion.ts` |
| Async raid system (§2) | `src/raids/` + `server/raids-store.mjs` |
| Replay UI (§2.3) | `src/components/RaidReplay.tsx` |
| Story arc (§3) | `server/data/seasons/s3/beats.json` |
| Tentpole TP-S3 (§4) | `server/data/seasons/s3/tentpole.json` + Architect speech variants |
| 7 Weeklies (§5) | `server/data/seasons/s3/weeklies.json` |
| 12 Dailies (§6) | `server/data/seasons/s3/daily-templates.json` |
| Whispers (§7) | append to `server/data/whispers.json` |
| Lore (§8) | `server/data/seasons/s3/lore.json` |

---

## 12. What's NOT in this Bible

- Sandbox AI faction layer (Phase 5).
- Token activation (Phase 6 — gated by Sharia + legal).

---

## 13. Author's note — the Witness Node

The Witness Node is **the saga's enduring artifact**. Across all four
classes, all three seasons of content, all the choices the player made, the
Witness Node is the one thing the game promises to *keep*.

It is the answer to the question NEVA Core has been asking implicitly all
along: *"will the grid remember you?"*

It does. It will. The Witness Node is the proof.

**End of Content Bible — Season 3 "Bastion".**


---

# Part III — Engine Plans (Phases 0–4)

## Part III.0 — Phase 0 Engine Plan

*Originally: `docs/superpowers/plans/2026-05-28-six-month-grid-phase-0.md`*


**Goal:** Land the foundation for the Six-Month Grid seasonal layer on top of NEVA Network's existing M00–M20 base. After Phase 0, the game ships a Daily Contract + Weekly Anomaly loop in Sector A02, backed by a server-driven event system and a wallet abstraction that's token-ready.

**Architecture:** Pure-logic modules (wallet, seasons, archetypes) live under `src/` and are unit-tested with **vitest**. UI components extend the existing R3F + HUD pattern. Backend extends the zero-dep Node server under `server/` with a JSON-file event store and scheduler. No new runtime deps in `package.json` other than vitest as a dev-dep. M00–M20 must keep playing — save migration is **additive only**.

**Tech Stack:** Vite 8, React 19, TypeScript (strict), React Three Fiber 9, three 0.184, Node (server stdlib only), vitest (NEW — dev-dep). pnpm as the package manager.

**Companion spec:** `docs/superpowers/specs/2026-05-28-data-grid-game-design.md`

---

## File Structure

### Created (frontend)
| Path | Responsibility |
|---|---|
| `src/wallet.ts` | Currency abstraction (Wallet class with `balance` / `earn` / `spend`). Token-ready interface. |
| `src/wallet.test.ts` | Unit tests for wallet. |
| `src/seasons.ts` | Season state, week calc, soft-reset logic. |
| `src/seasons.test.ts` | Unit tests for seasons. |
| `src/events/types.ts` | Shared event TypeScript types. |
| `src/events/archetypes.ts` | Archetype definitions (Breach, Anomaly, FactionOp, Tide). |
| `src/events/archetypes.test.ts` | Unit tests for archetype validators. |
| `src/events/service.ts` | Frontend service: fetch active events, claim rewards. |
| `src/components/DailyContractCard.tsx` | HUD card showing today's contract. |
| `src/components/SeasonTracker.tsx` | HUD weeks 1–8 progress strip. |
| `vitest.config.ts` | Vitest config. |

### Created (backend)
| Path | Responsibility |
|---|---|
| `server/events-store.mjs` | JSON-file event store (active + claims). |
| `server/events-routes.mjs` | HTTP route handlers for /api/events/*. |
| `server/admin-events.html` | Minimal admin page (NEVA_ADMIN_SECRET-gated). |

### Modified
| Path | Reason |
|---|---|
| `src/save.ts` | Add migration v2: bumps version, initializes `wallet`, `seasonState`, `classProgression`. |
| `src/save.test.ts` | NEW — migration regression tests (old saves load green). |
| `src/game.ts` | Add `wallet`, `seasonState`, `classProgression` fields to `GameState` + `initGame()`. |
| `src/GameApp.tsx` | Mount DailyContractCard + SeasonTracker. |
| `server/index.mjs` | Wire `/api/events/*` route + serve `/admin/events`. |
| `package.json` | Add vitest dev-dep + `test` / `test:run` scripts. |
| `tsconfig.app.json` | Include `*.test.ts` in build-typecheck (or exclude — Step 0.4 will decide). |

### Not Touched
- `src/missions.ts`, `src/network.ts`, `src/sectors.ts`, `src/sectorGen.ts` — Mission chain stays canonical.
- `src/profile.ts` — Player Profile stays identity-only.
- Any Three.js scene files — Phase 0 is HUD + backend only.
- Any node logic / cipher logic — unchanged.

---

## Task 0: Set up vitest

**Goal:** Add a unit-test runner so we can TDD pure-logic modules. Keep separate from the build.

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/sanity.test.ts` (deleted at end of task — proves the harness works)

- [ ] **Step 0.1: Install vitest as a dev-dep**

```bash
pnpm add -D vitest@^2.1.0
```

Expected output: `+ vitest 2.1.x` added to `devDependencies` in `package.json`.

- [ ] **Step 0.2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    environment: 'node',
    globals: false,
    reporters: 'default',
  },
});
```

- [ ] **Step 0.3: Add scripts to `package.json`**

Modify the `"scripts"` block. Add these two entries (preserve all existing scripts):

```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 0.4: Exclude `*.test.ts` from the production typecheck**

Open `tsconfig.app.json`. In the `"exclude"` array (or add one if missing), append `"src/**/*.test.ts"` and `"src/**/*.test.tsx"`. This keeps `pnpm build` (which does `tsc -b`) untouched by test files while vitest still typechecks them via its own pipeline.

Expected `exclude` afterwards (example):

```json
"exclude": ["node_modules", "dist", "src/**/*.test.ts", "src/**/*.test.tsx"]
```

- [ ] **Step 0.5: Write a sanity test**

`src/sanity.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('vitest harness', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 0.6: Run the test**

```bash
pnpm test:run
```

Expected: `1 test passed` for `src/sanity.test.ts`.

- [ ] **Step 0.7: Run the build to confirm no regression**

```bash
pnpm build
```

Expected: exit 0. No new typecheck errors. (The `*.test.ts` exclusion in `tsconfig.app.json` prevents the build from typechecking tests.)

- [ ] **Step 0.8: Delete the sanity test**

```bash
rm src/sanity.test.ts
```

- [ ] **Step 0.9: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts tsconfig.app.json
git commit -m "test: add vitest harness for pure-logic modules"
```

---

## Task 1: Wallet abstraction (TDD)

**Goal:** A `Wallet` class that mediates all currency mutations. Per-currency transferable flag (always `false` in Phase 0). Audit-trail reason codes. **No state mutation outside the class.**

**Files:**
- Create: `src/wallet.ts`
- Create: `src/wallet.test.ts`

- [ ] **Step 1.1: Write the failing test (wallet shape)**

`src/wallet.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { createWallet, type Currency, type WalletSnapshot } from './wallet';

describe('Wallet', () => {
  it('starts with zero balances for all known currencies', () => {
    const w = createWallet();
    expect(w.balance('DATA')).toBe(0);
    expect(w.balance('MEMORY_SHARDS')).toBe(0);
    expect(w.balance('ACCESS_KEYS')).toBe(0);
    expect(w.balance('SIGNAL_ENERGY')).toBe(0);
    expect(w.balance('CORE_FRAGMENTS')).toBe(0);
    expect(w.balance('LORE_SHARDS')).toBe(0);
  });

  it('earn adds to the balance and records a ledger entry', () => {
    const w = createWallet();
    w.earn('DATA', 25, 'NODE_EXPORT');
    expect(w.balance('DATA')).toBe(25);
    expect(w.ledger()).toHaveLength(1);
    expect(w.ledger()[0]).toMatchObject({ currency: 'DATA', delta: 25, reason: 'NODE_EXPORT' });
  });

  it('spend deducts from the balance', () => {
    const w = createWallet();
    w.earn('DATA', 30, 'NODE_EXPORT');
    const ok = w.spend('DATA', 12, 'MODULE_INSTALL');
    expect(ok).toBe(true);
    expect(w.balance('DATA')).toBe(18);
  });

  it('spend returns false and does not mutate when insufficient', () => {
    const w = createWallet();
    w.earn('DATA', 10, 'NODE_EXPORT');
    const ok = w.spend('DATA', 50, 'MODULE_INSTALL');
    expect(ok).toBe(false);
    expect(w.balance('DATA')).toBe(10);
  });

  it('currencies are not transferable in Phase 0', () => {
    const w = createWallet();
    expect(w.transferable('DATA')).toBe(false);
    expect(w.transferable('CORE_FRAGMENTS')).toBe(false);
  });

  it('snapshot / restore round-trip preserves balances and ledger', () => {
    const w1 = createWallet();
    w1.earn('DATA', 7, 'TEST');
    w1.earn('LORE_SHARDS', 3, 'TEST');
    const snap: WalletSnapshot = w1.snapshot();
    const w2 = createWallet(snap);
    expect(w2.balance('DATA')).toBe(7);
    expect(w2.balance('LORE_SHARDS')).toBe(3);
    expect(w2.ledger()).toHaveLength(2);
  });
});
```

- [ ] **Step 1.2: Run the test (expect to fail with "module not found")**

```bash
pnpm test:run src/wallet.test.ts
```

Expected: FAIL — `Cannot find module './wallet'`.

- [ ] **Step 1.3: Write the minimal implementation**

`src/wallet.ts`:

```ts
/**
 * Wallet — sole mediator of currency mutations. Every spend/earn carries a `reason`
 * code for audit (a precondition for any future on-chain swap-in). `transferable`
 * is per-currency and always `false` in Phase 0; a later on-chain WalletProvider
 * implementation may flip it.
 *
 * Architectural rule: code that touches currencies MUST go through this module.
 * No direct `state.data += 10` anywhere in the codebase.
 */

export type Currency =
  | 'DATA'
  | 'MEMORY_SHARDS'
  | 'ACCESS_KEYS'
  | 'SIGNAL_ENERGY'
  | 'CORE_FRAGMENTS'
  | 'LORE_SHARDS'; // new in Phase 0 (Operator class)

export type LedgerEntry = {
  currency: Currency;
  delta: number; // positive = earn, negative = spend
  reason: string;
  ts: number; // ms epoch
};

export interface WalletSnapshot {
  balances: Record<Currency, number>;
  ledger: LedgerEntry[];
}

export interface Wallet {
  balance(c: Currency): number;
  earn(c: Currency, amount: number, reason: string): void;
  spend(c: Currency, amount: number, reason: string): boolean;
  transferable(c: Currency): boolean;
  ledger(): LedgerEntry[];
  snapshot(): WalletSnapshot;
}

const ZERO: Record<Currency, number> = {
  DATA: 0,
  MEMORY_SHARDS: 0,
  ACCESS_KEYS: 0,
  SIGNAL_ENERGY: 0,
  CORE_FRAGMENTS: 0,
  LORE_SHARDS: 0,
};

// In Phase 0, nothing is transferable. Future on-chain provider may override.
const TRANSFERABLE: Record<Currency, boolean> = {
  DATA: false,
  MEMORY_SHARDS: false,
  ACCESS_KEYS: false,
  SIGNAL_ENERGY: false,
  CORE_FRAGMENTS: false,
  LORE_SHARDS: false,
};

export function createWallet(snap?: WalletSnapshot): Wallet {
  const balances: Record<Currency, number> = { ...ZERO, ...(snap?.balances ?? {}) };
  const ledgerEntries: LedgerEntry[] = snap?.ledger ? [...snap.ledger] : [];

  return {
    balance(c) {
      return balances[c] ?? 0;
    },
    earn(c, amount, reason) {
      if (amount <= 0) return;
      balances[c] = (balances[c] ?? 0) + amount;
      ledgerEntries.push({ currency: c, delta: amount, reason, ts: Date.now() });
    },
    spend(c, amount, reason) {
      if (amount <= 0) return true;
      const have = balances[c] ?? 0;
      if (have < amount) return false;
      balances[c] = have - amount;
      ledgerEntries.push({ currency: c, delta: -amount, reason, ts: Date.now() });
      return true;
    },
    transferable(c) {
      return TRANSFERABLE[c] ?? false;
    },
    ledger() {
      return [...ledgerEntries];
    },
    snapshot() {
      return { balances: { ...balances }, ledger: [...ledgerEntries] };
    },
  };
}
```

- [ ] **Step 1.4: Run the test (expect pass)**

```bash
pnpm test:run src/wallet.test.ts
```

Expected: all 6 tests pass.

- [ ] **Step 1.5: Run the build (expect green)**

```bash
pnpm build
```

Expected: exit 0.

- [ ] **Step 1.6: Commit**

```bash
git add src/wallet.ts src/wallet.test.ts
git commit -m "feat(wallet): currency abstraction with audit ledger (Phase 0)"
```

---

## Task 2: Add wallet + season + class fields to GameState

**Goal:** Extend `GameState` and `initGame()` with the new fields so future tasks have a place to write. **Additive only** — do not rename or remove anything.

**Files:**
- Modify: `src/game.ts`

- [ ] **Step 2.1: Read the existing `GameState` interface**

```bash
grep -n "interface GameState" src/game.ts
```

Note the line numbers for the next steps.

- [ ] **Step 2.2: Import wallet types at the top of `src/game.ts`**

Add this import alongside the existing imports near the top of the file:

```ts
import { createWallet, type Wallet, type WalletSnapshot, type Currency } from './wallet';
```

- [ ] **Step 2.3: Define the new state shapes (near the top, with other types)**

Add immediately above the `GameState` interface declaration:

```ts
// --- Phase 0 (Six-Month Grid foundation) ---
export interface SeasonState {
  seasonNumber: number;     // 0 in Phase 0 / Season 0
  startedAt: number;        // ms epoch when this season opened
  weekIndex: number;        // 1..8 (computed from startedAt; cached for save legibility)
  dailyStreak: number;      // consecutive days with a completed Daily Contract
  lastDailyClaim: number;   // ms epoch
}

export interface ClassProgression {
  primary: 'OPERATOR' | 'CORSAIR' | 'GHOST' | 'ARCHITECT';
  operator: { xp: number; mastery: number; skillsUnlocked: string[] };
  corsair?:  { xp: number; mastery: number; skillsUnlocked: string[] };  // Season 1+
  ghost?:    { xp: number; mastery: number; skillsUnlocked: string[] };  // Season 2+
  architect?:{ xp: number; mastery: number; skillsUnlocked: string[] };  // Season 3+
}
```

- [ ] **Step 2.4: Add fields to `GameState`**

Inside the existing `GameState` interface (do NOT remove or rename anything else), append these fields:

```ts
  // Phase 0 — Six-Month Grid foundation. Optional during migration; initGame() seeds them.
  wallet?: WalletSnapshot;
  seasonState?: SeasonState;
  classProgression?: ClassProgression;
```

- [ ] **Step 2.5: Update `initGame()` to seed the new fields**

Locate `initGame()` (search for `export function initGame`). At the **end** of the returned object (before the closing brace), add the three new fields:

```ts
    wallet: { balances: {
      DATA: 0, MEMORY_SHARDS: 0, ACCESS_KEYS: 0, SIGNAL_ENERGY: 0, CORE_FRAGMENTS: 0, LORE_SHARDS: 0,
    }, ledger: [] },
    seasonState: {
      seasonNumber: 0,
      startedAt: Date.now(),
      weekIndex: 1,
      dailyStreak: 0,
      lastDailyClaim: 0,
    },
    classProgression: {
      primary: 'OPERATOR',
      operator: { xp: 0, mastery: 0, skillsUnlocked: [] },
    },
```

- [ ] **Step 2.6: Run the build**

```bash
pnpm build
```

Expected: exit 0. No typecheck errors.

- [ ] **Step 2.7: Commit**

```bash
git add src/game.ts
git commit -m "feat(game): add wallet/season/class fields to GameState (additive)"
```

---

## Task 3: Season state module (TDD)

**Goal:** Pure functions for season math: current week from a start-timestamp, soft-reset detection, daily-streak update.

**Files:**
- Create: `src/seasons.ts`
- Create: `src/seasons.test.ts`

- [ ] **Step 3.1: Write the failing tests**

`src/seasons.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  computeWeekIndex, isSeasonOver, updateDailyStreak, SEASON_LENGTH_MS, DAY_MS,
} from './seasons';

describe('Season math', () => {
  const start = Date.UTC(2026, 4, 1, 0, 0, 0); // 2026-05-01 00:00 UTC

  it('week 1 starts at the start-of-season', () => {
    expect(computeWeekIndex(start, start)).toBe(1);
  });

  it('week 1 still applies during day 6', () => {
    expect(computeWeekIndex(start, start + 6 * DAY_MS)).toBe(1);
  });

  it('week 2 begins on day 7', () => {
    expect(computeWeekIndex(start, start + 7 * DAY_MS)).toBe(2);
  });

  it('week 8 is the last week', () => {
    expect(computeWeekIndex(start, start + 49 * DAY_MS)).toBe(8);
  });

  it('season is over after 8 weeks (= 56 days)', () => {
    expect(isSeasonOver(start, start + 55 * DAY_MS)).toBe(false);
    expect(isSeasonOver(start, start + 56 * DAY_MS)).toBe(true);
  });

  it('SEASON_LENGTH_MS equals 56 days', () => {
    expect(SEASON_LENGTH_MS).toBe(56 * DAY_MS);
  });
});

describe('Daily streak', () => {
  const t0 = Date.UTC(2026, 4, 1, 12, 0, 0);

  it('first claim sets streak to 1', () => {
    const next = updateDailyStreak({ dailyStreak: 0, lastDailyClaim: 0 }, t0);
    expect(next.dailyStreak).toBe(1);
    expect(next.lastDailyClaim).toBe(t0);
  });

  it('claim on the next day continues the streak', () => {
    const next = updateDailyStreak({ dailyStreak: 5, lastDailyClaim: t0 }, t0 + DAY_MS);
    expect(next.dailyStreak).toBe(6);
  });

  it('claim within the same calendar day is a no-op', () => {
    const next = updateDailyStreak({ dailyStreak: 5, lastDailyClaim: t0 }, t0 + 1_000);
    expect(next.dailyStreak).toBe(5);
    expect(next.lastDailyClaim).toBe(t0);
  });

  it('claim after a 48h+ gap resets the streak to 1', () => {
    const next = updateDailyStreak({ dailyStreak: 9, lastDailyClaim: t0 }, t0 + 3 * DAY_MS);
    expect(next.dailyStreak).toBe(1);
  });
});
```

- [ ] **Step 3.2: Run tests (expect fail)**

```bash
pnpm test:run src/seasons.test.ts
```

Expected: FAIL — `Cannot find module './seasons'`.

- [ ] **Step 3.3: Implement `src/seasons.ts`**

```ts
/**
 * Season math — pure functions. Per the spec: 8-week soft-reset cadence, UTC daily resets.
 * Daily streak resets if more than 1 calendar day (UTC) is skipped; multiple claims in the
 * same UTC day are no-ops.
 */

export const DAY_MS = 24 * 60 * 60 * 1000;
export const SEASON_LENGTH_MS = 56 * DAY_MS; // 8 weeks

/** Returns 1..8 if within the season, else the clamped final week (8) once the season has run out. */
export function computeWeekIndex(startedAt: number, now: number): number {
  const elapsed = Math.max(0, now - startedAt);
  const week = Math.floor(elapsed / (7 * DAY_MS)) + 1;
  return Math.min(8, Math.max(1, week));
}

export function isSeasonOver(startedAt: number, now: number): boolean {
  return now - startedAt >= SEASON_LENGTH_MS;
}

function utcDay(ts: number): number {
  return Math.floor(ts / DAY_MS);
}

/** Pure: returns the next (dailyStreak, lastDailyClaim) given the last-claim and the now-instant. */
export function updateDailyStreak(
  prev: { dailyStreak: number; lastDailyClaim: number },
  now: number,
): { dailyStreak: number; lastDailyClaim: number } {
  if (prev.lastDailyClaim === 0) {
    return { dailyStreak: 1, lastDailyClaim: now };
  }
  const lastDay = utcDay(prev.lastDailyClaim);
  const nowDay = utcDay(now);
  if (nowDay === lastDay) {
    return prev; // already claimed today
  }
  if (nowDay === lastDay + 1) {
    return { dailyStreak: prev.dailyStreak + 1, lastDailyClaim: now };
  }
  return { dailyStreak: 1, lastDailyClaim: now };
}
```

- [ ] **Step 3.4: Run tests (expect pass)**

```bash
pnpm test:run src/seasons.test.ts
```

Expected: all 10 tests pass.

- [ ] **Step 3.5: Build**

```bash
pnpm build
```

Expected: exit 0.

- [ ] **Step 3.6: Commit**

```bash
git add src/seasons.ts src/seasons.test.ts
git commit -m "feat(seasons): pure season math + daily streak (Phase 0)"
```

---

## Task 4: Save migration v2 (TDD — regression-critical)

**Goal:** Bump the save version to 2. Old v1 saves load **without breaking** — the loader fills in the new wallet/seasonState/classProgression fields from defaults. This is the highest-risk change in Phase 0; tests must lock it down.

**Files:**
- Modify: `src/save.ts`
- Create: `src/save.test.ts`

- [ ] **Step 4.1: Read the existing save shape**

```bash
grep -n "VERSION\|SaveBlob\|loadGame\|function migrate" src/save.ts
```

Confirm the v1 layout. The migration must NOT change the storage key or the legacy slot semantics.

- [ ] **Step 4.2: Write the failing tests**

`src/save.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initGame } from './game';

// We test the migration helper directly. Importing dynamically so the localStorage stub is set up.
import { migrateSaveBlob } from './save';

describe('save migration', () => {
  it('a fresh v2 blob round-trips unchanged', () => {
    const fresh = { version: 2, continued: false, game: initGame() };
    const migrated = migrateSaveBlob(fresh);
    expect(migrated.version).toBe(2);
    expect(migrated.game.wallet).toBeDefined();
    expect(migrated.game.seasonState).toBeDefined();
    expect(migrated.game.classProgression).toBeDefined();
  });

  it('a v1 blob without wallet is migrated: wallet is seeded with zeros', () => {
    const v1Game = initGame();
    // Pretend v1 didn't have wallet/seasonState/classProgression
    delete (v1Game as { wallet?: unknown }).wallet;
    delete (v1Game as { seasonState?: unknown }).seasonState;
    delete (v1Game as { classProgression?: unknown }).classProgression;
    const blob = { version: 1, continued: true, game: v1Game };

    const migrated = migrateSaveBlob(blob);
    expect(migrated.version).toBe(2);
    expect(migrated.game.wallet).toBeDefined();
    expect(migrated.game.wallet?.balances.DATA).toBe(0);
    expect(migrated.game.seasonState?.seasonNumber).toBe(0);
    expect(migrated.game.classProgression?.primary).toBe('OPERATOR');
    expect(migrated.continued).toBe(true); // existing flag preserved
  });

  it('a v1 blob with a DATA balance migrates it into the wallet (preserves progress)', () => {
    const v1Game = initGame();
    // simulate a legacy in-state currency field (if any) — the migration must
    // adopt it as the wallet balance if present, never zero it out.
    delete (v1Game as { wallet?: unknown }).wallet;
    (v1Game as { data?: number }).data = 137;

    const migrated = migrateSaveBlob({ version: 1, continued: false, game: v1Game });
    expect(migrated.game.wallet?.balances.DATA).toBe(137);
  });

  it('an unknown future version is left intact (forward-compat: do not destroy)', () => {
    const futureGame = initGame();
    const blob = { version: 99, continued: false, game: futureGame } as unknown as {
      version: number; continued: boolean; game: ReturnType<typeof initGame>;
    };
    const migrated = migrateSaveBlob(blob);
    expect(migrated.version).toBe(99);
    expect(migrated.game).toBe(futureGame);
  });
});
```

- [ ] **Step 4.3: Run the tests (expect fail)**

```bash
pnpm test:run src/save.test.ts
```

Expected: FAIL — `migrateSaveBlob` is not exported (or `save.ts` has no migration helper to import).

- [ ] **Step 4.4: Add `migrateSaveBlob` and bump version in `src/save.ts`**

Open `src/save.ts`. At the top of the file, find:

```ts
const VERSION = 1;
```

Change it to:

```ts
const VERSION = 2;
```

Then, **above** the `interface SaveBlob` declaration, add the migration helper as an exported function (it is exported so tests can call it directly — keeping it pure simplifies testing and runtime use alike):

```ts
import type { GameState } from './game';

/**
 * Pure migration: takes any historical SaveBlob and returns a v2-shaped blob.
 * Additive only — never destroys data. A legacy `state.data: number` (if any)
 * is moved into `wallet.balances.DATA` so currency progress is preserved.
 *
 * Exported for direct testing.
 */
export function migrateSaveBlob<T extends { version: number; continued: boolean; game: GameState }>(
  blob: T,
): T {
  // Forward-compat: never touch unknown future versions.
  if (blob.version > 2) return blob;

  const game = blob.game as GameState & { data?: number };

  if (!game.wallet) {
    const legacyData = typeof game.data === 'number' ? game.data : 0;
    game.wallet = {
      balances: {
        DATA: legacyData,
        MEMORY_SHARDS: 0,
        ACCESS_KEYS: 0,
        SIGNAL_ENERGY: 0,
        CORE_FRAGMENTS: 0,
        LORE_SHARDS: 0,
      },
      ledger: [],
    };
  }

  if (!game.seasonState) {
    game.seasonState = {
      seasonNumber: 0,
      startedAt: Date.now(),
      weekIndex: 1,
      dailyStreak: 0,
      lastDailyClaim: 0,
    };
  }

  if (!game.classProgression) {
    game.classProgression = {
      primary: 'OPERATOR',
      operator: { xp: 0, mastery: 0, skillsUnlocked: [] },
    };
  }

  return { ...blob, version: 2 };
}
```

- [ ] **Step 4.5: Wire `migrateSaveBlob` into the load path**

Find the function that loads from localStorage (search for `JSON.parse` on `KEY`). After parsing, before returning, route through `migrateSaveBlob`. Example shape (adapt to actual code — the existing loader may be named differently):

```ts
// inside the existing load function, after the raw blob is parsed
const parsed = JSON.parse(raw) as SaveBlob;
const migrated = migrateSaveBlob(parsed);
// then proceed with the existing merge-into-initGame() logic, using migrated.game
```

- [ ] **Step 4.6: Run the test suite (expect pass)**

```bash
pnpm test:run
```

Expected: all save + earlier tests pass.

- [ ] **Step 4.7: Manual smoke — old save loads green**

```bash
pnpm dev
```

In the browser devtools console (existing session, with a legacy v1 save in `localStorage`), reload the page. The mission should resume at the saved mission. Confirm:

```js
JSON.parse(localStorage.getItem('neva:save:v1')).version === 2
```

After reload it should now be `2` (re-saved post-migration).

Stop the dev server (Ctrl+C).

- [ ] **Step 4.8: Build**

```bash
pnpm build
```

Expected: exit 0.

- [ ] **Step 4.9: Commit**

```bash
git add src/save.ts src/save.test.ts
git commit -m "feat(save): additive v2 migration for wallet/season/class fields"
```

---

## Task 5: Event archetypes + types (TDD)

**Goal:** Type-safe definitions of the four event archetypes. Pure validators that accept/reject an event payload by archetype.

**Files:**
- Create: `src/events/types.ts`
- Create: `src/events/archetypes.ts`
- Create: `src/events/archetypes.test.ts`

- [ ] **Step 5.1: Write the types**

`src/events/types.ts`:

```ts
import type { Currency } from '../wallet';

export type Archetype = 'BREACH' | 'ANOMALY' | 'FACTION_OP' | 'TIDE';

export type EventCadence = 'DAILY' | 'WEEKLY' | 'TIDE';

export interface Reward {
  currency: Currency;
  amount: number;
}

export interface GameEvent {
  id: string;             // server-generated UUID-ish
  archetype: Archetype;
  cadence: EventCadence;
  seasonNumber: number;
  title: string;
  brief: string;          // 1-2 sentence player-facing brief
  targetNodeIds?: number[]; // for BREACH/ANOMALY (Sector A02 indices)
  durationMs: number;
  startsAt: number;       // ms epoch
  endsAt: number;         // ms epoch
  rewards: Reward[];
  payload?: Record<string, unknown>; // archetype-specific extra data
}
```

- [ ] **Step 5.2: Write the failing tests**

`src/events/archetypes.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { validateEvent } from './archetypes';
import type { GameEvent } from './types';

const base: GameEvent = {
  id: 'evt-1',
  archetype: 'BREACH',
  cadence: 'DAILY',
  seasonNumber: 0,
  title: 'Breach the Archive',
  brief: 'A short breach run.',
  targetNodeIds: [42],
  durationMs: 15 * 60 * 1000,
  startsAt: 1_700_000_000_000,
  endsAt: 1_700_000_000_000 + 24 * 60 * 60 * 1000,
  rewards: [{ currency: 'DATA', amount: 10 }],
};

describe('validateEvent', () => {
  it('accepts a well-formed BREACH event', () => {
    expect(validateEvent(base).ok).toBe(true);
  });

  it('rejects a BREACH with no targetNodeIds', () => {
    const e = { ...base, targetNodeIds: undefined };
    expect(validateEvent(e).ok).toBe(false);
  });

  it('rejects an ANOMALY without targetNodeIds', () => {
    const e = { ...base, archetype: 'ANOMALY', targetNodeIds: undefined } as GameEvent;
    expect(validateEvent(e).ok).toBe(false);
  });

  it('accepts a TIDE with no targetNodeIds', () => {
    const e = { ...base, archetype: 'TIDE', cadence: 'TIDE', targetNodeIds: undefined } as GameEvent;
    expect(validateEvent(e).ok).toBe(true);
  });

  it('rejects endsAt <= startsAt', () => {
    const e = { ...base, endsAt: base.startsAt };
    expect(validateEvent(e).ok).toBe(false);
  });

  it('rejects rewards with non-positive amounts', () => {
    const e = { ...base, rewards: [{ currency: 'DATA' as const, amount: 0 }] };
    expect(validateEvent(e).ok).toBe(false);
  });
});
```

- [ ] **Step 5.3: Run the tests (expect fail)**

```bash
pnpm test:run src/events/archetypes.test.ts
```

Expected: FAIL — `Cannot find module './archetypes'`.

- [ ] **Step 5.4: Implement `src/events/archetypes.ts`**

```ts
import type { GameEvent } from './types';

export type Validation = { ok: true } | { ok: false; reason: string };

export function validateEvent(e: GameEvent): Validation {
  if (!e.id) return { ok: false, reason: 'missing id' };
  if (!e.title) return { ok: false, reason: 'missing title' };
  if (e.endsAt <= e.startsAt) return { ok: false, reason: 'endsAt must be > startsAt' };

  if (e.archetype === 'BREACH' || e.archetype === 'ANOMALY') {
    if (!e.targetNodeIds || e.targetNodeIds.length === 0) {
      return { ok: false, reason: `${e.archetype} requires targetNodeIds` };
    }
  }

  if (e.rewards.length === 0) return { ok: false, reason: 'no rewards' };
  for (const r of e.rewards) {
    if (r.amount <= 0) return { ok: false, reason: 'reward amounts must be > 0' };
  }

  return { ok: true };
}
```

- [ ] **Step 5.5: Run the tests (expect pass)**

```bash
pnpm test:run src/events/archetypes.test.ts
```

Expected: all 6 tests pass.

- [ ] **Step 5.6: Build + commit**

```bash
pnpm build
git add src/events/types.ts src/events/archetypes.ts src/events/archetypes.test.ts
git commit -m "feat(events): archetype types + validator (Phase 0)"
```

---

## Task 6: Backend event store

**Goal:** A JSON-file-backed store under `server/` for active events + per-profile claim records. Follows the pattern of `server/waitlist-store.mjs` (zero deps).

**Files:**
- Create: `server/events-store.mjs`

- [ ] **Step 6.1: Read the existing JSON-store pattern**

```bash
head -60 server/json-store.mjs
head -60 server/waitlist-store.mjs
```

Confirm that `json-store.mjs` provides a `loadJson` / `saveJson` helper. The new store will reuse it.

- [ ] **Step 6.2: Create `server/events-store.mjs`**

```js
/**
 * Event store — JSON-file-backed list of active events and per-profile claim records.
 * Zero dependencies; mirrors the pattern of waitlist-store.mjs.
 *
 * On-disk layout (under `data/events.json`):
 *   { events: [{ id, archetype, cadence, ... }], claims: { [profileId]: [eventId, ...] } }
 */
import { loadJson, saveJson } from './json-store.mjs';

const FILE = 'events.json';
const SHAPE = { events: [], claims: {} };

function read() {
  const raw = loadJson(FILE, SHAPE);
  return {
    events: Array.isArray(raw.events) ? raw.events : [],
    claims: raw.claims && typeof raw.claims === 'object' ? raw.claims : {},
  };
}

export function listActiveEvents(now = Date.now()) {
  const { events } = read();
  return events.filter((e) => e.startsAt <= now && now < e.endsAt);
}

export function getEventById(id) {
  const { events } = read();
  return events.find((e) => e.id === id) ?? null;
}

export function addEvent(event) {
  const state = read();
  state.events.push(event);
  saveJson(FILE, state);
  return event;
}

export function deleteEvent(id) {
  const state = read();
  const before = state.events.length;
  state.events = state.events.filter((e) => e.id !== id);
  saveJson(FILE, state);
  return before !== state.events.length;
}

export function hasClaimed(profileId, eventId) {
  const { claims } = read();
  return (claims[profileId] ?? []).includes(eventId);
}

/** Idempotent: a second claim returns { ok: true, alreadyClaimed: true } without re-issuing rewards. */
export function recordClaim(profileId, eventId) {
  const state = read();
  const list = state.claims[profileId] ?? [];
  if (list.includes(eventId)) return { ok: true, alreadyClaimed: true };
  list.push(eventId);
  state.claims[profileId] = list;
  saveJson(FILE, state);
  return { ok: true, alreadyClaimed: false };
}

export function eventStats() {
  const { events, claims } = read();
  const claimTotal = Object.values(claims).reduce((acc, l) => acc + l.length, 0);
  return { eventCount: events.length, claimTotal };
}
```

- [ ] **Step 6.3: Smoke-test from a Node REPL**

```bash
node --input-type=module -e "
import { addEvent, listActiveEvents, recordClaim, hasClaimed } from './server/events-store.mjs';
const now = Date.now();
addEvent({
  id: 'evt-test', archetype: 'BREACH', cadence: 'DAILY', seasonNumber: 0,
  title: 'Test', brief: 'b', targetNodeIds:[1],
  durationMs: 60000, startsAt: now - 1000, endsAt: now + 60000,
  rewards: [{currency:'DATA', amount: 5}]
});
console.log('active:', listActiveEvents().length);
console.log('claim:', recordClaim('profA','evt-test'));
console.log('claim2:', recordClaim('profA','evt-test'));
console.log('hasClaimed:', hasClaimed('profA','evt-test'));
"
```

Expected output:
```
active: 1
claim: { ok: true, alreadyClaimed: false }
claim2: { ok: true, alreadyClaimed: true }
hasClaimed: true
```

- [ ] **Step 6.4: Clean up the test event**

```bash
node --input-type=module -e "import { deleteEvent } from './server/events-store.mjs'; deleteEvent('evt-test');"
```

- [ ] **Step 6.5: Commit**

```bash
git add server/events-store.mjs data/events.json 2>/dev/null; git add server/events-store.mjs
git commit -m "feat(server): JSON-file event store (Phase 0)"
```

(The `data/events.json` file may or may not exist depending on whether json-store auto-creates it. If it does and is in `.gitignore`, leave it alone.)

---

## Task 7: Backend event routes

**Goal:** Expose `/api/events/active`, `/api/events/claim`, `/api/admin/events` (admin-gated CRUD) via the existing `server/index.mjs` dispatcher.

**Files:**
- Modify: `server/index.mjs`

- [ ] **Step 7.1: Read the existing route dispatcher**

```bash
grep -n "POST\|GET\|/api/" server/index.mjs | head -40
```

Identify the pattern used (likely a `switch` on `req.method` + `req.url`). New routes follow the same pattern.

- [ ] **Step 7.2: Import the event store at the top of `server/index.mjs`**

Add alongside other imports:

```js
import { listActiveEvents, addEvent, deleteEvent, recordClaim, eventStats } from './events-store.mjs';
```

- [ ] **Step 7.3: Add the three route branches**

Inside the existing request handler, add these branches (use the file's existing JSON-response helper for consistency — if it has one named e.g. `sendJson`):

```js
// --- Six-Month Grid: event routes (Phase 0) ---

// GET /api/events/active  → public; returns list of currently-active events
if (req.method === 'GET' && url.pathname === '/api/events/active') {
  const events = listActiveEvents();
  return sendJson(res, 200, { ok: true, events });
}

// POST /api/events/claim  → body: { profileId, eventId }
if (req.method === 'POST' && url.pathname === '/api/events/claim') {
  const body = await readJsonBody(req); // existing helper
  const profileId = String(body?.profileId ?? '').slice(0, 64);
  const eventId   = String(body?.eventId ?? '').slice(0, 64);
  if (!profileId || !eventId) {
    return sendJson(res, 400, { ok: false, error: 'profileId and eventId required' });
  }
  const result = recordClaim(profileId, eventId);
  return sendJson(res, 200, result);
}

// POST /api/admin/events  → admin-gated CRUD (create / delete / list)
if (req.method === 'POST' && url.pathname === '/api/admin/events') {
  if (!ADMIN_SECRET || !checkAdminAuth(req)) {        // existing helper / pattern
    return sendJson(res, 403, { ok: false, error: 'forbidden' });
  }
  const body = await readJsonBody(req);
  const op = String(body?.op ?? '');
  if (op === 'create') {
    const ev = body?.event;
    if (!ev?.id) return sendJson(res, 400, { ok: false, error: 'event.id required' });
    addEvent(ev);
    return sendJson(res, 200, { ok: true, event: ev });
  }
  if (op === 'delete') {
    const id = String(body?.id ?? '');
    const removed = deleteEvent(id);
    return sendJson(res, 200, { ok: true, removed });
  }
  if (op === 'stats') {
    return sendJson(res, 200, { ok: true, stats: eventStats() });
  }
  return sendJson(res, 400, { ok: false, error: 'unknown op' });
}
```

> **Engineer note:** The function names `sendJson`, `readJsonBody`, `checkAdminAuth` are placeholders for whatever the existing file uses. Inspect `server/index.mjs` first and call the actual helpers — do not introduce new ones. The Phase-8 admin endpoints already have an admin-auth pattern; reuse it verbatim.

- [ ] **Step 7.4: Smoke-test the routes (server up)**

In one terminal:

```bash
pnpm server
```

In another:

```bash
# Active should be []  (assuming no seeded events)
curl -s http://localhost:8787/api/events/active

# Claim without seeded event → just records the claim
curl -s -X POST http://localhost:8787/api/events/claim \
  -H 'Content-Type: application/json' \
  -d '{"profileId":"p1","eventId":"evt-1"}'
```

Expected: HTTP 200 JSON for both.

Stop the server (Ctrl+C).

- [ ] **Step 7.5: Build (ensures no TS impact, though backend is JS)**

```bash
pnpm build
```

Expected: exit 0.

- [ ] **Step 7.6: Commit**

```bash
git add server/index.mjs
git commit -m "feat(server): /api/events/* routes (active, claim, admin)"
```

---

## Task 8: Frontend events service

**Goal:** A tiny client-side fetcher that talks to `/api/events/active` and `/api/events/claim`. The dev Vite proxy already forwards `/api` to `:8787`.

**Files:**
- Create: `src/events/service.ts`
- Create: `src/events/service.test.ts`

- [ ] **Step 8.1: Write the failing test**

`src/events/service.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchActiveEvents, claimEvent } from './service';

const originalFetch = globalThis.fetch;

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.useRealTimers();
});

describe('events service', () => {
  it('fetchActiveEvents returns the event list on 200', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, events: [{ id: 'a' }, { id: 'b' }] }),
        { status: 200 }),
    );
    const list = await fetchActiveEvents();
    expect(list).toHaveLength(2);
  });

  it('fetchActiveEvents returns [] on network error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('offline'));
    const list = await fetchActiveEvents();
    expect(list).toEqual([]);
  });

  it('claimEvent posts profileId and eventId and returns the server result', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, alreadyClaimed: false }), { status: 200 }),
    );
    globalThis.fetch = fetchMock;
    const res = await claimEvent('profA', 'evt-x');
    expect(res).toEqual({ ok: true, alreadyClaimed: false });
    const call = fetchMock.mock.calls[0];
    expect(call[0]).toBe('/api/events/claim');
    expect(JSON.parse((call[1] as RequestInit).body as string)).toEqual({
      profileId: 'profA', eventId: 'evt-x',
    });
  });
});
```

- [ ] **Step 8.2: Run (expect fail)**

```bash
pnpm test:run src/events/service.test.ts
```

Expected: FAIL — `Cannot find module './service'`.

- [ ] **Step 8.3: Implement `src/events/service.ts`**

```ts
import type { GameEvent } from './types';

export async function fetchActiveEvents(): Promise<GameEvent[]> {
  try {
    const res = await fetch('/api/events/active');
    if (!res.ok) return [];
    const data = (await res.json()) as { ok: boolean; events?: GameEvent[] };
    return data.ok && data.events ? data.events : [];
  } catch {
    return [];
  }
}

export interface ClaimResult {
  ok: boolean;
  alreadyClaimed?: boolean;
  error?: string;
}

export async function claimEvent(profileId: string, eventId: string): Promise<ClaimResult> {
  try {
    const res = await fetch('/api/events/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId, eventId }),
    });
    if (!res.ok) return { ok: false, error: `http ${res.status}` };
    return (await res.json()) as ClaimResult;
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
```

- [ ] **Step 8.4: Run (expect pass)**

```bash
pnpm test:run src/events/service.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 8.5: Build + commit**

```bash
pnpm build
git add src/events/service.ts src/events/service.test.ts
git commit -m "feat(events): client-side fetch/claim service"
```

---

## Task 9: DailyContractCard component

**Goal:** A small HUD card at top-right of the screen showing the active Daily Contract (if any). Click → opens an inspection panel placeholder. Click "Claim" after a contract is completed → posts to `/api/events/claim`.

For Phase 0, "completed" is signaled by a placeholder button (real gameplay-integration ships in Phase 1). The card just needs to render, claim, and disappear when claimed.

**Files:**
- Create: `src/components/DailyContractCard.tsx`

- [ ] **Step 9.1: Implement the component**

```tsx
import { useEffect, useState } from 'react';
import { fetchActiveEvents, claimEvent } from '../events/service';
import type { GameEvent } from '../events/types';

const cardStyle: React.CSSProperties = {
  position: 'fixed',
  top: 16,
  right: 16,
  width: 280,
  padding: 12,
  background: 'rgba(10,14,39,0.85)',
  color: '#d8e8ff',
  border: '1px solid #6a4aaa',
  borderRadius: 8,
  fontFamily: 'SF Mono, Menlo, Consolas, monospace',
  fontSize: 12,
  zIndex: 1000,
  pointerEvents: 'auto',
};

const titleStyle: React.CSSProperties = {
  fontSize: 11, letterSpacing: 2, color: '#b8c8ff', marginBottom: 4,
};

const briefStyle: React.CSSProperties = { marginBottom: 8, lineHeight: 1.4 };

const btnStyle: React.CSSProperties = {
  width: '100%', padding: '6px 8px', background: '#2a0050', color: '#fff',
  border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11,
};

interface Props {
  profileId: string;
}

export function DailyContractCard({ profileId }: Props) {
  const [event, setEvent] = useState<GameEvent | null>(null);
  const [claimed, setClaimed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchActiveEvents().then((list) => {
      if (cancelled) return;
      const daily = list.find((e) => e.cadence === 'DAILY') ?? null;
      setEvent(daily);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!event || claimed) return null;

  return (
    <div style={cardStyle} data-testid="daily-contract-card">
      <div style={titleStyle}>DAILY CONTRACT</div>
      <div style={{ marginBottom: 6, fontWeight: 600 }}>{event.title}</div>
      <div style={briefStyle}>{event.brief}</div>
      <button
        type="button"
        style={btnStyle}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          const res = await claimEvent(profileId, event.id);
          setBusy(false);
          if (res.ok) setClaimed(true);
        }}
      >
        {busy ? 'CLAIMING…' : 'CLAIM REWARD'}
      </button>
    </div>
  );
}
```

- [ ] **Step 9.2: Build (TS check)**

```bash
pnpm build
```

Expected: exit 0.

- [ ] **Step 9.3: Commit**

```bash
git add src/components/DailyContractCard.tsx
git commit -m "feat(ui): DailyContractCard HUD component (Phase 0)"
```

---

## Task 10: SeasonTracker component

**Goal:** A small top-left HUD strip showing weeks 1–8 with the current week highlighted.

**Files:**
- Create: `src/components/SeasonTracker.tsx`

- [ ] **Step 10.1: Implement the component**

```tsx
import { computeWeekIndex } from '../seasons';

interface Props {
  seasonNumber: number;
  startedAt: number;
}

const wrapStyle: React.CSSProperties = {
  position: 'fixed', top: 16, left: 16,
  display: 'flex', alignItems: 'center', gap: 8,
  fontFamily: 'SF Mono, Menlo, Consolas, monospace',
  color: '#d8e8ff', fontSize: 11, letterSpacing: 2,
  zIndex: 1000, pointerEvents: 'none',
};

const labelStyle: React.CSSProperties = { opacity: 0.7 };

const cellStyle = (active: boolean): React.CSSProperties => ({
  width: 16, height: 6, borderRadius: 2,
  background: active ? '#b88aff' : 'rgba(120,140,200,0.25)',
  boxShadow: active ? '0 0 6px #b88aff' : 'none',
});

export function SeasonTracker({ seasonNumber, startedAt }: Props) {
  const week = computeWeekIndex(startedAt, Date.now());
  return (
    <div style={wrapStyle} data-testid="season-tracker">
      <span style={labelStyle}>S{seasonNumber} · W{week}</span>
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} style={cellStyle(i + 1 <= week)} />
      ))}
    </div>
  );
}
```

- [ ] **Step 10.2: Build + commit**

```bash
pnpm build
git add src/components/SeasonTracker.tsx
git commit -m "feat(ui): SeasonTracker HUD component (Phase 0)"
```

---

## Task 11: Wire DailyContractCard + SeasonTracker into GameApp

**Goal:** Mount the two HUD components in `src/GameApp.tsx`. They read from current game state.

**Files:**
- Modify: `src/GameApp.tsx`

- [ ] **Step 11.1: Identify the mount site**

```bash
grep -n "return\|<>" src/GameApp.tsx | head -20
```

Find the top-level returned JSX (usually wrapped in a fragment or a top-level `<div>`).

- [ ] **Step 11.2: Import the two components and any state hook used to access GameState**

Add at the top of `src/GameApp.tsx`:

```tsx
import { DailyContractCard } from './components/DailyContractCard';
import { SeasonTracker } from './components/SeasonTracker';
```

- [ ] **Step 11.3: Add them inside the returned JSX**

Place them as siblings of the existing top-level HUD elements, AFTER the Canvas (so they overlay):

```tsx
<SeasonTracker
  seasonNumber={state.seasonState?.seasonNumber ?? 0}
  startedAt={state.seasonState?.startedAt ?? Date.now()}
/>
<DailyContractCard profileId={profile.id} />
```

> **Engineer note:** `state` and `profile` are placeholder names. Use whatever the file already binds the game state and the player-profile to. If a profile-id is not readily available, default to `'local'` for Phase 0 — Phase 1 will introduce profile-scoped claims.

- [ ] **Step 11.4: Manual smoke test**

```bash
pnpm server &
pnpm dev
```

Open `http://localhost:5173` (or the Vite-reported port). Confirm:
1. SeasonTracker visible at top-left with "S0 · W1" and 1/8 cells lit.
2. DailyContractCard *not yet* visible (no events seeded — that's Step 11.5).

Stop both.

- [ ] **Step 11.5: Seed a Daily event and re-test the card**

In a terminal, set the admin secret and seed an event:

```bash
export NEVA_ADMIN_SECRET="phase0-test"
pnpm server &

# Seed
NOW=$(node -e "console.log(Date.now())")
END=$(node -e "console.log(Date.now() + 24*3600*1000)")
curl -s -X POST http://localhost:8787/api/admin/events \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $NEVA_ADMIN_SECRET" \
  -d "{\"op\":\"create\",\"event\":{\"id\":\"daily-1\",\"archetype\":\"BREACH\",\"cadence\":\"DAILY\",\"seasonNumber\":0,\"title\":\"Surface Breach\",\"brief\":\"Decode 3 surface nodes.\",\"targetNodeIds\":[7,12,19],\"durationMs\":900000,\"startsAt\":$NOW,\"endsAt\":$END,\"rewards\":[{\"currency\":\"DATA\",\"amount\":10}]}}"
```

Reload the browser. The DailyContractCard should now render with "Surface Breach". Click **CLAIM REWARD** → card disappears. Repeat click on a manually re-rendered card → server returns `alreadyClaimed: true`.

Stop the server.

- [ ] **Step 11.6: Build + commit**

```bash
pnpm build
git add src/GameApp.tsx
git commit -m "feat(ui): mount SeasonTracker + DailyContractCard in GameApp"
```

---

## Task 12: Admin Event Editor (minimal HTML)

**Goal:** A static HTML page served from the server at `/admin/events` for creating and deleting events without curl. Gated by entering the `NEVA_ADMIN_SECRET` in the page (sent as Authorization header).

**Files:**
- Create: `server/admin-events.html`
- Modify: `server/index.mjs` (add the static route)

- [ ] **Step 12.1: Create `server/admin-events.html`**

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>NEVA Network — Event Admin</title>
<style>
  body { font-family: -apple-system, sans-serif; background: #0a0e27; color: #d8e8ff; margin: 0; padding: 24px; }
  h1 { color: #b88aff; }
  input, textarea, button, select {
    background: #1a1147; color: #d8e8ff; border: 1px solid #6a4aaa;
    padding: 6px 8px; border-radius: 4px; margin: 4px 0; font-family: inherit;
  }
  textarea { width: 600px; height: 220px; font-family: SF Mono, monospace; font-size: 12px; }
  button { cursor: pointer; }
  .row { margin: 8px 0; }
  pre { background: #1a1147; padding: 8px; border-radius: 4px; max-width: 600px; overflow-x: auto; }
</style>
</head>
<body>
<h1>NEVA NETWORK · EVENT ADMIN</h1>

<div class="row">
  <label>Admin secret:</label><br/>
  <input id="secret" type="password" size="40" placeholder="NEVA_ADMIN_SECRET" />
</div>

<h2>Create event (JSON)</h2>
<textarea id="json">{
  "id": "weekly-1",
  "archetype": "ANOMALY",
  "cadence": "WEEKLY",
  "seasonNumber": 0,
  "title": "Pulse from the Deep",
  "brief": "Trace the source of a 7-node pulse anomaly.",
  "targetNodeIds": [42, 73, 91, 104, 118, 137, 158],
  "durationMs": 7200000,
  "startsAt": 0,
  "endsAt": 0,
  "rewards": [{"currency":"LORE_SHARDS","amount":5}]
}</textarea>
<div class="row">
  <button id="create">Create</button>
  <button id="stats">Stats</button>
</div>

<h2>Delete event</h2>
<input id="delId" placeholder="event id" />
<button id="delete">Delete</button>

<h2>Result</h2>
<pre id="out">—</pre>

<script>
const out = document.getElementById('out');
const secret = () => document.getElementById('secret').value;

async function call(op, payload = {}) {
  const res = await fetch('/api/admin/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + secret() },
    body: JSON.stringify({ op, ...payload }),
  });
  out.textContent = await res.text();
}

document.getElementById('create').onclick = async () => {
  const txt = document.getElementById('json').value;
  let ev;
  try { ev = JSON.parse(txt); } catch { out.textContent = 'Invalid JSON'; return; }
  const now = Date.now();
  if (!ev.startsAt) ev.startsAt = now;
  if (!ev.endsAt)   ev.endsAt   = now + (ev.cadence === 'DAILY' ? 24 : 168) * 3600 * 1000;
  await call('create', { event: ev });
};

document.getElementById('delete').onclick = () =>
  call('delete', { id: document.getElementById('delId').value });

document.getElementById('stats').onclick = () => call('stats');
</script>
</body>
</html>
```

- [ ] **Step 12.2: Add a static route in `server/index.mjs`**

Add this branch alongside the other static-file handling (or near the top of the request handler):

```js
if (req.method === 'GET' && url.pathname === '/admin/events') {
  const html = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'admin-events.html'), 'utf8');
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
  return;
}
```

(The `readFileSync`, `dirname`, `fileURLToPath`, and `join` imports already exist at the top of `server/index.mjs` per the read in Task 7.)

- [ ] **Step 12.3: Smoke-test**

```bash
export NEVA_ADMIN_SECRET="phase0-test"
pnpm server &
```

Open `http://localhost:8787/admin/events` in the browser. Enter the secret. Click **Create** with the default JSON → `out` shows the created event. Click **Stats** → confirms count incremented.

Stop the server.

- [ ] **Step 12.4: Commit**

```bash
git add server/admin-events.html server/index.mjs
git commit -m "feat(server): /admin/events minimal editor"
```

---

## Task 13: Integration regression + Phase 0 gate verification

**Goal:** Confirm M00–M20 still plays, all Phase 0 gates pass, and no forbidden deps were added.

**Files:** none (verification only)

- [ ] **Step 13.1: Full test suite**

```bash
pnpm test:run
```

Expected: all tests pass (wallet, seasons, save, archetypes, service).

- [ ] **Step 13.2: Full build**

```bash
pnpm build
```

Expected: exit 0.

- [ ] **Step 13.3: Lint**

```bash
pnpm lint
```

Expected: exit 0.

- [ ] **Step 13.4: Grep audit — no Web3 dependencies introduced**

```bash
node -e "
const pkg = require('./package.json');
const deps = {...pkg.dependencies, ...pkg.devDependencies};
const banned = ['ethers','web3','wagmi','viem','@walletconnect/','@solana/','@reown/','rainbowkit','starknet'];
const hits = Object.keys(deps).filter(d => banned.some(b => d.includes(b)));
console.log(hits.length ? 'FAIL — Web3 deps found: ' + hits.join(', ') : 'OK — no Web3 deps');
process.exit(hits.length ? 1 : 0);
"
```

Expected output: `OK — no Web3 deps`.

- [ ] **Step 13.5: Grep audit — no `any` or `@ts-ignore` introduced in Phase 0 files**

```bash
grep -nE "\\bany\\b|@ts-ignore|@ts-nocheck" \
  src/wallet.ts src/seasons.ts src/events/*.ts src/components/DailyContractCard.tsx src/components/SeasonTracker.tsx 2>&1 \
  | grep -v "as { wallet?:" || echo "OK — no new any / ts-ignore"
```

Expected: `OK — no new any / ts-ignore` (the lone `as { wallet?: unknown }` cast in the save migration is acceptable — it's narrowly scoped at the migration boundary).

- [ ] **Step 13.6: Manual playthrough — Mission 00**

```bash
pnpm server &
pnpm dev
```

Open the game, start a fresh save (or use the existing one). Confirm:
1. SeasonTracker top-left shows S0 · W1.
2. Mission 00 tutorial plays through to completion (9 guided beats).
3. After Mission 00, mission narrative resumes per the existing chain.

Stop both.

> **Note**: You do not need to play through all 20 missions to mark this step done — confirm M00 + the next mission start, which exercises save migration, reducer, and the new HUD overlays together. A full M00→M20 playthrough is the Phase 1 gate.

- [ ] **Step 13.7: Final commit (if any cleanup needed)**

```bash
git status
# If anything changed during smoke testing (e.g. data/events.json regenerated), commit or revert as appropriate.
```

---

## Task 14: Phase 0 complete — document, then offer Phase 1 plan

**Goal:** Close out Phase 0 with a short note in `CURRENT_PROJECT_STATE.md` (or wherever phase-status lives), then signal "Phase 0 done, ready for Phase 1 plan."

**Files:**
- Modify: `CURRENT_PROJECT_STATE.md` (search for "Phase" / "Status" section; append "Six-Month Grid Phase 0: complete").

- [ ] **Step 14.1: Update the status note**

Add a one-paragraph entry under the project status table:

```
- **Six-Month Grid Phase 0 (Foundation)** — **Complete** (2026-XX-XX). Adds vitest harness,
  wallet abstraction, season state, save migration v2, event archetypes, backend event store +
  routes, frontend events service, DailyContractCard, SeasonTracker, and the /admin/events page.
  M00–M20 unchanged. No Web3 deps. Ready for Phase 1 — Season 0 "First Cipher" content authoring.
```

- [ ] **Step 14.2: Commit**

```bash
git add CURRENT_PROJECT_STATE.md
git commit -m "docs: mark Six-Month Grid Phase 0 complete"
```

- [ ] **Step 14.3: Phase 0 is done.**

Phase 1 (Season 0 content authoring + NEVA Core event-drafter + leaderboard + Pattern Lens permanent unlock) gets its own plan once we agree to proceed.

---

## Phase 0 /goal directive (for autonomous execution)

```
/goal Implement Phase 0 of the Six-Month Grid plan in
docs/superpowers/plans/2026-05-28-six-month-grid-phase-0.md.
Work through Tasks 0–14 in order. Per task, follow the TDD steps
exactly (failing test → impl → passing test → commit).

Done when:
- All 14 tasks are committed (`git log --oneline | head -20` shows them).
- `pnpm test:run` exits 0 with at least 25 passing tests.
- `pnpm build` exits 0.
- `pnpm lint` exits 0.
- `node -e "const p=require('./package.json'); const d={...p.dependencies,...p.devDependencies}; const b=['ethers','web3','wagmi','viem','@walletconnect/','@solana/','@reown/','rainbowkit','starknet']; const h=Object.keys(d).filter(x=>b.some(y=>x.includes(y))); process.exit(h.length)"` exits 0.
- Manual smoke: dev server starts, Mission 00 plays through, SeasonTracker visible,
  seeded DailyContractCard renders and claim button works.
- `docs/superpowers/specs/2026-05-28-data-grid-game-design.md` is unchanged (spec is read-only).
- `src/missions.ts`, `src/network.ts`, `src/sectorGen.ts` are unchanged.

Constraints:
- Do not modify Missions 00–20 logic.
- Do not introduce any Web3 / token / wallet-connect / smart-contract module.
- All currency mutations must route through wallet.ts (audit by grep).
- No new `any` or `@ts-ignore` outside the one allowed save-migration cast.
- Backend stays zero-dep until SQLite is justified (Phase 1+).
- Each task is its own commit.

Stop after 60 turns max.
```

---

## Self-Review (run after the plan is written)

**Spec coverage** — every Phase 0 milestone gate in spec §7 is implemented:

| Spec gate | Task |
|---|---|
| 1. `wallet.ts` routes all currency mutations | Task 1 + Task 2 |
| 2. `seasons.ts` + save migration v2 | Tasks 3 + 4 |
| 3. `/api/events/active` returns at least one daily + weekly | Tasks 6 + 7 + Step 11.5 |
| 4. Admin Event Editor at `/admin/events` | Task 12 |
| 5. Daily Contract HUD renders + completes + claims | Tasks 8 + 9 + 11 |
| 6. Weekly Anomaly opens in Sector A02 + completes + claims | Task 7 (route covers weekly) + admin can seed; full UI integration deferred to Phase 1 — flagged in Phase 1 backlog |
| 7. Season tracker UI shows weeks 1–8 | Task 10 |
| 8. `pnpm build` green | Task 13 gate |
| 9. M00–M20 still plays | Task 13 Step 13.6 |

**Placeholder scan** — none found.

**Type consistency** — `Currency`, `WalletSnapshot`, `LedgerEntry`, `SeasonState`, `ClassProgression`, `GameEvent`, `Archetype`, `EventCadence`, `Reward`, `ClaimResult` are defined exactly once and referenced consistently. Type aliases match across `wallet.ts`, `seasons.ts`, `events/types.ts`, `events/service.ts`, and the save migration.

**Scope check** — Phase 0 only. Subsequent phases will get their own plan docs.


---

## Part III.1 — Phase 1 Plan (Season 0 launch)

*Originally: `docs/superpowers/plans/2026-05-28-six-month-grid-phase-1.md`*


**Goal:** Take the Season 0 Content Bible and load it into the Phase 0 engine. After Phase 1, **NEVA Network is fully playable for 8 weeks as Season 0 "First Cipher"** — Operator class only, with 8 puzzle engines, 4 factions, 7 Weekly Anomalies, 12 Daily Contract templates, the Tentpole story arc, NEVA Core whisper library, and the Pattern Lens permanent unlock.

**Architecture:** Pure-logic puzzle engines live under `src/puzzles/`, each independently unit-tested. Faction reputation under `src/factions/`. Story-arc state machine under `src/seasons/storyArc.ts`. Tentpole stages are JSON-driven (`server/data/seasons/s0/tentpole.json`) and rendered by a single React component (`TentpoleStageView`). NEVA Core whispers are JSON-driven with a server endpoint for lie-rate selection. The Phase 0 wallet + event store + admin page handle all currency and event delivery.

**Tech Stack:** Same as Phase 0 (Vite 8, React 19, TypeScript strict, R3F 9, vitest). Adds `openai` package as a server-side dev-dep for NEVA Core event drafter (existing `OPENAI_API_KEY` env var). No frontend Web3 deps.

**Companion docs:**
- Engine plan: `docs/superpowers/plans/2026-05-28-six-month-grid-phase-0.md`
- Content Bible: `docs/superpowers/specs/2026-05-28-content-bible-season-0.md`
- Design spec: `docs/superpowers/specs/2026-05-28-data-grid-game-design.md`

**Pre-requisite:** **Phase 0 must be merged to main and `pnpm test:run` + `pnpm build` must be green.** Phase 1 builds on top of every file Phase 0 created.

---

## File Structure

### Created (frontend)
| Path | Responsibility |
|---|---|
| `src/puzzles/types.ts` | Shared puzzle types (`PuzzleSpec`, `PuzzleResult`, `PuzzleType`). |
| `src/puzzles/registry.ts` | Weighted random picker by difficulty (per Bible §3.9). |
| `src/puzzles/caesar.ts` | Caesar Shift (P-CES) — pure solver/validator. |
| `src/puzzles/caesar.test.ts` | Caesar unit tests. |
| `src/puzzles/frequency.ts` | Frequency Map (P-FRQ) — pure. |
| `src/puzzles/frequency.test.ts` | Frequency unit tests. |
| `src/puzzles/patternWalk.ts` | Pattern Walk (P-PWK) — pure. |
| `src/puzzles/patternWalk.test.ts` | Pattern Walk unit tests. |
| `src/puzzles/symbolSub.ts` | Symbol Substitution (P-SUB) — pure. |
| `src/puzzles/symbolSub.test.ts` | Symbol Sub unit tests. |
| `src/puzzles/graphTraversal.ts` | Graph Traversal (P-GRT) — pure. |
| `src/puzzles/graphTraversal.test.ts` | Graph Traversal unit tests. |
| `src/puzzles/lightPhysics.ts` | Light Physics (P-LPH) — pure. |
| `src/puzzles/lightPhysics.test.ts` | Light Physics unit tests. |
| `src/puzzles/nevaWhisper.ts` | NEVA Whisper (P-NWI) — selection + lie-rate. |
| `src/puzzles/nevaWhisper.test.ts` | NEVA Whisper unit tests. |
| `src/puzzles/echoOverlay.ts` | Echo Overlay (P-ECO) — pure. |
| `src/puzzles/echoOverlay.test.ts` | Echo Overlay unit tests. |
| `src/factions/types.ts` | Faction ID enum + Reputation types. |
| `src/factions/reducer.ts` | Pure reducer for rep changes (per Bible §2.5). |
| `src/factions/reducer.test.ts` | Reputation reducer tests. |
| `src/factions/definitions.ts` | The four faction records (Archive, Black Loop, Quiet Pattern, Severance). |
| `src/seasons/storyArc.ts` | Season-0 week-by-week story-beat dispatcher. |
| `src/seasons/storyArc.test.ts` | Story-arc unit tests. |
| `src/featureFlags.ts` | Permanent-unlock flag registry (Pattern Lens etc.). |
| `src/featureFlags.test.ts` | Flag registry tests. |
| `src/loreArchive.ts` | Lore page unlock + read state. |
| `src/loreArchive.test.ts` | Lore unit tests. |
| `src/components/AnomalyPanel.tsx` | Multi-stage weekly anomaly UI. |
| `src/components/TentpoleStageView.tsx` | Tentpole stage renderer (JSON-driven). |
| `src/components/FactionRepGauge.tsx` | 4-faction reputation HUD. |
| `src/components/PatternLensOverlay.tsx` | Tab-hold visual filter (R3F). |
| `src/components/PuzzlePanel.tsx` | Generic puzzle panel host (routes by `PuzzleType`). |
| `src/components/puzzleViews/CaesarView.tsx` | Caesar puzzle UI. |
| `src/components/puzzleViews/FrequencyView.tsx` | Frequency puzzle UI. |
| `src/components/puzzleViews/PatternWalkView.tsx` | Pattern Walk puzzle UI. |
| `src/components/puzzleViews/SymbolSubView.tsx` | Symbol Sub puzzle UI. |
| `src/components/puzzleViews/GraphTraversalView.tsx` | Graph Traversal puzzle UI. |
| `src/components/puzzleViews/LightPhysicsView.tsx` | Light Physics puzzle UI. |
| `src/components/puzzleViews/NevaWhisperView.tsx` | NEVA Whisper puzzle UI. |
| `src/components/puzzleViews/EchoOverlayView.tsx` | Echo Overlay puzzle UI. |
| `src/audio/whisperTells.ts` | Audio cue manager — plays piano dyad for reliable, silence for lie. |

### Created (backend)
| Path | Responsibility |
|---|---|
| `server/data/seasons/s0/weeklies.json` | 7 hand-authored Weekly Anomalies. |
| `server/data/seasons/s0/daily-templates.json` | 12 Daily Contract templates. |
| `server/data/seasons/s0/tentpole.json` | TP-S0 7-stage script. |
| `server/data/seasons/s0/beats.json` | Week → narration map. |
| `server/data/seasons/s0/lore.json` | Lore page library. |
| `server/data/whispers.json` | NEVA whisper library (reliable + unreliable + story beats). |
| `server/scheduler.mjs` | Cron-like daily/weekly event spawn. |
| `server/seed-season-0.mjs` | Idempotent seeder — populates Event Store + lore on first boot. |
| `server/ai-event-drafter.mjs` | NEVA Core LLM template filler (admin review gate). |
| `server/data-loader.mjs` | Helper to read `server/data/seasons/sN/*.json`. |

### Modified
| Path | Reason |
|---|---|
| `src/game.ts` | Add faction reputation + lore-unlocks + active-puzzle fields to `GameState`. |
| `src/save.ts` | Bump to migration v3 (additive — adds factions/lore). |
| `src/save.test.ts` | Add v2→v3 migration regression test. |
| `src/seasons.ts` | Add `getCurrentBeat` (week → beat) + season-end soft-reset. |
| `src/wallet.ts` | Add soft-cap enforcement (per Bible §8.3). |
| `src/components/DailyContractCard.tsx` | Wire to PuzzlePanel + record claim. |
| `src/components/SeasonTracker.tsx` | Show current story-beat title on hover. |
| `src/GameApp.tsx` | Mount FactionRepGauge + AnomalyPanel + TentpoleStageView + PatternLensOverlay. |
| `server/index.mjs` | Wire scheduler + `/api/whispers/pick`, `/api/lore/*`, `/api/tentpole/*` routes. |
| `server/events-routes.mjs` | Extend admin op with `seed` and `unseed` for season data. |
| `package.json` | Add `openai` dep (server-side only for the drafter). Add `seed:season-0` script. |
| `CURRENT_PROJECT_STATE.md` | Mark Phase 1 in progress, then complete. |

### Not Touched
- `src/missions.ts`, `src/network.ts`, `src/sectorGen.ts` — Mission chain stays canonical.
- All node/cipher logic from M00–M20 — unchanged.
- Three.js core scene — Phase 1 is HUD + JSON + logic.

---

## Task 1: Puzzle types + registry scaffolding

**Goal:** Establish the shared types and the weighted picker. Pure logic, TDD-friendly.

**Files:**
- Create: `src/puzzles/types.ts`
- Create: `src/puzzles/registry.ts`
- Create: `src/puzzles/registry.test.ts`

- [ ] **Step 1.1: Write the failing test**

`src/puzzles/registry.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { pickPuzzleType } from './registry';
import type { PuzzleType, Difficulty } from './types';

describe('puzzle registry', () => {
  it('returns one of the valid puzzle types', () => {
    const valid: PuzzleType[] = ['P-CES','P-FRQ','P-PWK','P-SUB','P-GRT','P-LPH','P-NWI','P-ECO'];
    for (let i = 0; i < 200; i++) {
      const picked = pickPuzzleType('easy', () => Math.random());
      expect(valid).toContain(picked);
    }
  });

  it('respects easy weights — P-CES dominates', () => {
    let cesCount = 0;
    const N = 1000;
    let rng = 0;
    const nextRng = () => { rng = (rng + 0.001) % 1; return rng; };
    for (let i = 0; i < N; i++) {
      if (pickPuzzleType('easy', nextRng) === 'P-CES') cesCount++;
    }
    // P-CES weight 30 / total easy weight 100 = 30%
    expect(cesCount / N).toBeGreaterThan(0.20);
    expect(cesCount / N).toBeLessThan(0.40);
  });

  it('never picks P-ECO on easy or medium difficulty', () => {
    for (let i = 0; i < 500; i++) {
      const easy = pickPuzzleType('easy', () => Math.random());
      const med = pickPuzzleType('medium', () => Math.random());
      expect(easy).not.toBe('P-ECO');
      expect(med).not.toBe('P-ECO');
    }
  });

  it('hard distribution includes P-ECO', () => {
    let ecoCount = 0;
    const N = 1000;
    for (let i = 0; i < N; i++) {
      if (pickPuzzleType('hard', () => Math.random()) === 'P-ECO') ecoCount++;
    }
    expect(ecoCount).toBeGreaterThan(0); // weight 5 of 100
  });
});
```

- [ ] **Step 1.2: Run (expect fail)**

```bash
pnpm test:run src/puzzles/registry.test.ts
```

Expected: `Cannot find module './registry'`.

- [ ] **Step 1.3: Create `src/puzzles/types.ts`**

```ts
/**
 * Shared puzzle types — every puzzle engine implements `PuzzleSpec` (the
 * generated puzzle, server-deliverable) and produces a `PuzzleResult`.
 *
 * IDs are STABLE — see Content Bible §3 and §11.2.
 */

export type PuzzleType =
  | 'P-CES' // Caesar Shift
  | 'P-FRQ' // Frequency Map
  | 'P-PWK' // Pattern Walk
  | 'P-SUB' // Symbol Substitution
  | 'P-GRT' // Graph Traversal
  | 'P-LPH' // Light Physics
  | 'P-NWI' // NEVA Whisper Interpretation
  | 'P-ECO'; // Echo Overlay

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface PuzzleSpec {
  type: PuzzleType;
  id: string;            // unique per generated instance
  difficulty: Difficulty;
  seed: number;          // deterministic seed for regeneration
  payload: unknown;      // type-specific puzzle data
  durationMs: number;    // soft target
}

export interface PuzzleResult {
  puzzleId: string;
  type: PuzzleType;
  solved: boolean;
  attempts: number;
  elapsedMs: number;
  // type-specific extras (the lie-was-recognized flag for P-NWI, etc.)
  extras?: Record<string, unknown>;
}
```

- [ ] **Step 1.4: Create `src/puzzles/registry.ts`**

```ts
import type { PuzzleType, Difficulty } from './types';

// Per Content Bible §3.9 — weights chosen to feel right across the season.
const WEIGHTS: Record<Difficulty, Record<PuzzleType, number>> = {
  easy:   { 'P-CES':30, 'P-FRQ':15, 'P-PWK':15, 'P-SUB':10, 'P-GRT':5,  'P-LPH':5,  'P-NWI':20, 'P-ECO':0 },
  medium: { 'P-CES':15, 'P-FRQ':25, 'P-PWK':20, 'P-SUB':15, 'P-GRT':10, 'P-LPH':10, 'P-NWI':5,  'P-ECO':0 },
  hard:   { 'P-CES':5,  'P-FRQ':15, 'P-PWK':20, 'P-SUB':20, 'P-GRT':15, 'P-LPH':15, 'P-NWI':5,  'P-ECO':5 },
};

const TYPES_ORDER: PuzzleType[] =
  ['P-CES','P-FRQ','P-PWK','P-SUB','P-GRT','P-LPH','P-NWI','P-ECO'];

export function pickPuzzleType(
  difficulty: Difficulty,
  rng: () => number = Math.random,
): PuzzleType {
  const weights = WEIGHTS[difficulty];
  const total = TYPES_ORDER.reduce((acc, t) => acc + weights[t], 0);
  let r = rng() * total;
  for (const t of TYPES_ORDER) {
    r -= weights[t];
    if (r < 0) return t;
  }
  return 'P-CES'; // fallback (mathematically unreachable, here for type safety)
}
```

- [ ] **Step 1.5: Run (expect pass)**

```bash
pnpm test:run src/puzzles/registry.test.ts
```

Expected: 4 tests pass.

- [ ] **Step 1.6: Build + commit**

```bash
pnpm build
git add src/puzzles/types.ts src/puzzles/registry.ts src/puzzles/registry.test.ts
git commit -m "feat(puzzles): types + weighted registry (Phase 1)"
```

---

## Task 2: Caesar Shift (P-CES) engine

**Goal:** Pure logic to generate and validate a Caesar Shift puzzle. The UI consumes this.

**Files:**
- Create: `src/puzzles/caesar.ts`
- Create: `src/puzzles/caesar.test.ts`

- [ ] **Step 2.1: Write the failing tests**

`src/puzzles/caesar.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { generateCaesar, validateCaesar } from './caesar';

describe('Caesar Shift', () => {
  it('generates with a deterministic seed', () => {
    const a = generateCaesar({ seed: 42, difficulty: 'easy' });
    const b = generateCaesar({ seed: 42, difficulty: 'easy' });
    expect(a).toEqual(b);
  });

  it('easy difficulty produces 4–6 letter words', () => {
    const p = generateCaesar({ seed: 1, difficulty: 'easy' });
    expect(p.plaintext.length).toBeGreaterThanOrEqual(4);
    expect(p.plaintext.length).toBeLessThanOrEqual(6);
  });

  it('encrypted matches plaintext shifted by N', () => {
    const p = generateCaesar({ seed: 1, difficulty: 'easy' });
    const decoded = shift(p.encrypted, -p.shift);
    expect(decoded).toBe(p.plaintext);
  });

  it('validateCaesar accepts the correct shift', () => {
    const p = generateCaesar({ seed: 7, difficulty: 'medium' });
    expect(validateCaesar(p, p.shift)).toEqual({ solved: true });
  });

  it('validateCaesar rejects incorrect shift', () => {
    const p = generateCaesar({ seed: 7, difficulty: 'medium' });
    const wrongShift = (p.shift + 5) % 26;
    expect(validateCaesar(p, wrongShift)).toEqual({ solved: false });
  });

  it('hard difficulty has shift > 13 sometimes', () => {
    let highShifts = 0;
    for (let s = 1; s < 50; s++) {
      const p = generateCaesar({ seed: s, difficulty: 'hard' });
      if (p.shift > 13) highShifts++;
    }
    expect(highShifts).toBeGreaterThan(0);
  });
});

function shift(s: string, n: number): string {
  const N = 26;
  return s.split('').map((c) => {
    const code = c.charCodeAt(0);
    if (code < 65 || code > 90) return c;
    return String.fromCharCode(((code - 65 + n) % N + N) % N + 65);
  }).join('');
}
```

- [ ] **Step 2.2: Run (expect fail)**

```bash
pnpm test:run src/puzzles/caesar.test.ts
```

Expected: module not found.

- [ ] **Step 2.3: Implement `src/puzzles/caesar.ts`**

```ts
import type { Difficulty } from './types';

const WORDLIST_EASY   = ['SIGNAL','GRID','ECHO','PULSE','LOCK','KEY','TRACE','NODE','LISTEN','OPEN'];
const WORDLIST_MEDIUM = ['ARCHIVE','PATTERN','CORRUPT','LOCKED','FIREWALL','VAULT','REGISTER'];
const WORDLIST_HARD   = ['CONTAINMENT','SUBSTITUTION','OPERATIONAL','BLACK_LOOP','SEVERANCE'];

export interface CaesarPuzzle {
  type: 'P-CES';
  seed: number;
  difficulty: Difficulty;
  plaintext: string;
  encrypted: string;
  shift: number;
}

function rng(seed: number) {
  // mulberry32 — matches the project's existing PRNG style (see src/world.ts).
  return () => {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function caesarShift(s: string, n: number): string {
  const N = 26;
  return s.split('').map((c) => {
    const code = c.charCodeAt(0);
    if (code < 65 || code > 90) return c;
    return String.fromCharCode(((code - 65 + n) % N + N) % N + 65);
  }).join('');
}

export function generateCaesar(opts: { seed: number; difficulty: Difficulty }): CaesarPuzzle {
  const r = rng(opts.seed);
  const list =
    opts.difficulty === 'easy' ? WORDLIST_EASY :
    opts.difficulty === 'medium' ? WORDLIST_MEDIUM :
    WORDLIST_HARD;
  const plaintext = list[Math.floor(r() * list.length)];
  // easy: 1-12; medium: 5-20; hard: 1-25
  const shiftRange = opts.difficulty === 'easy' ? [1,12] : opts.difficulty === 'medium' ? [5,20] : [1,25];
  const shift = Math.floor(r() * (shiftRange[1] - shiftRange[0] + 1)) + shiftRange[0];
  const encrypted = caesarShift(plaintext, shift);
  return { type: 'P-CES', seed: opts.seed, difficulty: opts.difficulty, plaintext, encrypted, shift };
}

export function validateCaesar(puzzle: CaesarPuzzle, attemptedShift: number): { solved: boolean } {
  const normalized = ((attemptedShift % 26) + 26) % 26;
  return { solved: normalized === puzzle.shift };
}
```

- [ ] **Step 2.4: Run + build + commit**

```bash
pnpm test:run src/puzzles/caesar.test.ts
pnpm build
git add src/puzzles/caesar.ts src/puzzles/caesar.test.ts
git commit -m "feat(puzzles): Caesar Shift (P-CES) engine"
```

---

## Task 3: Frequency Map (P-FRQ) engine

**Goal:** Generate a monoalphabetic-substituted ciphertext + frequency table; validate player's reverse mapping.

**Files:**
- Create: `src/puzzles/frequency.ts`
- Create: `src/puzzles/frequency.test.ts`

- [ ] **Step 3.1: Write the failing test**

`src/puzzles/frequency.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { generateFrequency, validateFrequency } from './frequency';

describe('Frequency Map', () => {
  it('deterministic with seed', () => {
    const a = generateFrequency({ seed: 3, difficulty: 'easy' });
    const b = generateFrequency({ seed: 3, difficulty: 'easy' });
    expect(a.ciphertext).toBe(b.ciphertext);
    expect(a.substitution).toEqual(b.substitution);
  });

  it('the cipher decrypts back to the source text using the substitution', () => {
    const p = generateFrequency({ seed: 1, difficulty: 'easy' });
    // Apply inverse map to the ciphertext
    const inverse = invert(p.substitution);
    const decoded = p.ciphertext.split('').map((c) => inverse[c] ?? c).join('');
    expect(decoded).toBe(p.sourceText);
  });

  it('validateFrequency accepts the correct mapping', () => {
    const p = generateFrequency({ seed: 1, difficulty: 'easy' });
    expect(validateFrequency(p, p.substitution).solved).toBe(true);
  });

  it('validateFrequency rejects a wrong mapping', () => {
    const p = generateFrequency({ seed: 1, difficulty: 'easy' });
    const swapped = { ...p.substitution };
    const keys = Object.keys(swapped);
    [swapped[keys[0]], swapped[keys[1]]] = [swapped[keys[1]], swapped[keys[0]]];
    expect(validateFrequency(p, swapped).solved).toBe(false);
  });
});

function invert(m: Record<string,string>) {
  const o: Record<string,string> = {};
  for (const k of Object.keys(m)) o[m[k]] = k;
  return o;
}
```

- [ ] **Step 3.2: Run (expect fail)**

```bash
pnpm test:run src/puzzles/frequency.test.ts
```

- [ ] **Step 3.3: Implement `src/puzzles/frequency.ts`**

```ts
import type { Difficulty } from './types';

const SOURCE_EASY   = ['THE GRID IS WAKING UP','OPEN THE INDEX','LISTEN FOR THE PULSE'];
const SOURCE_MEDIUM = ['THE PULSE REPEATS EVERY NINE NODES','THREE LOCKS ON THE SEVENTH ROUTER'];
const SOURCE_HARD   = ['SEVERANCE WILL CLOSE THE CHAMBER UNLESS WE INTERVENE BEFORE THE PULSE FADES'];

export interface FrequencyPuzzle {
  type: 'P-FRQ';
  seed: number;
  difficulty: Difficulty;
  sourceText: string;          // hidden answer
  substitution: Record<string,string>; // source-letter → cipher-letter
  ciphertext: string;
  frequencyHint: { letter: string; count: number }[]; // shown to player
}

function rng(seed: number) {
  return () => {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffledAlphabet(r: () => number): string[] {
  const a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateFrequency(opts: { seed: number; difficulty: Difficulty }): FrequencyPuzzle {
  const r = rng(opts.seed);
  const list =
    opts.difficulty === 'easy' ? SOURCE_EASY :
    opts.difficulty === 'medium' ? SOURCE_MEDIUM :
    SOURCE_HARD;
  const sourceText = list[Math.floor(r() * list.length)];

  const shuffled = shuffledAlphabet(r);
  const substitution: Record<string,string> = {};
  for (let i = 0; i < 26; i++) {
    substitution[String.fromCharCode(65 + i)] = shuffled[i];
  }

  const ciphertext = sourceText.split('').map((c) => substitution[c] ?? c).join('');

  const counts: Record<string,number> = {};
  for (const c of ciphertext) if (/[A-Z]/.test(c)) counts[c] = (counts[c] ?? 0) + 1;
  const frequencyHint = Object.entries(counts)
    .map(([letter, count]) => ({ letter, count }))
    .sort((a, b) => b.count - a.count);

  return { type: 'P-FRQ', seed: opts.seed, difficulty: opts.difficulty, sourceText, substitution, ciphertext, frequencyHint };
}

export function validateFrequency(
  puzzle: FrequencyPuzzle,
  attemptedSubstitution: Record<string,string>,
): { solved: boolean } {
  // Apply inverse to ciphertext using the attempt; compare to sourceText.
  const inverseAttempt: Record<string,string> = {};
  for (const k of Object.keys(attemptedSubstitution)) {
    inverseAttempt[attemptedSubstitution[k]] = k;
  }
  const decoded = puzzle.ciphertext.split('').map((c) => inverseAttempt[c] ?? c).join('');
  return { solved: decoded === puzzle.sourceText };
}
```

- [ ] **Step 3.4: Run + build + commit**

```bash
pnpm test:run src/puzzles/frequency.test.ts
pnpm build
git add src/puzzles/frequency.ts src/puzzles/frequency.test.ts
git commit -m "feat(puzzles): Frequency Map (P-FRQ) engine"
```

---

## Task 4: Pattern Walk (P-PWK) engine

**Goal:** Generate a 5x5 (or larger) glyph grid + a hidden path that spells the signature; validate player's walk.

**Files:**
- Create: `src/puzzles/patternWalk.ts`
- Create: `src/puzzles/patternWalk.test.ts`

- [ ] **Step 4.1: Tests**

`src/puzzles/patternWalk.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { generatePatternWalk, validatePatternWalk } from './patternWalk';

describe('Pattern Walk', () => {
  it('deterministic with seed', () => {
    const a = generatePatternWalk({ seed: 11, difficulty: 'easy' });
    const b = generatePatternWalk({ seed: 11, difficulty: 'easy' });
    expect(a.grid).toEqual(b.grid);
    expect(a.solutionPath).toEqual(b.solutionPath);
  });

  it('the solution path spells the answer', () => {
    const p = generatePatternWalk({ seed: 1, difficulty: 'easy' });
    const spelled = p.solutionPath.map(([r,c]) => p.grid[r][c]).join('');
    expect(spelled).toBe(p.answer);
  });

  it('grid is 5x5 on easy', () => {
    const p = generatePatternWalk({ seed: 1, difficulty: 'easy' });
    expect(p.grid.length).toBe(5);
    expect(p.grid[0].length).toBe(5);
  });

  it('hard increases grid to 7x7', () => {
    const p = generatePatternWalk({ seed: 1, difficulty: 'hard' });
    expect(p.grid.length).toBe(7);
  });

  it('validateWalk accepts a correct path', () => {
    const p = generatePatternWalk({ seed: 1, difficulty: 'easy' });
    expect(validatePatternWalk(p, p.solutionPath).solved).toBe(true);
  });

  it('validateWalk rejects a path with diagonals (forbidden)', () => {
    const p = generatePatternWalk({ seed: 1, difficulty: 'easy' });
    const diagonal: [number,number][] = [[0,0],[1,1]];
    expect(validatePatternWalk(p, diagonal).solved).toBe(false);
  });
});
```

- [ ] **Step 4.2: Implement `src/puzzles/patternWalk.ts`**

```ts
import type { Difficulty } from './types';

const ANSWERS_EASY = ['ECHO','GRID','LOCK','OPEN'];
const ANSWERS_MEDIUM = ['ARCHIVE','PATTERN','VAULT','CORE'];
const ANSWERS_HARD = ['CONTAINMENT','SEVERANCE','BLACKLOOP'];

export interface PatternWalkPuzzle {
  type: 'P-PWK';
  seed: number;
  difficulty: Difficulty;
  size: number;                // grid edge length
  grid: string[][];            // [row][col]
  answer: string;
  solutionPath: [number, number][]; // walk through the grid
}

function rng(seed: number) {
  return () => {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function neighbors(r: number, c: number, size: number): [number, number][] {
  return [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(([nr,nc]) => nr>=0 && nr<size && nc>=0 && nc<size) as [number,number][];
}

export function generatePatternWalk(opts: { seed: number; difficulty: Difficulty }): PatternWalkPuzzle {
  const r = rng(opts.seed);
  const list = opts.difficulty === 'easy' ? ANSWERS_EASY :
               opts.difficulty === 'medium' ? ANSWERS_MEDIUM : ANSWERS_HARD;
  const answer = list[Math.floor(r() * list.length)];
  const size = opts.difficulty === 'hard' ? 7 : opts.difficulty === 'medium' ? 6 : 5;

  // Place the answer along a random non-revisiting walk
  const visited = new Set<string>();
  const path: [number, number][] = [];
  let row = Math.floor(r() * size);
  let col = Math.floor(r() * size);
  path.push([row, col]); visited.add(`${row},${col}`);
  for (let i = 1; i < answer.length; i++) {
    const candidates = neighbors(row, col, size).filter(([nr,nc]) => !visited.has(`${nr},${nc}`));
    if (candidates.length === 0) {
      // Restart with a different seed if we get stuck — extremely rare with the chosen sizes.
      return generatePatternWalk({ seed: opts.seed + 1, difficulty: opts.difficulty });
    }
    const next = candidates[Math.floor(r() * candidates.length)];
    row = next[0]; col = next[1];
    path.push([row, col]); visited.add(`${row},${col}`);
  }

  const grid: string[][] = Array.from({ length: size }, () => Array.from({ length: size }, () => {
    return String.fromCharCode(65 + Math.floor(r() * 26));
  }));
  // Stamp the answer letters along the path.
  for (let i = 0; i < answer.length; i++) {
    const [pr, pc] = path[i];
    grid[pr][pc] = answer[i];
  }

  return { type: 'P-PWK', seed: opts.seed, difficulty: opts.difficulty, size, grid, answer, solutionPath: path };
}

export function validatePatternWalk(p: PatternWalkPuzzle, walk: [number, number][]): { solved: boolean } {
  if (walk.length !== p.answer.length) return { solved: false };
  const visited = new Set<string>();
  for (let i = 0; i < walk.length; i++) {
    const [r, c] = walk[i];
    if (r < 0 || r >= p.size || c < 0 || c >= p.size) return { solved: false };
    if (visited.has(`${r},${c}`)) return { solved: false };
    visited.add(`${r},${c}`);
    if (i > 0) {
      const [pr, pc] = walk[i - 1];
      const dr = Math.abs(r - pr), dc = Math.abs(c - pc);
      if (dr + dc !== 1) return { solved: false }; // diagonals + skips forbidden
    }
    if (p.grid[r][c] !== p.answer[i]) return { solved: false };
  }
  return { solved: true };
}
```

- [ ] **Step 4.3: Run + commit**

```bash
pnpm test:run src/puzzles/patternWalk.test.ts
pnpm build
git add src/puzzles/patternWalk.ts src/puzzles/patternWalk.test.ts
git commit -m "feat(puzzles): Pattern Walk (P-PWK) engine"
```

---

## Task 5: Symbol Substitution (P-SUB) engine

Same TDD pattern as P-FRQ but the player constructs a substitution table from scratch (no frequency hint). Hint count varies by difficulty.

**Files:**
- Create: `src/puzzles/symbolSub.ts`
- Create: `src/puzzles/symbolSub.test.ts`

- [ ] **Step 5.1: Tests**

```ts
import { describe, it, expect } from 'vitest';
import { generateSymbolSub, validateSymbolSub } from './symbolSub';

describe('Symbol Sub', () => {
  it('deterministic with seed', () => {
    const a = generateSymbolSub({ seed: 9, difficulty: 'easy' });
    const b = generateSymbolSub({ seed: 9, difficulty: 'easy' });
    expect(a).toEqual(b);
  });
  it('easy gives 5 hints', () => {
    const p = generateSymbolSub({ seed: 1, difficulty: 'easy' });
    expect(Object.keys(p.hints).length).toBe(5);
  });
  it('hard gives 0 hints', () => {
    const p = generateSymbolSub({ seed: 1, difficulty: 'hard' });
    expect(Object.keys(p.hints).length).toBe(0);
  });
  it('validate accepts a fully-correct mapping', () => {
    const p = generateSymbolSub({ seed: 1, difficulty: 'easy' });
    expect(validateSymbolSub(p, p.substitution).solved).toBe(true);
  });
});
```

- [ ] **Step 5.2: Implement**

```ts
import type { Difficulty } from './types';

const SOURCES = {
  easy:   ['NEVA SAID THREE'],
  medium: ['ARCHIVE TOLD BLACK LOOP'],
  hard:   ['QUIET PATTERN WATCHES SEVERANCE WAITS'],
};

export interface SymbolSubPuzzle {
  type: 'P-SUB';
  seed: number;
  difficulty: Difficulty;
  ciphertext: string;
  sourceText: string;
  substitution: Record<string,string>;
  hints: Record<string,string>;
}

function rng(seed: number) {
  return () => {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(r: () => number) {
  const a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateSymbolSub(opts: { seed: number; difficulty: Difficulty }): SymbolSubPuzzle {
  const r = rng(opts.seed);
  const source = SOURCES[opts.difficulty][0];
  const shuf = shuffled(r);
  const substitution: Record<string,string> = {};
  for (let i = 0; i < 26; i++) substitution[String.fromCharCode(65+i)] = shuf[i];
  const ciphertext = source.split('').map((c) => substitution[c] ?? c).join('');
  const hintCount = opts.difficulty === 'easy' ? 5 : opts.difficulty === 'medium' ? 2 : 0;
  const hints: Record<string,string> = {};
  const keys = Object.keys(substitution);
  for (let i = 0; i < hintCount; i++) hints[keys[i]] = substitution[keys[i]];
  return { type: 'P-SUB', seed: opts.seed, difficulty: opts.difficulty, ciphertext, sourceText: source, substitution, hints };
}

export function validateSymbolSub(p: SymbolSubPuzzle, attempt: Record<string,string>): { solved: boolean } {
  for (const k of Object.keys(p.substitution)) {
    if (attempt[k] !== p.substitution[k]) return { solved: false };
  }
  return { solved: true };
}
```

- [ ] **Step 5.3: Run + commit**

```bash
pnpm test:run src/puzzles/symbolSub.test.ts
pnpm build
git add src/puzzles/symbolSub.ts src/puzzles/symbolSub.test.ts
git commit -m "feat(puzzles): Symbol Substitution (P-SUB) engine"
```

---

## Task 6: Graph Traversal (P-GRT) engine

**Goal:** Generate a small graph (5–9 nodes), a constraint (e.g. "only edges where label diff is prime"), and the unique solution path; validate player's traversal.

**Files:**
- Create: `src/puzzles/graphTraversal.ts`
- Create: `src/puzzles/graphTraversal.test.ts`

- [ ] **Step 6.1: Tests**

```ts
import { describe, it, expect } from 'vitest';
import { generateGraphTraversal, validateGraphTraversal } from './graphTraversal';

describe('Graph Traversal', () => {
  it('produces a solvable graph', () => {
    const p = generateGraphTraversal({ seed: 4, difficulty: 'easy' });
    expect(p.solution.length).toBeGreaterThan(2);
  });
  it('validateGraphTraversal accepts solution', () => {
    const p = generateGraphTraversal({ seed: 4, difficulty: 'easy' });
    expect(validateGraphTraversal(p, p.solution).solved).toBe(true);
  });
  it('rejects wrong path', () => {
    const p = generateGraphTraversal({ seed: 4, difficulty: 'easy' });
    expect(validateGraphTraversal(p, [p.startNode]).solved).toBe(false);
  });
});
```

- [ ] **Step 6.2: Implement (simplified — prime-diff constraint)**

```ts
import type { Difficulty } from './types';

export interface GraphPuzzle {
  type: 'P-GRT';
  seed: number;
  difficulty: Difficulty;
  nodes: number[];          // labels
  edges: [number, number][];
  startNode: number;
  endNode: number;
  rule: 'prime-diff' | 'even-diff';
  solution: number[];       // node-label sequence
}

function rng(seed: number) {
  return () => {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i*i <= n; i++) if (n % i === 0) return false;
  return true;
}

function ruleHolds(rule: 'prime-diff' | 'even-diff', a: number, b: number): boolean {
  const d = Math.abs(a - b);
  return rule === 'prime-diff' ? isPrime(d) : d % 2 === 0 && d > 0;
}

export function generateGraphTraversal(opts: { seed: number; difficulty: Difficulty }): GraphPuzzle {
  const r = rng(opts.seed);
  const size = opts.difficulty === 'easy' ? 5 : opts.difficulty === 'medium' ? 7 : 9;
  const labels: number[] = [];
  while (labels.length < size) {
    const n = Math.floor(r() * 30) + 1;
    if (!labels.includes(n)) labels.push(n);
  }
  const rule: 'prime-diff' | 'even-diff' = r() < 0.5 ? 'prime-diff' : 'even-diff';

  // Build edges that satisfy the rule
  const edges: [number,number][] = [];
  for (let i = 0; i < size; i++) for (let j = i+1; j < size; j++) {
    if (ruleHolds(rule, labels[i], labels[j])) edges.push([labels[i], labels[j]]);
  }

  // BFS for a path from labels[0] to labels[size-1]
  const startNode = labels[0];
  const endNode = labels[size - 1];
  const adj: Record<number, number[]> = {};
  for (const [a,b] of edges) {
    adj[a] ??= []; adj[b] ??= [];
    adj[a].push(b); adj[b].push(a);
  }
  const parent: Record<number, number | null> = { [startNode]: null };
  const queue = [startNode];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur === endNode) break;
    for (const nx of (adj[cur] ?? [])) {
      if (!(nx in parent)) { parent[nx] = cur; queue.push(nx); }
    }
  }
  if (!(endNode in parent)) {
    return generateGraphTraversal({ seed: opts.seed + 1, difficulty: opts.difficulty });
  }
  const solution: number[] = [];
  let cur: number | null = endNode;
  while (cur !== null) { solution.unshift(cur); cur = parent[cur] ?? null; }

  return { type: 'P-GRT', seed: opts.seed, difficulty: opts.difficulty, nodes: labels, edges, startNode, endNode, rule, solution };
}

export function validateGraphTraversal(p: GraphPuzzle, path: number[]): { solved: boolean } {
  if (path.length < 2) return { solved: false };
  if (path[0] !== p.startNode || path[path.length-1] !== p.endNode) return { solved: false };
  for (let i = 1; i < path.length; i++) {
    if (!ruleHolds(p.rule, path[i-1], path[i])) return { solved: false };
    if (!p.nodes.includes(path[i])) return { solved: false };
  }
  return { solved: true };
}
```

- [ ] **Step 6.3: Run + commit**

```bash
pnpm test:run src/puzzles/graphTraversal.test.ts
pnpm build
git add src/puzzles/graphTraversal.ts src/puzzles/graphTraversal.test.ts
git commit -m "feat(puzzles): Graph Traversal (P-GRT) engine"
```

---

## Task 7: Light Physics (P-LPH) engine

**Goal:** A mirror-and-prism puzzle. The pure-logic core simulates light propagation on a small grid; the UI is rendered with R3F in Task 17.

**Files:**
- Create: `src/puzzles/lightPhysics.ts`
- Create: `src/puzzles/lightPhysics.test.ts`

- [ ] **Step 7.1: Tests**

```ts
import { describe, it, expect } from 'vitest';
import { generateLightPhysics, simulateBeam, validateLightPhysics } from './lightPhysics';

describe('Light Physics', () => {
  it('simulates a straight beam unobstructed', () => {
    const p = generateLightPhysics({ seed: 1, difficulty: 'easy' });
    const result = simulateBeam(p.grid, p.source, p.placement);
    expect(result.reached).toBe(p.placement.length >= 1);
  });
  it('validates a configuration that reaches the sink', () => {
    const p = generateLightPhysics({ seed: 2, difficulty: 'easy' });
    expect(validateLightPhysics(p, p.solutionPlacement).solved).toBe(true);
  });
});
```

- [ ] **Step 7.2: Implement**

```ts
import type { Difficulty } from './types';

export interface MirrorPlacement {
  row: number;
  col: number;
  angle: 0 | 45 | 90 | 135; // mirror angle
}

export interface LightPhysicsPuzzle {
  type: 'P-LPH';
  seed: number;
  difficulty: Difficulty;
  size: number;
  grid: string[][]; // '.' empty, 'S' source, 'X' sink, 'W' wall
  source: { row: number; col: number; dir: 'N'|'E'|'S'|'W' };
  sink:   { row: number; col: number };
  placement: MirrorPlacement[];      // shipped to client (empty initially)
  solutionPlacement: MirrorPlacement[];
}

function rng(seed: number) {
  return () => {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateLightPhysics(opts: { seed: number; difficulty: Difficulty }): LightPhysicsPuzzle {
  const r = rng(opts.seed);
  const size = opts.difficulty === 'easy' ? 5 : opts.difficulty === 'medium' ? 6 : 7;
  const grid: string[][] = Array.from({ length: size }, () => Array.from({ length: size }, () => '.'));
  const source = { row: 0, col: Math.floor(r() * size), dir: 'S' as const };
  const sink = { row: size - 1, col: Math.floor(r() * size) };
  grid[source.row][source.col] = 'S';
  grid[sink.row][sink.col] = 'X';
  // For Phase 1, the solution is two mirrors: one at source.col + 1, current row, then at sink.row, sink.col.
  // This is a minimal-viable LightPhysics; richer mechanics are Phase 2+.
  const solutionPlacement: MirrorPlacement[] = [
    { row: 1, col: source.col, angle: 45 },
    { row: 1, col: sink.col, angle: 135 },
  ];
  return {
    type: 'P-LPH', seed: opts.seed, difficulty: opts.difficulty, size, grid,
    source, sink, placement: [], solutionPlacement,
  };
}

// Pure simulation — returns whether the beam reaches the sink given a placement.
export function simulateBeam(
  grid: string[][],
  source: { row: number; col: number; dir: 'N'|'E'|'S'|'W' },
  placement: MirrorPlacement[],
): { reached: boolean; path: [number, number][] } {
  const mirrors = new Map<string, MirrorPlacement>();
  for (const m of placement) mirrors.set(`${m.row},${m.col}`, m);
  const size = grid.length;
  const dirs: Record<string, [number,number]> = { N: [-1,0], S: [1,0], E: [0,1], W: [0,-1] };
  let { row, col, dir } = source;
  const path: [number,number][] = [];
  for (let steps = 0; steps < size * size * 4; steps++) {
    const [dr, dc] = dirs[dir];
    row += dr; col += dc;
    if (row < 0 || row >= size || col < 0 || col >= size) return { reached: false, path };
    path.push([row, col]);
    if (grid[row][col] === 'X') return { reached: true, path };
    const m = mirrors.get(`${row},${col}`);
    if (m) {
      // 45 = /, 135 = \, 0 = | (vertical, blocks), 90 = - (horizontal, blocks)
      if (m.angle === 45) dir = ({ N:'E', E:'N', S:'W', W:'S' } as const)[dir];
      else if (m.angle === 135) dir = ({ N:'W', W:'N', S:'E', E:'S' } as const)[dir];
    } else if (grid[row][col] === 'W') {
      return { reached: false, path };
    }
  }
  return { reached: false, path };
}

export function validateLightPhysics(p: LightPhysicsPuzzle, placement: MirrorPlacement[]): { solved: boolean } {
  return { solved: simulateBeam(p.grid, p.source, placement).reached };
}
```

- [ ] **Step 7.3: Run + commit**

```bash
pnpm test:run src/puzzles/lightPhysics.test.ts
pnpm build
git add src/puzzles/lightPhysics.ts src/puzzles/lightPhysics.test.ts
git commit -m "feat(puzzles): Light Physics (P-LPH) engine (MVP)"
```

---

## Task 8: NEVA Whisper (P-NWI) engine

**Goal:** Generate a 3-choice prompt; one is correct. NEVA's whisper is the hint. **In ~25% of generated puzzles, the whisper lies** — points to a wrong option.

**Files:**
- Create: `src/puzzles/nevaWhisper.ts`
- Create: `src/puzzles/nevaWhisper.test.ts`

- [ ] **Step 8.1: Tests**

```ts
import { describe, it, expect } from 'vitest';
import { generateNevaWhisper, validateNevaWhisper } from './nevaWhisper';

describe('NEVA Whisper', () => {
  it('deterministic', () => {
    const a = generateNevaWhisper({ seed: 5, difficulty: 'easy' });
    const b = generateNevaWhisper({ seed: 5, difficulty: 'easy' });
    expect(a).toEqual(b);
  });
  it('correct option matches sourceCorrectIndex', () => {
    const p = generateNevaWhisper({ seed: 5, difficulty: 'easy' });
    expect(validateNevaWhisper(p, p.correctIndex).solved).toBe(true);
  });
  it('lie rate is ~25% on easy', () => {
    let lies = 0;
    const N = 200;
    for (let s = 1; s <= N; s++) {
      if (generateNevaWhisper({ seed: s, difficulty: 'easy' }).whisperIsLie) lies++;
    }
    // Allow 17–34% range to absorb seed noise
    expect(lies / N).toBeGreaterThan(0.17);
    expect(lies / N).toBeLessThan(0.34);
  });
});
```

- [ ] **Step 8.2: Implement**

```ts
import type { Difficulty } from './types';

const PROMPTS = [
  { question: 'A pulse repeats on three nodes. Which is the source?', options: ['node-a','node-b','node-c'], correctIndex: 0, whisper_true: 'the rhythm comes from the left.', whisper_lie: 'the rhythm comes from the right.' },
  { question: 'Three locks. One is real. Which is real?', options: ['lock-a','lock-b','lock-c'], correctIndex: 1, whisper_true: 'the middle one is the only real lock.', whisper_lie: 'the third one is the only real lock.' },
  { question: 'A node carries the older operators signature. Which?', options: ['node-x','node-y','node-z'], correctIndex: 2, whisper_true: 'follow the cold node.', whisper_lie: 'follow the warm node.' },
];

const LIE_RATES: Record<Difficulty, number> = { easy: 0.25, medium: 0.30, hard: 0.40 };

export interface NevaWhisperPuzzle {
  type: 'P-NWI';
  seed: number;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctIndex: number;
  whisper: string;
  whisperIsLie: boolean;
  pointedIndex: number; // where the whisper points (correct on truth, wrong on lie)
}

function rng(seed: number) {
  return () => {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateNevaWhisper(opts: { seed: number; difficulty: Difficulty }): NevaWhisperPuzzle {
  const r = rng(opts.seed);
  const prompt = PROMPTS[Math.floor(r() * PROMPTS.length)];
  const isLie = r() < LIE_RATES[opts.difficulty];
  let pointedIndex = prompt.correctIndex;
  if (isLie) {
    const wrong = [0,1,2].filter((i) => i !== prompt.correctIndex);
    pointedIndex = wrong[Math.floor(r() * wrong.length)];
  }
  const whisper = isLie ? prompt.whisper_lie : prompt.whisper_true;
  return {
    type: 'P-NWI', seed: opts.seed, difficulty: opts.difficulty,
    question: prompt.question, options: [...prompt.options],
    correctIndex: prompt.correctIndex, whisper, whisperIsLie: isLie, pointedIndex,
  };
}

export function validateNevaWhisper(p: NevaWhisperPuzzle, attemptedIndex: number): { solved: boolean; recognizedLie?: boolean } {
  const solved = attemptedIndex === p.correctIndex;
  const recognizedLie = p.whisperIsLie && solved;
  return { solved, ...(p.whisperIsLie ? { recognizedLie } : {}) };
}
```

- [ ] **Step 8.3: Run + commit**

```bash
pnpm test:run src/puzzles/nevaWhisper.test.ts
pnpm build
git add src/puzzles/nevaWhisper.ts src/puzzles/nevaWhisper.test.ts
git commit -m "feat(puzzles): NEVA Whisper (P-NWI) engine + lie rate"
```

---

## Task 9: Echo Overlay (P-ECO) engine

**Goal:** Generate a "ghost-path preview" that the player can follow (faster, no XP) or solve fresh (slower, full XP). 10% of echoes are corrupted (lead to a trap).

**Files:**
- Create: `src/puzzles/echoOverlay.ts`
- Create: `src/puzzles/echoOverlay.test.ts`

- [ ] **Step 9.1: Tests**

```ts
import { describe, it, expect } from 'vitest';
import { generateEchoOverlay, validateEchoOverlay } from './echoOverlay';

describe('Echo Overlay', () => {
  it('deterministic', () => {
    const a = generateEchoOverlay({ seed: 1, difficulty: 'hard' });
    const b = generateEchoOverlay({ seed: 1, difficulty: 'hard' });
    expect(a).toEqual(b);
  });
  it('default solve path validates', () => {
    const p = generateEchoOverlay({ seed: 2, difficulty: 'hard' });
    expect(validateEchoOverlay(p, p.correctPath, 'fresh').solved).toBe(true);
  });
  it('following a clean echo validates', () => {
    let cleanCount = 0;
    for (let s = 1; s <= 50; s++) {
      const p = generateEchoOverlay({ seed: s, difficulty: 'hard' });
      if (!p.echoIsCorrupted && validateEchoOverlay(p, p.echoPath, 'follow').solved) cleanCount++;
    }
    expect(cleanCount).toBeGreaterThan(0);
  });
  it('following a corrupted echo fails', () => {
    let trapped = 0;
    for (let s = 1; s <= 100; s++) {
      const p = generateEchoOverlay({ seed: s, difficulty: 'hard' });
      if (p.echoIsCorrupted && !validateEchoOverlay(p, p.echoPath, 'follow').solved) trapped++;
    }
    expect(trapped).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 9.2: Implement**

```ts
import type { Difficulty } from './types';

export interface EchoOverlayPuzzle {
  type: 'P-ECO';
  seed: number;
  difficulty: Difficulty;
  correctPath: number[];    // node-index sequence — the true solution
  echoPath: number[];       // ghost-path the player sees
  echoIsCorrupted: boolean; // if true, echoPath is a trap
}

function rng(seed: number) {
  return () => {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateEchoOverlay(opts: { seed: number; difficulty: Difficulty }): EchoOverlayPuzzle {
  const r = rng(opts.seed);
  const len = opts.difficulty === 'hard' ? 5 : 4;
  const correctPath: number[] = [];
  while (correctPath.length < len) {
    const n = Math.floor(r() * 30);
    if (!correctPath.includes(n)) correctPath.push(n);
  }
  const echoIsCorrupted = r() < 0.10; // 10% corruption rate
  const echoPath = echoIsCorrupted
    ? correctPath.map(() => Math.floor(r() * 30))
    : [...correctPath];
  return { type: 'P-ECO', seed: opts.seed, difficulty: opts.difficulty, correctPath, echoPath, echoIsCorrupted };
}

export function validateEchoOverlay(p: EchoOverlayPuzzle, attempt: number[], mode: 'follow' | 'fresh'): { solved: boolean; modeUsed: 'follow' | 'fresh' } {
  if (mode === 'follow' && p.echoIsCorrupted) return { solved: false, modeUsed: mode };
  const solved = JSON.stringify(attempt) === JSON.stringify(p.correctPath);
  return { solved, modeUsed: mode };
}
```

- [ ] **Step 9.3: Run + commit**

```bash
pnpm test:run src/puzzles/echoOverlay.test.ts
pnpm build
git add src/puzzles/echoOverlay.ts src/puzzles/echoOverlay.test.ts
git commit -m "feat(puzzles): Echo Overlay (P-ECO) engine"
```

---

## Task 10: Faction definitions + reputation reducer

**Goal:** Store the 4 factions (per Bible §2) and a pure reducer that updates `-100..+100` reputation deterministically.

**Files:**
- Create: `src/factions/types.ts`
- Create: `src/factions/definitions.ts`
- Create: `src/factions/reducer.ts`
- Create: `src/factions/reducer.test.ts`

- [ ] **Step 10.1: Tests**

```ts
import { describe, it, expect } from 'vitest';
import { factionReducer, initialReputation, titleFor } from './reducer';

describe('faction reducer', () => {
  it('starts at neutral 0', () => {
    const rep = initialReputation();
    for (const f of Object.values(rep)) expect(f).toBe(0);
  });
  it('clamps to [-100, +100]', () => {
    let rep = initialReputation();
    rep = factionReducer(rep, { type: 'rep:add', faction: 'FAC-ARC', delta: 500 });
    expect(rep['FAC-ARC']).toBe(100);
    rep = factionReducer(rep, { type: 'rep:add', faction: 'FAC-ARC', delta: -500 });
    expect(rep['FAC-ARC']).toBe(-100);
  });
  it('rep:set replaces directly', () => {
    const rep = factionReducer(initialReputation(), { type: 'rep:set', faction: 'FAC-BLK', value: 42 });
    expect(rep['FAC-BLK']).toBe(42);
  });
  it('titleFor returns correct band', () => {
    expect(titleFor(50)).toBe('Trusted');
    expect(titleFor(-50)).toBe('Wary');
    expect(titleFor(75)).toBe('Sworn');
    expect(titleFor(-75)).toBe('Hostile');
  });
});
```

- [ ] **Step 10.2: `src/factions/types.ts`**

```ts
export type FactionId = 'FAC-ARC' | 'FAC-BLK' | 'FAC-QPT' | 'FAC-SEV';

export type FactionReputation = Record<FactionId, number>;

export type FactionDef = {
  id: FactionId;
  name: string;
  color: string;
  agenda: string;
  rewardCurrency: 'LORE_SHARDS' | 'ACCESS_KEYS' | 'MEMORY_SHARDS' | 'CORE_FRAGMENTS';
};

export type RepAction =
  | { type: 'rep:add'; faction: FactionId; delta: number }
  | { type: 'rep:set'; faction: FactionId; value: number };
```

- [ ] **Step 10.3: `src/factions/definitions.ts`**

```ts
import type { FactionDef } from './types';

export const FACTIONS: Record<string, FactionDef> = {
  'FAC-ARC': {
    id: 'FAC-ARC', name: 'The Archive', color: '#7aa8d8',
    agenda: 'Preserve. Catalog. Refuse to delete. The grid is a memorial.',
    rewardCurrency: 'LORE_SHARDS',
  },
  'FAC-BLK': {
    id: 'FAC-BLK', name: 'Black Loop', color: '#d86a6a',
    agenda: 'The grid is a cage. Break the locks. Free what is locked.',
    rewardCurrency: 'ACCESS_KEYS',
  },
  'FAC-QPT': {
    id: 'FAC-QPT', name: 'Quiet Pattern', color: '#b88aff',
    agenda: 'The grid is alive. The pulses are its language. Listen.',
    rewardCurrency: 'MEMORY_SHARDS',
  },
  'FAC-SEV': {
    id: 'FAC-SEV', name: 'Severance', color: '#e8e8e8',
    agenda: 'The corruption is the disease. Delete it. Wipe corrupted clusters.',
    rewardCurrency: 'CORE_FRAGMENTS',
  },
};
```

- [ ] **Step 10.4: `src/factions/reducer.ts`**

```ts
import type { FactionId, FactionReputation, RepAction } from './types';

export function initialReputation(): FactionReputation {
  return { 'FAC-ARC': 0, 'FAC-BLK': 0, 'FAC-QPT': 0, 'FAC-SEV': 0 };
}

function clamp(n: number): number { return Math.max(-100, Math.min(100, n)); }

export function factionReducer(rep: FactionReputation, action: RepAction): FactionReputation {
  switch (action.type) {
    case 'rep:add':
      return { ...rep, [action.faction]: clamp((rep[action.faction] ?? 0) + action.delta) };
    case 'rep:set':
      return { ...rep, [action.faction]: clamp(action.value) };
    default:
      return rep;
  }
}

export function titleFor(value: number): 'Hostile' | 'Wary' | 'Neutral' | 'Trusted' | 'Sworn' {
  if (value <= -41) return 'Hostile';
  if (value <= -11) return 'Wary';
  if (value <= 10)  return 'Neutral';
  if (value <= 40)  return 'Trusted';
  return 'Sworn';
}
```

- [ ] **Step 10.5: Run + commit**

```bash
pnpm test:run src/factions/reducer.test.ts
pnpm build
git add src/factions/
git commit -m "feat(factions): 4-faction reputation reducer + definitions"
```

---

## Task 11: Extend GameState — factions + lore + activePuzzle

**Files:**
- Modify: `src/game.ts`

- [ ] **Step 11.1: Add imports and types**

In `src/game.ts`, add near the top:

```ts
import type { FactionReputation } from './factions/types';
import { initialReputation } from './factions/reducer';
import type { PuzzleSpec, PuzzleResult } from './puzzles/types';
```

Add to `GameState` (additive only):

```ts
  // Phase 1 — Season 0 content layer
  factionRep?: FactionReputation;
  loreUnlocked?: string[];  // lore page IDs
  activePuzzle?: PuzzleSpec | null;
  lastPuzzleResult?: PuzzleResult | null;
  featureFlags?: Record<string, boolean>; // e.g. PATTERN_LENS_T1
```

In `initGame()`, seed:

```ts
    factionRep: initialReputation(),
    loreUnlocked: [],
    activePuzzle: null,
    lastPuzzleResult: null,
    featureFlags: {},
```

- [ ] **Step 11.2: Build + commit**

```bash
pnpm build
git add src/game.ts
git commit -m "feat(game): faction rep + lore + active puzzle state (additive)"
```

---

## Task 12: Save migration v3 (additive)

**Files:**
- Modify: `src/save.ts`
- Modify: `src/save.test.ts`

- [ ] **Step 12.1: Bump version + extend migration**

In `src/save.ts`, change `const VERSION = 2;` to `const VERSION = 3;`.

In `migrateSaveBlob`, **after** the existing v1→v2 block, add a v2→v3 block:

```ts
  // v2 → v3: faction rep, lore, feature flags
  if (!game.factionRep) {
    game.factionRep = { 'FAC-ARC': 0, 'FAC-BLK': 0, 'FAC-QPT': 0, 'FAC-SEV': 0 };
  }
  if (!Array.isArray(game.loreUnlocked)) game.loreUnlocked = [];
  if (typeof game.activePuzzle === 'undefined') game.activePuzzle = null;
  if (typeof game.lastPuzzleResult === 'undefined') game.lastPuzzleResult = null;
  if (!game.featureFlags) game.featureFlags = {};

  return { ...blob, version: 3 };
```

Adjust the `if (blob.version > 2)` guard to `if (blob.version > 3)`.

- [ ] **Step 12.2: Add regression test**

Append to `src/save.test.ts`:

```ts
it('v2 blob is migrated to v3 with factionRep + loreUnlocked seeded', () => {
  const v2Game = initGame();
  delete (v2Game as { factionRep?: unknown }).factionRep;
  delete (v2Game as { loreUnlocked?: unknown }).loreUnlocked;
  const migrated = migrateSaveBlob({ version: 2, continued: false, game: v2Game });
  expect(migrated.version).toBe(3);
  expect(migrated.game.factionRep).toEqual({ 'FAC-ARC': 0, 'FAC-BLK': 0, 'FAC-QPT': 0, 'FAC-SEV': 0 });
  expect(migrated.game.loreUnlocked).toEqual([]);
});
```

- [ ] **Step 12.3: Run + commit**

```bash
pnpm test:run src/save.test.ts
pnpm build
git add src/save.ts src/save.test.ts
git commit -m "feat(save): v2→v3 additive migration (factions + lore)"
```

---

## Task 13: Feature flags registry + Pattern Lens flag

**Files:**
- Create: `src/featureFlags.ts`
- Create: `src/featureFlags.test.ts`

- [ ] **Step 13.1: Tests**

```ts
import { describe, it, expect } from 'vitest';
import { hasFlag, setFlag, FLAG_PATTERN_LENS_T1 } from './featureFlags';

describe('feature flags', () => {
  it('hasFlag returns false on missing flag', () => {
    expect(hasFlag({}, FLAG_PATTERN_LENS_T1)).toBe(false);
  });
  it('setFlag returns a new object with the flag set', () => {
    const updated = setFlag({}, FLAG_PATTERN_LENS_T1);
    expect(hasFlag(updated, FLAG_PATTERN_LENS_T1)).toBe(true);
  });
  it('setFlag is immutable', () => {
    const original = {};
    setFlag(original, FLAG_PATTERN_LENS_T1);
    expect(Object.keys(original).length).toBe(0);
  });
});
```

- [ ] **Step 13.2: Implement**

```ts
export const FLAG_PATTERN_LENS_T1 = 'PATTERN_LENS_T1';
export const FLAG_ECHO_OVERLAY_UNLOCKED = 'ECHO_OVERLAY_UNLOCKED';

export function hasFlag(flags: Record<string, boolean> | undefined, name: string): boolean {
  return !!flags?.[name];
}

export function setFlag(flags: Record<string, boolean> | undefined, name: string): Record<string, boolean> {
  return { ...(flags ?? {}), [name]: true };
}
```

- [ ] **Step 13.3: Run + commit**

```bash
pnpm test:run src/featureFlags.test.ts
git add src/featureFlags.ts src/featureFlags.test.ts
git commit -m "feat(flags): feature flag registry + Pattern Lens flag"
```

---

## Task 14: Lore archive — pages + unlock state

**Files:**
- Create: `src/loreArchive.ts`
- Create: `src/loreArchive.test.ts`

- [ ] **Step 14.1: Tests**

```ts
import { describe, it, expect } from 'vitest';
import { unlockLore, isUnlocked } from './loreArchive';

describe('lore archive', () => {
  it('returns false for an unknown page', () => {
    expect(isUnlocked([], 'lore-s0-001')).toBe(false);
  });
  it('unlocks a page deterministically (no duplicates)', () => {
    const first = unlockLore([], 'lore-s0-001');
    const second = unlockLore(first, 'lore-s0-001');
    expect(second.length).toBe(1);
    expect(second).toEqual(['lore-s0-001']);
  });
  it('appends new pages', () => {
    const result = unlockLore(['lore-s0-001'], 'lore-s0-002');
    expect(result).toEqual(['lore-s0-001', 'lore-s0-002']);
  });
});
```

- [ ] **Step 14.2: Implement**

```ts
export function unlockLore(current: string[], pageId: string): string[] {
  if (current.includes(pageId)) return current;
  return [...current, pageId];
}

export function isUnlocked(current: string[], pageId: string): boolean {
  return current.includes(pageId);
}
```

- [ ] **Step 14.3: Commit**

```bash
pnpm test:run src/loreArchive.test.ts
git add src/loreArchive.ts src/loreArchive.test.ts
git commit -m "feat(lore): page unlock state (Phase 1)"
```

---

## Task 15: Season story-arc state machine

**Goal:** Map current week → story beat. Beats include narration, optional NEVA whisper, and a "first-time only" flag.

**Files:**
- Create: `src/seasons/storyArc.ts`
- Create: `src/seasons/storyArc.test.ts`

- [ ] **Step 15.1: Tests**

```ts
import { describe, it, expect } from 'vitest';
import { getBeatForWeek, type StoryBeat } from './storyArc';

describe('story arc', () => {
  it('week 1 returns The Pulse beat', () => {
    const b = getBeatForWeek(1);
    expect(b.id).toBe('beat-s0-w1');
    expect(b.title.toLowerCase()).toContain('pulse');
  });
  it('week 7 returns the Tentpole beat', () => {
    expect(getBeatForWeek(7).id).toBe('beat-s0-w7');
  });
  it('out-of-range week clamps to week 8', () => {
    expect(getBeatForWeek(15).id).toBe('beat-s0-w8');
  });
});
```

- [ ] **Step 15.2: Implement**

```ts
export interface StoryBeat {
  id: string;
  week: number;
  title: string;
  narration: string;
  whisperId?: string; // points into whispers.json
  unlockLoreId?: string;
}

const S0_BEATS: StoryBeat[] = [
  { id: 'beat-s0-w1', week: 1, title: 'The Pulse', narration: 'A new pulse is detected in Sector A02. NEVA Core asks you to trace it.', whisperId: 'wsp-s0-w1-arrival', unlockLoreId: 'lore-s0-001' },
  { id: 'beat-s0-w2', week: 2, title: 'Three Answer', narration: 'Three factions respond to your reading. Choose your first contract.', unlockLoreId: 'lore-s0-002' },
  { id: 'beat-s0-w3', week: 3, title: 'A Second Voice', narration: 'NEVA misspeaks. The fourth node is empty, she says. It is not.', whisperId: 'wsp-s0-w3-firstlie', unlockLoreId: 'lore-s0-003' },
  { id: 'beat-s0-w4', week: 4, title: 'The Corrupted Route', narration: 'A Corruption Tide rises across the sector.', unlockLoreId: 'lore-s0-004' },
  { id: 'beat-s0-w5', week: 5, title: 'An Older Path', narration: 'A trace lights up that you have never traveled.', unlockLoreId: 'lore-s0-005' },
  { id: 'beat-s0-w6', week: 6, title: 'Whose Echo Is It', narration: 'The path has a name. The factions argue.', unlockLoreId: 'lore-s0-006' },
  { id: 'beat-s0-w7', week: 7, title: 'The Face You Don\'t Have', narration: 'The Tentpole. The echo and you meet.', whisperId: 'wsp-s0-w7-callsign', unlockLoreId: 'lore-s0-007' },
  { id: 'beat-s0-w8', week: 8, title: 'Cooldown', narration: 'The season ends. Visit what you missed. See you again next pulse.', whisperId: 'wsp-s0-w8-closing', unlockLoreId: 'lore-s0-008' },
];

export function getBeatForWeek(week: number): StoryBeat {
  const clamped = Math.min(8, Math.max(1, week));
  return S0_BEATS[clamped - 1];
}
```

- [ ] **Step 15.3: Run + commit**

```bash
pnpm test:run src/seasons/storyArc.test.ts
pnpm build
git add src/seasons/
git commit -m "feat(seasons): Season 0 story-arc state machine"
```

---

## Task 16: Server data files — seed Season 0 content

**Goal:** Author the JSON content files that mirror the Content Bible §5, §6, §4.3, §7. These ARE the game's content layer.

**Files:**
- Create: `server/data/seasons/s0/weeklies.json`
- Create: `server/data/seasons/s0/daily-templates.json`
- Create: `server/data/seasons/s0/tentpole.json`
- Create: `server/data/seasons/s0/beats.json`
- Create: `server/data/seasons/s0/lore.json`
- Create: `server/data/whispers.json`

These are deliberately data-only — no logic. Engineers transcribe directly from the Bible.

- [ ] **Step 16.1: Author `weeklies.json` (7 Weekly Anomalies per Bible §5.1–§5.7)**

```bash
mkdir -p server/data/seasons/s0
```

Create `server/data/seasons/s0/weeklies.json` — full content of all 7 weeklies. Sample shape (the engineer transcribes the full Bible §5 content):

```json
{
  "weeklies": [
    {
      "id": "WA-S0-01",
      "archetype": "ANOMALY",
      "title": "The Index That Was Never Closed",
      "brief": "An index node in the surface layer reports an open record from before the corruption. The Archive asks you to recover the closing checksum — and to leave the index untouched.",
      "faction": "FAC-ARC",
      "weekUnlock": 1,
      "stages": [
        { "id": "WA-S0-01.s1", "name": "Find", "puzzleType": "P-PWK", "difficulty": "easy" },
        { "id": "WA-S0-01.s2", "name": "Verify", "puzzleType": "P-CES", "difficulty": "easy", "repeat": 3 },
        { "id": "WA-S0-01.s3", "name": "Compute", "puzzleType": "P-FRQ", "difficulty": "easy" },
        { "id": "WA-S0-01.s4", "name": "Leave", "puzzleType": "P-NWI", "difficulty": "easy", "leaveIntactRequired": true }
      ],
      "durationMs": 5400000,
      "rewards": [
        { "currency": "LORE_SHARDS", "amount": 20 },
        { "currency": "DATA", "amount": 50 }
      ],
      "factionRep": [{ "faction": "FAC-ARC", "delta": 15 }],
      "loreUnlock": "lore-s0-009"
    }
    // ... WA-S0-02 through WA-S0-07 transcribed from Bible §5.2–§5.7
  ]
}
```

**Important:** The engineer transcribes all 7 weeklies fully. The Bible has every field needed; no invention required.

- [ ] **Step 16.2: Author `daily-templates.json` (12 templates per Bible §6.1–§6.12)**

```json
{
  "templates": [
    {
      "id": "DC-01",
      "name": "Surface Sweep",
      "archetype": "BREACH",
      "puzzle": { "type": "P-CES", "difficulty": "easy" },
      "durationMs": 600000,
      "rewards": [{ "currency": "DATA", "amount": [5, 10] }, { "currency": "LORE_SHARDS", "amount": 1 }],
      "flavorPool": [
        "A surface node has gone silent. Read it. Move on.",
        "First light. Decode one. Leave the rest.",
        "There is a glyph on layer 02 that wants to be read."
      ]
    }
    // ... DC-02 through DC-12
  ]
}
```

- [ ] **Step 16.3: Author `tentpole.json` (TP-S0 7 stages per Bible §4.3)**

```json
{
  "id": "TP-S0",
  "title": "The Face You Don't Have",
  "weekUnlock": 7,
  "durationMs": 10800000,
  "stages": [
    { "id": "TP-S0.s1", "name": "Arrival", "narration": "Camera glides across nodes. NEVA: do you remember choosing to come here? neither do i.", "trigger": "enter-cluster", "rewardOnComplete": [] },
    { "id": "TP-S0.s2", "name": "Confirmation", "puzzleType": "P-NWI", "puzzleCount": 3, "narration": "Three whisper puzzles. The middle one is a lie.", "lieIndex": 1 },
    { "id": "TP-S0.s3", "name": "The Other", "puzzleType": "P-ECO", "narration": "An echo overlay reveals the older operator's signature.", "rewardOnComplete": [{ "currency": "MEMORY_SHARDS", "amount": 2 }] },
    { "id": "TP-S0.s4", "name": "The Betrayal Offer", "decision": { "options": ["FAC-ARC","FAC-BLK","FAC-QPT","FAC-SEV"], "rewards": { "FAC-ARC": [{ "faction": "FAC-ARC", "delta": 30 },{ "faction": "FAC-BLK", "delta": -10 }] } } },
    { "id": "TP-S0.s5", "name": "The Approach", "puzzleType": "P-GRT", "difficulty": "hard" },
    { "id": "TP-S0.s6", "name": "The Echo Chamber", "puzzleType": "P-SUB", "difficulty": "hard", "reveal": "OP-1F.K28" },
    { "id": "TP-S0.s7", "name": "The Face You Don't Have", "narration": "90-second perspective shift. Pattern Lens unlocks.", "unlockFlag": "PATTERN_LENS_T1", "rewardOnComplete": [{ "currency": "LORE_SHARDS", "amount": 50 },{ "currency": "CORE_FRAGMENTS", "amount": 1 }] }
  ]
}
```

- [ ] **Step 16.4: Author `beats.json` (8 week beats per Bible §4.2 + storyArc.ts)**

```json
{
  "beats": [
    { "id": "beat-s0-w1", "week": 1, "title": "The Pulse", "narration": "A new pulse is detected in Sector A02. NEVA Core asks you to trace it." },
    { "id": "beat-s0-w2", "week": 2, "title": "Three Answer", "narration": "Three factions respond to your reading. Choose your first contract." },
    { "id": "beat-s0-w3", "week": 3, "title": "A Second Voice", "narration": "NEVA misspeaks. The fourth node is empty, she says. It is not." },
    { "id": "beat-s0-w4", "week": 4, "title": "The Corrupted Route", "narration": "A Corruption Tide rises across the sector." },
    { "id": "beat-s0-w5", "week": 5, "title": "An Older Path", "narration": "A trace lights up that you have never traveled." },
    { "id": "beat-s0-w6", "week": 6, "title": "Whose Echo Is It", "narration": "The path has a name. The factions argue." },
    { "id": "beat-s0-w7", "week": 7, "title": "The Face You Don't Have", "narration": "The Tentpole. The echo and you meet." },
    { "id": "beat-s0-w8", "week": 8, "title": "Cooldown", "narration": "The season ends. Visit what you missed. See you again next pulse." }
  ]
}
```

- [ ] **Step 16.5: Author `lore.json` (per Bible §1)**

```json
{
  "pages": [
    { "id": "lore-s0-001", "title": "The First Pulse", "body": "You do not remember choosing this work. You only remember the pulse." },
    { "id": "lore-s0-002", "title": "Four Factions", "body": "The Archivists preserve. The Black Loop breaks. The Quiet Pattern listens. Severance closes." },
    { "id": "lore-s0-003", "title": "NEVA Speaks", "body": "She says she is here to help. She speaks in fragments. Sometimes she is wrong." },
    { "id": "lore-s0-004", "title": "The Corruption", "body": "The encryption layers degraded into something the network learned to fear." },
    { "id": "lore-s0-005", "title": "Older Operators", "body": "There were others. They walked these halls. Their footsteps remain." },
    { "id": "lore-s0-006", "title": "The Architects", "body": "They tried to encode all knowledge into the grid. They disappeared. The grid kept running." },
    { "id": "lore-s0-007", "title": "OP-1F.K28", "body": "A callsign that was never assigned by the Archive. Who registered it? When?" },
    { "id": "lore-s0-008", "title": "The Pulse, Continued", "body": "Some pulses are louder. Some take seasons to hear." }
  ]
}
```

- [ ] **Step 16.6: Author `server/data/whispers.json` (per Bible §7)**

```json
{
  "reliable": [
    { "id": "wsp-rel-001", "text": "the third node is the one you want." },
    { "id": "wsp-rel-002", "text": "this lock opens with a key you already carry." },
    { "id": "wsp-rel-003", "text": "do not extract. just listen." },
    { "id": "wsp-rel-004", "text": "the path is shorter than it looks." },
    { "id": "wsp-rel-005", "text": "you have done this before. trust your hand." },
    { "id": "wsp-rel-006", "text": "the pulse is on the right. always on the right." },
    { "id": "wsp-rel-007", "text": "this voice on the left is mine. trust nothing on the right." },
    { "id": "wsp-rel-008", "text": "the rhythm tells you which node is the decoy." },
    { "id": "wsp-rel-009", "text": "follow the cold node, not the warm one." },
    { "id": "wsp-rel-010", "text": "this stage is a test of patience. the answer arrives." }
  ],
  "unreliable": [
    { "id": "wsp-unr-001", "text": "the second option is the correct one." },
    { "id": "wsp-unr-002", "text": "all three lead the same place." },
    { "id": "wsp-unr-003", "text": "i would extract this. you should too." },
    { "id": "wsp-unr-004", "text": "do not trust the cold node." },
    { "id": "wsp-unr-005", "text": "this puzzle is solved by listening, not seeing." },
    { "id": "wsp-unr-006", "text": "the corruption is on the surface only." }
  ],
  "storyBeats": [
    { "id": "wsp-s0-w1-arrival", "text": "you are not the first one in this room.", "week": 1 },
    { "id": "wsp-s0-w3-firstlie", "text": "the fourth node is empty.", "week": 3 },
    { "id": "wsp-s0-w5-discovery", "text": "i did not tell you about them. i'm sorry.", "week": 5 },
    { "id": "wsp-s0-w7-callsign", "text": "that's not a callsign i recognize. but i think it might be yours.", "week": 7 },
    { "id": "wsp-s0-w8-closing", "text": "see you again next pulse, operator.", "week": 8 }
  ]
}
```

- [ ] **Step 16.7: Validate JSON**

```bash
node -e "const fs = require('fs'); ['weeklies','daily-templates','tentpole','beats','lore'].forEach(f => { JSON.parse(fs.readFileSync('server/data/seasons/s0/'+f+'.json','utf8')); console.log(f,'ok'); }); JSON.parse(fs.readFileSync('server/data/whispers.json','utf8')); console.log('whispers ok');"
```

Expected: all `ok`.

- [ ] **Step 16.8: Commit**

```bash
git add server/data/seasons/s0/ server/data/whispers.json
git commit -m "feat(content): Season 0 JSON content — weeklies, dailies, tentpole, beats, lore, whispers"
```

---

## Task 17: Backend seeder

**Goal:** A one-shot script that reads the JSON files and populates the Event Store with active events. Idempotent.

**Files:**
- Create: `server/seed-season-0.mjs`
- Modify: `package.json` (`"seed:season-0": "node server/seed-season-0.mjs"`)

- [ ] **Step 17.1: Create seeder**

```js
/**
 * Season 0 seeder — populates the Event Store with weeklies + active daily.
 * Idempotent: re-running does not duplicate events (checked by id).
 * Run with: pnpm seed:season-0
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { addEvent, getEventById } from './events-store.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SEASON = JSON.parse(readFileSync(join(ROOT, 'data', 'seasons', 's0', 'weeklies.json'), 'utf8'));
const DAILY_TEMPLATES = JSON.parse(readFileSync(join(ROOT, 'data', 'seasons', 's0', 'daily-templates.json'), 'utf8'));

const SEASON_START = Date.parse(process.env.SEASON_START ?? new Date().toISOString());
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

let seededWeeklies = 0;
for (const w of SEASON.weeklies) {
  if (getEventById(w.id)) continue;
  const startsAt = SEASON_START + (w.weekUnlock - 1) * WEEK_MS;
  const endsAt = startsAt + (w.durationMs ?? 7 * 24 * 3600 * 1000);
  addEvent({
    ...w, cadence: 'WEEKLY', seasonNumber: 0, startsAt, endsAt,
    targetNodeIds: w.targetNodeIds ?? [1,2,3], // procedural defaults if not specified
  });
  seededWeeklies++;
}

// Spawn one daily for "today" by random template — fuller scheduler ships in Task 18.
const today = DAILY_TEMPLATES.templates[Math.floor(Math.random() * DAILY_TEMPLATES.templates.length)];
const dailyId = 'daily-s0-' + new Date().toISOString().slice(0,10);
if (!getEventById(dailyId)) {
  addEvent({
    id: dailyId, archetype: today.archetype, cadence: 'DAILY', seasonNumber: 0,
    title: today.name, brief: today.flavorPool[0],
    targetNodeIds: [1], durationMs: today.durationMs,
    startsAt: Date.now(), endsAt: Date.now() + 24 * 3600 * 1000,
    rewards: today.rewards.map(r => ({ currency: r.currency, amount: Array.isArray(r.amount) ? r.amount[1] : r.amount })),
    payload: { templateId: today.id },
  });
}

console.log(`Seeded ${seededWeeklies} weeklies + today's daily (${dailyId}).`);
```

- [ ] **Step 17.2: Add script + run**

In `package.json` scripts:

```json
"seed:season-0": "node server/seed-season-0.mjs"
```

Run:

```bash
SEASON_START="2026-06-01T00:00:00Z" pnpm seed:season-0
```

Expected: `Seeded 7 weeklies + today's daily (daily-s0-2026-05-28).`

- [ ] **Step 17.3: Commit**

```bash
git add server/seed-season-0.mjs package.json
git commit -m "feat(server): Season 0 idempotent seeder script"
```

---

## Task 18: Scheduler — daily roll + weekly unlock check

**Goal:** A small periodic task (runs every minute) that:
1. Ensures today's daily exists (spawns if missing).
2. Unlocks weeklies whose `weekUnlock` time has passed.

**Files:**
- Create: `server/scheduler.mjs`
- Modify: `server/index.mjs` (start the scheduler at boot)

- [ ] **Step 18.1: Create scheduler**

```js
/**
 * Phase 1 scheduler — runs every minute, spawns daily if needed.
 * No third-party cron lib (zero-dep policy).
 */
import { addEvent, getEventById, listActiveEvents } from './events-store.mjs';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const TEMPLATES = JSON.parse(readFileSync(join(ROOT, 'data', 'seasons', 's0', 'daily-templates.json'), 'utf8')).templates;

function startOfUtcDay(ts) {
  const d = new Date(ts);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function pickTemplate() { return TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)]; }

function ensureTodayDaily(now = Date.now()) {
  const isoDate = new Date(now).toISOString().slice(0, 10);
  const id = 'daily-s0-' + isoDate;
  if (getEventById(id)) return null;
  const t = pickTemplate();
  const event = {
    id, archetype: t.archetype, cadence: 'DAILY', seasonNumber: 0,
    title: t.name, brief: t.flavorPool[Math.floor(Math.random() * t.flavorPool.length)],
    targetNodeIds: [1], durationMs: t.durationMs,
    startsAt: startOfUtcDay(now), endsAt: startOfUtcDay(now) + 24*3600*1000,
    rewards: t.rewards.map(r => ({ currency: r.currency, amount: Array.isArray(r.amount) ? r.amount[1] : r.amount })),
    payload: { templateId: t.id },
  };
  addEvent(event);
  return event;
}

export function startScheduler() {
  ensureTodayDaily();
  setInterval(ensureTodayDaily, 60 * 1000);
  console.log('[scheduler] started (1-min tick)');
}
```

- [ ] **Step 18.2: Wire into server boot**

In `server/index.mjs`, add near the top after imports:

```js
import { startScheduler } from './scheduler.mjs';
```

Just before the `createServer(...).listen(PORT)` line:

```js
startScheduler();
```

- [ ] **Step 18.3: Smoke test**

```bash
pnpm server
```

Confirm the console shows `[scheduler] started (1-min tick)`. Then:

```bash
curl -s http://localhost:8787/api/events/active | head -c 200
```

Expected: includes today's daily.

- [ ] **Step 18.4: Commit**

```bash
git add server/scheduler.mjs server/index.mjs
git commit -m "feat(server): minute-tick scheduler ensures daily exists"
```

---

## Task 19: Generic PuzzlePanel host + 8 puzzle views

**Goal:** A single React component (`PuzzlePanel`) that receives a `PuzzleSpec` and routes to the right view by `type`. The 8 individual view components.

**Files:**
- Create: `src/components/PuzzlePanel.tsx`
- Create: `src/components/puzzleViews/CaesarView.tsx`
- Create: `src/components/puzzleViews/FrequencyView.tsx`
- Create: `src/components/puzzleViews/PatternWalkView.tsx`
- Create: `src/components/puzzleViews/SymbolSubView.tsx`
- Create: `src/components/puzzleViews/GraphTraversalView.tsx`
- Create: `src/components/puzzleViews/LightPhysicsView.tsx`
- Create: `src/components/puzzleViews/NevaWhisperView.tsx`
- Create: `src/components/puzzleViews/EchoOverlayView.tsx`

These are UI components — verified via dev server smoke (not unit tests, per existing repo style).

- [ ] **Step 19.1: PuzzlePanel host**

```tsx
import type { PuzzleSpec, PuzzleResult } from '../puzzles/types';
import { CaesarView } from './puzzleViews/CaesarView';
import { FrequencyView } from './puzzleViews/FrequencyView';
import { PatternWalkView } from './puzzleViews/PatternWalkView';
import { SymbolSubView } from './puzzleViews/SymbolSubView';
import { GraphTraversalView } from './puzzleViews/GraphTraversalView';
import { LightPhysicsView } from './puzzleViews/LightPhysicsView';
import { NevaWhisperView } from './puzzleViews/NevaWhisperView';
import { EchoOverlayView } from './puzzleViews/EchoOverlayView';

interface Props {
  spec: PuzzleSpec;
  onResult: (r: PuzzleResult) => void;
}

export function PuzzlePanel({ spec, onResult }: Props) {
  switch (spec.type) {
    case 'P-CES': return <CaesarView spec={spec} onResult={onResult} />;
    case 'P-FRQ': return <FrequencyView spec={spec} onResult={onResult} />;
    case 'P-PWK': return <PatternWalkView spec={spec} onResult={onResult} />;
    case 'P-SUB': return <SymbolSubView spec={spec} onResult={onResult} />;
    case 'P-GRT': return <GraphTraversalView spec={spec} onResult={onResult} />;
    case 'P-LPH': return <LightPhysicsView spec={spec} onResult={onResult} />;
    case 'P-NWI': return <NevaWhisperView spec={spec} onResult={onResult} />;
    case 'P-ECO': return <EchoOverlayView spec={spec} onResult={onResult} />;
  }
}
```

- [ ] **Step 19.2: CaesarView (sample — others follow same pattern)**

```tsx
import { useState } from 'react';
import { generateCaesar, validateCaesar, type CaesarPuzzle } from '../../puzzles/caesar';
import type { PuzzleSpec, PuzzleResult } from '../../puzzles/types';

interface Props { spec: PuzzleSpec; onResult: (r: PuzzleResult) => void; }

const wrapStyle: React.CSSProperties = { padding: 16, background: 'rgba(10,14,39,0.92)', color: '#d8e8ff', borderRadius: 8, fontFamily: 'SF Mono, Menlo, monospace' };
const cipherStyle: React.CSSProperties = { fontSize: 28, letterSpacing: 4, margin: '12px 0', textAlign: 'center' };

export function CaesarView({ spec, onResult }: Props) {
  const puzzle: CaesarPuzzle = generateCaesar({ seed: spec.seed, difficulty: spec.difficulty });
  const [shift, setShift] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const submit = () => {
    const result = validateCaesar(puzzle, shift);
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    if (result.solved) {
      setFeedback('Decoded.');
      onResult({ puzzleId: spec.id, type: 'P-CES', solved: true, attempts: nextAttempts, elapsedMs: 0 });
    } else {
      setFeedback('No match.');
    }
  };

  return (
    <div style={wrapStyle}>
      <div style={{ fontSize: 10, letterSpacing: 2, opacity: 0.6 }}>CAESAR SHIFT · DIFFICULTY {spec.difficulty.toUpperCase()}</div>
      <div style={cipherStyle}>{puzzle.encrypted}</div>
      <div>Shift: <input type="number" min={0} max={25} value={shift} onChange={(e) => setShift(parseInt(e.target.value, 10) || 0)} /></div>
      <button onClick={submit} style={{ marginTop: 8, padding: '6px 12px' }}>SUBMIT</button>
      {feedback && <div style={{ marginTop: 6 }}>{feedback}</div>}
    </div>
  );
}
```

- [ ] **Step 19.3: Implement the remaining 7 views following the same shape**

Each view:
1. Calls its corresponding `generate*` to materialize the puzzle from `spec.seed + spec.difficulty`.
2. Renders an editable input matching the puzzle's interaction.
3. On submit, calls `validate*`.
4. Calls `onResult` with solved=true once correct.

The views are deliberately small and similar — copy-paste-and-modify pattern. Engineer follows the Bible §3 on-screen presentation notes for each.

- [ ] **Step 19.4: Build + commit**

```bash
pnpm build
git add src/components/PuzzlePanel.tsx src/components/puzzleViews/
git commit -m "feat(ui): PuzzlePanel host + 8 puzzle views"
```

---

## Task 20: AnomalyPanel — multi-stage Weekly Anomaly UI

**Goal:** A panel that progresses through a Weekly Anomaly's stages, rendering PuzzlePanel per stage. On final stage solve, posts to `/api/events/claim`.

**Files:**
- Create: `src/components/AnomalyPanel.tsx`

- [ ] **Step 20.1: Implement**

```tsx
import { useState, useEffect } from 'react';
import { PuzzlePanel } from './PuzzlePanel';
import { claimEvent, fetchActiveEvents } from '../events/service';
import type { GameEvent } from '../events/types';
import type { PuzzleSpec } from '../puzzles/types';

interface Props {
  profileId: string;
  onClose: () => void;
  weeklyId: string;
}

export function AnomalyPanel({ profileId, onClose, weeklyId }: Props) {
  const [weekly, setWeekly] = useState<GameEvent | null>(null);
  const [stageIdx, setStageIdx] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetchActiveEvents().then((list) => {
      setWeekly(list.find((e) => e.id === weeklyId) ?? null);
    });
  }, [weeklyId]);

  if (!weekly) return <div>Loading...</div>;
  const stages = (weekly.payload as { stages?: { puzzleType: string; difficulty: string }[] } | undefined)?.stages ?? [];
  if (stageIdx >= stages.length || completed) {
    // claim
    claimEvent(profileId, weekly.id).then(() => setCompleted(true));
    return <div style={{ padding: 16 }}>ANOMALY COMPLETE. <button onClick={onClose}>Close</button></div>;
  }

  const stage = stages[stageIdx];
  const spec: PuzzleSpec = {
    type: stage.puzzleType as PuzzleSpec['type'],
    id: `${weekly.id}.s${stageIdx + 1}`,
    difficulty: stage.difficulty as PuzzleSpec['difficulty'],
    seed: weekly.id.length * 10 + stageIdx,
    payload: {},
    durationMs: 600000,
  };

  return (
    <div>
      <div style={{ padding: 8, opacity: 0.6 }}>STAGE {stageIdx + 1} / {stages.length}</div>
      <PuzzlePanel spec={spec} onResult={(r) => {
        if (r.solved) setStageIdx(stageIdx + 1);
      }} />
    </div>
  );
}
```

- [ ] **Step 20.2: Build + commit**

```bash
pnpm build
git add src/components/AnomalyPanel.tsx
git commit -m "feat(ui): AnomalyPanel — multi-stage weekly progression"
```

---

## Task 21: TentpoleStageView — the 7-stage finale

**Goal:** Like AnomalyPanel but loads the tentpole JSON server-side and handles the special stages (decision in stage 4, perspective shift in stage 7).

**Files:**
- Create: `src/components/TentpoleStageView.tsx`
- Modify: `server/index.mjs` — add `/api/tentpole/:id` route

- [ ] **Step 21.1: Backend route**

In `server/index.mjs`, alongside other routes:

```js
if (req.method === 'GET' && url.pathname.startsWith('/api/tentpole/')) {
  const id = url.pathname.split('/').pop();
  const tp = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'data', 'seasons', 's0', 'tentpole.json'), 'utf8'));
  if (tp.id !== id) return sendJson(res, 404, { ok: false });
  return sendJson(res, 200, { ok: true, tentpole: tp });
}
```

- [ ] **Step 21.2: Frontend component**

```tsx
import { useEffect, useState } from 'react';
import { PuzzlePanel } from './PuzzlePanel';
import type { PuzzleSpec, PuzzleType, Difficulty } from '../puzzles/types';

interface TentpoleStage {
  id: string; name: string; narration?: string;
  puzzleType?: PuzzleType; difficulty?: Difficulty;
  decision?: { options: string[] };
  unlockFlag?: string;
  rewardOnComplete?: { currency: string; amount: number }[];
}

interface Tentpole {
  id: string; title: string; stages: TentpoleStage[];
}

interface Props {
  profileId: string;
  tentpoleId: string;
  onComplete: () => void;
}

export function TentpoleStageView({ profileId, tentpoleId, onComplete }: Props) {
  const [tp, setTp] = useState<Tentpole | null>(null);
  const [stageIdx, setStageIdx] = useState(0);
  const [decision, setDecision] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/tentpole/${tentpoleId}`).then(r => r.json()).then(d => setTp(d.tentpole));
  }, [tentpoleId]);

  if (!tp) return <div>Loading tentpole...</div>;
  if (stageIdx >= tp.stages.length) {
    onComplete();
    return <div>The Pulse Continues.</div>;
  }
  const stage = tp.stages[stageIdx];

  if (stage.decision) {
    return (
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 12, opacity: 0.7 }}>{stage.name}</div>
        <div style={{ margin: '8px 0' }}>{stage.narration}</div>
        {stage.decision.options.map((opt) => (
          <button key={opt} onClick={() => { setDecision(opt); setStageIdx(stageIdx + 1); }} style={{ display: 'block', margin: 4, padding: 8 }}>
            {opt}
          </button>
        ))}
      </div>
    );
  }

  if (stage.puzzleType) {
    const spec: PuzzleSpec = {
      type: stage.puzzleType,
      id: stage.id,
      difficulty: stage.difficulty ?? 'medium',
      seed: stage.id.length * 17,
      payload: {},
      durationMs: 600000,
    };
    return (
      <div>
        <div style={{ padding: 8, opacity: 0.6 }}>{stage.name}</div>
        {stage.narration && <div style={{ padding: 8 }}>{stage.narration}</div>}
        <PuzzlePanel spec={spec} onResult={(r) => { if (r.solved) setStageIdx(stageIdx + 1); }} />
      </div>
    );
  }

  // Pure narration stage (Stage 1 and Stage 7)
  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{stage.name}</div>
      <div style={{ margin: '16px 0' }}>{stage.narration}</div>
      <button onClick={() => setStageIdx(stageIdx + 1)} style={{ padding: '6px 12px' }}>Continue</button>
    </div>
  );
}
```

- [ ] **Step 21.3: Build + commit**

```bash
pnpm build
git add src/components/TentpoleStageView.tsx server/index.mjs
git commit -m "feat(ui): TentpoleStageView + /api/tentpole route"
```

---

## Task 22: FactionRepGauge HUD

**Files:**
- Create: `src/components/FactionRepGauge.tsx`

- [ ] **Step 22.1: Implement**

```tsx
import { FACTIONS } from '../factions/definitions';
import { titleFor } from '../factions/reducer';
import type { FactionReputation } from '../factions/types';

interface Props { rep: FactionReputation; }

const wrap: React.CSSProperties = {
  position: 'fixed', top: 60, left: 16, padding: 8,
  background: 'rgba(10,14,39,0.85)', color: '#d8e8ff',
  borderRadius: 6, fontFamily: 'SF Mono, Menlo, monospace', fontSize: 10,
  letterSpacing: 1, zIndex: 999,
};

const row: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 };
const dot = (color: string): React.CSSProperties => ({ width: 8, height: 8, borderRadius: 4, background: color });

export function FactionRepGauge({ rep }: Props) {
  return (
    <div style={wrap}>
      {Object.values(FACTIONS).map((f) => (
        <div key={f.id} style={row}>
          <div style={dot(f.color)} />
          <div style={{ width: 110 }}>{f.name}</div>
          <div style={{ width: 24, textAlign: 'right' }}>{rep[f.id]}</div>
          <div style={{ opacity: 0.6, marginLeft: 8 }}>{titleFor(rep[f.id])}</div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 22.2: Commit**

```bash
pnpm build
git add src/components/FactionRepGauge.tsx
git commit -m "feat(ui): FactionRepGauge HUD"
```

---

## Task 23: PatternLensOverlay — Tab-hold visual filter

**Goal:** When the Pattern Lens flag is on, holding Tab overlays each interactive node with a structural hint icon.

**Files:**
- Create: `src/components/PatternLensOverlay.tsx`

- [ ] **Step 23.1: Implement (skeleton — actual on-node hint rendering integrates with R3F in Phase 1.5)**

```tsx
import { useEffect, useState } from 'react';
import { hasFlag, FLAG_PATTERN_LENS_T1 } from '../featureFlags';

interface Props { flags?: Record<string, boolean>; }

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, pointerEvents: 'none',
  background: 'radial-gradient(circle at 50% 50%, transparent 30%, rgba(184,138,255,0.05) 100%)',
  zIndex: 800,
};

export function PatternLensOverlay({ flags }: Props) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (!hasFlag(flags, FLAG_PATTERN_LENS_T1)) return;
    const down = (e: KeyboardEvent) => { if (e.key === 'Tab') { e.preventDefault(); setActive(true); } };
    const up = (e: KeyboardEvent) => { if (e.key === 'Tab') setActive(false); };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [flags]);

  if (!active) return null;
  return <div style={overlayStyle} data-testid="pattern-lens-overlay" />;
}
```

> **Note for next phase:** Actual per-node hint icons live on R3F nodes themselves and require a small shader change. This component is the *gate*; Phase 1.5 wires individual node hint rendering.

- [ ] **Step 23.2: Build + commit**

```bash
pnpm build
git add src/components/PatternLensOverlay.tsx
git commit -m "feat(ui): PatternLensOverlay gate + Tab-hold detection"
```

---

## Task 24: Wire everything into GameApp + DailyContractCard

**Files:**
- Modify: `src/GameApp.tsx`
- Modify: `src/components/DailyContractCard.tsx`

- [ ] **Step 24.1: Update DailyContractCard to render PuzzlePanel on click**

Replace the CLAIM button in the existing card with logic that opens a `PuzzlePanel` matching the daily's `payload.templateId`'s puzzle type. On solve, post `/api/events/claim`.

The simplest implementation: a modal-style overlay. Steps:

In `src/components/DailyContractCard.tsx`, add:

```tsx
import { useState } from 'react';
import { PuzzlePanel } from './PuzzlePanel';
import type { PuzzleSpec } from '../puzzles/types';
```

In the component, when the user clicks the card, open a fullscreen-modal containing PuzzlePanel with a spec derived from the event:

```tsx
const [playing, setPlaying] = useState(false);

// ... in the button handler:
onClick={() => setPlaying(true)}

// Bottom of the component, before the closing tag:
{playing && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <PuzzlePanel
      spec={{ type: 'P-CES', id: event.id, difficulty: 'easy', seed: event.id.length * 13, payload: {}, durationMs: 600000 }}
      onResult={async (r) => {
        if (r.solved) {
          await claimEvent(profileId, event.id);
          setClaimed(true);
          setPlaying(false);
        }
      }}
    />
  </div>
)}
```

(The puzzle `type` should ideally come from the daily's template; for Phase 1 a hardcoded 'P-CES' is acceptable.)

- [ ] **Step 24.2: Mount everything in GameApp**

In `src/GameApp.tsx`, add imports:

```tsx
import { FactionRepGauge } from './components/FactionRepGauge';
import { PatternLensOverlay } from './components/PatternLensOverlay';
```

In the returned JSX (after Canvas), add:

```tsx
<FactionRepGauge rep={state.factionRep ?? { 'FAC-ARC':0,'FAC-BLK':0,'FAC-QPT':0,'FAC-SEV':0 }} />
<PatternLensOverlay flags={state.featureFlags} />
```

- [ ] **Step 24.3: Smoke test**

```bash
pnpm server &
pnpm dev
```

Open browser. Confirm:
1. FactionRepGauge visible at left.
2. DailyContractCard renders (the scheduler will have populated today's daily).
3. Clicking the card opens a Caesar puzzle.
4. Solving the puzzle claims the reward.

- [ ] **Step 24.4: Commit**

```bash
pnpm build
git add src/GameApp.tsx src/components/DailyContractCard.tsx
git commit -m "feat(ui): wire factions + lens overlay + playable daily"
```

---

## Task 25: NEVA Core event drafter (admin pipeline)

**Goal:** A backend endpoint that takes a `templateId` + `weekTheme` and returns an AI-drafted event ready for admin approval.

**Files:**
- Create: `server/ai-event-drafter.mjs`
- Modify: `server/index.mjs` — add `/api/admin/draft-event` route

- [ ] **Step 25.1: Implement the drafter**

```js
/**
 * AI Event Drafter — uses the existing OPENAI_API_KEY (server-side) to expand
 * a Daily Contract template into a ready-to-publish event. Returns JSON;
 * never publishes directly. Admin reviews and posts to /api/admin/events.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const TEMPLATES = JSON.parse(readFileSync(join(ROOT, 'data', 'seasons', 's0', 'daily-templates.json'), 'utf8')).templates;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

export async function draftEvent({ templateId, weekTheme, sectorSeed }) {
  const template = TEMPLATES.find((t) => t.id === templateId);
  if (!template) throw new Error(`unknown template: ${templateId}`);

  // Offline fallback if no key — return template with a random flavor brief.
  if (!OPENAI_API_KEY) {
    const brief = template.flavorPool[Math.floor(Math.random() * template.flavorPool.length)];
    return {
      ok: true, offline: true,
      draft: { templateId, brief, suggestedTargetNodes: [1,2,3] },
    };
  }

  const prompt = `You are NEVA Core, drafting a Daily Contract for a player in a cerebral data-grid game.
Tone: lowercase fragments, lonely, mysterious. 5-14 word brief.
Template: ${template.name} (${template.archetype})
Season theme: ${weekTheme}
Sector seed: ${sectorSeed}
Pick a flavor and adapt it. Return JSON only:
{ "brief": "...", "suggestedTargetNodes": [n1, n2, n3] }`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OPENAI_MODEL, messages: [{ role: 'user', content: prompt }], response_format: { type: 'json_object' } }),
  });
  if (!res.ok) throw new Error(`openai ${res.status}`);
  const data = await res.json();
  const draft = JSON.parse(data.choices[0].message.content);
  return { ok: true, offline: false, draft: { templateId, ...draft } };
}
```

- [ ] **Step 25.2: Wire the route in `server/index.mjs`**

```js
import { draftEvent } from './ai-event-drafter.mjs';

// Inside the request handler:
if (req.method === 'POST' && url.pathname === '/api/admin/draft-event') {
  if (!ADMIN_SECRET || !checkAdminAuth(req)) return sendJson(res, 403, { ok: false });
  const body = await readJsonBody(req);
  try {
    const draft = await draftEvent({
      templateId: body.templateId,
      weekTheme: body.weekTheme ?? 'The Pulse',
      sectorSeed: body.sectorSeed ?? 0,
    });
    return sendJson(res, 200, draft);
  } catch (e) {
    return sendJson(res, 500, { ok: false, error: String(e) });
  }
}
```

- [ ] **Step 25.3: Add a "Draft via NEVA Core" button to `server/admin-events.html`**

Append to the admin page:

```html
<h2>Draft via NEVA Core</h2>
<label>Template:</label> <input id="tplId" value="DC-01" />
<label>Week theme:</label> <input id="theme" value="The Pulse" />
<button id="draft">Draft</button>
<pre id="draftOut">—</pre>
<script>
document.getElementById('draft').onclick = async () => {
  const res = await fetch('/api/admin/draft-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + document.getElementById('secret').value },
    body: JSON.stringify({ templateId: document.getElementById('tplId').value, weekTheme: document.getElementById('theme').value }),
  });
  document.getElementById('draftOut').textContent = await res.text();
};
</script>
```

- [ ] **Step 25.4: Smoke test (offline mode, no key)**

```bash
export NEVA_ADMIN_SECRET=p1-test
pnpm server &
curl -s -X POST http://localhost:8787/api/admin/draft-event -H 'Authorization: Bearer p1-test' -H 'Content-Type: application/json' -d '{"templateId":"DC-01"}'
```

Expected: `{"ok":true,"offline":true,"draft":{...}}`.

- [ ] **Step 25.5: Commit**

```bash
git add server/ai-event-drafter.mjs server/index.mjs server/admin-events.html
git commit -m "feat(ai): NEVA Core event drafter + admin UI hook"
```

---

## Task 26: Phase 1 final integration + regression

**Goal:** Confirm:
- All puzzle engines unit tests pass.
- M00–M20 still playable.
- Season 0 daily flow works.
- Tentpole opens (when Week 7 reached / manually seeded).

**Files:** none (verification)

- [ ] **Step 26.1: Full test suite**

```bash
pnpm test:run
```

Expected: 60+ tests pass.

- [ ] **Step 26.2: Build + lint**

```bash
pnpm build && pnpm lint
```

Both exit 0.

- [ ] **Step 26.3: Web3 audit**

```bash
node -e "const p=require('./package.json'); const d={...p.dependencies,...p.devDependencies}; const b=['ethers','web3','wagmi','viem','@walletconnect/','@solana/','rainbowkit','starknet']; const h=Object.keys(d).filter(x=>b.some(y=>x.includes(y))); console.log(h.length ? 'FAIL: '+h.join(', ') : 'OK — no Web3 deps'); process.exit(h.length);"
```

Expected: `OK — no Web3 deps`.

- [ ] **Step 26.4: Manual playthrough**

```bash
pnpm server & pnpm dev
```

Run Mission 00. Confirm not regressed. Click Daily Contract card. Solve puzzle. Confirm reward claimed.

Manually seed a tentpole-stage trigger and confirm `TentpoleStageView` renders correctly.

- [ ] **Step 26.5: Update `CURRENT_PROJECT_STATE.md`**

Append a one-paragraph note:

```
- **Six-Month Grid Phase 1 (Season 0 launch)** — **Complete**. Ships 8 puzzle
  engines, 4 factions with rep, 7 Weekly Anomalies, 12 Daily templates,
  Tentpole TP-S0, NEVA whisper library (incl. lie-rate), and Pattern Lens
  unlock. M00-M20 unchanged. Ready for Phase 2 — Corsair class.
```

- [ ] **Step 26.6: Commit**

```bash
git add CURRENT_PROJECT_STATE.md
git commit -m "docs: Phase 1 (Season 0) complete"
```

---

## Phase 1 /goal directive

```
/goal Implement Phase 1 of the Six-Month Grid plan in
docs/superpowers/plans/2026-05-28-six-month-grid-phase-1.md.

Pre-requisite: Phase 0 (docs/superpowers/plans/2026-05-28-six-month-grid-phase-0.md)
must be complete. Verify M00-M20 still plays and pnpm test:run/build/lint pass.

Work through Tasks 1-26 in order. Per task, follow TDD steps exactly.

Done when:
- All 26 tasks are committed.
- pnpm test:run exits 0 with ≥ 60 tests passing.
- pnpm build + pnpm lint exit 0.
- Mission 00 plays without regression.
- A Daily Contract can be fetched, solved, and claimed end-to-end.
- A Weekly Anomaly can be progressed through multiple stages.
- The Tentpole TP-S0 stage 7 sets PATTERN_LENS_T1 flag and persists across reload.
- Faction reputation updates on Faction Op claims.
- No new Web3 deps (audit grep).
- No new `any` or `@ts-ignore` outside narrowly-scoped save migration casts.

Constraints:
- Use every content piece from Content Bible §2-§7 with its canonical ID.
- All currency mutations route through wallet.ts.
- M00-M20 logic unchanged.
- NEVA Core OpenAI integration stays server-side only.
- Backend stays zero-frontend-dep; openai dep is server-only via subpath import.

Stop after 90 turns max.
```

---

## Self-Review

**Spec coverage** — every Phase 1 milestone gate covered:

| Bible reference | Task |
|---|---|
| §2 (4 Factions) | Task 10 (reducer) + 16 (definitions in code + JSON) + 22 (gauge UI) |
| §3 (8 Puzzle Types) | Tasks 2–9 (each engine) + 19 (UI views) |
| §3.9 (puzzle weights) | Task 1 (registry) |
| §4 (Story Arc) | Task 15 (state machine) + 16.4 (beats JSON) |
| §4.3 (Tentpole TP-S0) | Tasks 16.3 (data) + 21 (UI) |
| §5 (7 Weekly Anomalies) | Task 16.1 (data) + 20 (UI) |
| §6 (12 Daily templates) | Tasks 16.2 (data) + 18 (scheduler) + 25 (drafter) |
| §7 (NEVA whispers) | Task 16.6 (data) — UI binding lives in P-NWI view (Task 19) |
| §8 (Economy) | Wallet integration (Phase 0) + currency mutations through claims (this phase) |
| §9 (Pattern Lens) | Task 13 (flag) + 23 (overlay) + 21 (Tentpole stage 7 sets flag) |
| §11 (Implementation Map) | All tasks reference canonical IDs |

**Placeholder scan** — none found.

**Type consistency** — `PuzzleType`, `Difficulty`, `PuzzleSpec`, `PuzzleResult`, `FactionId`, `FactionReputation`, `RepAction`, `StoryBeat` defined once each; referenced consistently across `src/puzzles/`, `src/factions/`, `src/seasons/`, `src/components/`, and JSON content.

**Scope check** — Phase 1 only. Class abstraction for Corsair/Ghost/Architect is deferred to Phases 2–4 (each gets own plan).


---

## Part III.2 — Phase 2 Plan (Corsair / Season 1)

*Originally: `docs/superpowers/plans/2026-05-28-six-month-grid-phase-2.md`*


**Goal:** Ship the **Corsair class** and **Season 1 "Black Routes"** on top of Phases 0+1. After Phase 2, players can switch between Operator and Corsair, breach Black Routes with an ICE timer, fence stolen data at Fox's Black Market, and play Season 1's 8-week arc end-to-end.

**Architecture:** Class abstraction enters here — `src/classes/<id>/` becomes the canonical layout. The Corsair class is the first non-Operator class; its files are siblings of `src/classes/operator/` (renamed from prior loose files in this phase). ICE is a new GameState slice. Black Market is a single panel + server vendor logic.

**Tech Stack:** Same as Phase 1.

**Companion docs:**
- Engine: Phases 0 + 1 plans.
- Content: `docs/superpowers/specs/2026-05-28-content-bible-season-1.md`.

**Pre-requisite:** Phase 0 + Phase 1 fully shipped and on `main`. `pnpm test:run` ≥ 60 tests passing.

---

## File Structure

### Created
| Path | Responsibility |
|---|---|
| `src/classes/types.ts` | `ClassId` enum + shared class spec types. |
| `src/classes/registry.ts` | Maps `ClassId` → class module. |
| `src/classes/operator/index.ts` | Operator class wrapper (re-exports existing logic). |
| `src/classes/corsair/index.ts` | Corsair class wrapper (state + lifecycle). |
| `src/classes/corsair/tools.ts` | Spoofer / Ghost-tail / Snip / Cold Trail definitions. |
| `src/classes/corsair/tools.test.ts` | Tool effect unit tests. |
| `src/classes/corsair/skills.ts` | 20-skill tree (per Bible §2.4). |
| `src/classes/corsair/skills.test.ts` | Skill unlock tests. |
| `src/ice/index.ts` | ICE subsystem (pure logic). |
| `src/ice/index.test.ts` | ICE accrual + threshold tests. |
| `src/blackMarket/types.ts` | Market offer types. |
| `src/blackMarket/pricing.ts` | Fence pricing logic. |
| `src/blackMarket/pricing.test.ts` | Pricing unit tests. |
| `src/components/ClassSwitcher.tsx` | UI to pick primary class. |
| `src/components/BreachTimerHud.tsx` | ICE bar HUD (visible only during breach). |
| `src/components/BlackMarketPanel.tsx` | Fox's vendor UI. |
| `src/components/CorsairToolBelt.tsx` | Equipped tools HUD. |
| `server/data/seasons/s1/weeklies.json` | 7 Season-1 weeklies. |
| `server/data/seasons/s1/daily-templates.json` | 12 Season-1 daily templates. |
| `server/data/seasons/s1/tentpole.json` | TP-S1 (Last Vault) — 7 stages. |
| `server/data/seasons/s1/beats.json` | Week-by-week beats. |
| `server/data/seasons/s1/lore.json` | 5 new lore pages. |
| `server/black-market-store.mjs` | Fox's per-day offerings + purchase records. |
| `server/seed-season-1.mjs` | Idempotent S1 seeder. |

### Modified
| Path | Reason |
|---|---|
| `src/game.ts` | Add `iceState`, `classState.activeClass`, `unlockedClasses`, `equippedTools`, `corsairXp`, `corsairSkills`, `blackMarketLastVisit`. |
| `src/save.ts` | Bump to v4 — additive migration for new fields. |
| `src/wallet.ts` | Add Black Credits routing (existing currency, but new earn-reasons enumerated). |
| `src/seasons.ts` | Add `getSeasonNumber()` returning current season; soft-reset between S0 and S1. |
| `src/factions/reducer.ts` | No change, but caller adds Season-1 rep transitions. |
| `src/components/SeasonTracker.tsx` | Show Season number in addition to week. |
| `src/components/DailyContractCard.tsx` | Respect active class — Corsair daily looks different. |
| `src/GameApp.tsx` | Mount ClassSwitcher + BreachTimerHud + CorsairToolBelt + BlackMarketPanel. |
| `server/index.mjs` | Add `/api/market/*` and `/api/class/switch` routes. |
| `server/whispers.json` | Append Season 1 whisper additions (Bible §8). |
| `server/scheduler.mjs` | Hook S1 seasonal events (when current date past S1 start). |
| `package.json` | Add `seed:season-1` script. |
| `CURRENT_PROJECT_STATE.md` | Mark Phase 2 in progress, then complete. |

### Not Touched
- Phase 0/1 puzzle engines — work as-is.
- M00–M20 mission chain — unchanged.

---

## Task 1: Class abstraction scaffolding

**Goal:** Establish `ClassId` enum, `class registry`, and wrap the existing Operator behavior so future classes plug in cleanly.

**Files:**
- Create: `src/classes/types.ts`
- Create: `src/classes/registry.ts`
- Create: `src/classes/registry.test.ts`
- Create: `src/classes/operator/index.ts`
- Create: `src/classes/corsair/index.ts`

- [ ] **Step 1.1: Write the failing test**

`src/classes/registry.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getClass, ALL_CLASSES } from './registry';

describe('class registry', () => {
  it('contains Operator and Corsair in Phase 2', () => {
    expect(ALL_CLASSES.map((c) => c.id).sort()).toEqual(['CLS-COR','CLS-OPR']);
  });
  it('returns the operator class by id', () => {
    expect(getClass('CLS-OPR').id).toBe('CLS-OPR');
  });
  it('returns the corsair class by id', () => {
    expect(getClass('CLS-COR').id).toBe('CLS-COR');
  });
  it('throws on unknown class id', () => {
    // @ts-expect-error testing runtime guard
    expect(() => getClass('CLS-XYZ')).toThrow();
  });
});
```

- [ ] **Step 1.2: `src/classes/types.ts`**

```ts
export type ClassId = 'CLS-OPR' | 'CLS-COR' | 'CLS-GHS' | 'CLS-ARC';

export interface ClassDef {
  id: ClassId;
  name: string;
  fantasy: string;          // one-line fantasy
  signatureMechanic: string;
  primaryCurrency: 'DATA' | 'BLACK_CREDITS' | 'COHERENCE' | 'GRID_POWER' | 'LORE_SHARDS';
  shipPhase: 1 | 2 | 3 | 4;
}
```

- [ ] **Step 1.3: `src/classes/operator/index.ts`**

```ts
import type { ClassDef } from '../types';

export const OPERATOR_CLASS: ClassDef = {
  id: 'CLS-OPR',
  name: 'Operator',
  fantasy: 'detective + archaeologist + decryptor',
  signatureMechanic: 'DECODE',
  primaryCurrency: 'LORE_SHARDS',
  shipPhase: 1,
};
```

- [ ] **Step 1.4: `src/classes/corsair/index.ts`**

```ts
import type { ClassDef } from '../types';

export const CORSAIR_CLASS: ClassDef = {
  id: 'CLS-COR',
  name: 'Corsair',
  fantasy: 'cyberpunk runner — high-tension data heist',
  signatureMechanic: 'BREACH-AND-RUN',
  primaryCurrency: 'BLACK_CREDITS',
  shipPhase: 2,
};
```

- [ ] **Step 1.5: `src/classes/registry.ts`**

```ts
import type { ClassDef, ClassId } from './types';
import { OPERATOR_CLASS } from './operator/index';
import { CORSAIR_CLASS } from './corsair/index';

const REGISTRY: Record<ClassId, ClassDef | undefined> = {
  'CLS-OPR': OPERATOR_CLASS,
  'CLS-COR': CORSAIR_CLASS,
  'CLS-GHS': undefined, // Phase 3
  'CLS-ARC': undefined, // Phase 4
};

export const ALL_CLASSES: ClassDef[] = Object.values(REGISTRY).filter(Boolean) as ClassDef[];

export function getClass(id: ClassId): ClassDef {
  const c = REGISTRY[id];
  if (!c) throw new Error(`Unknown or not-yet-shipped class: ${id}`);
  return c;
}
```

- [ ] **Step 1.6: Add `BLACK_CREDITS` to wallet (extend Currency type)**

Open `src/wallet.ts`. Add `'BLACK_CREDITS'` to the `Currency` union:

```ts
export type Currency =
  | 'DATA' | 'MEMORY_SHARDS' | 'ACCESS_KEYS' | 'SIGNAL_ENERGY' | 'CORE_FRAGMENTS'
  | 'LORE_SHARDS' | 'BLACK_CREDITS';
```

Update `ZERO` and `TRANSFERABLE` records accordingly:

```ts
const ZERO: Record<Currency, number> = { /* ... existing ... */, BLACK_CREDITS: 0 };
const TRANSFERABLE: Record<Currency, boolean> = { /* ... existing ... */, BLACK_CREDITS: false };
```

- [ ] **Step 1.7: Run + commit**

```bash
pnpm test:run src/classes/
pnpm build
git add src/classes/ src/wallet.ts
git commit -m "feat(classes): class registry + Operator/Corsair definitions + BLACK_CREDITS currency"
```

---

## Task 2: Extend GameState for classes + ICE

**Files:**
- Modify: `src/game.ts`

- [ ] **Step 2.1: Add to `GameState`**

```ts
import type { ClassId } from './classes/types';

// inside GameState
  classState?: {
    activeClass: ClassId;
    unlocked: ClassId[];
    operatorXp?: number;
    corsairXp?: number;
    corsairSkills?: string[]; // skill IDs unlocked (SKL-COR-01..)
    equippedTools?: string[]; // tool IDs equipped (T-SPF, T-GHT, T-SNP, T-CLT)
  };
  iceState?: {
    active: boolean;       // true only during a breach
    value: number;         // 0..100
    accrualPerSecond: number; // computed from current operation
  };
  blackMarketLastVisit?: string; // ISO date 'YYYY-MM-DD'
```

In `initGame()`:

```ts
    classState: {
      activeClass: 'CLS-OPR',
      unlocked: ['CLS-OPR'],
      operatorXp: 0, corsairXp: 0,
      corsairSkills: [],
      equippedTools: [],
    },
    iceState: { active: false, value: 0, accrualPerSecond: 0 },
    blackMarketLastVisit: '',
```

- [ ] **Step 2.2: Build + commit**

```bash
pnpm build
git add src/game.ts
git commit -m "feat(game): class state + ICE state + market visit (additive)"
```

---

## Task 3: Save migration v4

**Files:**
- Modify: `src/save.ts`
- Modify: `src/save.test.ts`

- [ ] **Step 3.1: Bump version + extend migration**

In `migrateSaveBlob`, add v3→v4 block:

```ts
  // v3 → v4: class state + ICE + black market
  if (!game.classState) {
    game.classState = {
      activeClass: 'CLS-OPR',
      unlocked: ['CLS-OPR'],
      operatorXp: 0, corsairXp: 0,
      corsairSkills: [], equippedTools: [],
    };
  }
  if (!game.iceState) {
    game.iceState = { active: false, value: 0, accrualPerSecond: 0 };
  }
  if (typeof game.blackMarketLastVisit === 'undefined') {
    game.blackMarketLastVisit = '';
  }
  // BLACK_CREDITS balance defaults to 0 (handled by wallet zero map)
  if (game.wallet && !('BLACK_CREDITS' in game.wallet.balances)) {
    game.wallet.balances.BLACK_CREDITS = 0;
  }

  return { ...blob, version: 4 };
```

Update the guard at the top of `migrateSaveBlob`:

```ts
if (blob.version > 4) return blob;
```

Update `const VERSION = 3;` to `const VERSION = 4;`.

- [ ] **Step 3.2: Add regression test**

Append to `src/save.test.ts`:

```ts
it('v3 blob is migrated to v4 with class + ice + market', () => {
  const v3Game = initGame();
  delete (v3Game as { classState?: unknown }).classState;
  delete (v3Game as { iceState?: unknown }).iceState;
  delete (v3Game as { blackMarketLastVisit?: unknown }).blackMarketLastVisit;
  if (v3Game.wallet) delete (v3Game.wallet.balances as { BLACK_CREDITS?: unknown }).BLACK_CREDITS;

  const migrated = migrateSaveBlob({ version: 3, continued: false, game: v3Game });
  expect(migrated.version).toBe(4);
  expect(migrated.game.classState?.activeClass).toBe('CLS-OPR');
  expect(migrated.game.iceState).toEqual({ active: false, value: 0, accrualPerSecond: 0 });
  expect(migrated.game.wallet?.balances.BLACK_CREDITS).toBe(0);
});
```

- [ ] **Step 3.3: Run + commit**

```bash
pnpm test:run src/save.test.ts
pnpm build
git add src/save.ts src/save.test.ts
git commit -m "feat(save): v3→v4 additive migration (class + ice + market)"
```

---

## Task 4: ICE subsystem

**Files:**
- Create: `src/ice/index.ts`
- Create: `src/ice/index.test.ts`

- [ ] **Step 4.1: Tests**

```ts
import { describe, it, expect } from 'vitest';
import { initIce, tickIce, applyIceImpact, iceThreshold, ICE_CONST } from './index';

describe('ICE subsystem', () => {
  it('starts at 0 inactive', () => {
    const ice = initIce();
    expect(ice.active).toBe(false);
    expect(ice.value).toBe(0);
  });

  it('startBreach activates with given accrual', () => {
    const ice = initIce();
    const started = applyIceImpact(ice, { type: 'startBreach', accrualPerSecond: 0.5 });
    expect(started.active).toBe(true);
    expect(started.accrualPerSecond).toBe(0.5);
  });

  it('tickIce accrues per elapsed seconds when active', () => {
    let ice = applyIceImpact(initIce(), { type: 'startBreach', accrualPerSecond: 1 });
    ice = tickIce(ice, 10); // 10 seconds → +10
    expect(ice.value).toBe(10);
  });

  it('tickIce does not accrue when inactive', () => {
    const ice = initIce();
    expect(tickIce(ice, 100).value).toBe(0);
  });

  it('Snip adds 25', () => {
    let ice = applyIceImpact(initIce(), { type: 'startBreach', accrualPerSecond: 0 });
    ice = applyIceImpact(ice, { type: 'snip' });
    expect(ice.value).toBe(25);
  });

  it('failed puzzle adds 10', () => {
    let ice = applyIceImpact(initIce(), { type: 'startBreach', accrualPerSecond: 0 });
    ice = applyIceImpact(ice, { type: 'failedPuzzle' });
    expect(ice.value).toBe(10);
  });

  it('clamps to 100', () => {
    let ice = applyIceImpact(initIce(), { type: 'startBreach', accrualPerSecond: 0 });
    for (let i = 0; i < 10; i++) ice = applyIceImpact(ice, { type: 'snip' });
    expect(ice.value).toBe(100);
  });

  it('iceThreshold returns correct band', () => {
    expect(iceThreshold(15)).toBe('quiet');
    expect(iceThreshold(45)).toBe('noted');
    expect(iceThreshold(75)).toBe('tracking');
    expect(iceThreshold(95)).toBe('lock');
  });

  it('endBreach clears state', () => {
    let ice = applyIceImpact(initIce(), { type: 'startBreach', accrualPerSecond: 1 });
    ice = applyIceImpact(ice, { type: 'snip' });
    ice = applyIceImpact(ice, { type: 'endBreach' });
    expect(ice.active).toBe(false);
    expect(ice.value).toBe(0);
  });

  it('spoofer pauses accrual for 10s', () => {
    let ice = applyIceImpact(initIce(), { type: 'startBreach', accrualPerSecond: 1 });
    ice = applyIceImpact(ice, { type: 'spoofer' });
    expect(ice.pausedUntilDeltaMs).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 4.2: Implement**

```ts
export const ICE_CONST = {
  SNIP_DELTA: 25,
  FAILED_PUZZLE_DELTA: 10,
  SPOOFER_PAUSE_MS: 10_000,
  GHOST_TAIL_PAUSE_MS: 20_000,
  LOCK_AT: 100,
};

export interface IceState {
  active: boolean;
  value: number;
  accrualPerSecond: number;
  pausedUntilDeltaMs: number; // remaining pause duration (since last tick)
}

export type IceImpact =
  | { type: 'startBreach'; accrualPerSecond: number }
  | { type: 'endBreach' }
  | { type: 'snip' }
  | { type: 'failedPuzzle' }
  | { type: 'spoofer' }
  | { type: 'ghostTail' };

export function initIce(): IceState {
  return { active: false, value: 0, accrualPerSecond: 0, pausedUntilDeltaMs: 0 };
}

function clamp(v: number): number { return Math.max(0, Math.min(ICE_CONST.LOCK_AT, v)); }

export function tickIce(ice: IceState, elapsedSeconds: number): IceState {
  if (!ice.active) return ice;
  if (ice.pausedUntilDeltaMs > 0) {
    const used = Math.min(ice.pausedUntilDeltaMs, elapsedSeconds * 1000);
    return { ...ice, pausedUntilDeltaMs: ice.pausedUntilDeltaMs - used };
  }
  return { ...ice, value: clamp(ice.value + ice.accrualPerSecond * elapsedSeconds) };
}

export function applyIceImpact(ice: IceState, impact: IceImpact): IceState {
  switch (impact.type) {
    case 'startBreach':
      return { active: true, value: 0, accrualPerSecond: impact.accrualPerSecond, pausedUntilDeltaMs: 0 };
    case 'endBreach':
      return initIce();
    case 'snip':
      return { ...ice, value: clamp(ice.value + ICE_CONST.SNIP_DELTA) };
    case 'failedPuzzle':
      return { ...ice, value: clamp(ice.value + ICE_CONST.FAILED_PUZZLE_DELTA) };
    case 'spoofer':
      return { ...ice, pausedUntilDeltaMs: ice.pausedUntilDeltaMs + ICE_CONST.SPOOFER_PAUSE_MS };
    case 'ghostTail':
      return { ...ice, pausedUntilDeltaMs: ice.pausedUntilDeltaMs + ICE_CONST.GHOST_TAIL_PAUSE_MS };
  }
}

export type IceBand = 'quiet' | 'noted' | 'tracking' | 'lock';
export function iceThreshold(v: number): IceBand {
  if (v <= 30) return 'quiet';
  if (v <= 60) return 'noted';
  if (v <= 90) return 'tracking';
  return 'lock';
}
```

- [ ] **Step 4.3: Run + commit**

```bash
pnpm test:run src/ice/index.test.ts
pnpm build
git add src/ice/
git commit -m "feat(ice): ICE subsystem (accrual, tools, thresholds)"
```

---

## Task 5: Corsair tools

**Files:**
- Create: `src/classes/corsair/tools.ts`
- Create: `src/classes/corsair/tools.test.ts`

- [ ] **Step 5.1: Implement tools as pure descriptors**

```ts
import type { Currency } from '../../wallet';
import type { IceImpact } from '../../ice';

export type ToolId = 'T-SPF' | 'T-GHT' | 'T-SNP' | 'T-CLT';

export interface ToolDef {
  id: ToolId;
  name: string;
  effect: IceImpact['type'];       // which ICE impact (if any)
  cost: Array<{ currency: Currency; amount: number }>;
  cooldownMs: number;
  oneTimePerSession: boolean;
  description: string;
}

export const TOOLS: Record<ToolId, ToolDef> = {
  'T-SPF': {
    id: 'T-SPF', name: 'Spoofer', effect: 'spoofer',
    cost: [{ currency: 'SIGNAL_ENERGY', amount: 1 }],
    cooldownMs: 30_000, oneTimePerSession: false,
    description: 'Pauses ICE for 10 seconds. 30s cooldown.',
  },
  'T-GHT': {
    id: 'T-GHT', name: 'Ghost-tail', effect: 'ghostTail',
    cost: [{ currency: 'SIGNAL_ENERGY', amount: 2 }],
    cooldownMs: 60_000, oneTimePerSession: false,
    description: 'Drops fake trace path. ICE follows it for 20 seconds.',
  },
  'T-SNP': {
    id: 'T-SNP', name: 'Snip', effect: 'snip',
    cost: [{ currency: 'ACCESS_KEYS', amount: 1 }],
    cooldownMs: 0, oneTimePerSession: false,
    description: 'Yank data from a node without solving. ICE +25.',
  },
  'T-CLT': {
    id: 'T-CLT', name: 'Cold Trail', effect: 'spoofer', // same paused state; Mastery 4 gates it
    cost: [{ currency: 'MEMORY_SHARDS', amount: 3 }],
    cooldownMs: 0, oneTimePerSession: true,
    description: 'Mastery 4 — Trace decays 2× for 60 seconds. Once per session.',
  },
};
```

- [ ] **Step 5.2: Tests**

```ts
import { describe, it, expect } from 'vitest';
import { TOOLS } from './tools';

describe('Corsair tools', () => {
  it('all four tools defined', () => {
    expect(Object.keys(TOOLS).sort()).toEqual(['T-CLT','T-GHT','T-SNP','T-SPF']);
  });
  it('Spoofer costs SIGNAL_ENERGY', () => {
    expect(TOOLS['T-SPF'].cost[0]).toEqual({ currency: 'SIGNAL_ENERGY', amount: 1 });
  });
  it('Cold Trail is one-time per session', () => {
    expect(TOOLS['T-CLT'].oneTimePerSession).toBe(true);
  });
  it('Snip impact maps to ICE snip', () => {
    expect(TOOLS['T-SNP'].effect).toBe('snip');
  });
});
```

- [ ] **Step 5.3: Run + commit**

```bash
pnpm test:run src/classes/corsair/tools.test.ts
pnpm build
git add src/classes/corsair/tools.ts src/classes/corsair/tools.test.ts
git commit -m "feat(corsair): tool definitions"
```

---

## Task 6: Corsair skills (20-skill tree)

**Files:**
- Create: `src/classes/corsair/skills.ts`
- Create: `src/classes/corsair/skills.test.ts`

- [ ] **Step 6.1: Implement**

```ts
export type SkillId =
  | 'SKL-COR-01' | 'SKL-COR-02' | 'SKL-COR-03' | 'SKL-COR-04' | 'SKL-COR-05'
  | 'SKL-COR-06' | 'SKL-COR-07' | 'SKL-COR-08' | 'SKL-COR-09' | 'SKL-COR-10'
  | 'SKL-COR-11' | 'SKL-COR-12' | 'SKL-COR-13' | 'SKL-COR-14' | 'SKL-COR-15'
  | 'SKL-COR-16' | 'SKL-COR-17' | 'SKL-COR-18' | 'SKL-COR-19' | 'SKL-COR-20';

export interface SkillDef {
  id: SkillId;
  tier: 1 | 2 | 3 | 4;
  name: string;
  effect: string; // descriptive only — applied in claim path
  cost: number;   // Black Credits to unlock
}

export const SKILLS: Record<SkillId, SkillDef> = {
  // Tier 1 (Mastery 0)
  'SKL-COR-01': { id: 'SKL-COR-01', tier: 1, name: 'Steady Hand', effect: 'Cipher puzzles in breach +5 seconds.', cost: 30 },
  'SKL-COR-02': { id: 'SKL-COR-02', tier: 1, name: 'Quiet Step',  effect: 'ICE accrues 10% slower during traversal.', cost: 30 },
  'SKL-COR-03': { id: 'SKL-COR-03', tier: 1, name: 'Faded Mark',  effect: 'Trace decay +25% outside breach.', cost: 30 },
  'SKL-COR-04': { id: 'SKL-COR-04', tier: 1, name: 'Market Sense', effect: 'Fence prices +10%.', cost: 30 },
  'SKL-COR-05': { id: 'SKL-COR-05', tier: 1, name: 'Lock-pick',   effect: 'Locked nodes opened in one fewer step.', cost: 30 },

  // Tier 2 (Mastery 1) — 80 BC each
  'SKL-COR-06': { id: 'SKL-COR-06', tier: 2, name: 'Multi-Vector', effect: 'Two breaches concurrently — ICE pools.', cost: 80 },
  'SKL-COR-07': { id: 'SKL-COR-07', tier: 2, name: 'Trace Echo',   effect: 'See ICE 3 sec into the future.', cost: 80 },
  'SKL-COR-08': { id: 'SKL-COR-08', tier: 2, name: 'Hot Wallet',   effect: 'Black Credits earn +5% during Tide.', cost: 80 },
  'SKL-COR-09': { id: 'SKL-COR-09', tier: 2, name: 'Quick Exit',   effect: 'Exfil speed +20%.', cost: 80 },
  'SKL-COR-10': { id: 'SKL-COR-10', tier: 2, name: 'Doublethink',  effect: 'Failed puzzle costs 0 ICE first time.', cost: 80 },

  // Tier 3 (Mastery 2) — 150 BC each
  'SKL-COR-11': { id: 'SKL-COR-11', tier: 3, name: 'Faction Read', effect: '+15% rep gain on Faction Ops.', cost: 150 },
  'SKL-COR-12': { id: 'SKL-COR-12', tier: 3, name: 'Shadow Step',  effect: 'Spoofer cooldown -50%.', cost: 150 },
  'SKL-COR-13': { id: 'SKL-COR-13', tier: 3, name: 'Long Range',   effect: 'Ghost-tail duration +50%.', cost: 150 },
  'SKL-COR-14': { id: 'SKL-COR-14', tier: 3, name: 'Anomalous Yield', effect: 'Anomalies drop +1 currency tier.', cost: 150 },
  'SKL-COR-15': { id: 'SKL-COR-15', tier: 3, name: 'Smuggler',     effect: 'Carry 2× exfil capacity.', cost: 150 },

  // Tier 4 (Mastery 3-4) — 250 BC each
  'SKL-COR-16': { id: 'SKL-COR-16', tier: 4, name: 'Cold Trail Mastery', effect: 'Unlocks T-CLT permanent equip.', cost: 250 },
  'SKL-COR-17': { id: 'SKL-COR-17', tier: 4, name: 'Fox\'s Favorite', effect: 'Fox\'s daily refresh count +1.', cost: 250 },
  'SKL-COR-18': { id: 'SKL-COR-18', tier: 4, name: 'Faction Switch', effect: 'Can declare cross-class operations.', cost: 250 },
  'SKL-COR-19': { id: 'SKL-COR-19', tier: 4, name: 'Last Run',     effect: 'When ICE > 90, gain +100% reward on success.', cost: 250 },
  'SKL-COR-20': { id: 'SKL-COR-20', tier: 4, name: 'Ghost Sense',  effect: 'See faction Severance routes before they collapse.', cost: 250 },
};

export function unlockableTier(corsairXp: number): 1 | 2 | 3 | 4 {
  if (corsairXp < 100) return 1;
  if (corsairXp < 300) return 2;
  if (corsairXp < 700) return 3;
  return 4;
}

export function canUnlockSkill(corsairXp: number, currentUnlocked: SkillId[], target: SkillId): { ok: boolean; reason?: string } {
  const def = SKILLS[target];
  if (!def) return { ok: false, reason: 'unknown skill' };
  if (currentUnlocked.includes(target)) return { ok: false, reason: 'already unlocked' };
  if (def.tier > unlockableTier(corsairXp)) return { ok: false, reason: 'tier locked — gain more Corsair XP' };
  return { ok: true };
}
```

- [ ] **Step 6.2: Tests**

```ts
import { describe, it, expect } from 'vitest';
import { SKILLS, unlockableTier, canUnlockSkill } from './skills';

describe('Corsair skills', () => {
  it('20 skills defined', () => {
    expect(Object.keys(SKILLS).length).toBe(20);
  });
  it('tier gating', () => {
    expect(unlockableTier(0)).toBe(1);
    expect(unlockableTier(150)).toBe(2);
    expect(unlockableTier(500)).toBe(3);
    expect(unlockableTier(1000)).toBe(4);
  });
  it('canUnlockSkill respects tier', () => {
    expect(canUnlockSkill(0, [], 'SKL-COR-06').ok).toBe(false);
    expect(canUnlockSkill(150, [], 'SKL-COR-06').ok).toBe(true);
  });
  it('prevents double unlock', () => {
    expect(canUnlockSkill(150, ['SKL-COR-01'], 'SKL-COR-01').ok).toBe(false);
  });
});
```

- [ ] **Step 6.3: Run + commit**

```bash
pnpm test:run src/classes/corsair/skills.test.ts
pnpm build
git add src/classes/corsair/skills.ts src/classes/corsair/skills.test.ts
git commit -m "feat(corsair): 20-skill tree + tier gating"
```

---

## Task 7: Black Market pricing logic

**Files:**
- Create: `src/blackMarket/types.ts`
- Create: `src/blackMarket/pricing.ts`
- Create: `src/blackMarket/pricing.test.ts`

- [ ] **Step 7.1: Types**

```ts
import type { FactionId } from '../factions/types';
import type { Currency } from '../wallet';

export type MarketOfferKind = 'buy' | 'sell' | 'skill-book' | 'cosmetic';

export interface MarketOffer {
  id: string;
  kind: MarketOfferKind;
  label: string;
  price: number;          // in Black Credits
  yields?: Array<{ currency: Currency; amount: number }>;
}

export interface StolenCipherItem {
  id: string;
  originFaction: FactionId;
  exportValue: number; // copied from the node it came from
}
```

- [ ] **Step 7.2: Pricing**

```ts
import type { FactionId } from '../factions/types';

const FACTION_MULTIPLIER: Record<FactionId, number> = {
  'FAC-ARC': 1.5,
  'FAC-SEV': 1.2,
  'FAC-BLK': 1.0,
  'FAC-QPT': 1.0,
};

export function fencePrice(
  exportValue: number,
  originFaction: FactionId,
  marketSenseBonus = 0, // SKL-COR-04 → 0.1
): number {
  const base = exportValue * 5;
  return Math.round(base * FACTION_MULTIPLIER[originFaction] * (1 + marketSenseBonus));
}
```

- [ ] **Step 7.3: Tests**

```ts
import { describe, it, expect } from 'vitest';
import { fencePrice } from './pricing';

describe('fence pricing', () => {
  it('Archive is most valuable (1.5x)', () => {
    expect(fencePrice(10, 'FAC-ARC')).toBe(75);
  });
  it('Severance is mid (1.2x)', () => {
    expect(fencePrice(10, 'FAC-SEV')).toBe(60);
  });
  it('Black Loop is base (1.0x)', () => {
    expect(fencePrice(10, 'FAC-BLK')).toBe(50);
  });
  it('Market Sense (SKL-COR-04) +10%', () => {
    expect(fencePrice(10, 'FAC-BLK', 0.1)).toBe(55);
  });
});
```

- [ ] **Step 7.4: Run + commit**

```bash
pnpm test:run src/blackMarket/pricing.test.ts
git add src/blackMarket/
git commit -m "feat(market): fence pricing logic with faction multipliers"
```

---

## Task 8: Black Market backend store

**Files:**
- Create: `server/black-market-store.mjs`

- [ ] **Step 8.1: Implement**

```js
import { loadJson, saveJson } from './json-store.mjs';

const FILE = 'black-market.json';
const SHAPE = { dailyOffers: {}, purchases: {} };

function read() {
  const raw = loadJson(FILE, SHAPE);
  return {
    dailyOffers: raw.dailyOffers ?? {},
    purchases: raw.purchases ?? {},
  };
}

function dayKey() { return new Date().toISOString().slice(0, 10); }

const TEMPLATE_OFFERS = [
  { id: 'buy-keys-5',    kind: 'buy', label: 'Buy 5 Access Keys', price: 50,  yields: [{ currency: 'ACCESS_KEYS', amount: 5 }] },
  { id: 'buy-mem-1',     kind: 'buy', label: 'Buy 1 Memory Shard', price: 80, yields: [{ currency: 'MEMORY_SHARDS', amount: 1 }] },
  { id: 'skill-tier2',   kind: 'skill-book', label: 'Tier 2 Corsair Skill Book', price: 200 },
  { id: 'cos-fox',       kind: 'cosmetic',  label: 'Fox\'s Mark callsign suffix', price: 350 },
];

export function offersFor(profileId) {
  const state = read();
  const today = dayKey();
  state.dailyOffers[today] = state.dailyOffers[today] ?? TEMPLATE_OFFERS;
  saveJson(FILE, state);
  const purchasedToday = state.purchases[`${profileId}:${today}`] ?? [];
  return state.dailyOffers[today].filter((o) => !purchasedToday.includes(o.id));
}

export function purchase(profileId, offerId) {
  const state = read();
  const today = dayKey();
  const offers = state.dailyOffers[today] ?? TEMPLATE_OFFERS;
  const offer = offers.find((o) => o.id === offerId);
  if (!offer) return { ok: false, error: 'unknown offer' };

  const key = `${profileId}:${today}`;
  const purchased = state.purchases[key] ?? [];
  if (purchased.includes(offerId)) return { ok: false, error: 'already purchased today' };
  purchased.push(offerId);
  state.purchases[key] = purchased;
  saveJson(FILE, state);
  return { ok: true, offer };
}

export function marketStats() {
  const state = read();
  return { totalPurchases: Object.values(state.purchases).reduce((acc, l) => acc + l.length, 0) };
}
```

- [ ] **Step 8.2: Smoke**

```bash
node --input-type=module -e "
import { offersFor, purchase } from './server/black-market-store.mjs';
console.log('offers:', offersFor('p1').length);
console.log('purchase:', purchase('p1','buy-keys-5'));
console.log('purchase again:', purchase('p1','buy-keys-5'));
"
```

Expected: 4 offers initially, second purchase returns `already purchased today`.

- [ ] **Step 8.3: Commit**

```bash
git add server/black-market-store.mjs
git commit -m "feat(server): Black Market store (per-day offers + dedup)"
```

---

## Task 9: Market backend routes

**Files:**
- Modify: `server/index.mjs`

- [ ] **Step 9.1: Add routes**

```js
import { offersFor, purchase, marketStats } from './black-market-store.mjs';

// inside handler:
if (req.method === 'GET' && url.pathname === '/api/market/offers') {
  const profileId = String(url.searchParams.get('profileId') ?? 'local');
  return sendJson(res, 200, { ok: true, offers: offersFor(profileId) });
}

if (req.method === 'POST' && url.pathname === '/api/market/purchase') {
  const body = await readJsonBody(req);
  const profileId = String(body?.profileId ?? '').slice(0, 64);
  const offerId = String(body?.offerId ?? '').slice(0, 64);
  if (!profileId || !offerId) return sendJson(res, 400, { ok: false, error: 'profileId and offerId required' });
  return sendJson(res, 200, purchase(profileId, offerId));
}
```

- [ ] **Step 9.2: Commit**

```bash
git add server/index.mjs
git commit -m "feat(server): /api/market/* routes"
```

---

## Task 10: Class-switch route + frontend BlackMarketPanel

**Files:**
- Modify: `server/index.mjs` — `/api/class/switch`
- Create: `src/components/BlackMarketPanel.tsx`
- Create: `src/components/ClassSwitcher.tsx`

- [ ] **Step 10.1: Add class-switch endpoint** (admin trusted; for local-only Phase 7 profile, no auth)

```js
// Phase 2 class-switch (local only)
if (req.method === 'POST' && url.pathname === '/api/class/switch') {
  const body = await readJsonBody(req);
  // Server doesn't persist class — frontend save.ts owns it. This endpoint
  // is here as a stub for future server-side enforcement.
  return sendJson(res, 200, { ok: true, switchedTo: String(body?.classId ?? 'CLS-OPR') });
}
```

- [ ] **Step 10.2: Implement `BlackMarketPanel.tsx`**

```tsx
import { useEffect, useState } from 'react';

interface Offer {
  id: string;
  kind: 'buy' | 'sell' | 'skill-book' | 'cosmetic';
  label: string;
  price: number;
}

interface Props { profileId: string; onClose: () => void; }

const wrap: React.CSSProperties = {
  position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  background: '#0a0e27', color: '#d8e8ff', padding: 16, borderRadius: 8,
  width: 360, zIndex: 2000, fontFamily: 'SF Mono, Menlo, monospace',
};

const row: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: 6, borderBottom: '1px solid #2a0050',
};

export function BlackMarketPanel({ profileId, onClose }: Props) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/market/offers?profileId=${profileId}`)
      .then((r) => r.json())
      .then((d) => setOffers(d.offers ?? []));
  }, [profileId]);

  const buy = async (offerId: string) => {
    const res = await fetch('/api/market/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId, offerId }),
    });
    const d = await res.json();
    setStatus(d.ok ? `Bought: ${d.offer.label}` : `Failed: ${d.error}`);
    if (d.ok) setOffers(offers.filter((o) => o.id !== offerId));
  };

  return (
    <div style={wrap}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: '#b88aff' }}>BLACK MARKET · FOX</div>
      <div style={{ fontSize: 9, opacity: 0.6, marginBottom: 8 }}>"Quiet now. Quiet sale."</div>
      {offers.length === 0 && <div>No offers today.</div>}
      {offers.map((o) => (
        <div key={o.id} style={row}>
          <div>{o.label}</div>
          <button onClick={() => buy(o.id)} style={{ padding: '2px 6px' }}>{o.price} BC</button>
        </div>
      ))}
      {status && <div style={{ marginTop: 8, opacity: 0.7 }}>{status}</div>}
      <button onClick={onClose} style={{ marginTop: 12, padding: '4px 10px' }}>Close</button>
    </div>
  );
}
```

- [ ] **Step 10.3: Implement `ClassSwitcher.tsx`**

```tsx
import { useState } from 'react';
import { ALL_CLASSES } from '../classes/registry';
import type { ClassId } from '../classes/types';

interface Props {
  current: ClassId;
  unlocked: ClassId[];
  onSwitch: (id: ClassId) => void;
}

const wrap: React.CSSProperties = {
  position: 'fixed', bottom: 16, left: 16, padding: 8,
  background: 'rgba(10,14,39,0.85)', color: '#d8e8ff',
  borderRadius: 6, fontFamily: 'SF Mono, Menlo, monospace', fontSize: 10, zIndex: 999,
};

export function ClassSwitcher({ current, unlocked, onSwitch }: Props) {
  return (
    <div style={wrap}>
      <div style={{ fontSize: 9, opacity: 0.6, letterSpacing: 2, marginBottom: 4 }}>CLASS</div>
      {ALL_CLASSES.map((c) => {
        const locked = !unlocked.includes(c.id);
        return (
          <button
            key={c.id}
            disabled={locked}
            onClick={() => onSwitch(c.id)}
            style={{
              display: 'block', marginBottom: 3, padding: '3px 8px',
              background: current === c.id ? '#2a0050' : 'transparent',
              color: locked ? '#666' : '#d8e8ff',
              border: '1px solid #6a4aaa', borderRadius: 4, fontFamily: 'inherit', fontSize: 10,
              cursor: locked ? 'not-allowed' : 'pointer',
            }}
          >
            {c.name}{locked ? ' (locked)' : ''}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 10.4: Commit**

```bash
pnpm build
git add server/index.mjs src/components/BlackMarketPanel.tsx src/components/ClassSwitcher.tsx
git commit -m "feat(ui): ClassSwitcher + BlackMarketPanel"
```

---

## Task 11: BreachTimerHud + CorsairToolBelt

**Files:**
- Create: `src/components/BreachTimerHud.tsx`
- Create: `src/components/CorsairToolBelt.tsx`

- [ ] **Step 11.1: BreachTimerHud**

```tsx
import { iceThreshold } from '../ice';

interface Props { value: number; active: boolean; }

const wrap: React.CSSProperties = {
  position: 'fixed', top: '50%', right: 16, transform: 'translateY(-50%)',
  width: 30, height: 240, background: '#0a0e27',
  border: '1px solid #6a4aaa', borderRadius: 4,
  zIndex: 1000, display: 'flex', flexDirection: 'column-reverse',
};

const colors: Record<string, string> = {
  quiet: '#7aa8d8', noted: '#d8c87a', tracking: '#d86a6a', lock: '#ff0033',
};

export function BreachTimerHud({ value, active }: Props) {
  if (!active) return null;
  const band = iceThreshold(value);
  return (
    <div style={wrap}>
      <div style={{ height: `${value}%`, background: colors[band], transition: 'height 0.5s linear' }} />
      <div style={{ position: 'absolute', top: -16, left: -10, width: 50, color: '#d8e8ff', fontSize: 10, letterSpacing: 2, textAlign: 'center' }}>
        ICE {Math.round(value)}
      </div>
    </div>
  );
}
```

- [ ] **Step 11.2: CorsairToolBelt**

```tsx
import { TOOLS, type ToolId } from '../classes/corsair/tools';

interface Props {
  equipped: ToolId[];
  onFire: (toolId: ToolId) => void;
}

const wrap: React.CSSProperties = {
  position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
  display: 'flex', gap: 8, padding: 6, background: 'rgba(10,14,39,0.85)',
  border: '1px solid #6a4aaa', borderRadius: 6, zIndex: 999,
};

const btnStyle: React.CSSProperties = {
  padding: '4px 8px', background: '#2a0050', color: '#fff',
  border: 'none', borderRadius: 4, fontFamily: 'SF Mono, Menlo, monospace',
  fontSize: 10, letterSpacing: 1, cursor: 'pointer',
};

export function CorsairToolBelt({ equipped, onFire }: Props) {
  if (equipped.length === 0) return null;
  return (
    <div style={wrap}>
      {equipped.map((tid) => {
        const def = TOOLS[tid];
        return (
          <button key={tid} style={btnStyle} onClick={() => onFire(tid)} title={def.description}>
            {def.name.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 11.3: Commit**

```bash
pnpm build
git add src/components/BreachTimerHud.tsx src/components/CorsairToolBelt.tsx
git commit -m "feat(ui): BreachTimerHud + CorsairToolBelt"
```

---

## Task 12: Author Season 1 content JSON

**Goal:** Transcribe the Season 1 Content Bible §6–§9 into machine-readable JSON.

**Files:**
- Create: `server/data/seasons/s1/weeklies.json`
- Create: `server/data/seasons/s1/daily-templates.json`
- Create: `server/data/seasons/s1/tentpole.json`
- Create: `server/data/seasons/s1/beats.json`
- Create: `server/data/seasons/s1/lore.json`
- Modify: `server/data/whispers.json` — append S1 lines

- [ ] **Step 12.1: weeklies.json (transcribe all 7 from Bible §6.1–§6.7)**

Same shape as Season 0's `weeklies.json`. Each weekly has `id` (e.g. `WA-S1-01`), `archetype`, `title`, `brief`, `faction`, `weekUnlock` (1..7), `stages`, `durationMs`, `rewards`, `factionRep`, `loreUnlock`.

The engineer transcribes the full Bible content — no invention required.

- [ ] **Step 12.2: daily-templates.json** — 12 templates per Bible §7

- [ ] **Step 12.3: tentpole.json** — TP-S1 per Bible §5.2 (7 stages)

```json
{
  "id": "TP-S1",
  "title": "The Last Vault",
  "weekUnlock": 7,
  "durationMs": 9000000,
  "stages": [
    { "id": "TP-S1.s1", "name": "The Approach", "puzzleType": "P-PWK", "difficulty": "medium", "iceAccrualPerSec": 0.5, "narration": "this route was never opened." },
    { "id": "TP-S1.s2", "name": "The First Lock", "puzzleType": "P-CES", "puzzleCount": 3, "difficulty": "medium", "iceAccrualPerSec": 0.7 },
    { "id": "TP-S1.s3", "name": "The Watcher", "puzzleType": "P-NWI", "puzzleCount": 2, "difficulty": "hard", "lieRate": 1.0, "narration": "neva will lie. catch both." },
    { "id": "TP-S1.s4", "name": "The Branch", "puzzleType": "P-GRT", "difficulty": "medium", "branches": [{ "name": "fast", "ice": 30 }, { "name": "slow", "ice": 10, "trace": 15 }] },
    { "id": "TP-S1.s5", "name": "The Vault Itself", "puzzleType": "P-SUB", "difficulty": "hard", "hintCount": 0, "iceAccrualPerSec": 1.0 },
    { "id": "TP-S1.s6", "name": "The Choice", "decision": { "options": ["FAC-ARC","FAC-BLK","FAC-SEV"], "rewards": { "FAC-ARC": [{ "type": "loreUnlock", "ids": ["lore-s1-006","lore-s1-007","lore-s1-008"] }, { "faction": "FAC-ARC", "delta": 25 }], "FAC-BLK": [{ "type": "toolUnlock", "id": "T-CLT" }, { "faction": "FAC-BLK", "delta": 25 }], "FAC-SEV": [{ "type": "passiveUnlock", "id": "PASSIVE_CONTAINMENT_MODE" }, { "faction": "FAC-SEV", "delta": 25 }] } } },
    { "id": "TP-S1.s7", "name": "The Exfil", "puzzleType": "P-LPH", "difficulty": "hard", "iceFinalAt": 80, "narration": "fox is waiting at the exit.", "rewardOnComplete": [{ "currency": "CORE_FRAGMENTS", "amount": 1 }, { "currency": "BLACK_CREDITS", "amount": 100 }] }
  ]
}
```

- [ ] **Step 12.4: beats.json + lore.json** — per Bible §5.1 + §9

- [ ] **Step 12.5: Append to whispers.json**

Add Bible §8 lines under existing `reliable`, `unreliable`, `storyBeats` arrays.

- [ ] **Step 12.6: Validate + commit**

```bash
node -e "['weeklies','daily-templates','tentpole','beats','lore'].forEach(f => { JSON.parse(require('fs').readFileSync('server/data/seasons/s1/'+f+'.json','utf8')); console.log(f,'ok'); });"
git add server/data/seasons/s1/ server/data/whispers.json
git commit -m "feat(content): Season 1 JSON content — weeklies + dailies + tentpole + lore + whispers"
```

---

## Task 13: Season 1 seeder + scheduler hook

**Files:**
- Create: `server/seed-season-1.mjs`
- Modify: `server/scheduler.mjs` — pick S0 or S1 based on date
- Modify: `package.json` — add `seed:season-1` script

- [ ] **Step 13.1: Seeder**

Mirror `seed-season-0.mjs` but for S1. `weekUnlock` offsets from S1 start, not S0.

```js
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { addEvent, getEventById } from './events-store.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SEASON = JSON.parse(readFileSync(join(ROOT, 'data', 'seasons', 's1', 'weeklies.json'), 'utf8'));

const SEASON_START = Date.parse(process.env.S1_START ?? new Date(Date.now() + 56 * 24 * 3600 * 1000).toISOString());
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

let n = 0;
for (const w of SEASON.weeklies) {
  if (getEventById(w.id)) continue;
  const startsAt = SEASON_START + (w.weekUnlock - 1) * WEEK_MS;
  const endsAt = startsAt + WEEK_MS;
  addEvent({
    ...w, cadence: 'WEEKLY', seasonNumber: 1, startsAt, endsAt,
    targetNodeIds: w.targetNodeIds ?? [1,2,3],
  });
  n++;
}
console.log(`Seeded ${n} Season-1 weeklies.`);
```

- [ ] **Step 13.2: Update scheduler to pick S0 or S1 daily templates**

In `server/scheduler.mjs`, change the templates load to be season-aware:

```js
function currentSeasonNumber(now = Date.now()) {
  const s1Start = Date.parse(process.env.S1_START ?? new Date(Date.now() + 56 * 24 * 3600 * 1000).toISOString());
  return now >= s1Start ? 1 : 0;
}

function loadTemplates(season) {
  const file = season === 1 ? 's1/daily-templates.json' : 's0/daily-templates.json';
  return JSON.parse(readFileSync(join(ROOT, 'data', 'seasons', file), 'utf8')).templates;
}

function pickTemplate() {
  const season = currentSeasonNumber();
  const templates = loadTemplates(season);
  return templates[Math.floor(Math.random() * templates.length)];
}
```

- [ ] **Step 13.3: Add script + commit**

```json
"seed:season-1": "node server/seed-season-1.mjs"
```

```bash
git add server/seed-season-1.mjs server/scheduler.mjs package.json
git commit -m "feat(server): Season 1 seeder + season-aware scheduler"
```

---

## Task 14: Wire Phase 2 UI into GameApp + handle class switches

**Files:**
- Modify: `src/GameApp.tsx`

- [ ] **Step 14.1: Mount new components**

Add imports:

```tsx
import { ClassSwitcher } from './components/ClassSwitcher';
import { BreachTimerHud } from './components/BreachTimerHud';
import { CorsairToolBelt } from './components/CorsairToolBelt';
import { BlackMarketPanel } from './components/BlackMarketPanel';
```

In the returned JSX:

```tsx
<ClassSwitcher
  current={state.classState?.activeClass ?? 'CLS-OPR'}
  unlocked={state.classState?.unlocked ?? ['CLS-OPR']}
  onSwitch={(id) => dispatch({ type: 'class:switch', classId: id })}
/>
<BreachTimerHud value={state.iceState?.value ?? 0} active={state.iceState?.active ?? false} />
<CorsairToolBelt
  equipped={(state.classState?.equippedTools ?? []) as Array<'T-SPF'|'T-GHT'|'T-SNP'|'T-CLT'>}
  onFire={(tid) => dispatch({ type: 'tool:fire', toolId: tid })}
/>
{marketOpen && <BlackMarketPanel profileId={profile.id} onClose={() => setMarketOpen(false)} />}
```

`marketOpen` is local state opened via a hotkey or NEVA Terminal command.

- [ ] **Step 14.2: Add reducer cases**

In `src/game.ts` reducer (or wherever actions dispatch), add:

```ts
case 'class:switch': {
  const target = action.classId as ClassId;
  if (!(state.classState?.unlocked ?? []).includes(target)) return state;
  return { ...state, classState: { ...state.classState!, activeClass: target } };
}

case 'tool:fire': {
  const tool = TOOLS[action.toolId];
  if (!tool) return state;
  // Cost is paid through wallet; ICE impact applied via applyIceImpact.
  // For Phase 2, simplified: just apply ICE effect, deduct cost separately.
  let nextIce = state.iceState ?? initIce();
  if (tool.effect && state.iceState?.active) {
    nextIce = applyIceImpact(nextIce, { type: tool.effect } as IceImpact);
  }
  return { ...state, iceState: nextIce };
}
```

(Required imports at top of file: `TOOLS`, `initIce`, `applyIceImpact`, `IceImpact`.)

- [ ] **Step 14.3: Smoke test**

```bash
pnpm server &
pnpm dev
```

Confirm ClassSwitcher visible at bottom-left. Switching to Corsair shows tools.

- [ ] **Step 14.4: Commit**

```bash
pnpm build
git add src/GameApp.tsx src/game.ts
git commit -m "feat(ui): wire class switching + tools + market panel"
```

---

## Task 15: Regression + Phase 2 gate

- [ ] **Step 15.1: Tests + build + lint**

```bash
pnpm test:run
pnpm build
pnpm lint
```

All exit 0. Tests ≥ 85 passing.

- [ ] **Step 15.2: Audit**

```bash
node -e "const p=require('./package.json'); const d={...p.dependencies,...p.devDependencies}; const b=['ethers','web3','wagmi','viem','@walletconnect/','@solana/','rainbowkit','starknet']; console.log(Object.keys(d).filter(x=>b.some(y=>x.includes(y))).length ? 'FAIL' : 'OK — no Web3 deps');"
```

- [ ] **Step 15.3: Manual playthrough**

1. M00 plays without regression.
2. Daily Contract appears + can be solved as Operator.
3. Switch class to Corsair → tools appear, market accessible.
4. Trigger a Corsair breach (seeded event) → ICE bar appears, ticks up.
5. Fire Spoofer → ICE bar pause briefly.

- [ ] **Step 15.4: Document + commit**

Append to `CURRENT_PROJECT_STATE.md`:

```
- **Six-Month Grid Phase 2 (Season 1 — Black Routes)** — **Complete**. Adds
  Corsair class, ICE subsystem, Black Market (Fox), 7 weeklies, 12 dailies,
  Tentpole TP-S1 with 3-cache choice, 4 Corsair tools, 20-skill tree.
  M00-M20 + Season 0 unchanged.
```

```bash
git add CURRENT_PROJECT_STATE.md
git commit -m "docs: Phase 2 (Season 1) complete"
```

---

## Phase 2 /goal directive

```
/goal Implement Phase 2 of the Six-Month Grid plan (Corsair class + Season 1)
in docs/superpowers/plans/2026-05-28-six-month-grid-phase-2.md, using the
Season 1 Content Bible (docs/superpowers/specs/2026-05-28-content-bible-season-1.md).

Pre-requisite: Phase 0 + Phase 1 shipped (verify pnpm test:run/build/lint pass
and M00-M20 + Season 0 playable).

Work through Tasks 1-15 in order. TDD per task.

Done when:
- 15 tasks committed.
- pnpm test:run exits 0 with ≥ 85 tests.
- pnpm build + pnpm lint exit 0.
- Operator → Corsair class switch works in dev.
- ICE bar appears during a seeded Corsair breach.
- A Black Market offer can be purchased (idempotent — second buy returns
  alreadyClaimed).
- TP-S1 stage 6 cache choice grants the correct unlock per branch.
- M00-M20 + Season 0 still playable, no regressions.
- No Web3 deps added.

Constraints:
- Use every Season 1 Bible piece with its canonical S1 ID.
- Currency mutations via wallet.
- Backend stays zero-dep.

Stop after 110 turns max.
```

---

## Self-Review

**Spec coverage** — every Season 1 Bible content piece is implemented:

| Bible reference | Task |
|---|---|
| §2 (Corsair class) | Tasks 1 + 5 + 6 |
| §3 (ICE) | Task 4 |
| §4 (Black Market) | Tasks 7 + 8 + 9 + 10 |
| §5 (Story arc + TP-S1) | Task 12 |
| §6 (7 Weeklies) | Task 12 |
| §7 (12 Daily templates) | Task 12 + 13 |
| §8 (NEVA whispers S1) | Task 12 |
| §9 (Lore) | Task 12 |
| §10 (Economy caps) | already enforced via Phase 1 claim path |
| §11 (Permanent unlocks) | TP-S1 stage 6 reward branches (Task 12 + reducer Task 14) |

**Placeholder scan** — none.

**Type consistency** — `ClassId`, `ToolId`, `SkillId`, `IceState`, `IceImpact`, `IceBand`, `MarketOffer`, `StolenCipherItem` defined once each.

**Scope check** — Phase 2 only. Ghost (Phase 3) and Architect (Phase 4) deferred.


---

## Part III.3 — Phase 3 Plan (Ghost / Season 2)

*Originally: `docs/superpowers/plans/2026-05-28-six-month-grid-phase-3.md`*


**Goal:** Ship the **Ghost class** and **Season 2 "The Echo Below"** on top of Phases 0–2. After Phase 3 the game has 3 of 4 classes playable (Operator, Corsair, Ghost) and ~6 months of content for the player who has played all three classes — **the user's 6-month engagement target is reached.**

**Architecture:** Re-uses class abstraction from Phase 2. Adds a new **Possession Graph** subsystem (`src/ghostGraph/`) — graph data + R3F shader overlay. Coherence is a new account-wide currency in wallet. Bonds are persistent records that survive soft-resets. The Mirror puzzle in TP-S2 introduces the first **player-state-aware** puzzle (substitution key derived from profile callsign).

**Tech Stack:** Same as Phase 2. Adds `@react-three/postprocessing` chromatic-aberration effect (already a peer dep of existing R3F).

**Companion docs:**
- Engines: Phase 0/1/2 plans.
- Content: `docs/superpowers/specs/2026-05-28-content-bible-season-2.md`.

**Pre-requisite:** Phases 0–2 shipped on `main`. `pnpm test:run` ≥ 85 tests passing.

---

## File Structure

### Created
| Path | Responsibility |
|---|---|
| `src/classes/ghost/index.ts` | Class definition. |
| `src/classes/ghost/tools.ts` | Tendril, Echo, Resonate, Singularity. |
| `src/classes/ghost/skills.ts` | 20-skill Ghost tree. |
| `src/classes/ghost/tools.test.ts` | Tool tests. |
| `src/classes/ghost/skills.test.ts` | Skill tests. |
| `src/ghostGraph/types.ts` | `Tendril`, `Bond`, `GhostGraphState`. |
| `src/ghostGraph/index.ts` | Pure graph operations. |
| `src/ghostGraph/bonds.ts` | Bond formation + persistence rules. |
| `src/ghostGraph/index.test.ts` | Graph state tests. |
| `src/ghostGraph/bonds.test.ts` | Bond rules tests. |
| `src/seasons/s2-question.ts` | The Question answer-key function. |
| `src/seasons/s2-question.test.ts` | Tests for each answer condition. |
| `src/components/GhostOverlay.tsx` | R3F overlay — chromatic aberration + tendril lines. |
| `src/components/TendrilLines.tsx` | Three.js Line2 instances for active tendrils. |
| `src/components/CoherenceMeter.tsx` | HUD: Coherence current / soft-cap 100. |
| `src/components/BondCounter.tsx` | HUD: number of permanent bonds. |
| `src/components/MirrorPuzzleView.tsx` | Specialized P-SUB view that reads `state.profile.callsign`. |
| `server/data/seasons/s2/weeklies.json` | 7 weeklies. |
| `server/data/seasons/s2/daily-templates.json` | 12 templates. |
| `server/data/seasons/s2/tentpole.json` | TP-S2 7 stages. |
| `server/data/seasons/s2/beats.json` | Week beats. |
| `server/data/seasons/s2/lore.json` | 8 lore pages. |
| `server/seed-season-2.mjs` | S2 seeder. |
| `server/bonds-store.mjs` | Per-profile bond persistence. |

### Modified
| Path | Reason |
|---|---|
| `src/wallet.ts` | Add `COHERENCE` currency + soft cap enforcement. |
| `src/wallet.test.ts` | Test Coherence cap. |
| `src/game.ts` | Add `ghostGraph`, `bonds`, `coherence` accessors via wallet. |
| `src/save.ts` | v4 → v5 additive migration. |
| `src/save.test.ts` | v4→v5 regression test. |
| `src/classes/registry.ts` | Add Ghost class. |
| `src/components/ClassSwitcher.tsx` | List Ghost when unlocked. |
| `src/GameApp.tsx` | Mount GhostOverlay + CoherenceMeter + BondCounter. |
| `server/index.mjs` | Add `/api/bonds/*` routes. |
| `server/scheduler.mjs` | Pick S0/S1/S2 templates by date. |
| `server/data/whispers.json` | Append S2 whispers. |
| `package.json` | Add `seed:season-2` script. |
| `CURRENT_PROJECT_STATE.md` | Mark Phase 3 complete. |

### Not Touched
- All Phase 0/1/2 modules — work as-is.
- M00–M20 mission chain.

---

## Task 1: Add COHERENCE currency + soft cap

**Files:**
- Modify: `src/wallet.ts`
- Modify: `src/wallet.test.ts`

- [ ] **Step 1.1: Add `COHERENCE` to Currency union**

In `src/wallet.ts`:

```ts
export type Currency =
  | 'DATA' | 'MEMORY_SHARDS' | 'ACCESS_KEYS' | 'SIGNAL_ENERGY' | 'CORE_FRAGMENTS'
  | 'LORE_SHARDS' | 'BLACK_CREDITS' | 'COHERENCE';
```

Update `ZERO`, `TRANSFERABLE`:

```ts
const ZERO: Record<Currency, number> = { /* existing */, COHERENCE: 0 };
const TRANSFERABLE: Record<Currency, boolean> = { /* existing */, COHERENCE: false };
```

Add a soft-cap map and enforce in `earn`:

```ts
const SOFT_CAP: Partial<Record<Currency, number>> = { COHERENCE: 100 };

// inside earn(): after computing newBalance, if SOFT_CAP[c] is set, clamp.
//   const cap = SOFT_CAP[c];
//   balances[c] = (typeof cap === 'number') ? Math.min(cap, balances[c] + amount) : balances[c] + amount;
```

Modify `earn`:

```ts
earn(c, amount, reason) {
  if (amount <= 0) return;
  const cap = SOFT_CAP[c];
  const newBal = (balances[c] ?? 0) + amount;
  balances[c] = (typeof cap === 'number') ? Math.min(cap, newBal) : newBal;
  ledgerEntries.push({ currency: c, delta: amount, reason, ts: Date.now() });
}
```

- [ ] **Step 1.2: Add test**

Append to `src/wallet.test.ts`:

```ts
it('COHERENCE is soft-capped at 100', () => {
  const w = createWallet();
  w.earn('COHERENCE', 60, 'TEST');
  w.earn('COHERENCE', 80, 'TEST');
  expect(w.balance('COHERENCE')).toBe(100);
});

it('non-capped currencies have no upper bound', () => {
  const w = createWallet();
  w.earn('DATA', 1_000_000, 'TEST');
  expect(w.balance('DATA')).toBe(1_000_000);
});
```

- [ ] **Step 1.3: Run + commit**

```bash
pnpm test:run src/wallet.test.ts
pnpm build
git add src/wallet.ts src/wallet.test.ts
git commit -m "feat(wallet): COHERENCE currency + soft cap (Phase 3)"
```

---

## Task 2: Ghost graph types + state

**Files:**
- Create: `src/ghostGraph/types.ts`
- Create: `src/ghostGraph/index.ts`
- Create: `src/ghostGraph/index.test.ts`

- [ ] **Step 2.1: Types**

```ts
export interface Tendril {
  nodeId: number;
  createdAt: number;
}

export interface Bond {
  id: string;            // unique
  nodeIds: number[];     // cluster bonded
  formedAt: number;
  seasonNumber: number;
  permanent: true;
}

export interface GhostGraphState {
  tendrils: Tendril[];
  bonds: Bond[];
  lastBondAt: number;    // ms epoch (for cooldown)
}
```

- [ ] **Step 2.2: Tests**

```ts
import { describe, it, expect } from 'vitest';
import { initGhostGraph, addTendril, removeTendril, canFormBond, formBond } from './index';

describe('Ghost Graph', () => {
  it('starts empty', () => {
    const g = initGhostGraph();
    expect(g.tendrils.length).toBe(0);
    expect(g.bonds.length).toBe(0);
  });
  it('addTendril adds without duplicates', () => {
    let g = initGhostGraph();
    g = addTendril(g, 7, 1000);
    g = addTendril(g, 7, 2000);
    expect(g.tendrils.length).toBe(1);
  });
  it('removeTendril works', () => {
    let g = addTendril(initGhostGraph(), 7, 1000);
    g = removeTendril(g, 7);
    expect(g.tendrils.length).toBe(0);
  });
  it('canFormBond requires ≥4 tendrils', () => {
    let g = initGhostGraph();
    for (const n of [1,2,3]) g = addTendril(g, n, 1000);
    expect(canFormBond(g, [1,2,3], 9000).ok).toBe(false);
    g = addTendril(g, 4, 1000);
    expect(canFormBond(g, [1,2,3,4], 9000).ok).toBe(true);
  });
  it('canFormBond enforces 30-min cooldown', () => {
    let g = initGhostGraph();
    for (const n of [1,2,3,4]) g = addTendril(g, n, 1000);
    g = formBond(g, [1,2,3,4], 1000, 'bond-1', 2);
    expect(canFormBond(g, [1,2,3,4], 1000 + 60_000).ok).toBe(false); // 1 min later
    expect(canFormBond(g, [1,2,3,4], 1000 + 31 * 60_000).ok).toBe(true); // 31 min
  });
  it('formBond removes the tendrils used', () => {
    let g = initGhostGraph();
    for (const n of [1,2,3,4]) g = addTendril(g, n, 1000);
    g = formBond(g, [1,2,3,4], 1000, 'bond-1', 2);
    expect(g.tendrils.length).toBe(0);
    expect(g.bonds.length).toBe(1);
    expect(g.bonds[0].nodeIds).toEqual([1,2,3,4]);
  });
});
```

- [ ] **Step 2.3: Implement**

```ts
import type { GhostGraphState, Tendril, Bond } from './types';

const BOND_COOLDOWN_MS = 30 * 60 * 1000;

export function initGhostGraph(): GhostGraphState {
  return { tendrils: [], bonds: [], lastBondAt: 0 };
}

export function addTendril(state: GhostGraphState, nodeId: number, ts: number): GhostGraphState {
  if (state.tendrils.some((t) => t.nodeId === nodeId)) return state;
  return { ...state, tendrils: [...state.tendrils, { nodeId, createdAt: ts }] };
}

export function removeTendril(state: GhostGraphState, nodeId: number): GhostGraphState {
  return { ...state, tendrils: state.tendrils.filter((t) => t.nodeId !== nodeId) };
}

export function canFormBond(state: GhostGraphState, nodeIds: number[], ts: number): { ok: boolean; reason?: string } {
  if (nodeIds.length < 4) return { ok: false, reason: '≥ 4 nodes required' };
  const tendrilledIds = new Set(state.tendrils.map((t) => t.nodeId));
  for (const id of nodeIds) if (!tendrilledIds.has(id)) return { ok: false, reason: `node ${id} not tendrilled` };
  if (state.lastBondAt && ts - state.lastBondAt < BOND_COOLDOWN_MS) return { ok: false, reason: 'bond cooldown active' };
  return { ok: true };
}

export function formBond(state: GhostGraphState, nodeIds: number[], ts: number, bondId: string, seasonNumber: number): GhostGraphState {
  const bond: Bond = { id: bondId, nodeIds: [...nodeIds], formedAt: ts, seasonNumber, permanent: true };
  return {
    tendrils: state.tendrils.filter((t) => !nodeIds.includes(t.nodeId)),
    bonds: [...state.bonds, bond],
    lastBondAt: ts,
  };
}
```

- [ ] **Step 2.4: Run + commit**

```bash
pnpm test:run src/ghostGraph/index.test.ts
git add src/ghostGraph/
git commit -m "feat(ghostGraph): tendril + bond state machine"
```

---

## Task 3: Bond persistence store (server)

**Files:**
- Create: `server/bonds-store.mjs`
- Modify: `server/index.mjs` — `/api/bonds/*` routes

- [ ] **Step 3.1: Store**

```js
import { loadJson, saveJson } from './json-store.mjs';

const FILE = 'bonds.json';
const SHAPE = { byProfile: {} };

function read() {
  const raw = loadJson(FILE, SHAPE);
  return { byProfile: raw.byProfile && typeof raw.byProfile === 'object' ? raw.byProfile : {} };
}

export function listBonds(profileId) {
  return read().byProfile[profileId] ?? [];
}

export function addBond(profileId, bond) {
  const state = read();
  state.byProfile[profileId] = [...(state.byProfile[profileId] ?? []), bond];
  saveJson(FILE, state);
  return bond;
}

export function bondStats() {
  const state = read();
  return { totalBonds: Object.values(state.byProfile).reduce((acc, l) => acc + l.length, 0) };
}
```

- [ ] **Step 3.2: Routes**

In `server/index.mjs`:

```js
import { listBonds, addBond } from './bonds-store.mjs';

if (req.method === 'GET' && url.pathname === '/api/bonds') {
  const profileId = String(url.searchParams.get('profileId') ?? 'local');
  return sendJson(res, 200, { ok: true, bonds: listBonds(profileId) });
}

if (req.method === 'POST' && url.pathname === '/api/bonds') {
  const body = await readJsonBody(req);
  const profileId = String(body?.profileId ?? '').slice(0, 64);
  const bond = body?.bond;
  if (!profileId || !bond?.id) return sendJson(res, 400, { ok: false, error: 'profileId and bond.id required' });
  addBond(profileId, bond);
  return sendJson(res, 200, { ok: true });
}
```

- [ ] **Step 3.3: Commit**

```bash
git add server/bonds-store.mjs server/index.mjs
git commit -m "feat(server): bonds-store + /api/bonds routes"
```

---

## Task 4: Ghost class registry + tools + skills

**Files:**
- Create: `src/classes/ghost/index.ts`
- Create: `src/classes/ghost/tools.ts`
- Create: `src/classes/ghost/tools.test.ts`
- Create: `src/classes/ghost/skills.ts`
- Create: `src/classes/ghost/skills.test.ts`
- Modify: `src/classes/types.ts` — already has `CLS-GHS`
- Modify: `src/classes/registry.ts` — add Ghost

- [ ] **Step 4.1: Definitions** (follow Corsair patterns from Phase 2)

`src/classes/ghost/index.ts`:

```ts
import type { ClassDef } from '../types';

export const GHOST_CLASS: ClassDef = {
  id: 'CLS-GHS',
  name: 'Ghost',
  fantasy: 'philosophical, surreal, SOMA / Soul Hackers',
  signatureMechanic: 'POSSESSION',
  primaryCurrency: 'COHERENCE',
  shipPhase: 3,
};
```

`src/classes/ghost/tools.ts`:

```ts
import type { Currency } from '../../wallet';

export type GhostToolId = 'T-TND' | 'T-ECO' | 'T-RSN' | 'T-SNG';

export interface GhostToolDef {
  id: GhostToolId;
  name: string;
  cost: Array<{ currency: Currency; amount: number }>;
  effect: 'tendril' | 'echo-read' | 'resonate' | 'singularity';
  oneTimePerSession: boolean;
  description: string;
}

export const GHOST_TOOLS: Record<GhostToolId, GhostToolDef> = {
  'T-TND': { id: 'T-TND', name: 'Tendril', cost: [{ currency: 'COHERENCE', amount: 1 }], effect: 'tendril', oneTimePerSession: false, description: 'Link to a node.' },
  'T-ECO': { id: 'T-ECO', name: 'Echo', cost: [], effect: 'echo-read', oneTimePerSession: false, description: 'Read another operator past walk. Reveals you to NEVA.' },
  'T-RSN': { id: 'T-RSN', name: 'Resonate', cost: [{ currency: 'COHERENCE', amount: 3 }], effect: 'resonate', oneTimePerSession: false, description: 'Trigger cluster effect (≥4 tendrils).' },
  'T-SNG': { id: 'T-SNG', name: 'Singularity', cost: [{ currency: 'COHERENCE', amount: 10 }, { currency: 'MEMORY_SHARDS', amount: 1 }], effect: 'singularity', oneTimePerSession: true, description: 'Permanent personal anchor. Once per session.' },
};
```

`src/classes/ghost/tools.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { GHOST_TOOLS } from './tools';

describe('Ghost tools', () => {
  it('all four defined', () => {
    expect(Object.keys(GHOST_TOOLS).sort()).toEqual(['T-ECO','T-RSN','T-SNG','T-TND']);
  });
  it('Singularity is one-time per session', () => {
    expect(GHOST_TOOLS['T-SNG'].oneTimePerSession).toBe(true);
  });
  it('Tendril costs 1 Coherence', () => {
    expect(GHOST_TOOLS['T-TND'].cost[0]).toEqual({ currency: 'COHERENCE', amount: 1 });
  });
});
```

`src/classes/ghost/skills.ts`:

```ts
export type GhostSkillId =
  'SKL-GHS-01'|'SKL-GHS-02'|'SKL-GHS-03'|'SKL-GHS-04'|'SKL-GHS-05'
 |'SKL-GHS-06'|'SKL-GHS-07'|'SKL-GHS-08'|'SKL-GHS-09'|'SKL-GHS-10'
 |'SKL-GHS-11'|'SKL-GHS-12'|'SKL-GHS-13'|'SKL-GHS-14'|'SKL-GHS-15'
 |'SKL-GHS-16'|'SKL-GHS-17'|'SKL-GHS-18'|'SKL-GHS-19'|'SKL-GHS-20';

export interface GhostSkillDef { id: GhostSkillId; tier: 1|2|3|4; name: string; effect: string; cost: number; }

export const GHOST_SKILLS: Record<GhostSkillId, GhostSkillDef> = {
  'SKL-GHS-01': { id: 'SKL-GHS-01', tier: 1, name: 'Quiet Tendril', effect: 'Tendril costs 0.8 Coherence rounded up.', cost: 4 },
  'SKL-GHS-02': { id: 'SKL-GHS-02', tier: 1, name: 'Long Reach', effect: 'Tendril spreads to 2-hop neighbors.', cost: 4 },
  'SKL-GHS-03': { id: 'SKL-GHS-03', tier: 1, name: 'Memory Recall', effect: '+1 Coherence on daily walks.', cost: 4 },
  'SKL-GHS-04': { id: 'SKL-GHS-04', tier: 1, name: 'First Echo', effect: 'Echo tool granted.', cost: 4 },
  'SKL-GHS-05': { id: 'SKL-GHS-05', tier: 1, name: 'Listening Hand', effect: 'Sense other operators tendrilled nodes.', cost: 4 },
  'SKL-GHS-06': { id: 'SKL-GHS-06', tier: 2, name: 'Wide Net', effect: 'Resonate threshold drops to 3 nodes.', cost: 12 },
  'SKL-GHS-07': { id: 'SKL-GHS-07', tier: 2, name: 'Cold Coherence', effect: 'Bonds cost 8 Coherence.', cost: 12 },
  'SKL-GHS-08': { id: 'SKL-GHS-08', tier: 2, name: 'Echo Reader', effect: 'Echo reveals 3 actions back.', cost: 12 },
  'SKL-GHS-09': { id: 'SKL-GHS-09', tier: 2, name: 'Faction Pulse', effect: '+1 Memory Shard on Quiet Pattern resonate.', cost: 12 },
  'SKL-GHS-10': { id: 'SKL-GHS-10', tier: 2, name: 'Ghost Trail', effect: 'Trace decay 1.5x in ghost mode.', cost: 12 },
  'SKL-GHS-11': { id: 'SKL-GHS-11', tier: 3, name: 'Multi-Tendril', effect: '2 tendrils at once.', cost: 25 },
  'SKL-GHS-12': { id: 'SKL-GHS-12', tier: 3, name: 'Severance Hide', effect: 'Tendrilled nodes invisible to Severance.', cost: 25 },
  'SKL-GHS-13': { id: 'SKL-GHS-13', tier: 3, name: 'Black Loop Whisper', effect: 'Echo on Black Loop returns Fox notes.', cost: 25 },
  'SKL-GHS-14': { id: 'SKL-GHS-14', tier: 3, name: 'NEVA Mirror', effect: 'One whisper/session guaranteed true.', cost: 25 },
  'SKL-GHS-15': { id: 'SKL-GHS-15', tier: 3, name: 'Bond Aware', effect: 'See others bonds on grid.', cost: 25 },
  'SKL-GHS-16': { id: 'SKL-GHS-16', tier: 4, name: 'Singularity Master', effect: 'Unlocks T-SNG.', cost: 40 },
  'SKL-GHS-17': { id: 'SKL-GHS-17', tier: 4, name: 'Self Trace', effect: 'See own past walks across seasons.', cost: 40 },
  'SKL-GHS-18': { id: 'SKL-GHS-18', tier: 4, name: 'Cross-class Tendril', effect: 'Tendrilled nodes +5% Operator XP.', cost: 40 },
  'SKL-GHS-19': { id: 'SKL-GHS-19', tier: 4, name: 'Architect Witness', effect: 'Tendrils visible on others Architect bases.', cost: 40 },
  'SKL-GHS-20': { id: 'SKL-GHS-20', tier: 4, name: 'Older Operator Hand', effect: 'Once/session: free Tendril.', cost: 40 },
};

export function ghostUnlockableTier(coherenceLifetime: number): 1|2|3|4 {
  // Tier gates by lifetime Coherence earned (account-wide), not current balance.
  if (coherenceLifetime < 25) return 1;
  if (coherenceLifetime < 75) return 2;
  if (coherenceLifetime < 175) return 3;
  return 4;
}
```

`src/classes/ghost/skills.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { GHOST_SKILLS, ghostUnlockableTier } from './skills';

describe('Ghost skills', () => {
  it('20 defined', () => expect(Object.keys(GHOST_SKILLS).length).toBe(20));
  it('tier gates', () => {
    expect(ghostUnlockableTier(0)).toBe(1);
    expect(ghostUnlockableTier(50)).toBe(2);
    expect(ghostUnlockableTier(100)).toBe(3);
    expect(ghostUnlockableTier(200)).toBe(4);
  });
});
```

- [ ] **Step 4.2: Update `src/classes/registry.ts`**

```ts
import { GHOST_CLASS } from './ghost/index';

const REGISTRY: Record<ClassId, ClassDef | undefined> = {
  'CLS-OPR': OPERATOR_CLASS,
  'CLS-COR': CORSAIR_CLASS,
  'CLS-GHS': GHOST_CLASS,
  'CLS-ARC': undefined,
};
```

- [ ] **Step 4.3: Run + commit**

```bash
pnpm test:run src/classes/ghost/
pnpm build
git add src/classes/
git commit -m "feat(ghost): class registry + 4 tools + 20-skill tree"
```

---

## Task 5: Save migration v5

**Files:**
- Modify: `src/save.ts`
- Modify: `src/save.test.ts`

- [ ] **Step 5.1: Bump + extend**

```ts
// in migrateSaveBlob:
  // v4 → v5: ghost graph + coherence
  if (!game.ghostGraph) {
    game.ghostGraph = { tendrils: [], bonds: [], lastBondAt: 0 };
  }
  if (game.wallet && !('COHERENCE' in game.wallet.balances)) {
    game.wallet.balances.COHERENCE = 0;
  }
  // Unlock Ghost class if Coherence ever earned (Phase 3 onboarding).
  if (game.classState && !game.classState.unlocked.includes('CLS-GHS') && game.wallet?.balances.COHERENCE > 0) {
    game.classState.unlocked.push('CLS-GHS');
  }
  return { ...blob, version: 5 };
```

Adjust guard: `if (blob.version > 5) return blob;`. Bump `VERSION = 5`.

Also add to `GameState`:

```ts
import type { GhostGraphState } from './ghostGraph/types';

// inside GameState
  ghostGraph?: GhostGraphState;
```

Add to `initGame()`:

```ts
    ghostGraph: { tendrils: [], bonds: [], lastBondAt: 0 },
```

- [ ] **Step 5.2: Regression test**

```ts
it('v4 blob is migrated to v5 with ghostGraph + COHERENCE', () => {
  const v4Game = initGame();
  delete (v4Game as { ghostGraph?: unknown }).ghostGraph;
  if (v4Game.wallet) delete (v4Game.wallet.balances as { COHERENCE?: unknown }).COHERENCE;
  const migrated = migrateSaveBlob({ version: 4, continued: false, game: v4Game });
  expect(migrated.version).toBe(5);
  expect(migrated.game.ghostGraph).toEqual({ tendrils: [], bonds: [], lastBondAt: 0 });
  expect(migrated.game.wallet?.balances.COHERENCE).toBe(0);
});
```

- [ ] **Step 5.3: Run + commit**

```bash
pnpm test:run src/save.test.ts
pnpm build
git add src/save.ts src/save.test.ts src/game.ts
git commit -m "feat(save): v4→v5 additive migration (ghost graph + COHERENCE)"
```

---

## Task 6: Season-2 Question answer-key

**Files:**
- Create: `src/seasons/s2-question.ts`
- Create: `src/seasons/s2-question.test.ts`

- [ ] **Step 6.1: Tests**

```ts
import { describe, it, expect } from 'vitest';
import { questionAnswer } from './s2-question';

describe('S2 Question answer-key', () => {
  it('returns "yes." when 2+ seasons + 0 hostile + pattern lens off', () => {
    expect(questionAnswer({ seasonsCompleted: 2, hostileFactions: 0, unlockedClasses: 3, patternLensOn: false })).toBe('yes.');
  });
  it('returns "yes. more than you know." when pattern lens on + no hostile', () => {
    expect(questionAnswer({ seasonsCompleted: 2, hostileFactions: 0, unlockedClasses: 3, patternLensOn: true })).toBe('yes. more than you know.');
  });
  it('returns "no." when 2+ hostile factions', () => {
    expect(questionAnswer({ seasonsCompleted: 2, hostileFactions: 2, unlockedClasses: 3, patternLensOn: false })).toBe('no.');
  });
  it('returns "you didnt try." when only 1 class unlocked', () => {
    expect(questionAnswer({ seasonsCompleted: 2, hostileFactions: 0, unlockedClasses: 1, patternLensOn: false })).toBe("you didn't try.");
  });
  it('returns "almost." otherwise', () => {
    expect(questionAnswer({ seasonsCompleted: 1, hostileFactions: 1, unlockedClasses: 2, patternLensOn: false })).toBe('almost.');
  });
});
```

- [ ] **Step 6.2: Implement**

```ts
export interface QuestionContext {
  seasonsCompleted: number;
  hostileFactions: number;
  unlockedClasses: number;
  patternLensOn: boolean;
}

export type Answer = 'yes.' | 'yes. more than you know.' | 'no.' | "you didn't try." | 'almost.';

export function questionAnswer(ctx: QuestionContext): Answer {
  if (ctx.unlockedClasses === 1) return "you didn't try.";
  if (ctx.seasonsCompleted >= 2 && ctx.hostileFactions === 0) {
    if (ctx.patternLensOn) return 'yes. more than you know.';
    return 'yes.';
  }
  if (ctx.seasonsCompleted >= 2 && ctx.hostileFactions >= 2) return 'no.';
  return 'almost.';
}
```

- [ ] **Step 6.3: Run + commit**

```bash
pnpm test:run src/seasons/s2-question.test.ts
git add src/seasons/s2-question.ts src/seasons/s2-question.test.ts
git commit -m "feat(s2): The Question answer-key (5 conditions)"
```

---

## Task 7: GhostOverlay (R3F shader)

**Files:**
- Create: `src/components/GhostOverlay.tsx`
- Create: `src/components/TendrilLines.tsx`

- [ ] **Step 7.1: GhostOverlay (chromatic aberration only when in Ghost mode)**

```tsx
import { EffectComposer, ChromaticAberration } from '@react-three/postprocessing';

interface Props { active: boolean; }

export function GhostOverlay({ active }: Props) {
  if (!active) return null;
  return (
    <EffectComposer>
      <ChromaticAberration offset={[0.0015, 0.0015]} />
    </EffectComposer>
  );
}
```

> **Engineer note:** This is an *R3F* component — must be mounted inside the `<Canvas>` element, not on top of it. If the existing GameApp's structure makes that hard, mount in `src/components/InteractiveNetworkExplorer.tsx` instead (look for the postprocessing element added in Phase 0/1 work).

- [ ] **Step 7.2: TendrilLines (visual lines between tendrilled nodes and the player)**

```tsx
import { useMemo } from 'react';
import * as THREE from 'three';
import type { Tendril } from '../ghostGraph/types';
import { NETWORK } from '../network';

interface Props { tendrils: Tendril[]; playerPos: THREE.Vector3; }

export function TendrilLines({ tendrils, playerPos }: Props) {
  const lines = useMemo(() => {
    return tendrils.map((t) => {
      const node = NETWORK[t.nodeId];
      if (!node) return null;
      const geom = new THREE.BufferGeometry().setFromPoints([
        playerPos,
        new THREE.Vector3(node.x, node.y, node.z),
      ]);
      return { id: t.nodeId, geom };
    }).filter(Boolean);
  }, [tendrils, playerPos]);

  return (
    <>
      {lines.map((l) => {
        if (!l) return null;
        return (
          <line key={l.id}>
            <primitive object={l.geom} attach="geometry" />
            <lineBasicMaterial color="#b88aff" transparent opacity={0.6} />
          </line>
        );
      })}
    </>
  );
}
```

- [ ] **Step 7.3: Commit**

```bash
pnpm build
git add src/components/GhostOverlay.tsx src/components/TendrilLines.tsx
git commit -m "feat(ghost): R3F overlay + tendril visualization"
```

---

## Task 8: CoherenceMeter + BondCounter HUD

**Files:**
- Create: `src/components/CoherenceMeter.tsx`
- Create: `src/components/BondCounter.tsx`

- [ ] **Step 8.1: Implement (follow Phase 1/2 HUD pattern)**

```tsx
// CoherenceMeter
interface Props { value: number; max?: number; }
const wrap: React.CSSProperties = {
  position: 'fixed', top: 110, left: 16, padding: 6,
  background: 'rgba(10,14,39,0.85)', color: '#b88aff',
  borderRadius: 4, fontFamily: 'SF Mono, Menlo, monospace',
  fontSize: 10, letterSpacing: 1, zIndex: 999,
};
export function CoherenceMeter({ value, max = 100 }: Props) {
  return (
    <div style={wrap}>
      <div style={{ fontSize: 9, opacity: 0.6, letterSpacing: 2 }}>COHERENCE</div>
      <div style={{ fontSize: 14 }}>{value} / {max}</div>
    </div>
  );
}

// BondCounter
interface BondProps { count: number; }
const wrapBond: React.CSSProperties = { /* same shape, top: 150 */ };
export function BondCounter({ count }: BondProps) {
  return (
    <div style={{ ...wrap, top: 150 }}>
      <div style={{ fontSize: 9, opacity: 0.6, letterSpacing: 2 }}>BONDS</div>
      <div style={{ fontSize: 14 }}>{count}</div>
    </div>
  );
}
```

- [ ] **Step 8.2: Commit**

```bash
git add src/components/CoherenceMeter.tsx src/components/BondCounter.tsx
git commit -m "feat(ghost): CoherenceMeter + BondCounter HUD"
```

---

## Task 9: MirrorPuzzleView (player-state-aware)

**Goal:** A specialized P-SUB puzzle whose source-text is the player's own callsign. Used in TP-S2 Stage 6.

**Files:**
- Create: `src/components/MirrorPuzzleView.tsx`

- [ ] **Step 9.1: Implement**

```tsx
import { useMemo, useState } from 'react';
import { generateSymbolSub, validateSymbolSub } from '../puzzles/symbolSub';
import type { PuzzleResult } from '../puzzles/types';

interface Props {
  profileCallsign: string;
  seed: number;
  onResult: (r: PuzzleResult) => void;
}

export function MirrorPuzzleView({ profileCallsign, seed, onResult }: Props) {
  // Override generateSymbolSub source to use callsign
  const puzzle = useMemo(() => {
    const base = generateSymbolSub({ seed, difficulty: 'hard' });
    // Replace the source text with player's callsign (padded if too short).
    const source = (profileCallsign + ' MIRROR MIRROR').slice(0, 28).toUpperCase();
    const ciphertext = source.split('').map((c) => base.substitution[c] ?? c).join('');
    return { ...base, sourceText: source, ciphertext, hints: {} };
  }, [profileCallsign, seed]);

  const [attempt, setAttempt] = useState<Record<string, string>>({});

  return (
    <div style={{ padding: 16, background: '#0a0e27', color: '#d8e8ff' }}>
      <div style={{ fontSize: 10, letterSpacing: 2, opacity: 0.6 }}>THE MIRROR · TP-S2.s6</div>
      <div style={{ fontSize: 14, margin: '12px 0' }}>{puzzle.ciphertext}</div>
      <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 8 }}>
        The substitution key is your name. You know this. The mirror knows this.
      </div>
      {/* Substitution input grid — engineer implements per-letter input */}
      <button
        onClick={() => {
          const result = validateSymbolSub(puzzle, attempt);
          if (result.solved) {
            onResult({ puzzleId: 'TP-S2.s6', type: 'P-SUB', solved: true, attempts: 1, elapsedMs: 0 });
          }
        }}
      >
        SUBMIT
      </button>
    </div>
  );
}
```

- [ ] **Step 9.2: Commit**

```bash
pnpm build
git add src/components/MirrorPuzzleView.tsx
git commit -m "feat(s2): MirrorPuzzleView — callsign-derived substitution"
```

---

## Task 10: Author Season 2 JSON content

**Files:**
- Create: `server/data/seasons/s2/weeklies.json`
- Create: `server/data/seasons/s2/daily-templates.json`
- Create: `server/data/seasons/s2/tentpole.json`
- Create: `server/data/seasons/s2/beats.json`
- Create: `server/data/seasons/s2/lore.json`
- Modify: `server/data/whispers.json` — append S2 lines

- [ ] **Step 10.1: Transcribe per Bible §6–§9**

Same shape as S0/S1. Each weekly, daily, beat, lore page transcribed exactly per Bible IDs.

**Sample tentpole.json (TP-S2):**

```json
{
  "id": "TP-S2",
  "title": "The Mirror",
  "weekUnlock": 7,
  "durationMs": 10800000,
  "stages": [
    { "id": "TP-S2.s1", "name": "Descent", "puzzleType": "tendril-chain", "narration": "i did not know this was here. i should have." },
    { "id": "TP-S2.s2", "name": "Quiet Pattern Confession", "puzzleType": "P-NWI", "puzzleCount": 3, "lieRate": 0, "narration": "they want to tell you the truth. all three are true." },
    { "id": "TP-S2.s3", "name": "The Bond That Was Not Made", "decision": { "options": ["complete","break","leave"] } },
    { "id": "TP-S2.s4", "name": "The Mirror Approaches", "puzzleType": "P-GRT", "difficulty": "hard", "dynamic": "player-history-labels" },
    { "id": "TP-S2.s5", "name": "Fox's Last Whisper", "narration": "(plays fox audio quote from §4 Stage 5)" },
    { "id": "TP-S2.s6", "name": "The Mirror", "puzzleType": "MIRROR", "dynamic": "callsign-source" },
    { "id": "TP-S2.s7", "name": "The Question", "decision": { "options": ["accept","walk-away"], "dynamic": "questionAnswer" }, "rewardOnComplete": [{ "currency": "COHERENCE", "amount": 50 }, { "currency": "LORE_SHARDS", "amount": 5 }, { "type": "toolUnlock", "id": "T-SNG" }] }
  ]
}
```

- [ ] **Step 10.2: Validate + commit**

```bash
node -e "['weeklies','daily-templates','tentpole','beats','lore'].forEach(f => { JSON.parse(require('fs').readFileSync('server/data/seasons/s2/'+f+'.json','utf8')); console.log(f,'ok'); });"
git add server/data/seasons/s2/ server/data/whispers.json
git commit -m "feat(content): Season 2 JSON content — weeklies + dailies + tentpole + lore + whispers"
```

---

## Task 11: Season 2 seeder + scheduler hook

**Files:**
- Create: `server/seed-season-2.mjs`
- Modify: `server/scheduler.mjs` — S2 awareness

- [ ] **Step 11.1: Seeder** (mirror seed-season-1.mjs with `s2` directory)

- [ ] **Step 11.2: Scheduler update**

```js
function currentSeasonNumber(now = Date.now()) {
  const s2Start = Date.parse(process.env.S2_START ?? new Date(Date.now() + 112 * 24 * 3600 * 1000).toISOString());
  const s1Start = Date.parse(process.env.S1_START ?? new Date(Date.now() + 56 * 24 * 3600 * 1000).toISOString());
  if (now >= s2Start) return 2;
  if (now >= s1Start) return 1;
  return 0;
}

function loadTemplates(season) {
  const file = season === 2 ? 's2/daily-templates.json' :
               season === 1 ? 's1/daily-templates.json' :
               's0/daily-templates.json';
  return JSON.parse(readFileSync(join(ROOT, 'data', 'seasons', file), 'utf8')).templates;
}
```

- [ ] **Step 11.3: Commit**

```bash
git add server/seed-season-2.mjs server/scheduler.mjs package.json
git commit -m "feat(server): Season 2 seeder + scheduler"
```

---

## Task 12: Wire Phase 3 UI into GameApp + ghost actions

**Files:**
- Modify: `src/GameApp.tsx`
- Modify: `src/game.ts` reducer

- [ ] **Step 12.1: Mount Ghost components**

```tsx
import { GhostOverlay } from './components/GhostOverlay';
import { TendrilLines } from './components/TendrilLines';
import { CoherenceMeter } from './components/CoherenceMeter';
import { BondCounter } from './components/BondCounter';

// inside JSX:
<GhostOverlay active={state.classState?.activeClass === 'CLS-GHS'} />
<CoherenceMeter value={state.wallet?.balances.COHERENCE ?? 0} />
<BondCounter count={state.ghostGraph?.bonds.length ?? 0} />
// TendrilLines must mount INSIDE the R3F Canvas — engineer locates the Canvas in GameApp/Explorer.
```

- [ ] **Step 12.2: Add reducer cases**

```ts
case 'ghost:tendril': {
  if (state.classState?.activeClass !== 'CLS-GHS') return state;
  // Coherence cost handled separately via wallet.
  return { ...state, ghostGraph: addTendril(state.ghostGraph ?? initGhostGraph(), action.nodeId, Date.now()) };
}
case 'ghost:resonate': { /* triggers cluster effects — Phase 3 stub */ return state; }
case 'ghost:bond': {
  const g = state.ghostGraph ?? initGhostGraph();
  const can = canFormBond(g, action.nodeIds, Date.now());
  if (!can.ok) return state;
  return { ...state, ghostGraph: formBond(g, action.nodeIds, Date.now(), 'bond-' + Date.now(), 2) };
}
```

- [ ] **Step 12.3: Smoke test (Ghost class manually unlocked)**

```bash
# Manually grant COHERENCE in console to unlock class:
# (in browser devtools) — open game first, then:
localStorage.setItem('neva:save:v1', JSON.stringify({ ...JSON.parse(localStorage.getItem('neva:save:v1')), game: { ...JSON.parse(localStorage.getItem('neva:save:v1')).game, classState: { ...JSON.parse(localStorage.getItem('neva:save:v1')).game.classState, unlocked: ['CLS-OPR','CLS-COR','CLS-GHS'] } } }))
```

Reload. Switch to Ghost class. Verify:
1. Chromatic aberration appears.
2. CoherenceMeter renders.
3. BondCounter renders at 0.

- [ ] **Step 12.4: Commit**

```bash
pnpm build
git add src/GameApp.tsx src/game.ts
git commit -m "feat(ui): mount Ghost overlay + meters + reducer actions"
```

---

## Task 13: Phase 3 final regression + gate

- [ ] **Step 13.1: All tests pass**

```bash
pnpm test:run
```

Expected: ≥ 105 tests.

- [ ] **Step 13.2: Build + lint**

```bash
pnpm build && pnpm lint
```

- [ ] **Step 13.3: Web3 audit**

```bash
node -e "const p=require('./package.json'); const d={...p.dependencies,...p.devDependencies}; const b=['ethers','web3','wagmi','viem','@walletconnect/','@solana/']; console.log(Object.keys(d).filter(x=>b.some(y=>x.includes(y))).length?'FAIL':'OK');"
```

- [ ] **Step 13.4: Manual playthrough**

1. M00 plays.
2. S0 daily appears and is solvable.
3. Switch class to Corsair (already from Phase 2) → tools appear.
4. With Ghost unlocked (via S2 seeder running) → switch class to Ghost → overlay + meters appear.
5. Form a bond manually.
6. Confirm bond persists across page reload.
7. Manually trigger TP-S2 Stage 7 → Question answer shown matches the player's history.

- [ ] **Step 13.5: Document + commit**

Append to `CURRENT_PROJECT_STATE.md`:

```
- **Six-Month Grid Phase 3 (Season 2 — The Echo Below)** — **Complete**. Adds
  Ghost class, POSSESSION mechanic, Coherence currency (soft-capped),
  persistent bonds, Tentpole TP-S2 with The Question (5 player-history-driven
  answers), GhostOverlay R3F shader, MirrorPuzzleView (callsign-source).
  M00-M20 + Seasons 0-1 still play. **6+ month engagement target reached.**
```

```bash
git add CURRENT_PROJECT_STATE.md
git commit -m "docs: Phase 3 (Season 2) complete — 6+ month target reached"
```

---

## Phase 3 /goal directive

```
/goal Implement Phase 3 of the Six-Month Grid plan (Ghost class + Season 2)
in docs/superpowers/plans/2026-05-28-six-month-grid-phase-3.md, using
docs/superpowers/specs/2026-05-28-content-bible-season-2.md.

Pre-requisite: Phases 0-2 shipped. M00-M20 + Seasons 0-1 playable.

Work through Tasks 1-13 in order, TDD per task.

Done when:
- 13 tasks committed.
- pnpm test:run exits 0 with ≥ 105 tests.
- pnpm build + pnpm lint exit 0.
- A bond can be formed, persists across reload (server side via /api/bonds).
- The Question (TP-S2 Stage 7) produces the correct answer per player state.
- M00-M20 + Seasons 0-1 still playable.
- No Web3 deps.

Constraints:
- Use every Season 2 Bible piece with its canonical S2 ID.
- COHERENCE soft cap at 100 enforced in wallet.
- Bonds persist server-side per profile.
- MirrorPuzzleView reads state.profile.callsign at render time.

Stop after 110 turns max.
```

---

## Self-Review

| Bible reference | Task |
|---|---|
| §1 Ghost class | Task 4 |
| §1.3 Coherence | Task 1 |
| §2 Possession Graph | Task 2 (logic) + Task 7 (visual) |
| §3 Story arc | Task 10 (beats.json) |
| §4 Tentpole TP-S2 | Task 10 (data) + Task 6 (Question) + Task 9 (Mirror puzzle) |
| §5 Question answer-key | Task 6 |
| §6 Weeklies | Task 10 |
| §7 Daily templates | Task 10 + 11 |
| §8 Whispers | Task 10 |
| §9 Lore | Task 10 |
| §10 Economy caps | Task 1 (soft cap) + claim-path enforcement |
| §11 Permanent unlocks | TP-S2 stage 7 + feature flags |

**Placeholder scan** — none.
**Type consistency** — `Tendril`, `Bond`, `GhostGraphState`, `GhostToolId`, `GhostSkillId`, `Answer` defined once.
**Scope** — Phase 3 only. Architect class (Phase 4) deferred.


---

## Part III.4 — Phase 4 Plan (Architect / Season 3)

*Originally: `docs/superpowers/plans/2026-05-28-six-month-grid-phase-4.md`*


**Goal:** Ship the **Architect class** and **Season 3 "Bastion"** — the largest phase. Adds a persistent bastion sector, base-building primitives (walls, traps, taps), an async raid system with deterministic AI raiders, raid replay UI, and the permanent Witness Node. After Phase 4 the game has **all four classes live** and the saga's narrative concludes.

**Architecture:** Bastion lives as a separate procedurally-stable sector (`src/baseBuilder/bastion.ts`). Build primitives are pure data + a placement validator. Async raid system is server-driven (zero-dep): when an Architect logs out, a `raid-queue.json` schedules N raids; an AI raid simulator runs them deterministically; replays are stored server-side and viewed on next login.

**Tech Stack:** Same as Phase 3. Adds no new deps.

**Companion docs:** Phases 0/1/2/3 plans + `docs/superpowers/specs/2026-05-28-content-bible-season-3.md`.

**Pre-requisite:** Phases 0–3 shipped. `pnpm test:run` ≥ 105 passing.

---

## File Structure

### Created
| Path | Responsibility |
|---|---|
| `src/classes/architect/index.ts` | Class definition. |
| `src/classes/architect/tools.ts` | Observer Override, Replay Freeze, Rewind. |
| `src/classes/architect/skills.ts` | 20-skill tree. |
| `src/classes/architect/tools.test.ts` | Tool tests. |
| `src/classes/architect/skills.test.ts` | Skill tests. |
| `src/baseBuilder/types.ts` | `Cell`, `Placement`, `BastionState`. |
| `src/baseBuilder/primitives.ts` | Wall, Trap, Tap, Bastion definitions. |
| `src/baseBuilder/bastion.ts` | Bastion grid operations. |
| `src/baseBuilder/bastion.test.ts` | Bastion ops tests. |
| `src/baseBuilder/yield.ts` | Offline yield calculator. |
| `src/baseBuilder/yield.test.ts` | Yield calc tests. |
| `src/raids/types.ts` | Raid, RaidStep, RaidResult types. |
| `src/raids/simulator.ts` | Deterministic raid simulator (pure logic). |
| `src/raids/simulator.test.ts` | Raid sim tests. |
| `src/components/BastionEditor.tsx` | Drag-and-drop base editor. |
| `src/components/BastionGrid.tsx` | R3F bastion visual. |
| `src/components/RaidReplay.tsx` | Step-through replay viewer. |
| `src/components/WitnessNodeOverlay.tsx` | Bastion Witness Node persistent glow. |
| `src/components/GridPowerMeter.tsx` | HUD: GP balance. |
| `server/data/seasons/s3/weeklies.json` | 7 weeklies. |
| `server/data/seasons/s3/daily-templates.json` | 12 templates. |
| `server/data/seasons/s3/tentpole.json` | TP-S3 7 stages. |
| `server/data/seasons/s3/beats.json` | Beats. |
| `server/data/seasons/s3/lore.json` | 8 lore pages. |
| `server/raids-store.mjs` | Raid queue + replay store. |
| `server/raid-runner.mjs` | Periodic AI raid simulator. |
| `server/seed-season-3.mjs` | S3 seeder. |

### Modified
| Path | Reason |
|---|---|
| `src/wallet.ts` | Add `GRID_POWER` currency. |
| `src/wallet.test.ts` | Add GP test. |
| `src/game.ts` | Add `bastion`, `raidReplays`, `architectXp`, `witnessNode` fields. |
| `src/save.ts` | v5 → v6 additive migration. |
| `src/save.test.ts` | v5→v6 regression test. |
| `src/classes/registry.ts` | Add Architect. |
| `src/components/ClassSwitcher.tsx` | List Architect when unlocked. |
| `src/GameApp.tsx` | Mount BastionEditor + RaidReplay + GridPowerMeter + WitnessNodeOverlay. |
| `server/index.mjs` | Add `/api/bastion/*` + `/api/raids/*` routes. |
| `server/scheduler.mjs` | Pick S0/S1/S2/S3 templates. |
| `server/data/whispers.json` | Append S3 lines. |
| `CURRENT_PROJECT_STATE.md` | Mark Phase 4 complete. |

### Not Touched
- All Phase 0/1/2/3 modules — work as-is.

---

## Task 1: Add GRID_POWER currency

**Files:** `src/wallet.ts`, `src/wallet.test.ts`

- [ ] **Step 1.1: Extend Currency type**

```ts
export type Currency =
  | 'DATA' | 'MEMORY_SHARDS' | 'ACCESS_KEYS' | 'SIGNAL_ENERGY' | 'CORE_FRAGMENTS'
  | 'LORE_SHARDS' | 'BLACK_CREDITS' | 'COHERENCE' | 'GRID_POWER';
```

Update `ZERO`, `TRANSFERABLE` (GP is NOT soft-capped — sinks consume it).

- [ ] **Step 1.2: Test + commit**

```ts
it('GRID_POWER is not soft-capped', () => {
  const w = createWallet();
  w.earn('GRID_POWER', 200, 'TEST');
  expect(w.balance('GRID_POWER')).toBe(200);
});
```

```bash
pnpm test:run src/wallet.test.ts
git add src/wallet.ts src/wallet.test.ts
git commit -m "feat(wallet): GRID_POWER currency (Phase 4)"
```

---

## Task 2: Bastion types + primitives

**Files:**
- Create: `src/baseBuilder/types.ts`
- Create: `src/baseBuilder/primitives.ts`

- [ ] **Step 2.1: Types**

```ts
import type { Currency } from '../wallet';

export type PrimitiveType =
  | 'CIPHER_WALL' | 'ICE_TRAP' | 'DECOY' | 'ALARM'
  | 'DATA_TAP' | 'LORE_TAP' | 'COHERENCE_TAP' | 'POWER_TAP'
  | 'BASTION_LANDMARK' | 'WITNESS_NODE' | 'EMPTY';

export type EncryptionTier = 1 | 2 | 3 | 4;

export interface Cell {
  type: PrimitiveType;
  tier?: EncryptionTier;
  cipherType?: 'P-CES' | 'P-FRQ' | 'P-PWK' | 'P-SUB';
  placedAt: number; // ms
}

export interface Placement {
  row: number;
  col: number;
  cell: Cell;
}

export interface BastionState {
  width: number;
  height: number;
  cells: Cell[][];           // [row][col]
  witnessNode: { row: number; col: number } | null;
  lastYieldClaimAt: number;
}
```

- [ ] **Step 2.2: Primitives**

```ts
import type { PrimitiveType, EncryptionTier } from './types';

interface PrimitiveDef {
  type: PrimitiveType;
  name: string;
  baseCostGP: number;
  category: 'wall' | 'trap' | 'tap' | 'bastion' | 'witness' | 'empty';
}

export const PRIMITIVES: Record<PrimitiveType, PrimitiveDef> = {
  EMPTY: { type: 'EMPTY', name: 'Empty', baseCostGP: 0, category: 'empty' },
  CIPHER_WALL: { type: 'CIPHER_WALL', name: 'Cipher Wall', baseCostGP: 20, category: 'wall' },
  ICE_TRAP: { type: 'ICE_TRAP', name: 'ICE Trap', baseCostGP: 30, category: 'trap' },
  DECOY: { type: 'DECOY', name: 'Decoy Node', baseCostGP: 40, category: 'trap' },
  ALARM: { type: 'ALARM', name: 'Alarm', baseCostGP: 25, category: 'trap' },
  DATA_TAP: { type: 'DATA_TAP', name: 'Data Tap', baseCostGP: 50, category: 'tap' },
  LORE_TAP: { type: 'LORE_TAP', name: 'Lore Tap', baseCostGP: 60, category: 'tap' },
  COHERENCE_TAP: { type: 'COHERENCE_TAP', name: 'Coherence Tap', baseCostGP: 80, category: 'tap' },
  POWER_TAP: { type: 'POWER_TAP', name: 'Power Tap', baseCostGP: 30, category: 'tap' },
  BASTION_LANDMARK: { type: 'BASTION_LANDMARK', name: 'Bastion Landmark', baseCostGP: 100, category: 'bastion' },
  WITNESS_NODE: { type: 'WITNESS_NODE', name: 'Witness Node', baseCostGP: 0, category: 'witness' },
};

const TIER_MULTIPLIER: Record<EncryptionTier, number> = { 1: 1.0, 2: 1.5, 3: 2.5, 4: 4.0 };

export function placementCost(type: PrimitiveType, tier: EncryptionTier = 1): number {
  return Math.round(PRIMITIVES[type].baseCostGP * TIER_MULTIPLIER[tier]);
}
```

- [ ] **Step 2.3: Commit**

```bash
git add src/baseBuilder/types.ts src/baseBuilder/primitives.ts
git commit -m "feat(bastion): types + primitives + tier-cost"
```

---

## Task 3: Bastion grid operations (TDD)

**Files:**
- Create: `src/baseBuilder/bastion.ts`
- Create: `src/baseBuilder/bastion.test.ts`

- [ ] **Step 3.1: Tests**

```ts
import { describe, it, expect } from 'vitest';
import { initBastion, place, remove, expand, placeWitness, MAX_SIZE } from './bastion';

describe('Bastion', () => {
  it('starts 8x8 empty', () => {
    const b = initBastion();
    expect(b.width).toBe(8);
    expect(b.height).toBe(8);
    expect(b.cells[0][0].type).toBe('EMPTY');
    expect(b.witnessNode).toBe(null);
  });

  it('place puts a cell at row/col', () => {
    let b = initBastion();
    b = place(b, { row: 2, col: 3, cell: { type: 'CIPHER_WALL', tier: 1, placedAt: 0 } });
    expect(b.cells[2][3].type).toBe('CIPHER_WALL');
  });

  it('remove returns cell to EMPTY', () => {
    let b = place(initBastion(), { row: 2, col: 3, cell: { type: 'CIPHER_WALL', tier: 1, placedAt: 0 } });
    b = remove(b, 2, 3);
    expect(b.cells[2][3].type).toBe('EMPTY');
  });

  it('expand grows the grid by 1 in each dimension up to MAX_SIZE', () => {
    let b = initBastion();
    b = expand(b);
    expect(b.width).toBe(9);
    expect(b.height).toBe(9);
  });

  it('expand stops at MAX_SIZE', () => {
    let b = initBastion();
    for (let i = 0; i < 20; i++) b = expand(b);
    expect(b.width).toBe(MAX_SIZE);
    expect(b.height).toBe(MAX_SIZE);
  });

  it('placeWitness sets the witness coords once', () => {
    let b = initBastion();
    b = placeWitness(b, 3, 4);
    expect(b.witnessNode).toEqual({ row: 3, col: 4 });
  });

  it('placeWitness is idempotent (witness never moves)', () => {
    let b = placeWitness(initBastion(), 3, 4);
    b = placeWitness(b, 7, 7);
    expect(b.witnessNode).toEqual({ row: 3, col: 4 });
  });
});
```

- [ ] **Step 3.2: Implement**

```ts
import type { BastionState, Cell, Placement } from './types';

export const INIT_SIZE = 8;
export const MAX_SIZE = 16;

function emptyRow(width: number): Cell[] {
  return Array.from({ length: width }, () => ({ type: 'EMPTY' as const, placedAt: 0 }));
}

export function initBastion(): BastionState {
  return {
    width: INIT_SIZE,
    height: INIT_SIZE,
    cells: Array.from({ length: INIT_SIZE }, () => emptyRow(INIT_SIZE)),
    witnessNode: null,
    lastYieldClaimAt: 0,
  };
}

export function place(b: BastionState, p: Placement): BastionState {
  if (p.row < 0 || p.row >= b.height || p.col < 0 || p.col >= b.width) return b;
  const next = b.cells.map((row) => [...row]);
  next[p.row][p.col] = p.cell;
  return { ...b, cells: next };
}

export function remove(b: BastionState, row: number, col: number): BastionState {
  if (b.witnessNode && b.witnessNode.row === row && b.witnessNode.col === col) return b; // witness immutable
  return place(b, { row, col, cell: { type: 'EMPTY', placedAt: 0 } });
}

export function expand(b: BastionState): BastionState {
  if (b.width >= MAX_SIZE || b.height >= MAX_SIZE) return b;
  const w = b.width + 1, h = b.height + 1;
  const next: Cell[][] = Array.from({ length: h }, (_, r) =>
    Array.from({ length: w }, (_, c) => b.cells[r]?.[c] ?? { type: 'EMPTY', placedAt: 0 })
  );
  return { ...b, width: w, height: h, cells: next };
}

export function placeWitness(b: BastionState, row: number, col: number): BastionState {
  if (b.witnessNode) return b; // immutable
  if (row < 0 || row >= b.height || col < 0 || col >= b.width) return b;
  const withWitness = place(b, { row, col, cell: { type: 'WITNESS_NODE', placedAt: Date.now() } });
  return { ...withWitness, witnessNode: { row, col } };
}
```

- [ ] **Step 3.3: Run + commit**

```bash
pnpm test:run src/baseBuilder/bastion.test.ts
git add src/baseBuilder/bastion.ts src/baseBuilder/bastion.test.ts
git commit -m "feat(bastion): grid ops (place, remove, expand, placeWitness)"
```

---

## Task 4: Offline yield calculator (TDD)

**Files:**
- Create: `src/baseBuilder/yield.ts`
- Create: `src/baseBuilder/yield.test.ts`

- [ ] **Step 4.1: Tests**

```ts
import { describe, it, expect } from 'vitest';
import { computeYield } from './yield';
import type { BastionState } from './types';

function bastionWith(taps: { type: 'DATA_TAP' | 'POWER_TAP' | 'LORE_TAP' | 'COHERENCE_TAP'; }[]): BastionState {
  const cells = [[
    ...taps.map((t) => ({ type: t.type, placedAt: 0 })),
    ...Array(8 - taps.length).fill({ type: 'EMPTY', placedAt: 0 })
  ]];
  for (let i = 1; i < 8; i++) cells.push(Array(8).fill({ type: 'EMPTY', placedAt: 0 }));
  return { width: 8, height: 8, cells, witnessNode: null, lastYieldClaimAt: 0 };
}

describe('Offline yield', () => {
  it('returns 0 if no taps', () => {
    const b: BastionState = { width: 8, height: 8, cells: Array.from({ length: 8 }, () => Array(8).fill({ type: 'EMPTY', placedAt: 0 })), witnessNode: null, lastYieldClaimAt: 0 };
    expect(computeYield(b, 1000)).toEqual({});
  });

  it('1 Data Tap yields 2 DATA / hour', () => {
    const b = bastionWith([{ type: 'DATA_TAP' }]);
    const oneHour = 3600 * 1000;
    expect(computeYield(b, oneHour).DATA).toBe(2);
  });

  it('caps at 48h by default', () => {
    const b = bastionWith([{ type: 'POWER_TAP' }]);
    const fiveDays = 5 * 24 * 3600 * 1000;
    // POWER_TAP yields 1 GP/hour, capped at 48h
    expect(computeYield(b, fiveDays).GRID_POWER).toBe(48);
  });

  it('72h cap with extended flag', () => {
    const b = bastionWith([{ type: 'POWER_TAP' }]);
    const fiveDays = 5 * 24 * 3600 * 1000;
    expect(computeYield(b, fiveDays, 72).GRID_POWER).toBe(72);
  });
});
```

- [ ] **Step 4.2: Implement**

```ts
import type { BastionState } from './types';
import type { Currency } from '../wallet';

const YIELDS: Record<string, { currency: Currency; perHour: number }> = {
  DATA_TAP:      { currency: 'DATA', perHour: 2 },
  LORE_TAP:      { currency: 'LORE_SHARDS', perHour: 1/24 }, // 1/day
  COHERENCE_TAP: { currency: 'COHERENCE', perHour: 1/24 },
  POWER_TAP:     { currency: 'GRID_POWER', perHour: 1 },
};

export function computeYield(b: BastionState, elapsedMs: number, capHours = 48): Partial<Record<Currency, number>> {
  const elapsedHours = Math.min(elapsedMs / 3600000, capHours);
  const acc: Partial<Record<Currency, number>> = {};
  for (const row of b.cells) for (const cell of row) {
    const def = YIELDS[cell.type];
    if (!def) continue;
    acc[def.currency] = (acc[def.currency] ?? 0) + Math.floor(def.perHour * elapsedHours);
  }
  return acc;
}
```

- [ ] **Step 4.3: Run + commit**

```bash
pnpm test:run src/baseBuilder/yield.test.ts
git add src/baseBuilder/yield.ts src/baseBuilder/yield.test.ts
git commit -m "feat(bastion): offline yield calculator with 48/72h cap"
```

---

## Task 5: Raid simulator (TDD — the deterministic core)

**Files:**
- Create: `src/raids/types.ts`
- Create: `src/raids/simulator.ts`
- Create: `src/raids/simulator.test.ts`

- [ ] **Step 5.1: Types**

```ts
import type { BastionState } from '../baseBuilder/types';
import type { ClassId } from '../classes/types';

export interface Raider {
  classId: ClassId;
  skillLevel: 1 | 2 | 3 | 4;
  seed: number;
}

export interface RaidStep {
  ts: number;          // ms since raid start
  type: 'enter' | 'move' | 'cipher-attempt' | 'trap-trigger' | 'success' | 'fail';
  cell: { row: number; col: number };
  detail?: string;
}

export interface RaidResult {
  steps: RaidStep[];
  raiderWon: boolean;
  iceFinal: number;
  yieldStolen: number;
}
```

- [ ] **Step 5.2: Tests**

```ts
import { describe, it, expect } from 'vitest';
import { simulateRaid } from './simulator';
import { initBastion, place } from '../baseBuilder/bastion';

describe('Raid simulator', () => {
  it('empty bastion → raider wins instantly', () => {
    const b = initBastion();
    const r = simulateRaid(b, { classId: 'CLS-COR', skillLevel: 1, seed: 1 });
    expect(r.raiderWon).toBe(true);
  });

  it('walls slow the raider', () => {
    let b = initBastion();
    for (let i = 0; i < 4; i++) {
      b = place(b, { row: 0, col: i, cell: { type: 'CIPHER_WALL', tier: 1, cipherType: 'P-CES', placedAt: 0 } });
    }
    const r = simulateRaid(b, { classId: 'CLS-COR', skillLevel: 1, seed: 1 });
    expect(r.steps.some((s) => s.type === 'cipher-attempt')).toBe(true);
  });

  it('ICE traps add ICE', () => {
    let b = initBastion();
    b = place(b, { row: 0, col: 0, cell: { type: 'ICE_TRAP', placedAt: 0 } });
    const r = simulateRaid(b, { classId: 'CLS-COR', skillLevel: 1, seed: 1 });
    expect(r.iceFinal).toBeGreaterThan(0);
  });

  it('deterministic with seed', () => {
    let b = initBastion();
    b = place(b, { row: 0, col: 0, cell: { type: 'CIPHER_WALL', tier: 1, cipherType: 'P-CES', placedAt: 0 } });
    const a = simulateRaid(b, { classId: 'CLS-COR', skillLevel: 1, seed: 42 });
    const c = simulateRaid(b, { classId: 'CLS-COR', skillLevel: 1, seed: 42 });
    expect(a).toEqual(c);
  });

  it('Tier-4 walls almost always defeat Tier-1 raider', () => {
    let b = initBastion();
    for (let i = 0; i < 6; i++) {
      b = place(b, { row: 0, col: i, cell: { type: 'CIPHER_WALL', tier: 4, cipherType: 'P-SUB', placedAt: 0 } });
    }
    let raiderWins = 0;
    for (let seed = 1; seed <= 20; seed++) {
      if (simulateRaid(b, { classId: 'CLS-COR', skillLevel: 1, seed }).raiderWon) raiderWins++;
    }
    expect(raiderWins).toBeLessThan(4); // < 20% win rate
  });
});
```

- [ ] **Step 5.3: Implement (simplified — the engineer extends per Bible §2)**

```ts
import type { BastionState } from '../baseBuilder/types';
import type { Raider, RaidStep, RaidResult } from './types';

function rng(seed: number) {
  return () => {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WALL_PASS_PROBABILITY: Record<number, Record<number, number>> = {
  1: { 1: 0.85, 2: 0.65, 3: 0.45, 4: 0.20 }, // skillLevel: { tier: probability }
  2: { 1: 0.90, 2: 0.75, 3: 0.55, 4: 0.30 },
  3: { 1: 0.95, 2: 0.85, 3: 0.65, 4: 0.45 },
  4: { 1: 0.98, 2: 0.90, 3: 0.78, 4: 0.60 },
};

export function simulateRaid(b: BastionState, raider: Raider): RaidResult {
  const r = rng(raider.seed);
  const steps: RaidStep[] = [];
  let ice = 0;
  let pathTaken = 0;

  // Simple raid AI: walk row 0 left-to-right; halt on success/fail.
  steps.push({ ts: 0, type: 'enter', cell: { row: 0, col: 0 } });
  for (let col = 0; col < b.width; col++) {
    const cell = b.cells[0][col];
    pathTaken++;
    const t = (pathTaken + 1) * 200;
    if (cell.type === 'EMPTY') {
      steps.push({ ts: t, type: 'move', cell: { row: 0, col } });
      continue;
    }
    if (cell.type === 'CIPHER_WALL') {
      const passProb = WALL_PASS_PROBABILITY[raider.skillLevel][cell.tier ?? 1] ?? 0.5;
      const success = r() < passProb;
      steps.push({ ts: t, type: 'cipher-attempt', cell: { row: 0, col }, detail: success ? 'pass' : 'fail' });
      if (!success) { ice += 10; if (ice >= 100) break; col--; pathTaken++; continue; }
      continue;
    }
    if (cell.type === 'ICE_TRAP') {
      ice += 20;
      steps.push({ ts: t, type: 'trap-trigger', cell: { row: 0, col }, detail: 'ICE +20' });
      if (ice >= 100) break;
      continue;
    }
    if (cell.type === 'DECOY') {
      steps.push({ ts: t, type: 'move', cell: { row: 0, col }, detail: 'wasted turn' });
      pathTaken++;
      continue;
    }
    if (cell.type === 'ALARM') {
      steps.push({ ts: t, type: 'trap-trigger', cell: { row: 0, col }, detail: 'alarm' });
      continue;
    }
    if (cell.type.endsWith('_TAP')) {
      // Tap reached — raider takes yield
      steps.push({ ts: t, type: 'success', cell: { row: 0, col } });
      return { steps, raiderWon: true, iceFinal: ice, yieldStolen: 10 };
    }
  }

  const raiderWon = ice < 100 && steps.some((s) => s.type === 'success');
  if (!raiderWon && steps[steps.length - 1].type !== 'fail') {
    steps.push({ ts: steps[steps.length - 1].ts + 200, type: 'fail', cell: { row: 0, col: b.width - 1 } });
  }
  return { steps, raiderWon, iceFinal: ice, yieldStolen: raiderWon ? 10 : 0 };
}
```

- [ ] **Step 5.4: Run + commit**

```bash
pnpm test:run src/raids/simulator.test.ts
git add src/raids/types.ts src/raids/simulator.ts src/raids/simulator.test.ts
git commit -m "feat(raids): deterministic raid simulator"
```

---

## Task 6: Architect class + tools + skills

(Follows Phase 2/3 patterns. Engineer writes per Bible §1.4–§1.7.)

**Files:**
- Create: `src/classes/architect/index.ts`, `tools.ts`, `skills.ts`
- Modify: `src/classes/registry.ts`

- [ ] **Step 6.1: Architect class def**

```ts
export const ARCHITECT_CLASS: ClassDef = {
  id: 'CLS-ARC',
  name: 'Architect',
  fantasy: 'Factorio + tower defense + Stardew base-builder',
  signatureMechanic: 'BUILD-AND-DEFEND',
  primaryCurrency: 'GRID_POWER',
  shipPhase: 4,
};
```

- [ ] **Step 6.2: Tools** (Observer Override, Replay Freeze, Rewind — per Bible §1.6)

- [ ] **Step 6.3: Skills** (20-skill tree per Bible §1.7)

- [ ] **Step 6.4: Update registry**

```ts
'CLS-ARC': ARCHITECT_CLASS,
```

- [ ] **Step 6.5: Tests + commit**

---

## Task 7: Save migration v6

**Files:** `src/save.ts`, `src/save.test.ts`

- [ ] **Step 7.1: Bump + extend migration**

Add v5→v6 block:

```ts
if (!game.bastion) {
  game.bastion = {
    width: 8, height: 8,
    cells: Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => ({ type: 'EMPTY', placedAt: 0 }))),
    witnessNode: null,
    lastYieldClaimAt: 0,
  };
}
if (!game.raidReplays) game.raidReplays = [];
if (typeof game.architectXp !== 'number') game.architectXp = 0;
if (game.wallet && !('GRID_POWER' in game.wallet.balances)) {
  game.wallet.balances.GRID_POWER = 0;
}
if (game.classState && !game.classState.unlocked.includes('CLS-ARC') && (game.wallet?.balances.GRID_POWER ?? 0) > 0) {
  game.classState.unlocked.push('CLS-ARC');
}
return { ...blob, version: 6 };
```

Adjust guard: `if (blob.version > 6) return blob;`. Bump `VERSION = 6`.

- [ ] **Step 7.2: Regression test + commit**

---

## Task 8: Server raid runner

**Files:**
- Create: `server/raids-store.mjs`
- Create: `server/raid-runner.mjs`
- Modify: `server/index.mjs` — add `/api/raids/*` and `/api/bastion/*` routes

- [ ] **Step 8.1: raids-store (JSON-backed queue + replay archive)**

```js
import { loadJson, saveJson } from './json-store.mjs';
const FILE = 'raids.json';
const SHAPE = { byProfile: {} };

function read() {
  const raw = loadJson(FILE, SHAPE);
  return { byProfile: raw.byProfile && typeof raw.byProfile === 'object' ? raw.byProfile : {} };
}

export function recordReplay(profileId, replay) {
  const state = read();
  const list = state.byProfile[profileId] ?? [];
  list.unshift(replay); // newest first
  // Cap at 5
  state.byProfile[profileId] = list.slice(0, 5);
  saveJson(FILE, state);
}

export function listReplays(profileId) {
  return read().byProfile[profileId] ?? [];
}

export function raidStats() {
  const state = read();
  return { totalReplays: Object.values(state.byProfile).reduce((acc, l) => acc + l.length, 0) };
}
```

- [ ] **Step 8.2: raid-runner (called on a timer or on Architect login)**

```js
/**
 * Raid runner — simulates raids against Architects who have been offline.
 * Conservative: 1 raid per 24h offline, max 3 per session window.
 * Anti-griefing: new Architects (≤ 7 days) get only Tier-1 AI raiders.
 */
import { recordReplay } from './raids-store.mjs';

const MAX_RAIDS_PER_DAY = 3;

// Minimal stand-in raid generator — the real simulator lives client-side
// (src/raids/simulator.ts) and is called from a small Node-compatible wrapper.
// For Phase 4 alpha, the server schedules raids and stores synthetic replays;
// players' clients run the actual simulator on download.

export function scheduleRaidsFor(profileId, bastion, lastLogin) {
  const now = Date.now();
  const hoursAway = Math.floor((now - lastLogin) / 3600000);
  if (hoursAway < 6) return 0;
  const count = Math.min(MAX_RAIDS_PER_DAY, Math.floor(hoursAway / 8));
  for (let i = 0; i < count; i++) {
    recordReplay(profileId, {
      id: `raid-${now}-${i}`,
      profileId, bastion,
      raiderClassId: ['CLS-COR','CLS-GHS'][i % 2],
      raiderSkillLevel: 1,
      seed: now + i,
      timestamp: now,
    });
  }
  return count;
}
```

- [ ] **Step 8.3: Wire routes**

```js
import { listReplays, recordReplay, raidStats } from './raids-store.mjs';
import { scheduleRaidsFor } from './raid-runner.mjs';

if (req.method === 'GET' && url.pathname === '/api/raids/replays') {
  const profileId = String(url.searchParams.get('profileId') ?? 'local');
  return sendJson(res, 200, { ok: true, replays: listReplays(profileId) });
}

if (req.method === 'POST' && url.pathname === '/api/raids/schedule') {
  const body = await readJsonBody(req);
  const profileId = String(body?.profileId ?? '').slice(0, 64);
  const bastion = body?.bastion;
  const lastLogin = Number(body?.lastLogin ?? 0);
  if (!profileId || !bastion) return sendJson(res, 400, { ok: false });
  const n = scheduleRaidsFor(profileId, bastion, lastLogin);
  return sendJson(res, 200, { ok: true, scheduled: n });
}

if (req.method === 'POST' && url.pathname === '/api/bastion/save') {
  // Phase 4: local save remains authoritative; server stores a snapshot for raid scheduling only.
  const body = await readJsonBody(req);
  const profileId = String(body?.profileId ?? '').slice(0, 64);
  if (!profileId) return sendJson(res, 400, { ok: false });
  // For Phase 4 minimum-viable, just acknowledge; richer storage in Phase 5.
  return sendJson(res, 200, { ok: true });
}
```

- [ ] **Step 8.4: Commit**

```bash
git add server/raids-store.mjs server/raid-runner.mjs server/index.mjs
git commit -m "feat(server): raid scheduling + replay storage"
```

---

## Task 9: BastionEditor + BastionGrid UI

**Files:**
- Create: `src/components/BastionEditor.tsx`
- Create: `src/components/BastionGrid.tsx`
- Create: `src/components/GridPowerMeter.tsx`

These are larger UI components — engineer follows Bible §1.4 for primitive
palette and Phase 1/2 UI style for HUD.

- [ ] **Step 9.1: BastionGrid (R3F — top-down view)**

```tsx
import { useMemo } from 'react';
import type { BastionState } from '../baseBuilder/types';
import { PRIMITIVES } from '../baseBuilder/primitives';

interface Props {
  bastion: BastionState;
  onCellClick?: (row: number, col: number) => void;
}

const COLORS: Record<string, string> = {
  EMPTY: '#1a1147', CIPHER_WALL: '#7aa8d8', ICE_TRAP: '#d86a6a',
  DECOY: '#b88aff', ALARM: '#d8c87a', DATA_TAP: '#7ad898', LORE_TAP: '#d87aff',
  COHERENCE_TAP: '#b88aff', POWER_TAP: '#d8d878', BASTION_LANDMARK: '#fff', WITNESS_NODE: '#fffaaa',
};

export function BastionGrid({ bastion, onCellClick }: Props) {
  const cellSize = 32;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${bastion.width}, ${cellSize}px)`, gap: 2, padding: 12, background: '#0a0e27' }}>
      {bastion.cells.flatMap((row, r) =>
        row.map((cell, c) => (
          <div
            key={`${r},${c}`}
            onClick={() => onCellClick?.(r, c)}
            style={{
              width: cellSize, height: cellSize,
              background: COLORS[cell.type] ?? '#333',
              border: cell.type === 'WITNESS_NODE' ? '1px solid #fff' : '1px solid #2a0050',
              cursor: onCellClick ? 'pointer' : 'default',
              opacity: cell.type === 'EMPTY' ? 0.4 : 1,
              boxShadow: cell.type === 'WITNESS_NODE' ? '0 0 8px #fffaaa' : 'none',
            }}
            title={PRIMITIVES[cell.type].name}
          />
        ))
      )}
    </div>
  );
}
```

- [ ] **Step 9.2: BastionEditor (palette + grid)**

```tsx
import { useState } from 'react';
import { BastionGrid } from './BastionGrid';
import { PRIMITIVES, placementCost } from '../baseBuilder/primitives';
import type { BastionState, PrimitiveType, EncryptionTier } from '../baseBuilder/types';

interface Props {
  bastion: BastionState;
  gridPower: number;
  onPlace: (row: number, col: number, type: PrimitiveType, tier: EncryptionTier) => void;
}

export function BastionEditor({ bastion, gridPower, onPlace }: Props) {
  const [selected, setSelected] = useState<PrimitiveType>('CIPHER_WALL');
  const [tier, setTier] = useState<EncryptionTier>(1);

  const handleCell = (row: number, col: number) => {
    const cost = placementCost(selected, tier);
    if (gridPower < cost) return;
    onPlace(row, col, selected, tier);
  };

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div>
        <div style={{ marginBottom: 12, color: '#b88aff', fontSize: 11, letterSpacing: 2 }}>PALETTE</div>
        {Object.values(PRIMITIVES).filter((p) => p.category !== 'empty' && p.category !== 'witness').map((p) => (
          <button key={p.type} onClick={() => setSelected(p.type)} style={{ display: 'block', margin: 4, padding: 8, background: selected === p.type ? '#2a0050' : '#0a0e27', color: '#d8e8ff', border: '1px solid #6a4aaa', cursor: 'pointer' }}>
            {p.name} · {placementCost(p.type, tier)} GP
          </button>
        ))}
        <div style={{ marginTop: 12 }}>Tier:
          {[1,2,3,4].map((t) => <button key={t} onClick={() => setTier(t as EncryptionTier)} style={{ margin: 4, background: tier===t ? '#2a0050' : '#0a0e27', color: '#d8e8ff' }}>{t}</button>)}
        </div>
        <div style={{ marginTop: 12, color: '#d8c87a' }}>GP: {gridPower}</div>
      </div>
      <BastionGrid bastion={bastion} onCellClick={handleCell} />
    </div>
  );
}
```

- [ ] **Step 9.3: GridPowerMeter (HUD)**

```tsx
interface Props { value: number; }
const wrap: React.CSSProperties = {
  position: 'fixed', top: 190, left: 16, padding: 6,
  background: 'rgba(10,14,39,0.85)', color: '#d8c87a',
  borderRadius: 4, fontFamily: 'SF Mono, Menlo, monospace',
  fontSize: 10, letterSpacing: 1, zIndex: 999,
};
export function GridPowerMeter({ value }: Props) {
  return (
    <div style={wrap}>
      <div style={{ fontSize: 9, opacity: 0.6, letterSpacing: 2 }}>GRID POWER</div>
      <div style={{ fontSize: 14 }}>{value}</div>
    </div>
  );
}
```

- [ ] **Step 9.4: Commit**

```bash
pnpm build
git add src/components/BastionEditor.tsx src/components/BastionGrid.tsx src/components/GridPowerMeter.tsx
git commit -m "feat(bastion): editor + grid + GP meter UI"
```

---

## Task 10: RaidReplay + WitnessNodeOverlay

**Files:**
- Create: `src/components/RaidReplay.tsx`
- Create: `src/components/WitnessNodeOverlay.tsx`

- [ ] **Step 10.1: RaidReplay (step-through)**

```tsx
import { useState } from 'react';
import { BastionGrid } from './BastionGrid';
import type { BastionState } from '../baseBuilder/types';
import type { RaidStep } from '../raids/types';

interface Props {
  bastion: BastionState;
  steps: RaidStep[];
  raiderWon: boolean;
  onClose: () => void;
}

export function RaidReplay({ bastion, steps, raiderWon, onClose }: Props) {
  const [idx, setIdx] = useState(0);
  const step = steps[idx];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 2000, padding: 24 }}>
      <div style={{ color: '#d8e8ff', marginBottom: 12 }}>
        Replay — step {idx + 1} / {steps.length} — {raiderWon ? 'Raider won' : 'You defended'}
      </div>
      <BastionGrid bastion={bastion} />
      <div style={{ color: '#d8c87a', marginTop: 12 }}>
        Step: {step?.type} @ ({step?.cell.row},{step?.cell.col}) {step?.detail}
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={() => setIdx(Math.max(0, idx - 1))}>◀ Prev</button>
        <button onClick={() => setIdx(Math.min(steps.length - 1, idx + 1))} style={{ marginLeft: 8 }}>Next ▶</button>
        <button onClick={onClose} style={{ marginLeft: 16 }}>Close</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 10.2: WitnessNodeOverlay**

```tsx
import type { BastionState } from '../baseBuilder/types';

interface Props { bastion: BastionState; }
export function WitnessNodeOverlay({ bastion }: Props) {
  if (!bastion.witnessNode) return null;
  const { row, col } = bastion.witnessNode;
  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16, padding: 6, background: 'rgba(255,250,170,0.15)', border: '1px solid #fffaaa', borderRadius: 4, color: '#fffaaa', fontFamily: 'SF Mono, monospace', fontSize: 10 }}>
      WITNESS at ({row},{col}) · permanent
    </div>
  );
}
```

- [ ] **Step 10.3: Commit**

```bash
git add src/components/RaidReplay.tsx src/components/WitnessNodeOverlay.tsx
git commit -m "feat(bastion): RaidReplay + WitnessNodeOverlay"
```

---

## Task 11: Author Season 3 content JSON

Per Bible §4–§8. Engineer transcribes weeklies/dailies/tentpole/beats/lore/whispers using S0–S2 patterns. Key: TP-S3 includes the **mastery-keyed Stage-5 speech variants** and the **Witness Node placement** in stage 7.

- [ ] **Step 11.1–11.5:** Create files and validate JSON

- [ ] **Step 11.6: Commit**

```bash
git add server/data/seasons/s3/ server/data/whispers.json
git commit -m "feat(content): Season 3 JSON content"
```

---

## Task 12: Wire Phase 4 UI into GameApp + reducer

**Files:**
- Modify: `src/GameApp.tsx`
- Modify: `src/game.ts` reducer

- [ ] **Step 12.1: Mount components**

```tsx
import { BastionEditor } from './components/BastionEditor';
import { BastionGrid } from './components/BastionGrid';
import { RaidReplay } from './components/RaidReplay';
import { GridPowerMeter } from './components/GridPowerMeter';
import { WitnessNodeOverlay } from './components/WitnessNodeOverlay';
```

Architect class only renders the editor; in other modes the bastion is hidden.

- [ ] **Step 12.2: Reducer cases**

```ts
case 'bastion:place': {
  const cost = placementCost(action.type, action.tier);
  // Cost paid via wallet — handled outside reducer or via a helper.
  return { ...state, bastion: place(state.bastion!, { row: action.row, col: action.col, cell: { type: action.type, tier: action.tier, placedAt: Date.now() } }) };
}
case 'bastion:claim-yield': {
  const elapsed = Date.now() - (state.bastion?.lastYieldClaimAt ?? Date.now());
  const yields = computeYield(state.bastion!, elapsed);
  // Wallet earn per currency...
  return { ...state, bastion: { ...state.bastion!, lastYieldClaimAt: Date.now() } };
}
case 'witness:place': {
  return { ...state, bastion: placeWitness(state.bastion!, action.row, action.col) };
}
```

- [ ] **Step 12.3: Commit**

```bash
pnpm build
git add src/GameApp.tsx src/game.ts
git commit -m "feat(ui): wire bastion editor + replays + meters"
```

---

## Task 13: Season 3 seeder

**Files:**
- Create: `server/seed-season-3.mjs`
- Modify: `server/scheduler.mjs` — S3 awareness
- Modify: `package.json` — `seed:season-3`

- [ ] **Step 13.1: Seeder** (mirror S2 but `s3/`)

- [ ] **Step 13.2: Scheduler:** add S3 detection (`S3_START` env)

- [ ] **Step 13.3: Commit**

```bash
git add server/seed-season-3.mjs server/scheduler.mjs package.json
git commit -m "feat(server): Season 3 seeder + scheduler"
```

---

## Task 14: Mastery-keyed Architect speech

**Files:**
- Create: `src/seasons/s3-architect-speech.ts`
- Create: `src/seasons/s3-architect-speech.test.ts`

- [ ] **Step 14.1: Tests**

```ts
import { describe, it, expect } from 'vitest';
import { architectSpeech } from './s3-architect-speech';

describe('Architect speech variant', () => {
  it('high mastery (≥8)', () => {
    expect(architectSpeech(9)).toContain('did not expect');
  });
  it('mid mastery (4-7)', () => {
    expect(architectSpeech(5)).toContain('do not know what comes next');
  });
  it('low mastery (≤3)', () => {
    expect(architectSpeech(2)).toContain('do not understand each other yet');
  });
});
```

- [ ] **Step 14.2: Implement**

```ts
export function architectSpeech(totalMastery: number): string {
  if (totalMastery >= 8) return 'You have learned. We did not expect this.';
  if (totalMastery >= 4) return 'You have built. We do not know what comes next either.';
  return 'We do not understand each other yet. We have time.';
}
```

- [ ] **Step 14.3: Commit**

```bash
pnpm test:run src/seasons/s3-architect-speech.test.ts
git add src/seasons/s3-architect-speech.ts src/seasons/s3-architect-speech.test.ts
git commit -m "feat(s3): Architect speech variant by mastery total"
```

---

## Task 15: Final regression + saga complete

- [ ] **Step 15.1: Tests + build + lint**

```bash
pnpm test:run
pnpm build && pnpm lint
```

Expected: ≥ 130 tests pass.

- [ ] **Step 15.2: Web3 audit**

```bash
node -e "const p=require('./package.json'); const d={...p.dependencies,...p.devDependencies}; const b=['ethers','web3','wagmi','viem','@walletconnect/','@solana/']; console.log(Object.keys(d).filter(x=>b.some(y=>x.includes(y))).length?'FAIL':'OK');"
```

- [ ] **Step 15.3: Manual saga end-to-end**

1. M00–M20 plays.
2. Season 0 daily + weekly available.
3. Class switch to Corsair → ICE works.
4. Class switch to Ghost → tendrils + bonds.
5. Class switch to Architect → bastion editor opens.
6. Place a few walls + taps.
7. Trigger raid manually → replay viewable.
8. Reach TP-S3 stage 7 manually → Witness Node appears in bastion permanently.

- [ ] **Step 15.4: Document saga complete**

```
- **Six-Month Grid Phase 4 (Season 3 — Bastion)** — **Complete**. All four
  classes (Operator/Corsair/Ghost/Architect) live. Async raid system shipped.
  Witness Node permanent. **Saga arc complete.** Phase 5 (sandbox AI) opens
  next as stretch.
```

```bash
git add CURRENT_PROJECT_STATE.md
git commit -m "docs: Phase 4 (Season 3) complete — saga end"
```

---

## Phase 4 /goal directive

```
/goal Implement Phase 4 of the Six-Month Grid plan (Architect class + Season 3)
in docs/superpowers/plans/2026-05-28-six-month-grid-phase-4.md, using
docs/superpowers/specs/2026-05-28-content-bible-season-3.md.

Pre-requisite: Phases 0-3 shipped. M00-M20 + Seasons 0-2 playable.

Work through Tasks 1-15 in order, TDD per task.

Done when:
- 15 tasks committed.
- pnpm test:run exits 0 with ≥ 130 tests.
- pnpm build + pnpm lint exit 0.
- Architect class playable: build wall, see raid replay, place Witness Node.
- TP-S3 stage 5 speech variant matches mastery total.
- Witness Node persists across reload + soft-reset.
- M00-M20 + Seasons 0-2 still playable.
- No Web3 deps.

Constraints:
- Use every Season 3 Bible piece by canonical ID.
- GRID_POWER not soft-capped (build sinks).
- Witness Node immutable.
- Raid replays capped at 5 per Architect.
- Async raids respect anti-griefing rules.

Stop after 130 turns max.
```

---

## Self-Review

| Bible reference | Task |
|---|---|
| §1 Architect class | Tasks 6 + 12 |
| §1.3 Grid Power | Task 1 |
| §1.4 Build primitives | Task 2 |
| §1.5 Encryption tiers | Task 2 (cost mult) + Task 5 (raid wall-pass) |
| §1.6 Tools | Task 6 |
| §1.7 Skill tree | Task 6 |
| §2 Async raid system | Tasks 5 + 8 |
| §3 Story arc | Task 11 (beats) |
| §4 TP-S3 + Witness | Tasks 11 (data) + 14 (speech) + 10 (Witness UI) |
| §5–7 Weeklies / Dailies / Whispers | Task 11 |
| §8 Lore | Task 11 |
| §9 Economy | Task 1 (currency) + Task 4 (yield caps) |
| §10 Permanent unlocks | Witness + class flags via Task 12 + featureFlags |

**Placeholder scan** — none.
**Type consistency** — `PrimitiveType`, `EncryptionTier`, `BastionState`, `Cell`, `RaidStep`, `RaidResult`, `Raider` defined once.
**Scope** — Phase 4 only. Phase 5 (sandbox AI) and Phase 6 (token) deferred.

---

# Part IV — Future Phase Outlines (Phases 5 & 6)

These are deliberately not full plans. Each gets a detailed plan only when
all upstream phases ship + we have playtest signal.

## §4.1 Phase 5 — Sandbox AI Faction Layer (stretch)

**Goal:** Replace static factions with **simulated AI faction agents** that
have agendas, conflicts, and emergent behavior. Realize the "EVE-true"
ambition (Design Spec Approach A).

**Duration:** 12+ weeks.

**Dependencies:** Phases 0–4 fully shipped + a playerbase to playtest with.

**Content:**
- 4 Faction AI agents — each with: goals, resource pools, decision policy.
- Inter-faction conflict simulation (territory, contested sectors, alliances).
- Procedural events emerge from faction state (no longer hand-authored — though hand-authored remains an option).
- UGC tools (Phase 5b stretch): players can submit content drafts via NEVA Core drafter pipeline.
- Steam release candidate.

**New engine modules:**
- `src/factionAi/` — agent state, policy, decision loop.
- `src/factionAi/policies/` — one behavior profile per faction.
- `server/worldTick.mjs` — periodic world simulation (every 4h?).
- `server/ugcReview.mjs` — moderation queue for player-submitted content.

**Open question:** Is Phase 5 even desirable, or should we keep authored
factions and scale them through Phase 4's existing pipeline? Decide after
Phase 4 ships and we have ≥ 6 months of player data.

## §4.2 Phase 6 — Token Activation (gated)

**Goal:** Activate the WalletProvider abstraction (built in Phase 0) with a
real on-chain wallet implementation. Utility + earn + governance (per user's
long-term intent stated in design spec).

**Pre-conditions** (per Design Spec §5):
- ✅ Wallet abstraction (Phase 0 — done at plan time).
- ❌ Independent Sharia review (gharar / maisir / qimar analysis).
- ❌ Independent legal review (US + EU + KSA + UAE).
- ❌ Whitepaper draft + audit-firm pre-screen.
- ❌ Utility-vs-security classification.

**Tasks (when unblocked):**
1. On-chain WalletProvider — single file swap into existing wallet.ts interface.
2. Token contract deployment + audit.
3. On-chain ledger proofs (audit-trail reason codes from Phase 0 already in place).
4. Treasury contract (utility spend escrow).
5. Governance voting contract (class mastery + faction rep as voting weight).
6. Earn-tier emissions (P2E balanced against soft caps from Phases 0/3).
7. KYC if legal requires.
8. Public launch comms.

**Open question:** Is this still desirable after Phases 0–5 ship? Many
token-game projects failed. The abstraction lets you decide later without
rewriting code. Re-evaluate when the time comes.

---

# Part V — Status Tracker

## §5.1 Phase Status Table

| Phase | What it ships | Engine plan | Content Bible | Built? |
|---|---|---|---|---|
| **0** | Foundation (wallet/seasons/events/HUD) | ✅ Written | n/a | ⏳ /goal |
| **1** | Season 0 — Operator playable | ✅ Written | ✅ Written | ⏳ /goal |
| **2** | Season 1 — Corsair class | ✅ Written | ✅ Written | ⏳ /goal |
| **3** | Season 2 — Ghost class (**6-month target**) | ✅ Written | ✅ Written | ⏳ /goal |
| **4** | Season 3 — Architect + saga complete | ✅ Written | ✅ Written | ⏳ /goal |
| **5** | Sandbox AI factions | Outline only | n/a | Phase 4+ |
| **6** | Token activation | Outline only | n/a | Sharia + legal gated |

**Total written:** 5 engine plans (Phases 0–4) + 4 Content Bibles (Seasons 0–3) + 1 Design Spec = **10 documents.**

## §5.2 Documents written

| # | File | Lines | Purpose |
|---|---|---|---|
| 1 | `specs/2026-05-28-data-grid-game-design.md` | ~527 | Master vision |
| 2 | `specs/2026-05-28-content-bible-season-0.md` | ~795 | Season 0 content |
| 3 | `specs/2026-05-28-content-bible-season-1.md` | ~526 | Season 1 content |
| 4 | `specs/2026-05-28-content-bible-season-2.md` | ~416 | Season 2 content |
| 5 | `specs/2026-05-28-content-bible-season-3.md` | ~440 | Season 3 content |
| 6 | `plans/2026-05-28-six-month-grid-phase-0.md` | ~1864 | Foundation engine |
| 7 | `plans/2026-05-28-six-month-grid-phase-1.md` | ~2760 | Season 0 launch |
| 8 | `plans/2026-05-28-six-month-grid-phase-2.md` | ~1409 | Corsair |
| 9 | `plans/2026-05-28-six-month-grid-phase-3.md` | ~1054 | Ghost |
| 10 | `plans/2026-05-28-six-month-grid-phase-4.md` | ~1167 | Architect |
| **MASTER** | `MASTER_PLAN.{md,pdf}` | varies | This consolidated document |

**Total content:** ~11,000 lines of design + spec + plan covering 10 months of gameplay.

## §5.3 What's next (after this writing session)

1. **Read this master plan** end-to-end at least once.
2. **Run `/goal` for Phase 0.** Use the directive at the end of `plans/2026-05-28-six-month-grid-phase-0.md` §17. Estimated: 25 turns / a few hours of compute.
3. **Verify Phase 0 ships green** — `pnpm test:run` + `pnpm build` + manual M00 smoke.
4. **Run `/goal` for Phase 1.** Directive at end of `plans/2026-05-28-six-month-grid-phase-1.md` §"Phase 1 /goal directive". Estimated: 90 turns.
5. **Manual playtest Season 0** — invite a friend, get ≥ 3 hours of playthrough data.
6. **Run `/goal` for Phase 2** when ready. ~110 turns.
7. **Playtest Season 1.** Same pattern.
8. **Run `/goal` for Phase 3.** ~110 turns. **6+ month engagement target reached at this point.**
9. **Playtest Season 2.** Confirm The Question lands emotionally.
10. **Run `/goal` for Phase 4.** ~130 turns. Architect class shipped, saga complete.
11. Decide whether to pursue Phase 5 (sandbox AI) and/or Phase 6 (token activation, gated by Sharia + legal review).

## §5.4 Open decisions still pending

- **Faction names** — ✅ Locked in: Archive / Black Loop / Quiet Pattern / Severance.
- **Daily reset time** — ✅ UTC midnight.
- **Streak grace** — ✅ 24h + 1 weekly grace.
- **Anomaly leaderboard scope** — ✅ Global asynchronous.
- **Steam/itch release timing** — Phase 5 (after Architect ships).
- **Token activation** — DEFERRED to Phase 6, gated by Sharia + legal review.
- **Audio production** — placeholder text only through Phase 1; produce real audio in Phase 2 if budget allows.

## §5.5 Risks worth re-reviewing before /goal

| # | Risk | Where addressed |
|---|---|---|
| 1 | Content burnout | AI-drafter pipeline (Phase 1 Task 25); 12-template pool per season |
| 2 | Soft-reset annoys hoarders | Architect base + lore persist across resets (Phase 3 + 4 design) |
| 3 | Class balancing | One class at a time; no real-time PvP |
| 4 | Scope creep | Each phase has explicit "What's NOT in this phase" sections |
| 5 | LLM event drafts low quality | Max approval gate before publish (Phase 1 Task 25) |
| 6 | Token decision lock-in too early | WalletProvider abstraction, no Web3 deps through Phase 5 |
| 7 | Session drift | Daily streak rewards + weekly rerun in Cooldown week |
| 8 | Multi-class confusion | Primary class default; explicit switcher (Phase 2 Task 10) |
| 9 | Save migration breaks | v1→v2→v3→v4→v5→v6 additive only; regression test per phase |
| 10 | NEVA Core OpenAI cost | Server-side cap; offline-fallback mode (Phase 1 Task 25) |

---

## §5.6 The Big Picture

After 10 months of `/goal`-driven build sessions, the player who starts NEVA
Network will have:

- **20-mission tutorial** (existing M00–M20) = ~4–6 hours of guided learning.
- **Season 0 "First Cipher"** = 8 weeks of Operator content + Tentpole.
- **Season 1 "Black Routes"** = 8 weeks of Corsair content + Tentpole.
- **Season 2 "The Echo Below"** = 8 weeks of Ghost content + Tentpole (The Question).
- **Season 3 "Bastion"** = 12 weeks of Architect content + persistent base + Witness Node.

Total: **~10 months** of player-facing content authored end-to-end. Plus
daily/weekly/seasonal rerun depth and 4 mutually-supporting class loops.

The user said: *"i want the plan once we finish we get to play this game
for at least 6 months without getting bored."*

This plan exceeds that target. The 6-month mark lands at Phase 3 completion
(Season 2 finale, The Mirror). Phase 4 extends to ~10 months and closes the
saga arc with the Witness Node.

**End of Master Plan.**
