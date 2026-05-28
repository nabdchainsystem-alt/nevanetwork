# NEVA NETWORK — Content Bible: Season 0 "First Cipher"
**Date:** 2026-05-28
**Author:** Max + Claude (Opus 4.7)
**Companion to:**
- Design Spec: `docs/superpowers/specs/2026-05-28-data-grid-game-design.md`
- Engine Plan: `docs/superpowers/plans/2026-05-28-six-month-grid-phase-0.md`
**Status:** Draft 1 — every piece below is implementation-ready.

---

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
