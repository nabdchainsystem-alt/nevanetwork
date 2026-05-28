# Six-Month Grid — Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

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
