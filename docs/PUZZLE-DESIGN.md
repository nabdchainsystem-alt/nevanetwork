# PUZZLE-DESIGN.md — authoring a year of NEVA NETWORK puzzles

This is the **puzzle system**: the archetypes, how each maps to the existing node
types and game actions, the deterministic generator pattern that keeps puzzles
reproducible, the difficulty curve, and a 365-day plan so you never repeat.

Source content (the actual facts/formulas to build puzzles from) lives in
`docs/SCIENCE-CODEX.md`. This file is the *machine*; the codex is the *fuel*.

---

## 1. The core loop you already have

From `src/game.ts`, the game gives you a complete puzzle skeleton for free:

- **Node types** carry meaning: `MEMORY`, `CAMERA`, `IDENTITY`, `MESSAGE`, `ARCHIVE`,
  `GATEWAY`, `DECOY`, `LOCKED`.
- **Actions**: `OPEN_STREAM`, `TRACE`, `ISOLATE`, `EXPORT`, `ENTER_SUB`, `RESET`.
- **Currencies**: `traceLevel` (0–100, **lock = fail**), `extractedData` (score),
  `accessLevel` (gate: `1 + floor(extractedData/100)`), `currentDepth` (how deep you've
  dived through gateways), `isolatedNodes`, `revealedLinks`.

Reframe these as puzzle verbs:

| Game action | Puzzle meaning |
|-------------|----------------|
| `OPEN_STREAM` | Reveal the puzzle prompt / clue text for this node. |
| `TRACE` | Reveal a node's links — used for path/graph puzzles and as a "hint" that costs trace. |
| `ISOLATE` | Mark a node as the answer / quarantine a suspected DECOY. Correct = reward, wrong = trace spike. |
| `EXPORT` | Submit the solution to claim the data (only succeeds if the puzzle is solved / node unlocked). |
| `ENTER_SUB` | A correct GATEWAY solution descends a layer (a harder puzzle set). |
| trace rising | The universal **wrong-answer / time-pressure** cost. Hits 100 → session locked. |

**Design rule:** a puzzle is *"what does the player have to figure out before `EXPORT`
(or `ISOLATE`/`ENTER_SUB`) succeeds?"* You rarely need new game state — you need a
**validator** that gates an existing action.

---

## 2. Node type → puzzle flavor

Anchor each puzzle to the type the node already has, so theme and mechanic agree:

| Type | Natural puzzle flavor |
|------|----------------------|
| `MEMORY` | Sequence completion, pattern recall, "what comes next" (number/shape/state sequences). |
| `MESSAGE` | Ciphers & decoding — Caesar/Vigenère/substitution, Morse, binary/hex/Base64/ASCII, semaphore. |
| `IDENTITY` | Logic deduction (knights/knaves, Zebra-style grids), "which node is who". High value, high trace. |
| `ARCHIVE` | Requires a `TRACE` first (already enforced). Knowledge/lore retrieval — astronomy, history-of-science, unit conversions. |
| `CAMERA` | Spatial / geometry / visual — rotations, reflections, projections, "which view matches". |
| `GATEWAY` | A gate puzzle whose answer opens a `ENTER_SUB` dive. Often a key/path. Can't be ISOLATEd (built-in). |
| `DECOY` | A *trap*: looks solvable, but EXPORT spikes trace. The puzzle is **recognizing** it's a decoy (parity check, inconsistent clue, impossible figure). ISOLATE it instead. |
| `LOCKED` | Needs a key derived from a puzzle (a code, a computed value, an access level). |

---

## 3. The 12 puzzle archetypes

Each archetype is a reusable template. Combine archetype × codex topic × difficulty to
generate effectively unlimited puzzles. For each: what the player sees, what they do,
how to validate.

1. **Decode / cipher** — given ciphertext + a hint about the scheme, recover plaintext.
   *Validate:* exact string match (case-normalized). Codex: §Encodings, §Number theory (modular).
2. **Sequence completion** — show *n* terms, ask term *n+1* (or the rule).
   *Validate:* numeric equality. Codex: §Sequences, §Number theory.
3. **Pathfinding on the graph** — using the real `NETWORK.neighbours`, find shortest /
   cheapest / only path between two nodes; or the minimum trace route.
   *Validate:* compare to BFS/Dijkstra result you compute from the same data. Codex: §Graph theory.
4. **Logic deduction** — a set of constraints; determine the unique assignment.
   *Validate:* unique solution found by constraint propagation. Codex: §Logic.
5. **Spot-the-decoy / consistency check** — several nodes, one violates a rule (parity,
   checksum, conservation law). Identify it.
   *Validate:* index match. Codex: §Number theory (checksums), §Physics (conservation).
6. **Calculation / formula** — plug values into a physics/astronomy formula, answer within tolerance.
   *Validate:* `|answer − expected| < ε`. Codex: §Mechanics, §Relativity, §Astrophysics.
7. **Unit / scale conversion** — convert between units or order objects by size/distance/age.
   *Validate:* numeric tolerance or correct ordering. Codex: §Scale & constants.
8. **Spatial reasoning** — rotate/reflect/fold a shape; match a 3D view; count hidden cubes.
   *Validate:* enumerated choice. Codex: §Geometry, §Topology.
9. **Optimization / resource** — maximize extracted data under a trace budget; knapsack-style.
   *Validate:* compare to optimal you precompute. Codex: §Combinatorics.
10. **Simulation / prediction** — given initial conditions (orbit, pendulum, cellular
    automaton, decay), predict the state after *t* steps.
    *Validate:* run the same deterministic sim. Codex: §Mechanics, §Chaos, §Quantum.
11. **Pattern / classification** — group nodes by a hidden property (prime vs composite,
    star type, particle family); the puzzle is finding the rule.
    *Validate:* correct partition. Codex: §Number theory, §Particle physics, §Stellar.
12. **Lore / trivia gate** — a fact about the universe gates access (good for ARCHIVE).
    Keep these rare and well-sourced; pair with a *computed* element so they aren't pure recall.
    *Validate:* multiple-choice or exact value. Codex: any §.

---

## 4. Deterministic generator pattern (critical)

Every puzzle must regenerate identically from the seed (see CLAUDE.md convention #1 &
#2). Pattern:

```ts
// puzzles.ts (sketch) — give puzzles their OWN xor'd sub-seed, never share a stream
import { WORLD_SEED, mulberry32 } from './world';

const PUZZLE_SALT = 0x9_17e5 >>> 0;            // pick a unique constant for this subsystem

export interface Puzzle {
  archetype: string;                            // e.g. 'cipher'
  prompt: string;                               // what OPEN_STREAM reveals
  // validate is PURE: same input -> same result, no Date.now/Math.random
  validate: (answer: string) => boolean;
}

// one stable RNG per node, derived from the node index
function rngForNode(i: number) {
  return mulberry32((WORLD_SEED ^ PUZZLE_SALT ^ (i * 0x9e3779b1)) >>> 0);
}

export function puzzleForNode(i: number): Puzzle {
  const r = rngForNode(i);
  // derive BOTH the clue and the answer from r, so they always match:
  // ...build prompt + expected answer from r...
}
```

Rules:
- Derive **clue and answer from the same RNG** so they can never desync.
- The validator is **pure** — it goes through (or alongside) the existing pure
  `gameReducer`. No clocks, no `Math.random`.
- Want a daily puzzle? Fold a day index into the salt:
  `mulberry32(WORLD_SEED ^ PUZZLE_SALT ^ dayIndex)`. Same day → same puzzle for everyone.
- Test it: a generated puzzle's own `validate(correctAnswer)` must return `true`, and the
  optimization/graph archetypes must agree with an independent solver. Use the
  `test-driven-development` and `playtest-and-determinism` skills.

---

## 5. Difficulty curve

Tie difficulty to **depth** (`currentDepth`) and **accessLevel** — both already exist.

| Tier | Gate | Feel | Examples |
|------|------|------|----------|
| 1 — Surface | depth 1 | One step, one concept. ~15s. | Caesar shift, next Fibonacci term, count the cubes. |
| 2 — Trace | depth 2–3 | Two steps or a small search. ~1 min. | Vigenère with given key, shortest path on 6 nodes, kinetic-energy calc. |
| 3 — Deep | depth 4–6 | Multi-constraint or multi-stage. Several min. | Logic grid, knapsack under trace budget, orbital period from Kepler. |
| 4 — Core | depth 7+ | Chains spanning multiple nodes; partial info; a real fail risk. | Decode→path→deduce key→unlock GATEWAY; relativistic time-dilation chain. |

Knobs that scale a single archetype across tiers: alphabet/range size, number of
constraints, graph size, tolerance ε, number of decoys, whether a hint (`TRACE`) is
affordable, and time pressure (trace decay rate).

---

## 6. Anti-repetition: the 365-day plan

Organize the world into **themed sectors** (you already display a `SECTOR` in the HUD).
Each sector pulls from one codex domain; rotate archetypes within it. 12 themes ×
~30 days, or 52 weeks each owning a sub-topic. A grid this large (220 interactive +
thousands of background nodes, plus infinite `ENTER_SUB` depth) easily holds a year.

| Month | Sector theme | Codex source | Lead archetypes |
|-------|--------------|--------------|-----------------|
| 1 | Number & primes | §Number theory | sequence, classification, cipher |
| 2 | Codes & signals | §Encodings | decode, spot-the-decoy (checksums) |
| 3 | Graphs & networks | §Graph theory | pathfinding, optimization |
| 4 | Logic & proof | §Logic | deduction, spot-the-decoy |
| 5 | Geometry & shape | §Geometry/§Topology | spatial, calculation |
| 6 | Classical motion | §Mechanics | calculation, simulation |
| 7 | Waves, light & fields | §EM & waves | calculation, pattern |
| 8 | Heat & chance | §Thermo, §Probability | optimization, prediction |
| 9 | Quantum | §Quantum | simulation, logic (superposition/entanglement) |
| 10 | Spacetime & relativity | §Relativity | calculation, prediction |
| 11 | Stars & galaxies | §Astrophysics | scale, classification, lore |
| 12 | Cosmos & origins | §Cosmology | scale, calculation, lore |

Daily generation recipe: `(dayIndex) → theme = months[...], archetype = rotate(dayIndex),
difficulty = tier from streak/progress`, then `puzzleForNode` with `dayIndex` folded into
the salt. That's a deterministic, non-repeating year — and it keeps going.

---

## 7. Authoring checklist (per puzzle)

1. Pick **node type** → flavor (§2) and **archetype** (§3).
2. Pull facts/formulas from the matching **codex** section.
3. Derive clue **and** answer from one node RNG (§4). Keep `validate` pure.
4. Set difficulty knobs for the target **tier** (§5).
5. Wire it: `OPEN_STREAM` shows the prompt; the solve gates `EXPORT`/`ISOLATE`/`ENTER_SUB`;
   wrong answers add trace.
6. Test: `validate(answer) === true`; solvers agree; same seed reproduces it; StrictMode-safe.
7. Run `pnpm build` + a manual playtest (use `playtest-and-determinism` debug overlays).
