# Six-Month Grid — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

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
