# NEVA NETWORK — Content Bible: Season 1 "Black Routes"
**Date:** 2026-05-28
**Author:** Max + Claude (Opus 4.7)
**Companion to:**
- Design Spec: `docs/superpowers/specs/2026-05-28-data-grid-game-design.md`
- Master Plan: `docs/superpowers/MASTER_PLAN.md`
- Season 0 Bible (read first): `docs/superpowers/specs/2026-05-28-content-bible-season-0.md`
**Status:** Draft 1 — implementation-ready.

---

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
