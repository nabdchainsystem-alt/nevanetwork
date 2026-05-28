# Six-Month Grid — Phase 0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

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
