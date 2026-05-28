# CLAUDE.md — NEVA NETWORK

Spatial-memory interface that doubles as a puzzle game. A huge, deterministic 3D
network of glowing nodes floats in a black void; you fly through it, click a node,
the camera dives and focuses, and a holographic inspection panel opens. Each node
is a potential **puzzle** (decode an access key, trace a path, deduce which node is
the decoy, solve the physics of an orbit, etc.). Long-term goal: enough puzzle
machinery and source knowledge to author **a year of puzzles** without running dry.

> This file is loaded into Claude's context every session. Keep it lean and current.
> **Before changing core systems, read `CURRENT_PROJECT_STATE.md` (the audited source of truth)
> and `NEVA_NETWORK_MASTER_BLUEPRINT.md`.** Deep puzzle material lives in `docs/`.

---

## 🛑 Six-Month Grid Build — READ `BUILD_STATUS.md` FIRST

There is a long-term build plan to extend NEVA Network into a 6+ month, 4-class,
event-driven game. The plan is split into **5 phases (0–4)**, each with its own
TDD-style plan document in `docs/superpowers/plans/`. The full vision and all
content bibles live in `docs/superpowers/MASTER_PLAN.md` (+ `.pdf`).

**Before running any `/goal` on this build:**
1. **Read `/Users/max/nevanetwork/BUILD_STATUS.md`** — it has the signed checklist of which phases are done.
2. **Refuse to build Phase N if Phase N-1 is unchecked.** Tell the user and offer to run the missing prior phase.
3. **Verify the marker file + test count** before trusting any ☑.

**After completing any `/goal` on this build:**
1. Update `BUILD_STATUS.md` — replace ☐ with ☑, add your signature (model · date · commit · test count).
2. Append a one-line Notes-log entry.
3. Commit `BUILD_STATUS.md` with message `docs: mark Phase N complete (signed)`.

`BUILD_STATUS.md` is the contract between sessions. Do not break it.

---

## Current state & guardrails (READ FIRST)

**The game is fully playable Mission 00 → Mission 20** across two sectors. The full mission chain,
systems, and "what's not built yet" are audited in **`CURRENT_PROJECT_STATE.md`** — treat that as
the source of truth. (This file and the blueprint were once stale and are now synced to it.)

- **Sectors (UPDATED — see blueprint §39):** **Missions 00–20 ARE Sector A01** (within it: Memory
  Grid 00–07, then the Deep Network *chapter* 08–20). Completing **Mission 20 = SECTOR A01 COMPLETE**
  (Alpha Core online) and **unlocks Sector A02** — a NEW, larger, deterministic **procedural grid**
  (`sectorGen.ts`) entered via a cinematic transition (`SectorTransition`), free-scan only (no
  missions yet). `GameState.sectorProgress` (`currentSector`/`a02Unlocked`/`a02Entered`/`a02Seed`)
  is the source of truth; old "missions 08–20 = Sector A02" naming is superseded. (Internal
  `sectorA02Secured` is just the M20 completion gate — do NOT rename without a save migration.)
- **Chapters:** First Signal · Network Awakening · Private Grid · Deep Network · Corruption Pressure · Alpha Core.
- **Mission chain (canonical — do NOT renumber/rename):** 00 First Signal · 01 Surface Breach ·
  02 Archive Hunt · 03 Signal War · 04 **Private Grid** · 05 Secure Routes · 06 Deep Extraction ·
  07 Core Breach · 08 Deep Signal · 09 Vault Breach · 10 **Firewall Surge** · 11 Corruption Wave ·
  12 Relay Collapse · 13 Signal Storm · 14 Core Fragment Recovery · 15 Private Grid Overload ·
  16 Corruption Containment · 17 Black Route Access · 18 Sector A02 Core Chamber ·
  19 Alpha Core Stabilization · 20 Sector A02 Secured.

### Do Not Rebuild / Do Not Duplicate
- **Do not rebuild the mission chain** or re-derive Missions 00–20 — they exist and pass build.
- **Do not duplicate existing missions.** Firewall Surge is **Mission 10**, not 04; **Mission 04
  is Private Grid**. Stale prompts may claim "add Mission 04 = Firewall Surge" — ignore them.
- **Do not rename or renumber missions** without a save migration (`save.ts`).
- **Do not reintroduce removed HUD sections** — the left HUD's QUICK CONTROLS and TARGET NODE were
  deliberately removed; selected-node detail lives in Node Info / Node Inspection.
- **Do not add token / presale / ICO / Web3 / wallet / smart-contract / payment** logic — blocked
  behind the roadmap + legal + Sharia review (status below).
- **Do not treat the old launch-roadmap PDF as code truth** — it is **absent** from the repo.
  Verify against `CURRENT_PROJECT_STATE.md`.
- **NEVA Core (AI) is advisory only.** It returns hint text from the backend (`/api/ai/neva-core`,
  `server/neva-ai.mjs`); it must never change missions, save, resources, or completion. The OpenAI
  key stays server-side (`OPENAI_API_KEY` — **never** a `VITE_` var / never in frontend code).
- **Player Profile (Phase 7) is LOCAL-ONLY and identity-only.** It lives in its own localStorage
  slot (`profile.ts`), never inside `GameState`/the reducer/the save, and must NEVER dispatch a
  game action or change missions/resources/trace/rewards/completion. **Do not add real login,
  remote save, email/account/invite-code linking, or wallet/token linking to the profile** — those
  belong to a later backend/account phase (the panel shows them as PLANNED). Keep `accountStatus`
  `LOCAL_ONLY` and `futureAccountLink` null until then.
- **Phase 8 backend is early-access only.** Invite codes / redemption / feedback / analytics / admin
  summary live in `server/` (no accounts, login, sessions, passwords, email, DB, or payments). The
  landing's invite redeem stores a **local-only** flag (`earlyAccess.ts`, `neva:earlyaccess:v1`) —
  it must **NOT gate the game** (the alpha stays open) and must **NOT** be wired into the Player
  Profile or the game save. Admin endpoints stay gated by `NEVA_ADMIN_SECRET`; never expose emails.
- **Do not build new gameplay** until a full Mission 00→20 manual playthrough is done.

### Official next steps
1. **Manual playthrough Mission 00 → 20** (confirm completability + feel; no code change).
2. **Prototype v1.1 Playtest Patch** from the friction notes.
3. **Backend hardening / invite-code planning** (accounts foundation).
4. **Only after that**, consider AI/OpenAI integration as a "NEVA Core Assistant". Token/presale stays blocked.

### Status
Prototype Foundation **Complete** · Gameplay Expansion to M20 **Complete** · Cinematic Pass
**Complete** · Landing Page **Complete** · Backend Foundation **Phase 8 — Partial Complete (waitlist +
invite codes / early access / feedback / analytics / admin summary; no accounts/login/DB/email/payments)** ·
Accounts / Login / Remote Save **Not started** · AI Integration **v1 — NEVA Core Assistant (advisory, backend-only)** ·
Player Profile **v1 — Local operator identity (Phase 7; local-only, no remote account)** · Token Utility **Not started / Blocked** ·
Sharia Review **Required later** · Legal Review **Required later** · Presale **Blocked**.

---

## Stack & commands

- **Vite 8** + **React 19** + **TypeScript** (strict) + **React Three Fiber 9** (`@react-three/fiber`), `@react-three/drei`, `@react-three/postprocessing` (Bloom). Renderer is **three.js 0.184**.
- Package manager: **pnpm** (`pnpm-lock.yaml` is the source of truth — don't introduce npm/yarn lockfiles).

```bash
pnpm install
pnpm dev       # Vite dev server (HMR). esbuild strips types — does NOT typecheck.
pnpm build     # tsc -b && vite build — this is the real typecheck gate. Run before "done".
pnpm lint      # eslint
pnpm preview   # serve the production build
pnpm server    # backend API + NEVA Core AI (Node, :8787). Dev: run alongside `pnpm dev` (Vite proxies /api). Prod: serves dist + /api.
pnpm waitlist:count      # local waitlist totals (no emails)
pnpm feedback:summary    # local feedback totals by category
pnpm analytics:summary   # local analytics totals by event/mission
pnpm backend:check       # load all stores + report config (admin/openai set?)
```

**Env (server-side only — never `VITE_`):** copy `.env.example` → `.env`. `OPENAI_API_KEY` enables
NEVA Core (else it runs offline with fallback hints); `OPENAI_MODEL` optional (default `gpt-4o-mini`).
**`NEVA_ADMIN_SECRET`** gates `POST /api/invite/generate` + `GET /api/admin/summary` (Phase 8); unset →
admin summary returns 503 and invite-generate is localhost-only (dev). `pnpm server` auto-loads `.env`.
Never commit `.env` or log secrets. Full backend reference: **`server/README.md`**.

**Gotcha:** the dev server compiles even with type errors (esbuild). Always run `pnpm build`
(or `npx tsc -b`) to confirm types before declaring a change complete.

---

## Architecture (the real files)

Entry: `index.html` → `src/main.tsx` → `src/App.tsx` (landing/game router) → `src/GameApp.tsx` (the game).

| File | Role |
|------|------|
| `src/App.tsx` | Thin top-level gate. Shows `Landing` first; **Play Alpha Prototype / ENTER** sets a local `entered` state → mounts `GameApp`; the in-game ⏏ EXIT returns to the landing (autosave untouched). Only one of the two is mounted at a time → never more than one WebGL context. *(`intro.ts` localStorage flag exists but App currently uses local state.)* |
| `src/GameApp.tsx` | The game shell. Holds UI state (`selected`/`hovered`/`locked`) + the game `useReducer`, and orchestrates the objective-focus camera transitions, mission-warp cinematic, and core-stabilization sweep. Keyboard: **O/T/I/E** act on `selected`; **Space** terminal · **U** upgrades · **B** subnetwork · **L** player profile · **,** settings · **V** dev scan · **G** nearest gateway · **R** reset view (Shift+R full reset; locked R = checkpoint retry). Trace-decay tick every 500 ms. *(Named `GameApp` not `Game` — `game.ts` would collide on macOS's case-insensitive FS.)* |
| `src/missions.ts` | Mission **view-model + copy**: `MISSION_META` (titles/briefings/done lines for M01–20), chapter names, the live HUD objective line (`getMissionHudState`), the per-mission task checklist, and `deepObjectiveHint` (inspection-panel action emphasis). Presentational — the hard completion **gates** live in `game.ts` (`missionTasksDone`). |
| `src/objectives.ts` | The reusable **Mission Objective Guidance** system: `resolveObjectiveTarget` (target node + status + required action + hint), `OBJECTIVE_META`, `objectiveVisualKind` (marker style), `objectiveBadge`, `gridTip`. Drives the in-world marker, NodeInfo badge, HUD hint, FOCUS OBJECTIVE button. |
| `src/save.ts` | Versioned localStorage autosave (`v1` + `.bak`) with additive-merge migration seam + a separate **checkpoint** slot (milestone snapshots; trace-lock retry never bounces to Mission 01). |
| `src/components/landing/` | The public landing page — **`Landing.tsx` + `landing.css`** (pure-CSS holographic visuals; no R3F canvas). A fixed scroll container (`body`/`#root` are `overflow:hidden`) with: sticky nav, hero (CTAs + CSS-SVG node graph), Game Concept cards, Current Alpha, Sector Map, Private Grid, **NEVA Coin future-utility concept (safe wording — not live, no sale)**, Roadmap (Phases 1–9), **live Waitlist form → `POST /api/waitlist`**, footer disclaimer; scroll-reveal animations. *(Ignore older docs describing `Hero.tsx`/`sections.tsx`/`content.ts`/a live cube — those files do not exist.)* |
| `server/` | Backend (zero-dep Node, `pnpm server`; see `server/README.md`). `index.mjs` = http server: waitlist (`POST /api/waitlist`, `GET /api/waitlist/stats`), **`POST /api/ai/neva-core`**, **Phase 8** invite (`/api/invite/generate` admin · `/redeem` · `/status`), `/api/feedback`, `/api/analytics/event`, `/api/admin/summary` (admin); serves `dist/` in prod. `waitlist-store.mjs` = waitlist validation/dedupe **+ invite-code helpers** (`generateInviteCode`/`assignInviteCodeToEntry`/`getInviteByCode`/`redeemInviteCode`/`listInviteStats`). `feedback-store.mjs` + `analytics-store.mjs` (privacy-safe, emails stripped) on `json-store.mjs`. `neva-ai.mjs` = **NEVA Core v1** (OpenAI via `fetch`, advisory only). Stores: `data/{waitlist,feedback,analytics}.json` (git-ignored). Admin gated by `NEVA_ADMIN_SECRET`. **No accounts/login/sessions/DB/email/payments.** |
| `src/nevaCore.ts` + `src/components/NevaCorePanel.tsx` | NEVA Core **frontend** (advisory, read-only): builds a compact safe game context, posts it to `/api/ai/neva-core`, shows a short hint in a compact panel (open with **N**). Never dispatches a game action. Falls back to deterministic hints if the route is offline. |
| `src/profile.ts` + `src/components/ProfilePanel.tsx` + `src/components/CallsignPrompt.tsx` | **Player Profile v1 (Phase 7) — LOCAL-FIRST operator identity.** Own localStorage slot (`neva:profile:v1` + `.bak`), **fully separate from the game save/checkpoint** so Shift+R, checkpoint retry, and soft-R all KEEP the identity and the pure reducer / save schema stay untouched. A persistent **high-water-mark** snapshot of progression (only ever rises) + accumulated achievements; `networkScore`/`playerLevel` are derived. First run shows **CREATE CALLSIGN** (3–18 chars `[A-Za-z0-9_-]`, skip → `OPERATOR-XXXX`); panel opens with **L** (`◇ PROFILE` launcher). **Identity/advisory only — it NEVER dispatches a game action or changes missions/resources/trace/save.** `accountStatus` is `LOCAL_ONLY`; remote account / login / email / wallet / remote save are shown as **PLANNED, not implemented** (later backend/account phase). `RESET PROFILE` (in-panel, confirmed) clears only the local identity. |
| `src/world.ts` | Pure config. `WORLD_SEED`, `FIELD.radius`, `SPAWN`/`LOOK_AT`, background-node `QUALITY` tiers, and the **`mulberry32`** PRNG. Everything visual is derived from these numbers. |
| `src/network.ts` | Builds the **interactive graph once at module load** → `NETWORK`. **`MISSION_NODE_COUNT=220`** mission nodes (the original graph — FIXED indices: missions/anchors/saves depend on them) in `CLUSTER_COUNT=11` lobes; nearest-neighbour `edges`/`neighbours` among the mission nodes. **Appended `DECOY_NODE_COUNT=1980` hidden-trap DECOY nodes** (`INTERACTIVE_COUNT=220+1980`) fill A01: render normal, EXPORT trips → red + trace spike; **no edges, never designated/tutorial** (`game.ts` `nodeType` forces DECOY for `i≥220`; designated/tutorial/type loops pinned to `MISSION_NODE_COUNT`). Per-node `meta`. |
| `src/sectors.ts` | **Sector coordinate registry** — each sector's node coords in one file (`SECTORS.A01` = `NETWORK` incl. decoys, `SECTORS.A02` = `SECTOR_A02`) + `sectorNodePos` / `exportSectorCoords`. Deterministic from seed; read-only. |
| `src/game.ts` | The interface-game layer + **mission engine**. `NodeType` union, `TYPE_CFG`, depth-scaled node types, resources/upgrades/modules defs, the deterministic **designated objective nodes** (CORE/HOME/VAULT/FIREWALL/CORRUPTION/RELAY/STORM/FRAGMENT/GRID/CLUSTER/BLACKROUTE/CHAMBER/ALPHA_CORE), Mission-00 tutorial steps, the per-mission flags + `missionTasksDone` (M00–20 completion gates), `getCurrentObjectiveNodeId`, and the **pure** `gameReducer` (OPEN_STREAM/TRACE/ISOLATE/EXPORT/USE_KEY/ANALYZE/ENTER_SUB/BUY_UPGRADE/INSTALL_MODULE/MISSION_*/…). Trace 0–100, lock at 100; access level scales with extracted data. |
| `src/telemetry.ts` | Tiny shared mutable object (`x,y,z,speed`) written by the camera each frame, read by the HUD. Avoids React re-renders on the hot path. |
| `src/fadeMaterials.ts` | Distance/focus fade helpers for materials. |
| `src/components/InteractiveNetworkExplorer.tsx` | Owns the R3F `<Canvas>`: black bg, exp² fog, camera, background haze, connections, interactive nodes (one `InstancedMesh`), focus markers, subnetwork, the panel, and the Bloom pass. |
| `src/components/FlyCamera.tsx` | Free-fly + click-to-focus camera; raycasts the interactive `InstancedMesh`; **R** warps back to overview; writes `telemetry`. |
| `src/components/InteractiveNodes.tsx` | Renders the 220 clickable nodes as a single instanced mesh (per-instance color by status/type). |
| `src/components/InstancedBackgroundNodes.tsx` | 5k–20k atmosphere nodes (decorative, non-interactive). |
| `src/components/NodeConnections.tsx` | Draws the edge lines between interactive nodes. |
| `src/components/SelectedNodeFocus.tsx` | Selection/hover reticle + traced-link highlight. |
| `src/components/Subnetwork.tsx` | The deeper cluster revealed when you enter a GATEWAY node (`depthSeed`/`gatewayNode`). |
| `src/components/HolographicNodePanel.tsx` | The in-world inspection panel (NODE ID / TYPE / STATUS / … + OPEN STREAM / TRACE / ISOLATE / EXPORT / FREE SCAN). **This is where a node's puzzle UI mounts.** |
| `src/components/ExplorerHud.tsx` | 2D overlay: session/trace readout + the space-time comb timeline. (The old centered title/OVERVIEW header was removed.) |

### Non-negotiable conventions

1. **Determinism is the spine.** Every generated thing flows from `WORLD_SEED` through
   `mulberry32`. Each subsystem XORs the seed with its own constant
   (`network.ts` uses `^0x4e70a17`, `game.ts` types use `^0x6a3e11`) so subsystems
   don't share a stream. **A given seed must always produce the same network, types,
   and — crucially — the same puzzle solutions.** When you add a puzzle generator,
   give it its own XOR'd sub-seed and derive everything (clues *and* answer) from it.
2. **The reducer is pure.** No `Date.now()` / `Math.random()` inside `gameReducer` —
   it must be React-StrictMode-safe (double-invocation yields identical state). Side
   effects (clock, RNG seeding) live in `App.tsx` effects or module init.
3. **Procedural, not authored geometry.** Positions/links/types come from numbers in
   `world.ts`. To rescale the world, change the config, not hand-placed coordinates.
4. **Hot-path data bypasses React.** Per-frame values (camera telemetry) use the shared
   mutable `telemetry` object, not state. Keep it that way for anything 60 fps.
5. **One instanced mesh for the interactive nodes.** Don't spawn 220 React meshes —
   extend the existing `InstancedMesh` and set per-instance attributes.
6. **Menus/panels are plain translucent surfaces** — a subtle dark `rgba` background
   (+ optional blur), no borders and no corner marks. Keep the HUD minimal: the left
   `.hud__stats` column (SYSTEM STATUS / RESOURCES / NETWORK ACCESS / PRIVATE GRID / SAVE),
   the lower-left `.hud__mission` panel (objective + tasks), and the in-world `.np__frame` /
   `.np-stream__frame`. **The left HUD's QUICK CONTROLS and TARGET NODE sections were removed
   on purpose — do not reintroduce them** (selected-node detail lives in Node Info / Node
   Inspection). (Earlier corner-bracket framing was also removed at the user's request.)
7. **Node state colour language** (see `InteractiveNodes.tsx` / `SelectedNodeFocus.tsx` /
   `NodeConnections.tsx`): the world stays monochrome — **a clean/fresh board shows only
   white/gray nodes; tint is earned, never decorative, and always muted (no neon/arcade).**
   active = white/gray, **extracted = subtle muted ice-blue, dimmer than active** (a
   "spent / don't revisit" marker), **DECOY = a hidden trap: renders as a normal active
   node until an action trips it, then reveals muted danger red** (selecting one also tints
   its focus frame red as discovery feedback), isolated = muted cool slate, locked =
   dim/blocked gray until traced. Keep these consistent across nodes, focus core, and links.
   (Earlier neon cyan/red was toned down, and always-red decoys were hidden, at the user's request.)

---

## How a puzzle attaches to a node (the model)

The grid/network is the **container**; each node carries a puzzle. Recommended shape
(see `docs/PUZZLE-DESIGN.md` for the full system):

- A node's **type** (`game.ts`) already implies a flavor (DECOY = trap, LOCKED =
  needs a key, ARCHIVE = needs a trace, GATEWAY = descend a layer). Lean on that.
- Derive each node's puzzle **deterministically from its index + a puzzle sub-seed**,
  so the same node always poses the same puzzle and accepts the same answer.
- The puzzle's UI mounts inside `HolographicNodePanel` (replace/extend the action
  buttons with the puzzle's input). A correct answer dispatches the existing actions
  (`EXPORT` to claim data, `ENTER_SUB` to descend, lowering `traceLevel`, etc.).
- Wrong answers cost **trace** (the existing fail currency). Trace hitting 100 locks
  the session — that's your global fail state, already built.

---

## Skills to invoke (and when)

Claude: **invoke the matching skill via the `Skill` tool before acting**. Most game-* skills
below are written against Phaser 3 — this project is **React Three Fiber**, so take the
*concepts* (architecture, data shapes, UX rules) and adapt the API. The flagged ones
transfer almost verbatim.

**Process (use first):**
- `brainstorming` — before designing any new puzzle type, mechanic, or feature. Refine the idea before code.
- `systematic-debugging` — any "it doesn't work / wrong render / NaN position" bug.
- `test-driven-development` — for `game.ts` reducer logic and puzzle validators (pure functions → easy to test).
- `verification-before-completion` — run `pnpm build` + a manual check before claiming done.

**Directly applicable (transfer cleanly):**
- `playtest-and-determinism` ⭐ — **the most important here.** Seeded RNG (mulberry32), per-system seed splitting, deterministic snapshots, debug overlays, time-scale, god-mode flags. This project's whole design already follows it.
- `game-state-and-save` ⭐ — versioned save schema + migrations for `GameState`, localStorage vs IndexedDB, autosave, corruption recovery. Needed once progress must persist.
- `input-handling` ⭐ — action-mapping over keyboard/mouse/touch/gamepad, rebinding, focus-loss, mobile. Generalizes the current O/T/I/E/R hotkeys.
- `frontend-design` ⭐ — for the holographic panel, HUD, and any 2D UI. Keep the stark monochrome sci-fi aesthetic; avoid generic AI look.
- `perf-pass` / `game-performance` ⭐ — frame-budget work: instancing, draw-call batching, pooling, particle caps. Critical as node count grows ("huge grid").
- `quest-system` — model multi-node puzzle chains / questlines (objectives, prerequisites, rewards, journal). Maps well onto "trace this path of nodes."
- `tutorial-and-onboarding` — first-run hints, contextual prompts ("press T to trace"), input-prompt glyphs.
- `game-accessibility` + `a11y-audit` — colorblind-safe palette, reduced-motion (bloom/scanline toggle), captions, font scaling, keyboard nav. Run before any release.
- `audio-mixing-web` — bus architecture (ambience/SFX/UI), autoplay-unlock, spatial volume for nodes.
- `web-game-deploy` — ship the Vite build (base path, hashing, headers, itch.io/Netlify/Vercel, iframe embed).

**Situational:**
- `web3-game-integration` — only if you ever add wallet/NFT features. **Hard rule from that skill: gameplay must never depend on a wallet.**
- `inventory-system` — if extracted data items become a managed inventory.
- `npc-and-dialogue` — if the network gets characters / lore delivered via dialogue.
- `scene-transitions-and-portals` — concept maps onto GATEWAY → subnetwork dives (`ENTER_SUB`).
- `asset-pipeline`, `tilemap-tiled-import`, `pixel-art-rendering`, `combat-and-skills`, `farming-and-resources`, `game-localization` — only if the project grows toward those (most assume a 2D tile/Phaser game; low relevance to the current 3D R3F build).

---

## Puzzle knowledge base (for authoring a year of puzzles)

The heavy material is split out so this file stays light:

- **`docs/PUZZLE-DESIGN.md`** — the puzzle *system*: archetypes, how each maps to node
  types and game actions, difficulty curves, a deterministic generator pattern, and a
  365-day authoring plan (themed sectors so you never repeat).
- **`docs/SCIENCE-CODEX.md`** — the *source material*: mathematics, physics, spacetime,
  relativity, quantum, cosmology, astrophysics, and constants/encodings — each section
  written as puzzle fuel (the fact + how to turn it into a puzzle).

When asked to "make a puzzle," start in `docs/PUZZLE-DESIGN.md` (pick an archetype +
node type), pull the content from `docs/SCIENCE-CODEX.md`, and wire the validator into
`game.ts` with its own XOR'd sub-seed.
