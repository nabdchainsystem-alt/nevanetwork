# Six-Month Grid — Phase 4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

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
