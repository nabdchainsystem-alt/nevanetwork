# NEVA NETWORK — Content Bible: Season 3 "Bastion"
**Date:** 2026-05-28
**Author:** Max + Claude (Opus 4.7)
**Companion docs:**
- Master Plan: `docs/superpowers/MASTER_PLAN.md`
- Prior Bibles: Seasons 0, 1, 2 (read in order).
**Status:** Draft 1 — implementation-ready.

---

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
