# NEVA NETWORK — Content Bible: Season 2 "The Echo Below"
**Date:** 2026-05-28
**Author:** Max + Claude (Opus 4.7)
**Companion docs:**
- Master Plan: `docs/superpowers/MASTER_PLAN.md`
- Season 0 Bible (foundation): `docs/superpowers/specs/2026-05-28-content-bible-season-0.md`
- Season 1 Bible: `docs/superpowers/specs/2026-05-28-content-bible-season-1.md`
**Status:** Draft 1 — implementation-ready.

---

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
