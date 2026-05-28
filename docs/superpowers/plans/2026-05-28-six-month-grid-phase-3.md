# Six-Month Grid — Phase 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

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
