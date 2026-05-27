# CURRENT_PROJECT_STATE.md — NEVA NETWORK

> Read-only audit of the **actual codebase** as of **2026-05-26**. No gameplay, UI, or
> behavior was changed to produce this report. Everything below was verified by reading
> the source, not by assumption.

> **Headline finding:** the code is **far ahead of the docs**. The game is playable
> **Mission 00 → Mission 20** across two sectors, with a public landing page and a working
> waitlist backend. The `NEVA_NETWORK_MASTER_BLUEPRINT.md` only documents through ~Mission 03 +
> the Private-Grid/resource/upgrade layer, and **`NEVA_Network_Master_Launch_Roadmap.pdf` does
> not exist** in the repo. Treat external prompts written against the old roadmap with caution
> (e.g. "add Mission 04 = FIREWALL SURGE" is stale — Mission 04 is already PRIVATE GRID and
> FIREWALL SURGE is already Mission 10).

---

## 1. Current Build Status

| Check | Command | Result |
|------|---------|--------|
| TypeScript | `npx tsc -b` | ✅ **0 errors** |
| Lint | `pnpm lint` (`eslint .`) | ✅ **0 problems** |
| Production build | `pnpm build` (`tsc -b && vite build`) | ✅ **success** |

- **Bundle (build output):** `index.js` ≈ **1,345 kB** (≈ 370 kB gzip), `index.css` ≈ **101 kB**
  (≈ 21 kB gzip).
- **Known warning (pre-existing, benign):** Vite reports *"Some chunks are larger than 500 kB"* —
  this is the three.js / React-Three-Fiber renderer in a single chunk. Not an error; no
  code-splitting configured.
- **Stack:** Vite 8 + React 19 + TypeScript (strict) + React-Three-Fiber 9 / drei /
  postprocessing (Bloom), three 0.184. Package manager **pnpm**.
- **Test runner:** none configured (`pnpm test` is not defined; no vitest/jest). Verification is
  build + lint + typecheck + manual.

### Technical debt / drift
- **Docs are stale.** `NEVA_NETWORK_MASTER_BLUEPRINT.md` and `CLAUDE.md` describe roughly the
  Mission-00–03 era (plus resources/upgrades/Private Grid). They do **not** document Missions
  04–20, the Mission Objective Guidance system, the cinematic pass, the rewritten landing page,
  or the waitlist backend. `CLAUDE.md` also describes a richer multi-file landing
  (`sections.tsx`, `content.ts`, live R3F hero) that **does not match** the actual single
  `Landing.tsx` (CSS-only visuals).
- Single large JS chunk (no code-splitting).
- `CORE_FRAGMENTS` resource is earned but currently **unspendable** (reserved for future).
- A few mission completion flags latch **by node index regardless of mission id** (safe
  "auto-complete if already done", but a subtle flow nuance — see §11).

---

## 2. Mission Chain Status

The chain is **Mission 00 (tutorial) → Mission 20 (finale)**, all implemented. Completion gates
live in `game.ts › missionTasksDone()`; HUD checklists in `missions.ts › getMissionHudState()`;
guidance metadata in `objectives.ts › OBJECTIVE_META`.

**Global rules**
- **Failure (all missions):** trace reaches **100% → session locked** (`locked`). Recovery =
  **R** (retry from latest checkpoint) or **Shift+R** (full reset). The only fail state.
- **Advance:** completing a mission latches `missionComplete`; **CONTINUE NETWORK** dispatches
  `MISSION_ADVANCE` (caps at 20) → next mission briefing.
- **Sectors / chapters:** A01 Memory Grid = M00–07; A02 Deep Network = M08–20.
  Chapters: FIRST SIGNAL (00) · NETWORK AWAKENING (01–03) · PRIVATE GRID (04–07) · DEEP NETWORK
  (08–10) · CORRUPTION PRESSURE (11–12) · ALPHA CORE (13–20).

| # | Name | Unlock | Main objective | Completion gate | Mechanic introduced | State |
|---|------|--------|----------------|-----------------|---------------------|-------|
| **00** | FIRST SIGNAL | first run (pre-network) | 9 guided tutorial beats, one per node type | `mission00.complete` (all 9 steps) → reveals network | Guided onboarding; teaches INSPECT/EXPORT/TRACE/USE_KEY/ISOLATE/OPEN/CORE | ✅ Full |
| **01** | SURFACE BREACH | tutorial done → ENTER | learn the loop, reach Depth 02 | inspected≥3 · extracted≥100 · traced≥3 · riskIsolated≥1 · depth≥2 | Core loop (inspect/export/trace/isolate/gateway) | ✅ Full |
| **02** | ARCHIVE HUNT | M01 continue | extract higher value, find next gateway | extracted≥200 · traced≥6 · archiveExports≥2 · riskIsolated≥2 · `nextGatewayFound` | ARCHIVE route verification, decoy avoidance | ✅ Full |
| **03** | SIGNAL WAR | M02 continue | survive resistance, reach Depth 03 | survived≥3 · stabilized≥5 · watcher≥2 · extracted≥250 · depth≥3 | **Signal Pulses, Watchers (CAMERA), Corrupted Links**; unlocks Private Grid | ✅ Full |
| **04** | PRIVATE GRID | M03 continue | install your first module/upgrade | `hasInstalledModule` (any module **or** upgrade level > 0) | **Private Grid / modules / upgrades** become objective-relevant | ✅ Full |
| **05** | SECURE ROUTES | M04 continue | harden the network | riskIsolated≥2 · traced≥4 | Isolate + trace combo | ✅ Full |
| **06** | DEEP EXTRACTION | M05 continue | pull serious DATA | extracted≥250 (mission-scoped) | High-value extraction under threat | ✅ Full |
| **07** | CORE BREACH | M06 continue | reach Depth 03, secure the CORE | depth≥3 · `coreSecured` (CORE node traced/extracted/unlocked/isolated) | **Designated CORE node**; Sector A01 finale | ✅ Full |
| **08** | DEEP SIGNAL | M07 continue | open a deep route, reach Depth 04 | `maxDepthReached ≥ 4` | Depth 04 / deep route | ✅ Full |
| **09** | VAULT BREACH | M08 continue | **EXTRACT [E]** the Deep Vault | `vaultBreached` (export the VAULT node) | Designated high-value vault (1.5× data, higher trace) | ✅ Full |
| **10** | FIREWALL SURGE | M09 continue | **OPEN [O]** / USE KEY the Black Firewall | `blackFirewallOpened` (open-stream or key on FIREWALL node) | **Firewall (LOCKED) designated node** | ✅ Full |
| **11** | CORRUPTION WAVE | M10 continue | **ISOLATE [I]** the corrupted node | `corruptionWaveCleared` (isolate CORRUPTION node) | Corruption-wave designated node | ✅ Full |
| **12** | RELAY COLLAPSE | M11 continue | **RESTORE [T]** the broken relay | `brokenRelayRestored` (trace RELAY gateway node) | Relay restore | ✅ Full |
| **13** | SIGNAL STORM | M12 continue | **ISOLATE [I]** the storm source | `signalStormCleared` (isolate STORM camera node) | Signal-storm designated node | ✅ Full |
| **14** | CORE FRAGMENT RECOVERY | M13 continue | **EXTRACT [E]** a core fragment | `coreFragmentRecovered` (export FRAGMENT node → +1 CORE) | Guaranteed Core Fragment recovery | ✅ Full |
| **15** | PRIVATE GRID OVERLOAD | M14 continue | **UPGRADE [U]/[B]** — bring a module online | `privateGridStabilized` (install module / buy upgrade during M15) | Node-less "use the grid" objective | ✅ Full |
| **16** | CORRUPTION CONTAINMENT | M15 continue | **ISOLATE [I]** the corrupted cluster | `corruptionContained` (isolate CLUSTER node) | 2nd corruption node (containment) | ✅ Full |
| **17** | BLACK ROUTE ACCESS | M16 continue | TRACE→**OPEN [O]** / USE KEY the Black Route | `blackRouteOpened` (open-stream/key on BLACKROUTE node) | 2nd firewall (dangerous route) | ✅ Full |
| **18** | SECTOR A02 CORE CHAMBER | M17 continue | **OPEN [O]** the chamber route | `coreChamberOpened` (open-stream on CHAMBER gateway) | Chamber route to the core | ✅ Full |
| **19** | ALPHA CORE STABILIZATION | M18 continue | **STABILIZE [T]** the Alpha Core | `alphaCoreStabilized` (trace CORE node during M19) | Alpha Core (reuses CORE node) | ✅ Full |
| **20** | SECTOR A02 SECURED | M19 continue | **SECURE [T]** the Alpha Core | `sectorA02Secured` (trace CORE node during M20) | **Finale** → "SECTOR A02 SECURED / ALPHA CORE ONLINE / NEXT SECTOR LOCKED" | ✅ Full |

> Action-variety note: TRACE no longer auto-completes the open/isolate/extract/upgrade missions —
> each objective requires its mapped action (EXTRACT / OPEN / ISOLATE / RESTORE-STABILIZE-SECURE /
> UPGRADE). Wrong actions don't falsely complete checklists.

---

## 3. Gameplay Systems Implemented

- **Node graph** — `network.ts`: 220 interactive nodes in 11 lobes, deterministic from
  `WORLD_SEED`, nearest-neighbour edges; thousands of decorative background nodes.
- **Node types (8)** — depth-scaled (Depth 01 vs Depth 02+ weight tables). See §4.
- **Trace system** — 0–100; actions add trace, idle TICK decays it; **100 = lock**. Tiers:
  STABLE/WATCHED/TRACED/CRITICAL. Per-action "TRACE ±N" readout.
- **Corruption system** — `EDGE_CORRUPT` (deterministic ~32% of edges); `corruptionRisk` % in HUD
  (Mission 03+); TRACE stabilizes corrupted links touching a node.
- **Signal Pulse** — Mission 03+ timed pressure events (raise action trace cost; survive +1).
- **Firewall / designated objective nodes** — deterministic "farthest of type" nodes:
  CORE/ALPHA CORE, HOME, VAULT, FIREWALL (Black Firewall), CORRUPTION, RELAY, STORM, FRAGMENT,
  GRID, CLUSTER, BLACKROUTE, CHAMBER. No new node *type* — they reuse existing types + rendering.
- **Resources (5)** — DATA + Memory Shards, Access Keys, Signal Energy, Core Fragments (§5).
- **Upgrades (6)** — permanent session upgrades, `UpgradePanel` [U] (§6).
- **Player Subnetwork / Private Grid + Modules (4)** — `PlayerSubnetworkPanel` [B], unlocks after
  Mission 03 (§6).
- **Checkpoints** — milestone snapshots (mission start / depth reached / route found / continue);
  trace-lock retry restores latest, never bounces to Mission 01.
- **Save / load** — `save.ts`, localStorage v1 + `.bak` + separate checkpoint slot, additive-merge
  migration seam (§8 of save behavior; §5 persistence).
- **Mission Objective Guidance system** — `objectives.ts`: `resolveObjectiveTarget`, in-world
  `ObjectiveMarker` (per-category color/shape), NodeInfo objective badge, HUD hint +
  FOCUS OBJECTIVE button, metadata-driven `getCurrentObjectiveNodeId`.
- **Mission transition cinematic** — clear panels → glide to overview → "ROUTE SHIFTING" light-speed
  warp on mission change; located cue.
- **Sector visual identity** — A02 = heavier fog + more bloom + deeper vignette (cheap, prop-driven).
- **Core / Alpha-Core moments** — stabilization sweep on M07/M19/M20; premium finale overlay.
- **Private Grid contextual tips** — advisory module suggestions in the HUD by situation.
- **Dev Scan** — `V` toggles a developer overlay (node-type tags, nearest-gateway bracket,
  corruption/watcher debug). `G` focuses nearest gateway. NEVA Terminal (`Space`) with
  `scan`/`go to <type>`/`finish mission` (dev) commands.
- **Landing page** — multi-section public identity page (§7).
- **Waitlist backend** — Node http server + JSON store (§8).
- **NEVA Core Assistant v1 (AI)** — backend-only OpenAI advisory hints (`server/neva-ai.mjs` →
  `POST /api/ai/neva-core`; frontend `src/nevaCore.ts` + `NevaCorePanel.tsx`, opened with **N**).
  Advisory ONLY (never changes game state); offline-safe deterministic fallbacks; key server-side
  (`OPENAI_API_KEY`). *(Added after this audit was first written; docs synced.)*
- **Player Profile v1 (Phase 7)** — LOCAL-FIRST operator identity (`src/profile.ts` +
  `ProfilePanel`/`CallsignPrompt`, open with **L**). Own localStorage slot (`neva:profile:v1` +
  `.bak`), **separate from the game save/checkpoint** so Shift+R / checkpoint retry / soft-R keep
  the identity. A persistent high-water-mark snapshot (callsign, player level, network score,
  mission/depth marks, resources/grid snapshot, achievements v1) folded from `GameState` by a pure
  `syncProfile`. Identity-only — **never** changes gameplay/save. `accountStatus: LOCAL_ONLY`;
  remote account/login/remote-save are PLANNED (placeholders only). *(Added after this audit; docs synced.)*
- **NOT present (intentionally):** ❌ Web3 / wallet / token / presale / ICO / smart contracts /
  payments · ❌ multiplayer · ❌ remote accounts / login / remote save / invite-code logic (only the
  local Player Profile above + waitlist data-model placeholders; LOZA easter-egg is a dormant hook).

---

## 4. Node Types

`NodeType` (game.ts): `MEMORY · MESSAGE · IDENTITY · ARCHIVE · CAMERA · GATEWAY · DECOY · LOCKED`.
Player-facing **class** (`nodeCategory`) overlays HOME/CORE/DATA/KEY/VAULT/FIREWALL/CORRUPTED/
WATCHER/GATEWAY.

| Type | Class | Primary action(s) | Reward (Depth 01 base) | Risk | Mission relevance |
|------|-------|-------------------|------------------------|------|-------------------|
| MEMORY | DATA | EXPORT | 10 data + memory shards | LOW | bulk data |
| MESSAGE | DATA | EXPORT (trace links useful) | 8 data | LOW | data |
| IDENTITY | KEY | EXPORT | 20 data + **1 key** (guaranteed) | HIGH | **Core Fragment node (M14)** |
| ARCHIVE | VAULT | TRACE→EXPORT (verify route) | 15 (→24 deep) + shards + key chance | MED | **Deep Vault (M09)** |
| CAMERA | WATCHER | ISOLATE (signal source) | export only if handled → signal | MED | M03 watchers · **Signal Storm (M13)** |
| GATEWAY | GATEWAY | OPEN STREAM → ENTER_SUB (descend) | none (route) | HIGH | depth progression · **Relay (M12) · Chamber (M18)**; ISOLATE fails on gateways |
| DECOY | CORRUPTED | ISOLATE (neutralize; EXPORT = trap/spike) | none | CRIT | **Corruption (M11) · Cluster (M16)** |
| LOCKED | FIREWALL | USE KEY / TRACE to unlock; OPEN to clear | 12 (+keys/access) | HIGH | **Black Firewall (M10) · Black Route (M17)** |
| — | HOME | (opens Private Grid panel) | — | — | private grid hub (nearest centre) |
| — | CORE / ALPHA CORE | SECURE/STABILIZE (TRACE) | — | — | **M07 / M19 / M20** (farthest node) |

---

## 5. Resources and Economy

| Resource | Earned by | Spent on | UI | Persists |
|----------|-----------|----------|----|----------|
| **DATA** (`extractedData`) | EXPORT (scales with depth, EXPORT EFFICIENCY, DATA VAULT) | module installs; drives **Access Level** (`1 + floor(data/100)`) | HUD RESOURCES + topbar DATA rate | ✅ |
| **Memory Shards** | MEMORY/ARCHIVE exports | ANALYZE NODE; upgrade/module costs | HUD RESOURCES (MEM) | ✅ |
| **Access Keys** | IDENTITY export (guaranteed); ARCHIVE/LOCKED chance; isolating LOCKED | USE KEY (unlock); upgrade/module costs | HUD RESOURCES (KEYS) | ✅ |
| **Signal Energy** | isolating watchers/decoys; stabilizing corrupted links; ENTER_SUB (+1) | BOOST ISOLATE / STABILIZE ROUTE; upgrade/module costs | HUD RESOURCES (SIGNAL) | ✅ |
| **Core Fragments** | Depth 03+ archive/identity/gateway chance; **M14 guaranteed +1** | **nothing yet (reserved)** | HUD RESOURCES (CORE) + "powers future upgrades" note | ✅ |

Economy is deterministic (seeded rolls, pure reducer). No real money, tokens, or external value.

---

## 6. Upgrade and Module Systems

**Permanent upgrades (6, max level 3, `UpgradePanel` [U])** — bought with resources; persist in save.

| Upgrade | Effect (per level) | Cost path (L1→L3) |
|--------|--------------------|-------------------|
| TRACE DAMPENER | trace gain −8%/lvl | 2 sig → 4 sig +1 key → 6 sig +2 key |
| EXPORT EFFICIENCY | data reward +10%/lvl | 4 mem → 8 mem +1 key → 12 mem +2 key |
| SCAN RESOLUTION | node intel +1/lvl | 3 mem → 6 mem +1 sig → 10 mem +2 sig |
| ISOLATION CORE | isolate −15% more trace/lvl | 3 sig → 6 sig → 9 sig +1 key |
| KEY FORGE | key drop +12%/lvl | 1 key+5 mem → 2 key+8 mem → 3 key+12 mem |
| SIGNAL STABILIZER | pulse −7%/lvl · wider repair | 4 sig → 8 sig +1 key → 12 sig +2 key |

**Private Grid modules (4, max level 3, `PlayerSubnetworkPanel` [B])** — unlock after Mission 03;
cost DATA + resources; persist in save.

| Module | Purpose / effect | Cost path (L1→L3) |
|--------|------------------|-------------------|
| DATA VAULT | data export +8%/lvl · +storage | 100d+5m → 220d+9m → 380d+14m |
| TRACE SHIELD | action trace −4%/lvl | 80d+4s → 170d+7s → 300d+11s |
| KEY CACHE | key drop +6%/lvl · better key handling | 120d+1k+4m → 240d+2k+7m → 400d+3k+11m |
| SIGNAL RELAY | pulse −4%/lvl · wider repair | 100d+5s+3m → 210d+8s+6m → 360d+12s+9m |

Modules/upgrades give subtle in-action feedback ("TRACE SHIELD", "SIGNAL RELAY ASSIST",
"KEY CACHE"). They **help, never gate** progress.

---

## 7. UI / Panels / HUD

- **Left HUD** (`ExplorerHud`): SYSTEM STATUS (trace bar + THREAT + CORRUPTION), RESOURCES,
  NETWORK ACCESS (access/depth/isolated/links/camera), PRIVATE GRID (online/offline + modules),
  SAVE / SCAN status. *(QUICK CONTROLS and TARGET NODE sections were intentionally removed — do
  not reintroduce.)*
- **Top status bar:** sector (A01/A02) + grid + integrity/uplink/core/mem/lat/data chips + signal
  chips (M03+).
- **Mission panel** (lower-left): chapter, mission id + name, ACTIVE/COMPLETE, objective line,
  status-aware objective hint + **FOCUS OBJECTIVE** button, Private-Grid tip line, task checklist
  (re-keyed type-in). Panel max-height raised so the full checklist fits.
- **Brand wordmark + comb timeline + coordinate readout** (top-center / bottom).
- **NEVA Terminal** (`Space`) — command console: `scan`, `go to <type>`, `finish mission` (dev),
  pin/dock.
- **Node Inspection panel** (`HolographicNodePanel`, right of node) — data rows, EXPECTED YIELD,
  action buttons (OPEN/TRACE/ISOLATE/EXTRACT + resource actions), **REQUIRED ACTION block**
  (step 1/2 → 2/2, cost, risk, "why"), stream panel, gateway ENTER.
- **Node Info panel** (`NodeInfoPanel`, left of node) — read-only twin + **MISSION OBJECTIVE** badge
  + required action.
- **Upgrade panel** (`UpgradePanel`, [U]) · **Player Subnetwork panel** (`PlayerSubnetworkPanel`,
  [B]) · **Interface settings** (`InterfaceSettingsPanel`, [,]).
- **Mission overlays** (`.mx`): briefing, complete, **premium finale** (M20). Plus transition-hint,
  mission-warp, core-sweep, objective marker, depth/lock/risk flashes.
- **Mission 00 Intro bar** (`Mission00Intro`) · **TouchControls** (mobile).
- **In-world (R3F):** InteractiveNodes (instanced), NodeConnections, CorruptedLinks, WatcherRings,
  ScanLabels, Subnetwork, PlayerSubnetwork, DevScanOverlay, SelectedNodeFocus, ObjectiveMarker,
  TutorialPath, FlyCamera, Bloom.
- **Landing page** (`components/landing/Landing.tsx` + `landing.css`): sticky Nav, Hero (CTAs +
  CSS-SVG network), Game Concept cards, Current Alpha, Sector Map (A01/A02 live, A03 planned),
  Private Grid, **NEVA Coin future-utility concept (safe wording)**, Roadmap (Phases 1–9),
  **Waitlist form (live)**, Footer disclaimer. Scroll-reveal animations.

---

## 8. Backend / Landing / Waitlist

- **Server:** `server/index.mjs` — zero-dependency Node `http` server (default port **8787**).
  - `POST /api/waitlist` → `{ ok, message, entryId }` | `{ ok, duplicate, message }` |
    `{ ok:false, error }`.
  - `GET /api/waitlist/stats` → `{ total, byRole, latestCreatedAt }` (**no emails exposed**).
  - Serves built `dist/` in production (SPA fallback).
- **Store:** `server/waitlist-store.mjs` — validation (email regex + 254 cap, role allowlist,
  trim/length caps, lowercase normalize, duplicate prevention), fs JSON at **`data/waitlist.json`**,
  corrupt-file backup, near-atomic writes. Entry model: `id, email, callsign, role, source, status
  (new|reviewed|invited|blocked), invited(false), inviteCode(null), notes, createdAt, updatedAt`.
- **Abuse guards:** 8 KB body cap, in-memory per-IP rate limit (8/60s).
- **Script:** `scripts/waitlist-summary.mjs` → `pnpm waitlist:count` (aggregate only).
- **Dev wiring:** `vite.config.ts` proxies `/api` → `http://localhost:8787`
  (override with `NEVA_API`).
- **Landing form:** real submit with idle/submitting/success/duplicate/error states; success shown
  **only** after API confirms; privacy line + footer disclaimer present.
- **Run locally:** dev = `pnpm server` + `pnpm dev`; preview = `pnpm server` + `pnpm preview`;
  prod = `pnpm build` then `pnpm server` (one process serves site + API).
- **Complete:** collection, dedupe, validation, stats, summary script, early-access data shape.
- **Missing:** accounts / login, invite-code issuance/redemption, email sending/verification,
  auth on the stats endpoint, a real database. **Static hosting alone will not store submissions —
  the Node server must run.** `data/waitlist.json` and backups are git-ignored (never commit emails).

---

## 9. Roadmap Comparison

- **`NEVA_Network_Master_Launch_Roadmap.pdf`** — **NOT PRESENT** in the repo.
- **`NEVA_NETWORK_MASTER_BLUEPRINT.md`** — present but **stale**: documents through ~Mission 03 +
  resources/upgrades/Player Subnetwork v1 + checkpoints + terminal + dev scan. It does not cover
  Missions 04–20, objective guidance, cinematic pass, the current landing, or the backend.

Against the phase plan shown on the landing-page roadmap:

| Phase | Status |
|-------|--------|
| P1 Prototype Foundation (M00–07) | ✅ Completed |
| P2 Playtest Patch (onboarding/guidance/save) | ✅ Completed |
| P3 Gameplay Expansion (M08–20, Sector A02, Alpha Core) | ✅ Completed (**built ahead of the blueprint docs**) |
| P4 Cinematic Upgrade | ✅ Completed |
| P5 Public Identity (landing) | ✅ Completed |
| P6 Gameplay Variety / Alpha Polish | ✅ Completed (action variety, required-action UI, grid tips) |
| P7 Backend / Waitlist / Accounts | 🟡 Partial — waitlist foundation done; **accounts/invite codes not started** |
| P8 Token Utility + Legal/Sharia review | ⛔ Not started — **intentionally blocked** (concept copy only) |
| P9 Testnet / Presale infrastructure | ⛔ Not started — **intentionally blocked** |

**Built earlier than documented:** Missions 04–20, the whole Objective Guidance system, cinematic
transitions/sector identity, the rewritten landing, and the waitlist backend all exist in code but
are absent from the blueprint.

---

## 10. Recommended Next Steps (3 safest, code-state-based)

1. **Update the docs to match reality (no code changes).** Refresh
   `NEVA_NETWORK_MASTER_BLUEPRINT.md` (and `CLAUDE.md`) to document Missions 04–20, the Objective
   Guidance system, cinematic/sector pass, the actual single-file landing, and the waitlist
   backend. This audit file is step 0; the drift is the biggest risk because external prompts keep
   acting on the old roadmap (e.g. the rejected "Mission 04 = FIREWALL SURGE").
2. **Full manual playthrough Mission 00 → 20** (no code change) to confirm completability, the
   required-action variety, and the transition/guidance feel; note any mission that still feels
   thin. Verify save/reload + checkpoint retry mid-run.
3. **Backend hardening for any real deploy (no gameplay change):** protect or remove
   `GET /api/waitlist/stats`, document that hosting must run the Node server (static-only won't
   save), and keep all token/presale/ICO paths blocked. Optionally add a deploy config patch.

> Do **not** build new gameplay/missions until the docs are reconciled and a playthrough confirms
> the current chain.

---

## 11. Risks / Problems

- **Documentation drift (highest risk):** blueprint + `CLAUDE.md` lag the code by ~16 missions +
  landing + backend; missing roadmap PDF. External prompts based on the old roadmap will propose
  conflicting/duplicate work (e.g. re-adding FIREWALL SURGE as M04). Reconcile docs first.
- **Naming/number collisions:** Mission 04 = PRIVATE GRID, Mission 10 = FIREWALL SURGE — any prompt
  assuming "M04 = firewall" is stale and would clobber the working arc + saves.
- **Flags latch by node index (not always mission-gated):** acting on a designated node "early"
  can pre-set a later mission's flag (safe "auto-complete if already done", but can skip a
  mission's interaction). M19/M20 are mission-gated to avoid M07 pre-latching the Alpha Core.
- **Features built but not (yet) useful:** `CORE_FRAGMENTS` are earned but unspendable; early-access
  fields (`status/invited/inviteCode`) exist with no UI/flow.
- **Bundle size:** ~1.35 MB JS single chunk (three.js); >500 kB chunk warning; consider
  code-splitting before broad deploy.
- **Backend/deploy:** `/api/waitlist/stats` is public (no emails, but counts); needs auth before a
  real launch. Static hosting will not persist submissions — requires the Node server. File-based
  single-process store (no DB), in-memory rate limit (resets on restart).
- **Save/checkpoint:** schema is v1 with additive merge (old saves tolerated); a checkpoint is
  written at mission start / depth / route / continue, and trace-lock retry never bounces to
  Mission 01 — confirm during the playthrough that no path regresses a completed save.
- **UI density:** mission panel + HUD are information-rich; watch for overlap on very short windows
  (panels scroll silently). No reintroduction of the removed Quick Controls / Target Node sections.
- **Token / presale / legal / Sharia (must remain BLOCKED):** only "future utility concept" copy +
  the footer disclaimer exist. No sale, ICO, presale, wallet, contract, or payment — keep it that
  way until legal + technical + Sharia review (Phase 8).

---

*End of audit. No gameplay, UI, save, or build behavior was modified — only this report file was
created.*
