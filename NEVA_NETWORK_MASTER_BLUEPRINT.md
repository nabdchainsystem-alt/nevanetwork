# NEVA NETWORK — MASTER BLUEPRINT

> **Read this file first before any future patch.** It is a source of truth for NEVA Network:
> concept, visual language, official asset names, systems, UI, and gameplay direction.
> **As of 2026-05-26, `CURRENT_PROJECT_STATE.md` is the audited source of truth and `§0` below is
> synced to it.** Older sections (§1–§25) are earlier-prototype detail — accurate for the systems
> they describe, but their mission count and "Current Status" (§12) are **superseded by §0**.
> When anything new is added, update §0 here **and** `CURRENT_PROJECT_STATE.md`.

---

## 0. CURRENT STATE (CANONICAL — 2026-05-26)

**NEVA Network is fully playable Mission 00 → Mission 20** across two sectors. Build/lint/typecheck
are green. This section reflects the real codebase (see `CURRENT_PROJECT_STATE.md` for the full
audited tables).

### Sectors & chapters
- **Sector A01 — Memory Grid:** Missions 00–07.
- **Sector A02 — Deep Network:** Missions 08–20.
- **Chapters:** First Signal (00) · Network Awakening (01–03) · Private Grid (04–07) ·
  Deep Network (08–10) · Corruption Pressure (11–12) · Alpha Core (13–20).

### Mission chain (canonical — do NOT renumber/rename without a save migration)

| # | Name | Objective / completion gate | Mechanic introduced |
|---|------|-----------------------------|---------------------|
| 00 | First Signal | 9 guided tutorial beats → `mission00.complete` reveals the network | Onboarding (one node type per beat) |
| 01 | Surface Breach | inspect≥3 · data≥100 · trace≥3 · isolate≥1 · Depth 02 | Core loop |
| 02 | Archive Hunt | data≥200 · trace≥6 · 2 archive exports · isolate≥2 · next gateway | Archive route verify, decoy avoidance |
| 03 | Signal War | survive≥3 · stabilize≥5 · watchers≥2 · data≥250 · Depth 03 | **Signal Pulses, Watchers, Corrupted Links**; unlocks Private Grid |
| 04 | **Private Grid** | install any module **or** upgrade | Private Grid / modules / upgrades become objective-relevant |
| 05 | Secure Routes | isolate≥2 · trace≥4 | Isolate + trace combo |
| 06 | Deep Extraction | data≥250 (mission-scoped) | High-value extraction under threat |
| 07 | Core Breach | Depth 03 · secure the CORE node | Designated CORE node; Sector A01 finale |
| 08 | Deep Signal | reach Depth 04 (`maxDepthReached≥4`) | Depth 04 / deep route |
| 09 | Vault Breach | **EXTRACT [E]** the Deep Vault | High-value vault node |
| 10 | **Firewall Surge** | **OPEN [O]** / USE KEY the Black Firewall | Firewall (LOCKED) designated node |
| 11 | Corruption Wave | **ISOLATE [I]** the corrupted node | Corruption-wave node |
| 12 | Relay Collapse | **RESTORE [T]** the broken relay | Relay restore |
| 13 | Signal Storm | **ISOLATE [I]** the storm source | Signal-storm node |
| 14 | Core Fragment Recovery | **EXTRACT [E]** a core fragment (+1 CORE) | Guaranteed fragment recovery |
| 15 | Private Grid Overload | **UPGRADE [U]/[B]** — bring a module online | Node-less "use the grid" objective |
| 16 | Corruption Containment | **ISOLATE [I]** the corrupted cluster | 2nd corruption node |
| 17 | Black Route Access | TRACE→**OPEN [O]** / USE KEY the Black Route | 2nd firewall (dangerous route) |
| 18 | Sector A02 Core Chamber | **OPEN [O]** the chamber route | Chamber gateway |
| 19 | Alpha Core Stabilization | **STABILIZE [T]** the Alpha Core | Alpha Core (reuses CORE node) |
| 20 | Sector A02 Secured | **SECURE [T]** the Alpha Core | **Finale**: SECTOR A02 SECURED · ALPHA CORE ONLINE · NEXT SECTOR LOCKED |

*Failure (all missions): trace reaches 100% → session locked → R (checkpoint retry) or Shift+R
(full reset). Action variety is enforced: TRACE alone no longer completes open/isolate/extract/
upgrade objectives.*

### Systems implemented
- **Node graph** (220 deterministic interactive nodes + decorative field); **8 node types** with
  player-facing **classes** (DATA/KEY/VAULT/FIREWALL/CORRUPTED/WATCHER/GATEWAY/HOME/CORE).
- **Trace system** (0–100, decay, lock-at-100, threat tiers); **Corruption system** (~32% edges);
  **Signal Pulse** (M03+); **Firewall / designated objective nodes**.
- **Resources (5):** DATA + Memory Shards / Access Keys / Signal Energy / Core Fragments.
- **Resource usage:** USE KEY (unlock) · BOOST ISOLATE / STABILIZE ROUTE (signal) · ANALYZE (mem) ·
  module installs (DATA + resources).
- **Upgrade system (6, max L3)** · **Player Subnetwork / Private Grid + Modules (4, max L3)**.
- **Checkpoints**, **Save/load** (localStorage v1 + checkpoint slot + additive migration seam).
- **Dev Scan** (V) · **NEVA Terminal** (Space) · **Playtest Notes** (P — local QA logger; see §29) ·
  **Mission Objective Guidance** (marker/badge/hint/FOCUS OBJECTIVE/grid tips) ·
  **Cinematic transitions** (route-shift warp, core sweep) ·
  **Sector visual identity** (A01 vs A02 fog/bloom).
- **Landing page** (`Landing.tsx` + `landing.css`, pure-CSS) · **Backend foundation** (`server/`,
  zero-dep Node): waitlist + **invite codes / redemption / early access · feedback · analytics ·
  protected admin summary** (Phase 8 — see §31). No accounts/login/DB/payments.
- **NEVA Core Assistant v1 (AI)** — advisory tactical-hint helper; backend-only OpenAI (see §28).
- **Player Profile v1 (Phase 7)** — LOCAL-FIRST operator identity: callsign, player level, network
  score, mission/depth high-water marks, resources + private-grid snapshot, achievements v1. Own
  localStorage slot, **separate from the game save/checkpoint** (so a session reset keeps the
  identity); identity-only — it never changes gameplay. Remote account/login is PLANNED (see §30).

### NOT present yet (intentionally)
- ❌ No Web3 / wallet connect. ❌ No token / presale / ICO / smart contracts / payments.
  ❌ No multiplayer. ❌ No remote accounts / login / remote save. (The **local** Player Profile in
  §30 is the only identity layer — `accountStatus: LOCAL_ONLY`, a non-functional "future account
  link" placeholder, and no email/account/wallet linking.)
- **AI is advisory only:** NEVA Core never changes missions, save, resources, or completion, and the
  OpenAI key is server-side only (never exposed to the frontend).
- **Player Profile is advisory/identity only:** it lives outside `GameState`/the reducer/the save and
  never dispatches a game action or changes missions/resources/trace/rewards/completion.
- **Invite codes + early access are implemented (Phase 8 — see §31):** generate/assign/redeem +
  feedback/analytics/admin-summary endpoints exist (backend-only, no emails exposed). What is still
  **not** built: real accounts, login/sessions, passwords, email sending, remote save, a database.
  A LOZA easter-egg hook is a dormant placeholder only.

### Status labels
Prototype Foundation **Complete** · Gameplay Expansion to M20 **Complete** · Cinematic Pass
**Complete** · Landing Page **Complete** · Backend Foundation **Phase 8 — Partial Complete (waitlist
+ invite codes / early access / feedback / analytics / admin summary; see §31)** · Accounts / Login /
Remote Save **Not Started** · AI Integration **v1 — NEVA Core Assistant (advisory, backend-only; see §28)** ·
Player Profile **v1 — Local operator identity (Phase 7, local-only; see §30)** ·
Token Utility **Not Started / Blocked** · Sharia Review **Not Started / Required Later** ·
Legal Review **Not Started / Required Later** · Presale **Blocked**.

### Official next steps
1. Manual playthrough Mission 00 → 20. 2. Prototype v1.1 Playtest Patch (friction notes).
3. Backend hardening / invite-code planning. 4. Only then, consider AI as a "NEVA Core Assistant".
Token/presale remains blocked.

### Do not rebuild / duplicate
Do not rebuild the mission chain · do not duplicate missions (Firewall Surge = M10, **not** M04;
M04 = Private Grid) · do not rename/renumber without migration · do not add token/presale/Web3
before the roadmap gates · do not treat the absent launch-roadmap PDF as code truth · do not build
new gameplay until the Mission 00→20 playthrough is done.

---

## 1. Project Identity

- **Project name:** NEVA Network
- **Subtitle (in-world HUD tagline):** BREACH THE MEMORY GRID
  *(was "Spatial Memory Interface" — replaced with a sharper, mission-driven line)*
- **Micro-tagline (under subtitle):** TRACE • EXTRACT • ASCEND
- **What it is:** A full-screen, monochrome, holographic data-network experience.
  You fly *inside* a spatial memory graph, click data nodes, and inspect them
  through an AR surveillance-style interface.
- **What it is NOT:** Not a traditional game. No character, no weapons, no
  health, no coins, no normal levels. It is an **interface-first cyber
  investigation / holographic data-network** experience.

---

## 2. Story / World Concept

NEVA Network is a spatial memory/data system. Every **Node Frame** represents a
digital object — a memory, message, identity, camera feed, archive, gateway, or
decoy. The operator (the player) does not control an avatar; they navigate the
network itself: inspecting nodes, tracing links, isolating objects, opening
data streams, and exporting data — all while avoiding **trace lock**. Going too
loud raises the **Trace Meter**; hit 100% and the session is compromised.

---

## 3. Visual Language

- Monochrome only: black / white / grayscale. **No color, no neon.**
  - **One sanctioned exception — earned, muted functional tone.** Tint may flag *state*
    (never decorate): only low-saturation, glow-free colours, applied to a single glyph or
    value, never a whole block. This is the node colour language (extracted = ice-blue,
    decoy = muted red) extended into the **left HUD** — see §3b.
- Thin white holographic lines; soft, restrained bloom.
- Tiny square/cube data nodes (hollow frames), not solid blocks.
- AR surveillance feel: scanlines, vignette, tracking brackets, leader lines.
- Full-width comb/barcode **Coordinate Ruler** at the bottom.
- Floating **Inspection Panel** beside the focused node.
- No traditional game UI, no cartoon effects, no large modals.

---

### 3b. Left-HUD Icon System & Functional Tones

A readability pass on the left session HUD (`.hud__stats` in `ExplorerHud`). Purely
visual — **no gameplay/logic/save changes**.

- **Icon library:** [`@tabler/icons-react`](https://tabler.io/icons) — outline, stroke-based
  glyphs that match the technical grid/AR style (chosen over filled/cartoon sets).
- **`HudIcon` component** (`src/components/HudIcon.tsx`): the only place icons render.
  Default **13px**, **stroke 1.5**, **opacity 0.8**, monochrome (`currentColor`); accepts an
  optional muted `color`. Shrinks to 11px on small screens. `<Stat>` (in `ExplorerHud`) is
  the `[glyph] LABEL ……… VALUE` row helper.
- **Tone tokens** (`src/components/hudTokens.ts` → `HUD_TONE`, resolving to `--hud-*` CSS
  vars in `styles.css`): `amber` trace-warn, `red` trace-crit/locked, `mem` cool blue-gray,
  `keys` pale gold, `signal` faint cyan/green, `core` faint violet-gray, `green` access
  granted, `ice` extracted, `slate` isolated. All **low-saturation, no glow**.
- **Row → icon → tone map:** TRACE `IconActivity` (amber ≥70 / red ≥90 on icon+value),
  RESOURCES `IconStack2`, DATA `IconDatabase`, MEM `IconBrain` (mem), KEYS `IconKey` (keys),
  SIGNAL `IconAntennaBars5` (signal), CORE `IconHexagon` (core), ACCESS `IconShieldCheck`
  (green), DEPTH `IconLayersIntersect`, ISOLATED `IconShieldOff` (slate when >0), LINKS
  `IconTopologyStar`, CAMERA `IconCamera`, NODE `IconCube`, TYPE `IconCategory`, STATUS
  `IconCircleCheck`/`IconRoute`/`IconShieldOff`/`IconCircleDashed` (ice extracted /
  slate isolated, icon+value), DEV SCAN `IconScan`.
- **Colour rule:** tint the **icon and/or value**, never the label block; resources tint the
  icon only, status/trace tint icon+value. Tree-shaken — import named icons only, never the
  whole set.
- **Trace gauge as a danger meter:** the `.hud__trace-fill` bar reads **green safe → amber
  ≥70% → red ≥90%** (`is-safe`/`is-warn`/`is-crit`), and the per-action **delta flash**
  (`.hud__trace-delta`) is **green when trace drops** (`is-down`, good), **muted red when it
  rises** (`is-up`, bad), **brighter red on a spike** (`is-spike`, `--hud-red-hot`). Same
  muted tokens — no neon.

---

## 4. Official Asset Names

| Asset | Meaning | Appearance | Role | Component (current) |
|---|---|---|---|---|
| **Node Frame** | A clickable/visual data cube | Small hollow white wireframe cube | The atoms of the network | `InteractiveNodes` |
| **Focus Node** | The currently inspected node | Small center point inside a pulsing cage | Inspection target | `selected` state + `SelectedNodeFocus` |
| **Micro Node** | Tiny background particle | Very small dim dust point | Atmosphere; future subnetwork seeds | `InstancedBackgroundNodes` |
| **Link Line** | Normal connection | Thin faint line between nodes | Shows graph topology | `NodeConnections` |
| **Trace Link** | Revealed/highlighted link | Brighter, animated pulse along link | Result of TRACE LINKS | `SelectedNodeFocus` |
| **Spatial Memory Graph** | The full network | The whole floating node cloud | The world | `network.ts` (data) |
| **Sector** | Coordinate region | — (label only) | Spatial addressing | `neva/registry/sectors.ts` |
| **Subnetwork** | Deeper local network | Small wireframe sub-cluster | Opened from a Gateway | `Subnetwork` |
| **Inspection Panel** | AR info panel | Thin glass panel, corner brackets, scanlines | Node data + actions | `HolographicNodePanel` |
| **Data Stream Panel** | Secondary stream readout | Small panel beside the Inspection Panel | OPEN STREAM output | `HolographicNodePanel` (`.np-stream`) |
| **Node Info Panel** | Compact selected-node metadata card | Small dark-transparent card, thin gray border, mono text (mid-left) | Quick technical identity of the selected node (ID/type/status/exact coords/sector/depth/layer/links/risk/value/signal + quick flags); **shown only during node selection**. Read-only — does not duplicate the Inspection Panel's actions | `ExplorerHud` (`.ni`) |
| **Title Lockup** | Brand wordmark | Cinematic segmented **NEVA NETWORK** wordmark + subtitle + micro-tagline + glowing light line. Big centered version = **cinematic/menu only** (Mission 00 boot, `.mx` overlays, landing); active gameplay uses the **compact top-left `.hud__logo`** instead (see §4a) | In-world identity/header | `ExplorerHud` (`.hud__brand*` / `.hud__logo`) |
| **Coordinate Ruler** | Bottom nav HUD | Full-width comb/barcode + readout | Space-time position | `ExplorerHud` (`.hud__coords`) |
| **Tracking Brackets** | Corner brackets on a node | 4 rotating L-corners | Hover/selection marker | `HolographicNodePanel` (`.np-target`) / `SelectedNodeFocus` |
| **Leader Line** | Node → panel connector | Thin low-opacity line + tick | Ties panel to node | `HolographicNodePanel` CSS (`.np::before`) |
| **Trace Meter** | Danger gauge | TRACE % + thin bar (top-left) | Core risk system | `ExplorerHud` + `game.ts` |
| **Access Level** | Clearance | `LV n` (top-left) | Gates locked/archive nodes | `game.ts` |
| **Gateway Node** | Subnetwork entry | Node of kind GATEWAY | Enter deeper layers | `game.ts` + `Subnetwork` |
| **Decoy Node** | Trap node | Node of kind DECOY | Punishes careless export | `game.ts` |

### 4a. Top Title Lockup — visual direction

The top-center brand (`.hud__brand*` in `ExplorerHud`, styled in `styles.css`) reads as a
**clean, high-end holographic game logo** — not plain HUD text. Direction:

- **NEVA NETWORK** — `Orbitron` (`--wg-space`), 28px, weight 600, uppercase, **wide
  cinematic spacing** (`letter-spacing: 0.58em`, mirrored as `padding-left` to keep it
  optically centered). **Segmented "cut" detailing** is baked into the glyphs via a
  `repeating-linear-gradient` fill clipped with `background-clip: text` — fine horizontal
  slice-lines (dimmer white bands) run through every letter, giving the segmented/sliced
  futuristic feel while staying **monochrome white/gray** and fully readable. **Soft white
  glow** via layered `text-shadow` (kept subtle, not overexposed) + the existing slow
  `brand-breathe` pulse. No image assets, no external fonts (both faces already loaded).
- **Subtitle — BREACH THE MEMORY GRID** — `Share Tech Mono` (`--wg-mono`), 11px, uppercase,
  `letter-spacing: 0.3em`, ~0.82 white (more visible than the old faint subtitle) + a very
  subtle glow. Smaller than the title; mission-driven replacement for the old
  "Spatial Memory Interface".
- **Micro-tagline — TRACE • EXTRACT • ASCEND** — tiny (7.5px), low opacity (~0.34), wide
  tracking; sits under the subtitle as a low-key premium accent.
- **Spacing/lockup** — extra breathing room between title → subtitle (`margin-top: 15px`);
  the glowing light line + action bar follow below, clear of the command bar. Absolutely
  positioned, so it never pushes gameplay UI down. Subtitle + micro-line hide on narrow
  (≤ mobile) screens; the title scales down to 17px / 0.42em there.

#### Brand placement (HUD branding pass)
- **Active gameplay uses a compact top-left `NEVA NETWORK` logo** (`.hud__logo` in the top status
  bar's `.hud__loc`) — the same segmented/cut cinematic title style, scaled to ~14px / `0.36em`,
  with a soft controlled glow. It reads as a HUD identity watermark, not a title screen.
- **The functional sector line sits to the right of the logo** on one baseline-aligned row
  (`.hud__loc` is `flex-direction: row`): `SECTOR A0n · <GRID NAME> · GRID <id>` (A01 → `MEMORY GRID`,
  late-A01 → `DEEP NETWORK`, A02 → `DEEP GRID`), in muted teal-ice (`.hud__loc-grid`); truncates
  gracefully on narrow screens. The hexagon sector emblem stays to the left of the row.
- **The large centered `.hud__brand` title/subtitle/micro-line is reserved for cinematic/menu
  states** — it now renders only during the Mission 00 boot/onboarding (`intro`); for Missions
  01–20 + Sector A02 it is hidden and the command bar (`.hud__actions`, always present) sits just
  below the top bar (`.hud__brand--bare`). Mission briefings / completion / finale (`.mx__brand`)
  and the landing page carry their own large wordmark, so the big title still appears there.

---

## 5. Node Types

(See `src/neva/registry/nodeTypes.ts` and `src/game.ts` `TYPE_CFG`.)

| Type | Story meaning | Risk | Value | Actions / notes |
|---|---|---|---|---|
| **MEMORY** | Stored memory fragment | LOW | 10 | Safe export target. |
| **CAMERA** | Surveillance feed | MED | 6 | OPEN STREAM raises trace fast. |
| **IDENTITY** | Person record | HIGH | 20 | High-value export, high trace. |
| **MESSAGE** | Comms packet | LOW | 8 | TRACE reveals nearby links. |
| **ARCHIVE** | Sealed archive | MED | 15 | Must be traced before export. |
| **GATEWAY** | Subnetwork entry | HIGH | — | OPEN STREAM → ENTER SUBNETWORK. Isolating backfires. |
| **DECOY** | Trap | CRIT | — | Export = trace spike, no data. |
| **LOCKED** | Protected node | HIGH | 12 | Export needs unlock (trace/isolate) or higher access. |

---

## 6. Action System

Buttons live in the **Inspection Panel**; keyboard shortcuts `O / T / I / E`.

| Action | Does | Visual feedback | Trace | Node effect | Future |
|---|---|---|---|---|---|
| **OPEN STREAM** | Opens Data Stream Panel (fake telemetry lines) | Stream panel reveal | +3..+6 (CAMERA/DECOY more) | — | Real per-type stream content; mini-games |
| **TRACE LINKS** | Reveals/strengthens links to neighbours | Brighter Trace Links + pulse | +3 | Unlocks ARCHIVE/LOCKED partially | Multi-hop trace, link maps |
| **ISOLATE** | Cuts node from nearby links | Node dims + bracket | −7 (GATEWAY: +8 backfire) | Marks ISOLATED | Timed isolation, chains |
| **EXPORT** | Extracts node data | Success pulse / fail glitch | +value-based (DECOY +18) | Marks EXTRACTED (dim), once only | Inventory, value scaling by access |

---

## 7. Coordinate System

The **Coordinate Ruler** (`ExplorerHud`, helpers in
`neva/systems/coordinateSystem.ts`) reads out:

- **X / Y / Z** — camera position (live from `telemetry`).
- **TIME** — live date+time stamp (the "time machine" dimension).
- **SECTOR** — derived hex grid id (e.g. `04-03-17`).
- **VEL** — current speed.
- **DEPTH** — subnetwork depth (HUD stats).
- **LAYER** — vertical band (computed in coordinate system).

Coordinates make the network feel like a real, addressable space; sectors give
every region a stable name as the graph grows huge.

---

## 8. Current System Flow

1. App loads in **free scan** (cursor) mode.
2. User hovers nodes (Tracking Brackets) and **clicks a Node Frame**.
3. Camera glides to a cinematic standoff (node stays centered/in front).
4. The **Inspection Panel** opens with a Leader Line to the node.
5. User inspects data and triggers actions (OPEN STREAM / TRACE / ISOLATE /
   EXPORT) which drive the game state + Trace Meter.
6. Clicking empty space or any movement key dismisses focus.
7. **Esc** exits focus (FREE SCAN); **F** toggles pointer-lock fly mode; **Space** opens the
   NEVA Terminal (see §18 — Space is the terminal key, it no longer flies).

**Flight / camera controls** (`FlyCamera`):
- **WASD** = move, **Q** = up, **E**/**C**/**Ctrl** = down (E means EXPORT *while a node is
  inspected* — it only descends during free flight; Q always ascends and is a NAV key).
- **Mouse wheel** = zoom (orbit radius). **Middle-button (wheel) drag** = rotate / raise the
  orbit around the current centre. **F** = pointer-lock mouse-look fly. **Shift** = boost.

**Reset behaviour** (three distinct paths in `GameApp.tsx` — `resetView` / `resetSession` /
`retryCheckpoint`, never one catch-all; camera recenters via `FlyCamera`):
- **R = RESET VIEW (soft)** during normal play: clears the selected node, closes the
  inspection + stream panels, exits focus, and recenters the camera on the overview —
  but **keeps all progress** (depth, trace, extracted data, access level, node statuses).
  At Depth 02, R keeps DEPTH 02, the objective, and the sector/coordinate UI intact.
- **SHIFT + R = RESET SESSION (full)**: a brand-new clean session back at Depth 01
  (resets depth, trace, extracted, access, selection, statuses, objective) and **wipes the
  checkpoint**.
- **Trace-locked R = RETRY FROM CHECKPOINT** (see §19): once `traceLevel ≥ 100` / `locked`, a
  plain **R restores the latest safe checkpoint** (keeps mission/depth/completion progress,
  clears the lock, resets trace) — it no longer bounces back to Mission 01. **SHIFT + R**
  while locked still does the full RESET SESSION. The top RESET button relabels to **RETRY**
  while locked (tooltip `R · RETRY CHECKPOINT   SHIFT+R · RESET SESSION`).

---

## 9. Future Gameplay Direction

Interface-first. No character, guns, coins, or normal levels. Play emerges from:
data inspection, link tracing, isolation, exporting, gateways → subnetworks,
trace risk management, and rising access levels. Possible next layers: missions
("extract this identity without trace lock"), multi-depth subnetworks, node
relationships/investigations, timed events.

---

## 10. File / Component Map

**Config / entry**
- `index.html` — page shell + title.
- `src/main.tsx` — React entry.
- `src/App.tsx` — thin router: shows `Landing` on first visit, mounts `GameApp` once
  ENTER NETWORK is pressed (remembered via `intro.ts`). Only one is mounted at a time
  (never >1 WebGL context).
- `src/GameApp.tsx` — the game shell: top-level state (selected/hovered/locked), game
  `useReducer`, trace tick, key shortcuts; renders explorer + HUD + the `⏏ INTRO` button.
- `src/intro.ts` — one-line `localStorage` flag (`neva:entered:v1`): `hasEnteredNetwork()` /
  `markEnteredNetwork()` (decoupled from the game autosave).
- `src/styles.css` — all HUD/panel/ruler **and landing (`.lp__*`)** styling (monochrome AR;
  landing carries the only `--lp-accent` ice tint).

**World data**
- `src/world.ts` — field size, spawn, seed, `mulberry32`, quality.
- `src/network.ts` — `NETWORK` (positions, centers, edges, neighbours, meta) — the Spatial Memory Graph data.
- `src/telemetry.ts` — render-free camera→HUD channel (x/y/z/speed).
- `src/devscan.ts` — render-free dev gateway-locator channel (count / nearest id / distance),
  written by `FlyCamera` each frame, read by the HUD and the `G` shortcut.
- `src/save.ts` — versioned `localStorage` saves (each with a `.bak`): the **autosave**
  (`neva:save:v1`) — `loadSave` / `writeSave` / `clearSave`, throttled (~1.5 s) + flushed on
  `pagehide`/hide — **and** the **checkpoint slot** (`neva:checkpoint:v1`) — `loadCheckpoint` /
  `writeCheckpoint` / `clearCheckpoint`, a safe milestone snapshot for failure recovery (§19).
- `src/game.ts` — node types + `gameReducer` (trace, extract, isolate, depth, access,
  Mission 01 state: inspect/risk-isolate counters + `missionTasksDone` completion latch).
- `src/fadeMaterials.ts` — distance-fade line material + node near-fade.
- `src/audio.ts` — tiny Web Audio synth (no asset files): soft UI chimes only
  (`playSelect` / `playReturn`); **M / `setAudioMuted` toggles them**. (A background
  ambient music bed was prototyped and then removed at the user's request — SFX only.)
- `src/terminal.ts` — pure command parser for the NEVA Terminal (`parseCommand` → lines + effect). See §18.
- `src/terminalNav.ts` — render-free "nearest node of type" channel (provided by `FlyCamera`, used by `go to`).
- `src/uiCapture.ts` — render-free flag: true while the terminal owns the keyboard (camera/game keys stand down).
- `src/playtest.ts` — Playtest Notes (local QA logger) data layer: note type / categories / quick-note
  map / context capture / `neva_playtest_notes_v1` localStorage / JSON export + copy-summary helpers. See §29.

**Scene components (`src/components/`)**
- `InteractiveNetworkExplorer` — the `<Canvas>` scene container (fog, bloom, assembly).
- `FlyCamera` — movement, mouse/arrow look, focus glide, warp-back reset, subnetwork dive.
- `InstancedBackgroundNodes` — Micro Nodes (atmosphere).
- `NodeConnections` — Link Lines.
- `CorruptedLinks` — Mission 03 readable corrupted-link overlay (dashed/flicker warning lines + AR ticks; see §17.1).
- `WatcherRings` — Mission 03 subtle camera-facing signal-ring around WATCHER (CAMERA) nodes (distance-faded, readable only when near/selected; see §17.2).
- `InteractiveNodes` — Node Frames (clickable, instanced, raycast target).
- `SelectedNodeFocus` — Focus Node cage, Trace Links, Tracking Brackets, success pulse.
- `HolographicNodePanel` — Inspection Panel + Data Stream Panel + Leader Line + Tracking Brackets.
- `Subnetwork` — gateway sub-cluster.
- `DevScanOverlay` — developer-only (D) overlay: thin AR node-type tags + nearest-gateway bracket + (Mission 03) corrupted-hub brackets/labels.
- `ScanLabels` — `scan` command overlay: a silver-gradient line + kind label above nearby nodes (distance-faded, capped; see §18).
- `Terminal` — the NEVA command console (Space): translucent AR panel, scrollback + `neva>` prompt (see §18).
- `ExplorerHud` — Coordinate Ruler, Trace Meter, session stats, trace overlays, dev readout, and the **Node Info Panel** (`.ni`) — a compact selected-node metadata card on the mid-left, shown only while a node is selected.
- `PlaytestNotesPanel` — the docked **NEVA // PLAYTEST NOTES** QA logger (toggle **P**): live context readout + quick-note buttons + manual add + notes list + export/copy/clear. Non-modal, local-only, no gameplay impact. See §29.

**Landing site (`src/components/landing/`)**
- A scrolling, multi-section marketing page that doubles as the game's front door, told
  around the origin myth **"ONE GLOWING CUBE"** (the cube = genesis node; **$NEVA** = the
  signal mined from the network). `Landing.tsx` is itself the fixed scroll container
  (`body`/`#root` are `overflow:hidden` for the game canvas). Monochrome-holographic with
  one ice-cyan accent (`--lp-accent`, landing-only); honors `prefers-reduced-motion`.
  **ENTER NETWORK** (hero / nav / play section) fires a DOM warp overlay (`.lp__warp`),
  then calls `onEnter` to mount the live game.
- **Hero** — `Hero.tsx` mounts the live R3F `<Canvas>`; `frameloop` pauses when the hero
  is scrolled off-screen. `LandingScene.tsx` = `LandingCamera` (approach→orbit) +
  `GenesisCube.tsx` (the glowing, breathing, replicating hero cube — `WORLD_SEED ^ 0x3c0be`)
  + drifting field + Bloom. `LandingConstellation.tsx` = hero nodes/edges (`^ 0x1a4d9`) with
  flowing signal pulses + cursor-proximity glow.
- **Sections** (`sections.tsx`): Story · $NEVA Token · How to Play · Roadmap · Community ·
  FAQ · Footer. `content.ts` holds every string + **placeholder** token data (supply /
  chain / contract / buy links are all `TBD`, with a "not financial advice" disclaimer in
  the footer). `Reveal.tsx` = IntersectionObserver scroll-in; `Nav.tsx` = sticky bar.
- `timeline.ts` — small easing helpers reused by the hero camera's approach.
- **Hard rule honored:** the game is free and never requires a wallet/token/purchase
  (stated in the FAQ); $NEVA is an optional meta-layer.

**NEVA registry (`src/neva/`)**
- `types.ts` — all shared types.
- `registry/nodeTypes.ts` — node kind definitions.
- `registry/visualTypes.ts` — visual asset definitions.
- `registry/sectors.ts` — sample sector definitions.
- `registry/assetRegistry.ts` — `NEVA_ASSET_REGISTRY` (combined).
- `systems/coordinateSystem.ts` — coordinate/sector helpers.
- `systems/networkGraph.ts` — graph accessors over `network.ts`.

---

## 11. Update Rules

- **Read this file first** before every major patch.
- Do **not** contradict the visual identity (monochrome, thin lines, AR).
- Do **not** add color / neon unless explicitly requested.
- Do **not** turn this into a normal game (no avatar/guns/coins/levels).
- Do **not** rename an existing asset without updating this file.
- Whenever a new node type, action, HUD element, visual asset, mechanic, or
  component is added — **update this file**.
- Keep this file short enough to be useful, detailed enough to guide work.

---

## 12. Current Status

> ⚠ **SUPERSEDED — see §0 (CURRENT STATE, 2026-05-26).** This section describes the early
> single-session loop (≈ Mission 03 era). The game is now playable Mission 00 → 20; §0 is canonical.

**Works — core single-session loop is complete end-to-end** (Find Gateway → Open
Stream → Enter Depth 02 → Extract higher-value data → Manage Trace → Avoid Trace Lock):
- Monochrome AR network scene (Node Frames, Micro Nodes, Link Lines).
- Free scan + fly mode; click-to-focus camera; Esc/R/F; warp-back reset.
- Inspection Panel with data rows + action buttons; Data Stream Panel.
- **Gateway → Depth 02:** select GATEWAY → panel shows `GATEWAY NODE DETECTED /
  OPEN STREAM TO ACCESS SUBNETWORK` → OPEN STREAM shows the handshake lines + a
  clickable `↳ ENTER SUBNETWORK · DEPTH 0N` (in the main panel, always on-screen) →
  `ENTER_SUB` raises `currentDepth`, bumps `depthSeed` (camera dive + wireframe
  sub-cluster), flashes `DEPTH 0N ACCESSED / SUBNETWORK LINK ESTABLISHED`. No reload.
- **`currentDepth`, `traceLevel`, `accessLevel` are the single sources of truth** —
  HUD (DEPTH/TRACE/ACCESS), objective, ruler `SECTOR A0n`, and panel all read live state.
- Game layer: Trace rules (decay + thresholds + lock), EXPORT/TRACE/ISOLATE/OPEN/ENTER,
  Access Level, restrained node visual states, contextual hints, derived objective.
- Coordinate Ruler (X/Y/Z + TIME + SECTOR + VEL), full-width comb timeline.
- NEVA registry + types + systems scaffolding.

**Partial**
- Subnetwork is visual + depth-economics only (sub-cluster wireframe not yet
  independently clickable — the existing 220 nodes operate at depth-02 value/trace).
- Sectors are derived/sample; not yet authored regions.
- Data Stream content is placeholder.

**Planned next**
- Make the Depth-02 sub-cluster independently interactive (its own nodes/types).
- Missions / objectives within trace constraints.
- Richer per-type stream + export consequences.

**Recent patches** (newest first; verified with `pnpm build` + `pnpm lint` each time):
- **Upgrade Panel redesign** (UI only, see §22): the panel is now a **centered ~65vw/65vh
  holographic system panel** (was a small right-docked strip) matching the Inspection/Stream
  panels — corner brackets, scanline, soft glow, header + `NETWORK AUGMENTATION SYSTEM` subtitle,
  resource strip, and a **2-column upgrade-card grid** (1 col on narrow screens). Opens **and closes**
  with the **Terminal's staged animation** (full set, ~20% quicker) — corner brackets assemble at
  screen centre → glide to the panel corners → surface scales/fades up → content fades in (~1.9 s open),
  and the mirror retract on close (`.up--closing`, ~620 ms) — over a dim 2px-blur **backdrop** (click to
  close). No gameplay/cost/effect/save changes — markup + CSS only.
- **Upgrade System v1** (see §22): resources now buy **permanent session upgrades**
  (`GameState.upgrades`, 6 upgrades × levels 0–3). **TRACE_DAMPENER** (−8%/lvl trace gains, ≥1
  floor, central in `withTrace`), **EXPORT_EFFICIENCY** (+10%/lvl DATA), **SCAN_RESOLUTION**
  (clearer panel intel), **ISOLATION_CORE** (+15%/lvl isolate reduction), **KEY_FORGE** (+12%/lvl
  key-drop chance), **SIGNAL_STABILIZER** (pulse −7%/lvl + wider corrupted-link repair at lvl ≥ 2).
  Costs use SIGNAL/MEM/KEYS (CORE reserved). New `BUY_UPGRADE` action (pure, deterministic), a
  floating monochrome **NEVA // UPGRADES** panel toggled with **U** showing level/effect/next-cost +
  UPGRADE buttons, signed spend feedback, immediate save-on-buy. Persists (deep-merged); R-soft +
  checkpoint keep, Shift+R clears. Missions untouched (upgrades help, never required).
- **Resource Usage v1** (see §21): resources are now spendable. **USE_KEY** spends 1 ACCESS_KEY to
  unlock a LOCKED node (alternative to Access Level). **BOOST ISOLATE** spends 1 SIGNAL for a
  ~doubled trace cut (`ISOLATE {boost}`). **STABILIZE ROUTE** spends 1 SIGNAL to also repair
  corrupted links on the node's neighbours (`TRACE {boost}`). **ANALYZE** spends 1 MEMORY_SHARD to
  reveal clearer info (DECOY/ARCHIVE/LOCKED signatures, persisted via `NodeStatus.analyzed`). New
  **RESOURCE ACTIONS** panel section (contextual, shown only when useful + affordable), signed
  resource-gain flash (`-1 KEY` …), a CORE "future upgrades" hint, and dev-scan readiness lines.
  CORE_FRAGMENTS stay reserved. Spending persists (statuses/resources already saved); R-soft keeps,
  Shift+R clears. Missions untouched (resource actions help but aren't required). Reducer stays
  pure — boosts/unlocks are deterministic.
- **Resource / mining layer (v1)** (see §20): the first step toward open-ended progression. Beyond
  **DATA** (= `extractedData`), actions now mine **MEMORY_SHARDS / ACCESS_KEYS / SIGNAL_ENERGY /
  CORE_FRAGMENTS** (`GameState.resources`). EXPORT yields DATA + type-based bonuses (MEMORY→shards,
  ARCHIVE→shards +key chance, IDENTITY→key, LOCKED→key chance, CAMERA→signal if handled safely);
  ISOLATE watchers/decoys→signal, locked→key chance, unverified archive→shard; TRACE stabilising a
  corrupted batch→signal; ENTER_SUB→signal. **All "chance" drops are deterministic** (per-node hash
  — keeps the pure reducer + lets the panel preview the exact yield). Reward scales lightly with
  depth; CORE_FRAGMENTS only at Depth 03+. New compact **RESOURCES** HUD strip, a "+N DATA · +1 MEM"
  gain flash, an **EXPECTED YIELD** panel preview, and a dev-scan resource debug line. Persists via
  the save (deep-merged, tolerates pre-resource saves); Shift+R clears, R-soft keeps. Missions
  untouched (resources are additive; DATA still drives extract tasks).
- **Checkpoint / failure recovery** (see §19): a trace lock no longer restarts at Mission 01.
  The game now snapshots a **safe checkpoint** at each milestone (mission 01/02/03 start, reaching
  Depth 02/03, next-depth route detected, mission-complete → Continue) to a separate
  `localStorage` slot (`neva:checkpoint:v1` + `.bak`, never a locked state). On TRACE LOCKED the
  overlay offers **RETRY FROM CHECKPOINT** / **RESET SESSION**; **R = retry** (restore latest
  checkpoint, clear lock, reset trace, keep mission/depth/completion), **Shift+R = full reset**
  (also wipes the checkpoint). New reducer action `LOAD_CHECKPOINT` (allowed through the locked
  guard); `save.ts` gains `loadCheckpoint` / `writeCheckpoint` / `clearCheckpoint`. Reload after a
  loss keeps the checkpoint, so retry still works.
- **Terminal + camera follow-ups:** (1) `go to <type>` now **cycles** through nodes of that
  type instead of re-routing to the one you're parked on (first = nearest, repeats = next,
  wrapping; per-type cursor in `GameApp`, `nodesOfType` helper). (2) Terminal closes via
  **✕ / `close` / Esc / Space-on-empty-prompt** — the empty-Space exit was added because
  fullscreen eats the first Esc. (3) **Mouse wheel = zoom** (orbit radius) and **middle-button
  drag = rotate/raise** the orbit. (4) Flight vertical keys rebound: **Q = up, E/C/Ctrl = down**
  (E stays EXPORT while a node is inspected; only descends in free flight).
- **NEVA Terminal + scan** (see §18): **Space** now opens a techy command console (it no longer
  flies — Space was removed from the camera's ascend). Pure parser (`terminal.ts`): `go to
  <type>` (also `goto`/`go`/`nearest`, with forgiving aliases) flies to + selects the nearest
  node of that kind via an on-demand `terminalNav` lookup in `FlyCamera`; `scan [on|off]`
  toggles `ScanLabels` — a silver-gradient line + KIND label above nearby nodes (distance-faded,
  capped at 30, recomputed ~5×/s, so it's never noisy); plus `help` / `clear` / `close`. While
  open the terminal owns the keyboard via a shared `uiCapture` flag (camera + game shortcuts
  stand down; ESC closes). New files: `terminal.ts`, `terminalNav.ts`, `uiCapture.ts`,
  `components/Terminal.tsx`, `components/ScanLabels.tsx`.
- **Mission 03 readability pass** (see §17.2): made SIGNAL WAR understandable in-play without
  tutorials. WATCHER (CAMERA) nodes now wear a subtle camera-facing signal-ring (`WatcherRings`,
  distance-faded — invisible across the network, readable only when near/selected, brighter
  under a pulse); their panel reads `WATCHER NODE / SIGNAL SOURCE DETECTED / RECOMMENDED:
  ISOLATE`, the ISOLATE button gets the suggest-pulse, and their stream shows signal-source
  lines (`SIGNAL SOURCE / WATCH FEED / UPLINK TRACE / PRESSURE NODE`). Signal-pulse clarity: a
  top-bar `PRESSURE HIGH` chip during a pulse, short edge messages (`SIGNAL PULSE DETECTED` /
  `SIGNAL STABILIZED`). New **trace-change readout** — a "TRACE ±N" flash beside the meter on
  every deliberate action (muted-red `TRACE SPIKE +N` for big hits; idle decay never flashes),
  driven by a pure `traceDelta`/`traceDeltaId` in the reducer. Objective wording sharpened
  (`LOCATE DEPTH 03 ROUTE`); a M03 gateway stream reads `DEPTH 03 ROUTE DETECTED · SIGNAL WAR
  ZONE BREACHED`. Dev scan adds a `WATCHERS` count. Availability guaranteed deterministically
  (`ensureType` keeps ≥2 watchers; corrupted ~32% of edges and ≥1 deep gateway already exceed
  the minimums). W/C focus shortcuts were intentionally skipped — `W`/`C` are flight keys.
- **Perf + feel polish:** `InteractiveNodes` now only rebuilds/uploads its instance buffers
  when state (selection / focus / statuses / depth) actually changes instead of every frame
  (was constant idle cost — lossless fix). Softer camera focus-glide (`CENTRE_LERP` 1.5→1.0,
  rotation slerp 3.2→2.2); inspection panel fades in smoothly (no AR flicker); an EXTRACTED
  node's panel edge fades to a black→green "secured" gradient. Audio chimes retuned smoother
  + audible (mid-range; Safari unlock blip).
- **Session persistence + task clarity:** added a versioned `localStorage` autosave
  (`src/save.ts`) so a reload resumes the run instead of restarting Mission 01 (throttled
  writes, `.bak` corruption recovery, transient bits cleared on load; a full RESET just
  overwrites with a fresh state). Mission tasks now show **live per-mission progress counts**
  (`now/goal`) so the mission-relative `EXTRACT DATA` no longer looks stuck next to the
  lifetime `EXTRACTED` total. Also restored the **first-gesture audio unlock** (select/return
  chimes), lost when the ambient music was removed.
- **Mission 03 // SIGNAL WAR** (see §17): network-resistance mission — a signal-pulse
  pressure system, CAMERA-as-watcher framing + isolation task, deterministic corrupted
  links stabilised via TRACE, a 6-task checklist, subtle pulse cues (no flash), top-bar
  SIGNAL chip, and Depth 03 route completion. `MISSION_ADVANCE` now chains 1→2→3.
- **Mission 02 // ARCHIVE HUNT** (see §16): second mission continuing from Depth 02 — its
  own briefing/completion overlays, a delta-measured task checklist (`missionBase` +
  `missionProgress`), `MISSION_ADVANCE` to chain from Mission 01, archive route
  verify/unverify trace economics + panel banner, decoy-mistake tracking (warning, not
  fail), `isRiskNode` (unverified-archive aware), and a Depth 03 gateway tease.
- **Mission 01 // SURFACE BREACH** (see §15): the first complete playable session —
  briefing overlay, a live 6-task checklist, a mission-driven objective line, a
  completion overlay (CONTINUE / RESET, no forced stop), and a MISSION FAILED prefix on
  trace lock. Mission state added to the reducer (`INSPECT` / `MISSION_START` actions,
  `missionTasksDone` latch), reusing existing counters; R keeps progress, Shift+R restarts.
- **Dev Scan Mode:** added developer tooling (see §14) — `D` toggles a node-type AR overlay
  + gateway locator readout, `G`/`Shift+G`/`Alt+G` focus nearest/next/prev gateway, and a
  guaranteed minimum of gateways per layer. Off by default; no effect on normal play.
- **Bug fixes:** action messages are now tagged with their node (`msgNode`) so
  `DATA EXTRACTED +N` no longer lingers onto the next node you inspect; and long panel row
  values (depth-02 recommendations) now wrap inside the panel instead of overflowing.
- **Depth 02 Meaning Pass:** made Depth 02 a genuinely different layer — `nodeType` is now
  depth-aware (riskier re-rolled distribution at depth ≥ 2), explicit higher Depth-02 export
  values, depth-scaled trace gains (incl. DECOY spike & ISOLATE), depth-aware panel
  hints/recommendations, a fresh Depth-02 task checklist (snapshotted baselines +
  `nextGatewayFound`), slightly denser sub-cluster & brighter trace links, and Depth 03 prep
  (same system advances to d3 with a "NEXT SUBNETWORK ROUTE DETECTED" tease). Visuals/identity
  unchanged (no new colours — decoys still hidden until tripped).
- **Removed ambient music** at the user's request (`audio.ts` back to UI chimes only).
- **Reset rework:** split R into **soft RESET VIEW** (drop focus/panels/selection +
  recenter camera, keep depth & all progress) vs **SHIFT+R RESET SESSION** (full reset to
  Depth 01); a trace-locked R does the full reset. Three separate functions; hint button
  relabels RESET VIEW / RESET SESSION. Fixes R wrongly dropping Depth 02 → 01 mid-play.
- **Calmer audio + M mute:** made the ambient bed much calmer (lower/steady level, no
  tremolo, slower & gentler movement, soft sines only) and fixed **M to mute the music
  near-instantly** (was a slow multi-second fade that felt like it wasn't muting).
- **Ambient + clean board:** added a calm generative **ambient music bed** (`audio.ts`
  `startAmbient`, starts on first gesture, fades with M, suspends with the tab). Made
  **DECOYs hidden traps** — they render as normal active nodes (links neutral) until an
  action trips one, so a fresh board is pure white/gray (no always-on red).
- **Core-loop connect pass:** refined the derived objective state machine (added
  `INSPECT OR EXPORT DATA`, clean gateway hand-off after Depth 02), toned EXTRACTED/DECOY
  from neon to **subtle muted** tints (EXTRACTED dimmer than active), added a
  **dim/blocked LOCKED** look + matching muted link tints, disabled the EXPORT button on
  already-extracted nodes (`EXTRACTED` label), and clamped TRACE-link reveal to 3–8.

---

## 13. Depth & Level Progression (live)

**Reaching Depth 02 (the core loop):**
1. Find a **GATEWAY** node (≈8% of nodes — several exist in Depth 01).
2. Select it → the panel shows **GATEWAY NODE DETECTED · OPEN STREAM TO ACCESS SUBNETWORK**, and the OPEN STREAM button is highlighted (`is-suggest`).
3. **OPEN STREAM** → the Data Stream Panel shows a gateway handshake (`SUBNETWORK HANDSHAKE / DEPTH KEY FOUND / ROUTE MAP READY / ACCESS TUNNEL ACTIVE`) and a prominent **↳ ENTER SUBNETWORK** button with the hint *ENTER SUBNETWORK TO REACH DEPTH 0N*.
4. **ENTER SUBNETWORK** → `ENTER_SUB`: `currentDepth +1`, `depthSeed +1`, gateway sub-cluster spawns (`Subnetwork`), camera dives, and a cinematic **DEPTH 0N ACCESSED / SUBNETWORK LINK ESTABLISHED** overlay plays (title glow + ruler flicker). No page load.

**Depth identity — Depth 02 "Meaning Pass"** (`game.ts`, all deterministic). The deeper
layer is a genuinely different network, not just a relabel: `nodeType(i, depth)` re-rolls
the *same* node indices from a riskier distribution at depth ≥ 2 (own sub-seed
`^0x00d2`; Depth 01's stream is unchanged). Because decoys are hidden and node colour is
status-based, this shifts mechanics/panel/economics with no visual disruption.

- **Node distribution** (`WEIGHTS_D1` → `WEIGHTS_D2`): Depth 01 is the surface/learning
  mix (lots of MEMORY/MESSAGE). Depth 02 has **less MEMORY (22→12), more CAMERA (14→20),
  more ARCHIVE (12→20), more DECOY (20→24), more LOCKED (10→12), and a rarer GATEWAY
  (8→6)** — deeper = more risky/strategic, gateways scarcer & more valuable.
- **Reward scaling** (`exportValueAt`, explicit per layer): D1 MEMORY 10 / MESSAGE 8 /
  IDENTITY 20 / ARCHIVE 15 / CAMERA 6 → **D2 MEMORY 14 / MESSAGE 12 / IDENTITY 28 /
  ARCHIVE 24 / CAMERA 10** (LOCKED 12→18). GATEWAY/DECOY give no data. Depth 03+ scales
  gently from the D2 value (`×(1+(d−2)·0.35)`). The panel VALUE row shows the resolved number.
- **Trace scaling**: `depthTraceMul = 1 + (d−1)·0.25` (d2 = 1.25) on OPEN/TRACE/EXPORT; the
  **DECOY export spike scales too (+18 → +23 at d2)** and CAMERA/DECOY become the riskiest
  acts; **ISOLATE also scales (−7 → −9 at d2)** so it stays meaningful as gains rise. TRACE
  reveals 3–8 links (a few more per depth). Pressure, not instant failure.
- **Feel:** **Depth 01** = baseline (safe, low trace, learning). **Depth 02** = higher
  value, higher risk, more strategic, slightly denser gateway sub-cluster + brighter trace
  links. **Depth 03+** = same system, stricter access, higher risk/reward.

**Access Level** (`accessRequiredFor`):
- `accessLevel = 1 + floor(extractedData / 100)`.
- **LOCKED** needs unlock (trace/isolate) **or** access ≥ 2 (≥3 at depth 3+).
- **ARCHIVE** needs a TRACE **or** access ≥ 2 (≥3 at depth 3+).
- Panel shows **ACCESS REQ: GRANTED** or **LV n**; failed export → `ACCESS REQUIRED · LV n`.

**Objective system** (`ExplorerHud`, derived purely from live state, in priority order):
1. `game.locked` → **PRESS R TO RESET**
2. `trace ≥ 70` → **REDUCE TRACE / ISOLATE NODE**
3. gateway selected **and** its stream open → **ENTER SUBNETWORK → DEPTH 0N**
4. a *new* gateway selected (not the one already entered) → **OPEN GATEWAY STREAM**
5. `currentDepth ≥ 2` → **EXTRACT HIGHER VALUE DATA**
6. any normal node selected → **INSPECT OR EXPORT DATA**
7. nothing selected at depth 1 → **FIND A GATEWAY NODE**

This means the objective always reflects exactly where you are in the loop, including a clean hand-off after entering Depth 02 (the just-used gateway no longer re-prompts; a *different* gateway still does, for deeper dives).

**Task checklist** (`ExplorerHud`, depth-aware) — Depth 02+ swaps to a fresh deeper-layer
set measured from counters snapshotted on `ENTER_SUB` (so a player arriving with progress
still starts the new layer's goals clean):
- **Depth 01:** EXTRACT DATA · TRACE A LINK · ISOLATE A NODE · REACH DEPTH 02
- **Depth 02+:** EXTRACT 100 DATA · TRACE 3 LINKS · ISOLATE 1 RISK NODE · FIND NEXT GATEWAY
  (`nextGatewayFound` ticks when a GATEWAY stream is opened at depth ≥ 2).

**Recommended-action hints** (`typeHint` / `recommendedAction` in `game.ts`, depth-aware,
shown in panel). Depth 02 wording sharpens: MEMORY=`EXPORT`/`SAFE DATA OBJECT` ·
MESSAGE=`TRACE LINKS`/`MAY REVEAL ROUTES` · ARCHIVE=`TRACE LINKS BEFORE EXPORT`/`HIGH VALUE
ARCHIVE` · CAMERA=`ISOLATE OR AVOID`/`HIGH TRACE RISK` · DECOY=`DO NOT EXPORT`/`UNSTABLE
SIGNAL` · LOCKED=`TRACE LINKS / ACCESS REQUIRED`/`LOCKED OBJECT` · GATEWAY=`OPEN
STREAM`/`SUBNETWORK ROUTE` · IDENTITY=`EXPORT · CAREFUL`/`HIGH VALUE IDENTITY`.

**Depth 03 (future):** the system already supports it — a GATEWAY found/opened at Depth 02
shows **NEXT SUBNETWORK ROUTE DETECTED · DEPTH 03** in its stream and ENTER SUBNETWORK
advances `currentDepth` to 03 using the same machinery (deep type mix, value/trace formulas
cover d ≥ 3). Not yet authored as a distinct layer beyond that scaling — intentionally not overbuilt.

**Trace rules** (`game.ts`, single source of truth = `traceLevel` 0–100; HUD reads it live):
- OPEN STREAM `+openTrace×depthMul` (CAMERA/DECOY cost most); TRACE LINKS `+~3×depthMul`;
  EXPORT `+exportTrace×depthMul` by type; **DECOY EXPORT spike scales `+18×depthMul`
  (≈+23 at d2)**; **ISOLATE `−7×depthMul` (≈−9 at d2)** (GATEWAY isolate **backfires +8**).
  Idle decay `−1.4/s` via the `TICK` action.
- Thresholds: **≥70** edge flicker + warning objective; **≥90** `TRACE LOCK IMMINENT`;
  **≥100** `locked` → `TRACE LOCKED / SESSION COMPROMISED` (reducer freezes all actions
  except `RESET`). Reset model: **R** = soft RESET VIEW (keeps depth/progress) in normal
  play; **SHIFT+R** = full RESET SESSION; a **trace-locked R** = full reset (no page reload).

**Node visual states** (restrained, monochrome-first — `InteractiveNodes.tsx` /
`SelectedNodeFocus.tsx` / `NodeConnections.tsx`):
- **ACTIVE** white/gray cube (brightness from signal). **SELECTED** collapses the solid
  cube and shows the AR focus frame (semi-solid core + thin outline/brackets + a slow
  glow pulse, tinted to the node's state colour).
- **EXTRACTED** subtle muted ice-blue, *dimmer than active* — a clear "spent, don't
  revisit" marker; EXPORT button shows `EXTRACTED` and is disabled (no re-export).
- **ISOLATED** muted cool slate; its links dim. **LOCKED** dim/blocked gray until traced
  or access-granted. **DECOY = a hidden trap**: renders as a normal active node (and its
  links stay neutral) until an action trips it, then it reveals muted danger red;
  selecting one tints its focus frame red as discovery feedback, and the panel hint warns
  `UNSTABLE SIGNAL — EXPORT DANGEROUS`. **A fresh/clean board is therefore pure
  white/gray** — only EXTRACTED (ice-blue) and tripped DECOYs (red) ever carry colour,
  always muted, never neon.

**Balance:** trace gentle (decoy spike aside); Depth 02 reachable in a couple of minutes.
Selecting a node never costs trace (only actions do) — so inspecting a DECOY is safe; only
acting on it (OPEN STREAM / EXPORT) is dangerous. Sub-cluster nodes are visual-only for now
(value/trace economics scale by depth across the existing 220 nodes; the Depth-02 cluster
around the gateway is a deterministic wireframe, not yet independently clickable).

---

## 14. Dev Scan Mode (developer tooling)

A toggleable developer overlay for finding gateways and identifying node types fast while
authoring/testing. **Off by default; mounts nothing and changes no node visuals when off**,
so it can't affect the normal player experience.

- **V** = toggle Dev Scan (consumed in the capture phase so it never reaches flight / focus;
  `e.repeat`-guarded so holding doesn't flicker the toggle). **Moved off `D` in §23 — `D` is now
  the WASD strafe-right key.** `G` focuses the nearest gateway (`Shift+G`/`Alt+G` cycle).
- **When ON** (`DevScanOverlay`, inside the grid group, monochrome AR style):
  - thin white low-opacity tags on the important types — GATEWAY=`GATE` (brightest),
    DECOY=`DECOY`, ARCHIVE=`ARCH`, LOCKED=`LOCK`, CAMERA=`CAM` (tags shrink with distance
    via `distanceFactor`, so it stays an AR readout, not a debug mess);
  - a **pulsing bracket around the nearest gateway** (the locator);
  - HUD readout under the stats: `▣ DEV SCAN: ON`, `GATEWAYS` (count), `NEAREST` (node id),
    `DISTANCE`.
- **Gateway locator** lives in `devscan.ts` (render-free): `FlyCamera` computes nearest
  gateway each frame (world distance, accounts for grid rotation) → `devScanInfo`. Always
  maintained, so `G` works with the overlay off.
- **G** = focus + select + open the nearest gateway (normal focus glide). **Shift+G** /
  **Alt+G** = cycle next / previous gateway. If a layer truly has none →
  `NO GATEWAY FOUND IN CURRENT DEPTH` (transient HUD notice). A tiny always-on hint reads
  `D DEV SCAN · G NEAREST GATEWAY`.
- **Minimum gateway availability** (`ensureGateways` in `game.ts`): Depth 01 is guaranteed
  ≥ 2 gateways and Depth 02 ≥ 1 — a safety net over the random roll (the weights already
  exceed this, so it normally never fires and determinism is preserved). It only ever flips
  a few nodes to GATEWAY if a layer rolled too few; it never floods the network.

---

## 15. Mission 01 // SURFACE BREACH (first playable session)

The first mission of the session chain (see §16 for the multi-mission model): enter the
surface layer, learn the loop (inspect → export → trace → isolate), find a gateway, and
reach Depth 02 without trace lock. Mission state lives in `GameState`, reusing existing
counters where possible — `missionId`, `missionStarted`, `missionComplete`, `inspectedCount`,
`riskIsolated`; data/links/depth reuse `extractedData` / `revealedLinks` / `currentDepth`.

- **Briefing overlay** (`App`, class `.mx`): on a fresh session (`!missionStarted`) a
  monochrome cinematic card shows `NEVA NETWORK · MISSION 01 // SURFACE BREACH` + the four
  headline objectives. **Click or Enter** dispatches `MISSION_START` (the overlay captures
  clicks so the scene behind isn't selected).
- **Tasks** (live checklist in `ExplorerHud`, headed `MISSION 01 / SURFACE BREACH`):
  INSPECT 3 NODES (`inspectedCount`, via the `INSPECT` action on each new selection,
  deduped through `NodeStatus.inspected`) · EXPORT 100 DATA · TRACE 3 LINKS · ISOLATE 1
  RISK NODE (CAMERA/DECOY/LOCKED/ARCHIVE → `riskIsolated`) · ENTER DEPTH 02 · KEEP TRACE
  BELOW 100%.
- **Objective line** (mission-driven, reactive): `INSPECT THE NETWORK` → `EXPORT DATA` →
  `TRACE LINKS TO REVEAL ROUTES`; if a risk node is selected → `ISOLATE RISK NODE`; a
  gateway → `OPEN GATEWAY STREAM` → `ENTER SUBNETWORK`; high trace → `REDUCE TRACE`; on
  completion → `MISSION COMPLETE · CONTINUE EXTRACTION`; on lock → `MISSION FAILED — PRESS R`.
- **Completion** (`gameReducer` latches `missionComplete` via `missionTasksDone` once all
  tasks hold and not locked): overlay shows `MISSION 01 COMPLETE / SURFACE BREACH SUCCESSFUL
  / DEPTH 02 UNLOCKED` with **CONTINUE NETWORK** (dismiss + keep playing) and **RESET
  SESSION** (full reset). Never forces a stop.
- **Failure**: trace lock reuses the existing compromise overlay, now prefixed
  **MISSION FAILED** (then `TRACE LOCKED / SESSION COMPROMISED / PRESS R TO RESET`).
- **Reset behaviour with missions**: **R** (soft) keeps mission progress (no `RESET`
  dispatched). **Shift+R** and **trace-locked R** do a full reset → `missionStarted`/
  `missionComplete` clear and the briefing overlay re-shows (mission restarts). The
  complete-overlay dismissal (`continued`, App state) resets with the session.
- **Dev Scan compatibility**: unchanged — `D` toggles, `G` focuses nearest gateway, and
  because `G`/click both route through the same select path, mission counters still update
  when using dev shortcuts.

---

## 16. Mission 02 // ARCHIVE HUNT + multi-mission progression

The second mission, continuing **from the current network state** (no reset) after Mission
01 completes. Deeper, more valuable, riskier: trace archive routes, extract higher-value
data, avoid decoys, and locate the next gateway toward Depth 03.

- **Mission state is multi-mission**: `missionId` (1 SURFACE BREACH → 2 ARCHIVE HUNT),
  `missionStarted` / `missionComplete` (per current mission), plus counters
  `archiveExports`, `decoyExports`, `riskIsolated`, `inspectedCount`, and a `missionBase`
  snapshot captured at `MISSION_START` so each mission measures **fresh progress**
  (`missionProgress()` = current − base). Existing counters are reused (`extractedData`,
  `revealedLinks`, `nextGatewayFound`, `currentDepth`).
- **Progression**: Mission 01 complete → its overlay's **CONTINUE NETWORK** dispatches
  `MISSION_ADVANCE` (→ `missionId 2`, `missionStarted=false`, keep network state) → the
  **Mission 02 briefing** shows (`MISSION 02 // ARCHIVE HUNT · DEPTH 02 ACTIVE`, click/Enter
  to continue) → `MISSION_START` begins it and snapshots the baseline. The final mission's
  CONTINUE just dismisses (App `continued`) and keeps playing.
- **Tasks** (delta from `missionBase`): EXTRACT 200 DATA · TRACE 6 LINKS · EXPORT 2
  ARCHIVES · ISOLATE 2 RISK NODES · LOCATE GATEWAY → DEPTH 03 (`nextGatewayFound`) ·
  AVOID DECOY EXPORTS (informational — `decoyExports` delta; ✕ warning if violated, but
  **never blocks completion**; the only hard fail is trace lock).
- **Archive Hunt rules** (`game.ts` EXPORT): ARCHIVE export now always proceeds (within the
  existing access/trace gate) but its **route** matters — exporting an **unverified** archive
  (not traced) costs ~1.8× trace and warns; **tracing first verifies** the route for a
  ~0.6× cleaner export. The panel shows an `ARCHIVE ROUTE VERIFIED` / `ARCHIVE ROUTE
  UNVERIFIED` banner (unverified = subtle muted-red caution). Each archive export bumps
  `archiveExports`.
- **Decoy consequence**: a decoy trip increments `decoyExports`, spikes trace, and messages
  `DECOY TRIGGERED — TRACE SPIKE`; the AVOID task flips to a muted ✕ warning (decoy red stays subtle).
- **Risk-node isolation** counts DECOY / CAMERA / LOCKED / **unverified** ARCHIVE
  (`isRiskNode`); a traced (verified) archive no longer counts as risk.
- **Gateway toward Depth 03**: a GATEWAY stream opened at depth ≥ 2 sets `nextGatewayFound`
  (completes the locate task) and shows `NEXT SUBNETWORK ROUTE DETECTED · DEPTH 0n ROUTE
  PARTIAL`. ENTER SUBNETWORK already advances to Depth 03 via the same machinery (§13).
- **Completion overlay**: `MISSION 02 COMPLETE / ARCHIVE ROUTES EXTRACTED / DEPTH 03 SIGNAL
  DETECTED` with CONTINUE NETWORK (keep playing) / RESET SESSION.
- **Reset**: unchanged — R keeps progress; **Shift+R / trace-locked R** fully reset →
  `missionId` back to 1 and the Mission 01 briefing re-shows.

---

## 17. Mission 03 // SIGNAL WAR + network resistance

The first "the network fights back" mission, continuing from Depth 02 after Mission 02
(CONTINUE NETWORK → `MISSION_ADVANCE`, which now chains 1→2→3, capping at 3). NEVA becomes
**active**: it emits signal pulses, marks corrupted links, and runs watcher nodes. Still
interface-first — no enemies/characters/weapons/combat.

- **Signal Pulse system** (timer in `App.tsx`, state in the reducer): while Mission 03 is
  active (not complete/locked), a pulse fires every **25–45 s** and lasts **~7 s**
  (`PULSE_START` → `PULSE_END`, which advances `signalPulsesSurvived`). During a pulse,
  **action trace costs ×1.3** (`pulseMul`) and a **watcher (CAMERA) opened/exported costs an
  extra ×1.5**. Cues are subtle (no big flash): `SIGNAL PULSE ACTIVE` warning, brand + ruler
  flicker, a faint breathing edge bloom, a top-bar `SIGNAL: PULSE/CALM` chip, a brightening
  wave through the links, and a panel note `SIGNAL PULSE ACTIVE · ACTION TRACE COST
  INCREASED`. Timing uses real time + `Math.random` in the effect (reducer stays pure); a
  pulse interrupted by completion/lock is cleared so the cue never sticks.
- **Watcher nodes = CAMERA** (Option A): in Mission 03 the panel frames CAMERA as a
  **WATCHER NODE / SIGNAL SOURCE DETECTED**, RECOMMENDED ISOLATE; isolating one advances
  `watcherIsolated`. They're costlier to act on during a pulse. No new colour — a muted-red
  caution banner only.
- **Corrupted Links** (`EDGE_CORRUPT`, deterministic ~32% of edges): in Mission 03,
  unstabilized corrupted edges render as a **faint gray-red caution** in the resting link
  mesh, and — so they're actually findable — get a **readable warning overlay**
  (`CorruptedLinks.tsx`, see §17.1). **TRACE LINKS on a node stabilises the corrupted edges
  touching it** (`linkStabilized`, `corruptedLinksStabilized`++) → `CORRUPTED LINK
  STABILIZED · ROUTE INTEGRITY RESTORED`; the overlay drops those edges and they revert to
  normal stable white/gray lines. Simple + deterministic; no graph-repair complexity.
- **Tasks** (delta from `missionBase`): SURVIVE 3 SIGNAL PULSES · STABILIZE 5 CORRUPTED
  LINKS · ISOLATE 2 WATCHER NODES · EXTRACT 250 DATA · DETECT DEPTH 03 ROUTE
  (`depth03Detected` = `nextGatewayFound || currentDepth ≥ 3`) · KEEP TRACE BELOW 100%
  (informational). `missionBase` now also snapshots survived/stabilized/watcher.
- **Objective flow**: `MONITOR SIGNAL PRESSURE` → during a pulse `AVOID HIGH-RISK ACTIONS`;
  CAMERA → `ISOLATE WATCHER NODE`; **selected node touches corrupted links → `TRACE LINKS
  TO STABILIZE ROUTE`**; ARCHIVE → `TRACE LINKS TO STABILIZE ROUTE`; **still corrupted links
  left but none on this node / nothing selected → `FIND CORRUPTED ROUTES`**; `EXTRACT DATA
  UNDER PRESSURE`; GATEWAY → `OPEN DEPTH 03 ROUTE`; trace ≥ 70 → `REDUCE TRACE / ISOLATE
  SOURCE`; complete → `MISSION COMPLETE · CONTINUE NETWORK`.
- **Depth 03 route**: detecting/opening a depth-≥2 gateway stream (or already being at
  depth ≥ 3) completes the route task; ENTER SUBNETWORK advances to Depth 03 via the
  existing machinery (§13). Completion overlay: `MISSION 03 COMPLETE / SIGNAL WAR SURVIVED /
  DEPTH 03 ROUTE SECURED`.
- **Dev Scan**: CAMERA tags relabel to `WATCH`; the dev readout adds a `CORRUPTED` count
  (remaining unstabilized corrupted edges) and, when a node is selected, a `NEARBY` count
  (`corruptedNearby`). The worst remaining corrupted hubs (top 5) get a **faint red guide
  bracket + `CORRUPT n` label**, and the §17.1 overlay brightens under dev scan. D/G unchanged.

### 17.1 Corrupted-link visibility & guidance (Mission 03 readability patch)

Corrupted links were too hard to spot, so which routes to TRACE wasn't obvious. The fix is
**visibility + guidance only** — no change to mission logic, node rules, or the stabilize
mechanic (TRACE still repairs incident corrupted edges exactly as before).

- **Visual language** (`src/components/CorruptedLinks.tsx`, mounted in the grid group after
  `NodeConnections`): an overlay that draws *only* the still-unstabilized corrupted edges as
  a **muted red-gray (`0.66,0.28,0.29`), thin, broken/dashed line** with a **faint flicker**,
  sparse **glitch gaps**, and a **low but readable glow** (NormalBlending + Bloom). Distance
  fades match the resting link mesh. Brighter during a signal pulse and under dev scan; it
  stays monochrome-first — no neon, the rest of the network is untouched.
- **Corrupted-link markers**: a tiny perpendicular **AR warning tick** (a small 3D “+”,
  additive, flickering) at each unstabilized corrupted edge's midpoint — interface-annotation
  thin, never a big label. (Dev scan adds the `CORRUPT n` hub labels above.)
- **Nearby-corrupted hint** (`HolographicNodePanel`): when the selected node touches
  unstabilized corrupted links (`corruptedNearby(node, linkStabilized)`), the panel shows a
  muted-warning block — `CORRUPTED LINKS NEARBY` / `RECOMMENDED: TRACE LINKS` /
  `CORRUPTED LINKS: NN` — the **TRACE LINKS** button gets the `is-suggest` pulse, and a small
  `▹ TRACE LINKS TO STABILIZE ROUTE` hint sits under the action row. After TRACE, the block
  clears (count → 0), the message confirms `CORRUPTED LINK STABILIZED · ROUTE INTEGRITY
  RESTORED`, and the edge reverts to a stable line.
- **Helpers** (`game.ts`, pure read-only, no rule change): `corruptEdgesAt(node)` and
  `corruptedNearby(node, linkStabilized)` drive the panel, HUD `NEARBY` readout, objective
  flow, and dev-scan hubs.

### 17.2 Mission 03 readability & guidance pass

Made SIGNAL WAR understandable *during play* — readable watchers, clear pulse state, visible
trace pressure, and sharper guidance — **without tutorials or any change to the visual identity
or mission logic** (no rule, node, or stabilize-mechanic change). Build + lint pass.

- **Watcher visibility** (`WatcherRings.tsx`, mounted in the grid group): a subtle, two-ring,
  **camera-facing signal-ring** around every WATCHER (CAMERA) node in Mission 03. Muted warm-gray
  (faint caution, never neon), slow breathing pulse, **brighter during a signal pulse**. It
  **distance-fades** (fully readable when near, gone by ~96 units) so watchers are *not* obvious
  from across the network — only when you fly near or select one (selecting pulls the camera in).
  One `ShaderMaterial` (billboarded in the vertex shader from `cameraPosition`) + one merged
  `LineSegments` over `watchersAtDepth(depth)`; geometry rebuilt only on depth change. Pure
  annotation.
- **Watcher panel + stream** (`HolographicNodePanel`): a selected non-extracted watcher shows
  `WATCHER NODE / SIGNAL SOURCE DETECTED / RECOMMENDED: ISOLATE`, the **ISOLATE** button takes
  the `is-suggest` pulse, and its Data Stream reads `SIGNAL SOURCE / WATCH FEED / UPLINK TRACE /
  PRESSURE NODE`. A Mission 03 GATEWAY stream reads `DEPTH 03 ROUTE DETECTED · SIGNAL WAR ZONE
  BREACHED`. Dev scan still tags watchers `WATCH`.
- **Signal-pulse clarity** (`ExplorerHud`): the top-bar SIGNAL chip (PULSE/CALM) is joined by a
  muted-red `PRESSURE HIGH` chip during a pulse; short transient edge messages fire once on
  start (`SIGNAL PULSE DETECTED`) and end (`SIGNAL STABILIZED`), distinct from the persistent
  `SIGNAL PULSE ACTIVE` warning. Existing subtle cues kept (ruler/brand flicker, link brighten,
  edge breathe — no big flash). The in-panel `SIGNAL PULSE ACTIVE · ACTION TRACE COST INCREASED`
  note stays.
- **Trace-change readout** (`game.ts` + `ExplorerHud`): the reducer records each action's signed
  trace change in pure state — `traceDelta` + a bumping `traceDeltaId` set inside `withTrace`, so
  **only deliberate actions** surface a readout and **idle decay (`TICK`) never does**. The HUD
  flashes a small `TRACE ±N` tag beside the meter (green when reduced, muted-red `TRACE SPIKE +N`
  for big hits, threshold ≥12 — decoy/pulse-amplified). Shown once per action, never per frame.
- **Objective guidance** (`ExplorerHud`, M03 branch, already mostly in place): pulse →
  `AVOID HIGH-RISK ACTIONS`; watcher → `ISOLATE WATCHER NODE`; node touching corrupted links →
  `TRACE LINKS TO STABILIZE ROUTE`; corrupted left but none here → `FIND CORRUPTED ROUTES`;
  trace ≥70 → `REDUCE TRACE / ISOLATE SOURCE`; route not yet detected → `LOCATE DEPTH 03 ROUTE`.
- **Availability guarantees** (deterministic, `game.ts`): `ensureType(TYPES_DEEP, 'CAMERA', 2)`
  guarantees ≥2 watchers (never fires — the deep mix already rolls ~40); corrupted links are
  ~32% of all edges (≫5) and `ensureGateways` keeps ≥1 deep gateway. So Mission 03 is always
  completable regardless of seed. `watchersAtDepth(depth)` is the precomputed watcher list (HUD
  `WATCHERS` count).
- **Dev scan**: adds a `WATCHERS` count (alongside `GATEWAYS` / `CORRUPTED` / `NEARBY`). `G`
  still focuses the nearest gateway. **`W`/`C` focus shortcuts were intentionally skipped** —
  `W` (forward) and `C` (down) are core flight keys, so rebinding them would break movement.
- **Save/reset**: unchanged and compatible — autosave/resume still work (new `traceDelta`/
  `traceDeltaId` default in via the merge-over-`initGame`; the HUD seeds its edge-trackers from
  current state on mount, so a resumed run never spurious-flashes). R = reset view, Shift+R /
  trace-locked R = full reset.

---

## 18. NEVA Terminal + `scan` (command console)

A techy in-fiction command console for fast navigation and recon. Opened with **Space**
(Space is now the terminal key and **no longer flies** — it was removed from the camera's
ascend control at the user's request; descend stays on C/Ctrl, climb via look-up + W).

- **Open/close**: **Space** opens it in any mode (it exits pointer-lock so the mouse is free
  to type). Close with the **✕ CLOSE** button, the `close` / `exit` / `q` command, **Esc**, or
  **Space on an empty prompt** — the empty-Space close exists because in fullscreen the browser
  swallows the first Esc to leave fullscreen, so Esc alone isn't reliable. (Mid-command Space
  types a normal space, so `go to archive` is unaffected.) While open, a shared
  `uiCapture.active` flag makes `FlyCamera` and the GameApp shortcut handler **stand down**, so
  every keystroke goes to the command input — no flight, no O/T/I/E/R/D/G/M actions fire.
- **Look & feel** (`Terminal.tsx`, `.term`): a compact translucent AR surface (dark `rgba` +
  blur, faint internal hairlines, no corner-marks), mono font, a scrollback log and a `neva>`
  prompt. Silver text, monochrome — no neon. Bottom-centre, above the ruler; not a big modal.
- **Parser** (`terminal.ts`, pure + deterministic → `parseCommand(raw)` returns display lines +
  an optional effect; trivially testable):
  - `go to <type>` (also `goto <type>` / `go <type>` / `nearest <type>`) → routes to + selects
    a node of that kind, **cycling** so repeats visit a *different* one (first call = the
    nearest; each repeat = the next in `nodesOfType(type, depth)`, wrapping). This is because
    after routing the camera parks on the node, making it "nearest" again — cycling avoids
    re-picking it. Per-type cursor lives in `GameApp` (reset on depth change). Forgiving
    aliases: `memory|mem`, `message|msg|comms`, `camera|cam|watcher|watch`, `identity|ident|id`,
    `archive|arch`, `gateway|gate|gw`, `decoy`, `locked|lock`. Prints `▸ ROUTING → <TYPE> nn/NN ·
    NODE <id>`, or `▸ NO <TYPE> NODE IN RANGE`.
  - `scan` / `scan on` / `scan off` → toggles the kind-marker overlay.
  - `help` (lists commands + types), `clear`, `close`.
  - Unknown input → `UNKNOWN COMMAND/TYPE · TYPE HELP`.
- **Nearest lookup** (`terminalNav.ts`): `FlyCamera` provides `nearestOfType(type)`, computed
  on demand against the **live camera position + grid rotation** and the current depth's type
  mix (re-bound when depth/camera change). Render-free channel, like `telemetry` — costs
  nothing until a command fires.
- **`scan` overlay** (`ScanLabels.tsx`): a **thin vertical silver-gradient line above each node
  with its KIND labelled** at the top. To stay un-noisy it only marks nodes **near the camera**
  (within ~58 units, capped at 30, each fading with distance), recomputed ~5×/second (not every
  frame) and only when the near-set changes. Reveals **all kinds including DECOY/GATEWAY** (an
  operator recon tool, like Dev Scan — the hidden-trap rule still governs normal play). Pure
  read-only annotation: no trace cost, no game-rule effect, deterministic kinds from
  `nodeType(i, depth)`. Toggle off with `scan` again.

---

## 19. Checkpoint & failure recovery

A trace lock used to send the player all the way back to Mission 01 — too harsh. Recovery is
now **checkpoint-based**: a loss retries from the latest safe milestone, keeping mission,
depth, and completion progress. No gameplay-balance change — only failure handling.

- **Checkpoints** (`GameApp` capture effect → `writeCheckpoint`): a SAFE `GameState` snapshot is
  captured at each milestone — **Mission 01/02/03 start** (`missionStarted` false→true),
  **reaching a deeper layer** (`currentDepth` increases → Depth 02 / 03), **next-depth route
  detected** (`nextGatewayFound` false→true), and **mission-complete → Continue Network**
  (`continueNetwork`). It records everything in `GameState` (mission id, depth, access,
  extracted, the `missionBase` baseline, node statuses, `linkStabilized`, etc.). A checkpoint is
  **never** captured from a locked/failed state. The camera "safe position" is implicit: retry
  drops the selection so `FlyCamera` glides back to the overview orbit.
- **Storage** (`save.ts`): a dedicated slot `neva:checkpoint:v1` (+ `.bak`), separate from the
  autosave, so a failed state never overwrites the recoverable checkpoint. `loadCheckpoint`
  also defensively strips any `locked` flag. Held in a `GameApp` ref + persisted, so a **page
  reload after a loss still knows the latest checkpoint** and can retry.
- **Recovery** (reducer `LOAD_CHECKPOINT`, allowed through the locked guard): restores the
  checkpoint snapshot with `locked:false`, `traceLevel:0`, `missionComplete:false`, and transient
  bits cleared. If **no** checkpoint exists yet, it recovers **in place** (unlock + safe trace,
  keep current mission/depth) — it never bounces to Mission 01.
- **Failure overlay** (`ExplorerHud` `.hud__locked`): `MISSION FAILED` / **TRACE LOCKED** /
  **SESSION COMPROMISED** + two buttons — **RETRY FROM CHECKPOINT** (`onRetryCheckpoint`) and
  **RESET SESSION** (`onResetSession`) — and the hint `R = RETRY CHECKPOINT · SHIFT+R = RESET
  SESSION`. The top brand button relabels to **RETRY** while locked.
- **Keys when locked**: **R** = retry from checkpoint; **SHIFT + R** = full RESET SESSION
  (which also calls `clearCheckpoint`). Normal-play R / Shift+R are unchanged (§8).
- **Compatibility**: the autosave (`neva:save:v1`) is untouched and still resumes the live run;
  after a retry it autosaves the restored state. Both slots coexist.

---

## 20. Resource / mining layer (v1)

The first step toward NEVA as an open-ended mining/progression game (not only a mission chain).
Actions now yield **resources** on top of DATA. Additive only — missions, trace, depth, gateways,
and the save system are unchanged. State lives in `GameState.resources` + `lastGain` / `gainId`.

- **Resources** (`Resources` in `game.ts`):
  - **DATA** — the main extracted total (= `extractedData`, unchanged; also feeds mission tasks).
  - **MEMORY_SHARDS** — mostly from MEMORY / ARCHIVE exports.
  - **ACCESS_KEYS** — rare; reserved for future LOCKED / deep-system unlocks (collect + display now).
  - **SIGNAL_ENERGY** — from isolating watchers/decoys, stabilizing corrupted links, breaching
    subnetworks; reserved for future defensive/scan systems.
  - **CORE_FRAGMENTS** — very rare; only appear at **Depth 03+** (ARCHIVE/IDENTITY exports).
- **Determinism**: the reducer stays pure — every "chance" drop is a **deterministic per-node hash**
  (`roll(node, salt)` via `mulberry32`), so a node always drops the same bonus *and* the panel can
  preview the exact yield. A node exports once, so per-node rolls are stable.
- **Reward rules** (`exportYield(node, type, depth, prev)` is the single source of truth, used by
  both the reducer and the panel preview):
  - **EXPORT** → DATA + : MEMORY `shards +1` (d2+: +2) · MESSAGE DATA only · ARCHIVE `shards +2`
    (d2+: +3) + `key` chance (`keyChance` 0.15/0.35/0.5 by depth) + d3 `core` chance 0.15 ·
    IDENTITY `key +1` (+ d3 `core` chance) · LOCKED `key` chance · CAMERA `signal +1` *only if
    handled safely* (isolated/traced first) · DECOY/GATEWAY none.
  - **ISOLATE** (first time only) → CAMERA/DECOY `signal +1` (d3: +2) · LOCKED `key` chance ·
    unverified ARCHIVE `shards +1`.
  - **TRACE** stabilising a corrupted-link batch → `signal +1`. **ENTER_SUB** → `signal +1`.
  - **DECOY** export still spikes trace and grants nothing (unchanged).
- **Depth scaling**: light — more shards and higher key-chance deeper; CORE_FRAGMENTS gated to
  Depth 03+; watcher/decoy isolation signal doubles at Depth 03.
- **UI** (`ExplorerHud`): a compact monochrome **RESOURCES** strip in the left stats — `DATA / MEM /
  KEYS / SIGNAL / CORE` (DATA integrated here, so the old EXTRACTED row was folded in). A subtle
  green "+N DATA · +1 MEM …" **gain flash** beside the header (once per gain via `gainId`).
- **EXPECTED YIELD block** (`HolographicNodePanel`, `.np__yield`): **always visible** while a node
  is selected — placed directly below the node stats and above the action buttons, with a clear
  2px left rail. Deterministic, so it matches the real reward exactly. States:
  - *Before export* — `EXPECTED YIELD` + `DATA +n` and any non-zero bonus rows, with a muted
    `TRACE RISK HIGH` / `VERIFY ROUTE FIRST` note for CAMERA / unverified ARCHIVE.
  - *Spent* — `YIELD STATUS` → `EXTRACTED · SPENT` + the gained breakdown (or `DECOY TRIGGERED /
    NO VALID DATA` for a tripped decoy), so the node reads as used up.
  - *Special* — GATEWAY `ROUTE ACCESS / SUBNETWORK LINK`; DECOY `NO VALID DATA / TRACE SPIKE RISK`;
    access-gated `ACCESS REQUIRED / UNKNOWN UNTIL UNLOCKED`.
  Dev Scan adds a compact `RES GAIN` (last gain) + `YIELD` (selected node) debug line
  (`data/mem/keys/signal/core`) — supplementary only; the panel block shows in normal mode too.
- **Feedback messages**: subtle, white/gray with a faint muted-green gain accent — no arcade popups.
- **Save** (`save.ts`): `resources` persists in `neva:save:v1` (deep-merged over `initGame`, so
  pre-resource saves load cleanly; `lastGain` cleared on resume). Checkpoints snapshot resources too
  (retry keeps them). **R soft reset keeps resources; Shift+R full reset clears them** (`RESET` →
  `initGame`).
- **Future mining direction**: spend ACCESS_KEYS to unlock LOCKED nodes / deeper systems; spend
  SIGNAL_ENERGY on defensive/scan upgrades; CORE_FRAGMENTS as a deep end-game currency; passive
  extraction / node ownership; a resource-driven upgrade tree layered over the mission chain.

---

## 21. Resource Usage v1 (spending)

Resources are no longer just counters — three of them now drive actions. Lightweight first pass;
the reducer stays pure (unlocks/boosts are deterministic), and spent state rides the existing save.

- **ACCESS_KEYS → unlock LOCKED nodes** (`USE_KEY` action). When a LOCKED node's access is denied,
  the panel's **RESOURCE ACTIONS** shows **USE KEY · 1 KEY**. With keys > 0 it consumes 1 key, sets
  `NodeStatus.unlocked`, and the node can then OPEN STREAM / TRACE / EXPORT — message `ACCESS KEY
  USED · NODE UNLOCKED`. With 0 keys → `NO ACCESS KEYS AVAILABLE`. **Access Level still auto-grants
  access independently** — keys are an alternative manual unlock.
- **SIGNAL_ENERGY → active control** (boost flags on existing actions, so no new node rules):
  - **BOOST ISOLATE** (`ISOLATE {boost:true}`) — spends 1 SIGNAL for a **~doubled trace reduction**
    on a risk node (CAMERA/DECOY/LOCKED/unverified ARCHIVE). Message `SIGNAL ENERGY SPENT · ISOLATION
    BOOSTED`. The boost is a clean −1 SIGNAL (it overrides the normal isolate harvest).
  - **STABILIZE ROUTE** (`TRACE {boost:true}`) — when corrupted links are nearby, spends 1 SIGNAL to
    also stabilize the corrupted links on the node's **neighbours** (a wider repair). Message
    `SIGNAL ENERGY SPENT · ROUTE STABILIZED`. Clean −1 SIGNAL.
- **MEMORY_SHARDS → analysis** (`ANALYZE` action). For DECOY/ARCHIVE/LOCKED nodes, **ANALYZE NODE ·
  1 MEM** spends 1 shard and reveals clearer info (persisted `analyzed`): `DECOY SIGNATURE CONFIRMED`
  (DO NOT EXPORT) / `ARCHIVE ROUTE MAP REVEALED` / `LOCK SIGNATURE IDENTIFIED`. It doesn't change the
  node type — it's decision support, shown as a persistent confirmation block.
- **CORE_FRAGMENTS → future**: still display-only. When CORE > 0 the HUD hints `CORE FRAGMENTS WILL
  POWER FUTURE NETWORK UPGRADES`. Reserved as the deep end-game / upgrade currency (see §20 future
  direction) — not spent yet.
- **Panel — RESOURCE ACTIONS** (`HolographicNodePanel`, `.np__resact`, muted-green rail): a contextual
  block above the action buttons that shows only the relevant + affordable actions (USE KEY /
  ANALYZE NODE / BOOST ISOLATE / STABILIZE ROUTE), each with its cost (`1 KEY` / `1 MEM` / `1 SIGNAL`).
  Never shown when not useful, so most nodes stay uncluttered.
- **Feedback**: small monochrome messages (`ACCESS KEY USED`, `NODE ANALYZED`, `ROUTE STABILIZED`,
  `ISOLATION BOOSTED`, `NO ACCESS KEYS AVAILABLE`) + a signed resource flash beside the HUD strip
  (`-1 KEY`, `-1 SIGNAL`, `-1 MEM`).
- **Dev Scan**: compact readiness lines for the selected node — `KEY UNLOCK READY` / `SIGNAL BOOST
  READY` / `MEM ANALYZE READY` — supplementary only.
- **Save**: spent keys, unlocked nodes, and analyzed nodes persist (statuses + resources are already
  in `neva:save:v1`, and in checkpoints). **R soft reset keeps** resource progress; **Shift+R full
  reset clears** it (`RESET` → `initGame`).
- **Missions**: unchanged and not gated on resources — USE KEY helps LOCKED nodes, BOOST ISOLATE
  helps Mission 03 watcher/risk isolation, STABILIZE ROUTE helps corrupted-link tasks, ANALYZE helps
  avoid decoys. All optional aids.

---

## 22. Upgrade System v1

The first long-term progression layer: resources buy **permanent session upgrades** that make the
network abilities feel progressively stronger. State is `GameState.upgrades` (a `Record<UpgradeId,
number>`, levels 0–3). Definitions (costs + display) live in `UPGRADE_DEFS` (`game.ts`) so the
reducer and the UI agree. Reducer stays pure — purchases and effects are deterministic.

- **Upgrades + effects** (light touch):
  - **TRACE_DAMPENER** — trace GAINS −8%/level (applied centrally in `withTrace`, with a ≥1 floor so
    risky actions always cost something; reductions/decay unaffected).
  - **EXPORT_EFFICIENCY** — DATA reward +10%/level (in `exportYield`, so the panel preview matches).
  - **SCAN_RESOLUTION** — clearer node intel in the panel (hint clarity; light UI improvement).
  - **ISOLATION_CORE** — ISOLATE trace reduction +15%/level.
  - **KEY_FORGE** — ACCESS_KEY drop chance +12%/level on ARCHIVE/LOCKED rolls (deterministic).
  - **SIGNAL_STABILIZER** — Signal-Pulse pressure −7%/level (`pulseMul` floored at 1.0) and, at
    level ≥ 2, a normal TRACE also repairs neighbour corrupted links (wider stabilize).
- **Costs** (`UPGRADE_DEFS[i].costs[level]` = cost to reach `level+1`), SIGNAL/MEM/KEYS only — CORE is
  reserved for future high-tier upgrades:
  - TRACE_DAMPENER: 2 SIGNAL · 4 SIGNAL+1 KEY · 6 SIGNAL+2 KEYS
  - EXPORT_EFFICIENCY: 4 MEM · 8 MEM+1 KEY · 12 MEM+2 KEYS
  - SCAN_RESOLUTION: 3 MEM · 6 MEM+1 SIGNAL · 10 MEM+2 SIGNAL
  - ISOLATION_CORE: 3 SIGNAL · 6 SIGNAL · 9 SIGNAL+1 KEY
  - KEY_FORGE: 1 KEY+5 MEM · 2 KEYS+8 MEM · 3 KEYS+12 MEM
  - SIGNAL_STABILIZER: 4 SIGNAL · 8 SIGNAL+1 KEY · 12 SIGNAL+2 KEYS
- **Buying** (`BUY_UPGRADE { id }`): checks the level/cost, refuses at MAX (`UPGRADE AT MAX`) or when
  unaffordable (`INSUFFICIENT RESOURCES`), else subtracts the cost (negative gain → also flashes the
  HUD spend) and raises the level — message `UPGRADE INSTALLED · <NAME> LV n`. A global message, so
  the reducer wrapper now clears `msgNode` for non-node actions (it won't leak into a node panel).
- **UI** (`UpgradePanel`, `.up`): a **centered ~65vw / 65vh holographic system panel** (`width:
  min(65vw,980px)`, `height: min(65vh,680px)`, translate-centered) matching the Inspection/Stream
  panels — transparent dark glass, thin white border, **corner brackets**, inner **scanline**, soft
  white glow, header `NEVA // UPGRADES` + subtitle `NETWORK AUGMENTATION SYSTEM`, a divider that
  reveals on open, and a **resource strip** (DATA/MEM/KEYS/SIGNAL/CORE). Upgrades render as a
  **2-column grid** (1 column < 720px) of thin AR cards (corner ticks, hover glow) — each with name,
  `LV n/3`, effect, next cost, and an **UPGRADE** button (brighter when affordable, dim when not,
  **MAX** at level 3). **Open & close = the Terminal's staged animation** (the full set, ~20% quicker):
  `.up` is a transparent shell, the surface lives on `.up::before`, content on `.up__inner`. OPEN — the
  four `.up__corner` brackets **assemble at the screen centre and glide out to the panel corners**
  (`up-c-*`, 1.36 s), then the surface scales/fades up (`up-inside-in`, 1.04 s @0.48 s), then the content
  fades in (`up-content-in`, 0.76 s @1.16 s) — ~1.9 s total. CLOSE (`.up--closing`) — content fades, the
  surface collapses (`up-inside-out`), the brackets **glide back to centre and blink out** (`up-cc-*`),
  then unmount (`UP_CLOSE_MS` in `GameApp`, matching the CSS). **(As of §23 the open/close timings
  were unified to the Terminal's exact settings — corners 0.82s/0.62s, surface 0.72s/0.46s,
  `UP_CLOSE_MS` 760 ms — so the 1.36 s / 1.04 s / 620 ms figures above are superseded.)** Over a dim **backdrop**
  (`rgba(0,0,0,0.35)` + 2px blur; clicking it closes; reduced-motion shows the resting state instantly).
  **The backdrop dims out via `background-color` / `backdrop-filter`, NOT `opacity`** — animating the
  backdrop's opacity would group-fade all its children (panel + brackets) together and hide the crisp
  bracket-retract, so the close looked like a plain fade instead of the Terminal's. Toggled with **U**
  (or the HUD UPGRADES button → `fireKey('KeyU')`); while open it owns the keyboard via `uiCapture`;
  **U / Esc** (or ✕ CLOSE / backdrop) play the retract then close.
- **Save**: `upgrades` persists in `neva:save:v1` (deep-merged over `initGame`, so pre-upgrade saves
  load cleanly) and in checkpoints. A purchase **flushes the save immediately** (a refresh right after
  buying never loses it). **R soft reset + checkpoint retry keep** upgrades; **Shift+R full reset
  clears** them (`RESET` → `initGame`).
- **Missions**: unaffected and never required — upgrades only make the existing loop smoother
  (less trace, more DATA, stronger isolate, easier keys, pulse resistance).
- **Future direction**: CORE_FRAGMENTS-gated high-tier upgrades; per-depth or per-mission upgrade
  unlocks; an upgrade tree / prestige layer; passive extraction or node-ownership upgrades.

---

## 23. Clean Stability + UX Pass

A stabilize/unify/readability pass over the existing game — **no new systems, no balance
changes** (rewards, trace, mission requirements, upgrade costs, node distribution, depth
scaling all untouched). What changed:

- **UPGRADES command button.** The top command bar (`.hud__actions`) now has a subtle
  **`UPGRADES [U]`** button styled exactly like OPEN/TRACE/ISOLATE/EXPORT. It toggles the
  Upgrade panel via `fireKey('KeyU')` (so the `U` shortcut and the button share one path) and
  shows an `is-active` state (`.hud__act.is-active`) while the panel is open. `ExplorerHud` takes
  an `upgradesOpen` prop for this.

- **Unified panel animation (the Terminal's, everywhere).** Inspection, NODE INFO and Upgrade
  panels all open/close with the **same corner-assemble + surface-scale** the Terminal uses, at
  the **same settings**: corners `0.82s @0.05s` (open) / `0.62s @0.12s` (close), surface
  (`term-inside-in/out`) `0.72s @0.26s` (open) / `0.46s @0.14s` (close). The node panels'
  unmount delay (`NP_CLOSE_MS`) and the upgrade panel's (`UP_CLOSE_MS`) are both **760 ms**.
  The earlier per-panel timings (the slower `up-c-*` 1.36 s set, the lock-on leader line) are
  **gone** — no leader line on any panel.

- **Text writes in with the panel.** Panel content no longer waits ~1 s; the data rows cascade
  **top→bottom, sliding in from the left** (`np-row-in`) **in step with the panel opening**
  (~0.3 s base, ~45 ms/row), and the YIELD / RESOURCE-ACTIONS / GATEWAY blocks and the action
  buttons continue that cascade (≈0.9–1.3 s) instead of popping in with the frame.

- **NODE INFO is node-anchored.** It is no longer a fixed mid-left HUD card. It is its own
  `NodeInfoPanel` (rendered by `NodePanelHost`), anchored to the **same node** and opening to the
  **left** (mirroring the Inspection panel that opens right), a short beat after it. The old `.ni`
  HUD aside + its data block were removed from `ExplorerHud`.

- **Close-in-place on deselect.** `NodePanelHost` holds both node panels mounted through their
  retract, then unmounts. On deselect (click-away / R / Esc) the camera **holds on the node for
  `DESELECT_HOLD_MS` (500 ms)** so the panels retract in place, then eases back to overview — the
  close never rides the camera. **R no longer snaps the camera** while a panel is open (it just
  closes the panel; the camera follows). R with nothing selected still returns to overview.

- **Dev Scan moved D → V.** `D` is the **strafe-right** movement key (WASD). Dev Scan now toggles
  on **`V`** (consumed so it never reaches flight/focus). `G` still focuses the nearest gateway
  (`Shift+G`/`Alt+G` cycle). Dev Scan stays off by default and does nothing in normal play; its
  left-HUD hint reads `V DEV SCAN · G NEAREST GATEWAY`.

- **Panel style consistency.** All major surfaces share the AR language (translucent dark
  gradient + blur, subtle glow, scanline, corner brackets/ticks, high-letter-spacing mono titles,
  no bulky cards, no arcade colour). The mission/complete overlay (`.mx__box`) was aligned to the
  panel surface (gradient bg + blur + thin `--wg-line` border + soft glow) instead of a flat box.

- **Readability.** Global label tones lifted: `--wg-faint` `0.5 → 0.64`, `--wg-dim` `0.74 → 0.86`.
  Left-HUD stats `11px` + soft text-shadow; inspection secondary text (hint / yield / resource
  actions / gateway blocks) enlarged to ~10–11px with tighter tracking; upgrade cost/effect
  brightened to `--wg-dim` 10px. Hierarchy preserved (headers/values bright, secondary dimmer,
  disabled clearly dim).

- **Lint clean (0 problems).** `NodePanelHost` rewritten to React's "adjust state during render"
  pattern with a **derived `closing`** flag (no ref-write-in-render, no synchronous setState in an
  effect — the only setState is in the close timer callback). `FlyCamera`'s subnetwork-dive effect
  deps suppressed (stable `nodeWorld` reader). `landing/Reveal.tsx` uses a lazy `useState`
  initializer for the no-IntersectionObserver fallback.

- **Save / checkpoint / reset — verified, not rewritten.** Confirmed: refresh restores
  mission/depth/resources/upgrades/node statuses (`loadSave` merges over `initGame`); `R` = reset
  view only; `Shift+R` = full reset (`RESET` → `initGame`, `clearCheckpoint`, save overwritten
  fresh); trace-locked `R` = retry from the latest checkpoint (never Mission 01); `Shift+R` while
  locked = full reset. Upgrade levels, resource spending and node statuses all persist.

- **Control hints (canonical):** `ESC` = free scan / close panel · `R` = reset view · `Shift+R` =
  reset session · `U` = upgrades · `V` = dev scan · `G` = nearest gateway. While the Upgrade panel
  is open, `U` / `Esc` close it; while a node is selected, `Esc` deselects (closes the panels).

**Status after this pass:** build passes (`tsc -b && vite build`), `pnpm lint` reports 0 problems,
Missions 01–03 and all existing systems unchanged. Ready for the next major system.

---

## 24. Player Subnetwork v1 (private home grid)

The first **base-building** layer — the first step toward an open-ended strategy/mining game
rather than only a mission chain. A private "home grid" the player grows with modules paid for
from existing resources. **Not a mission**, never required; a second progression layer alongside
upgrades. No multiplayer / token / alliance / economy logic (deferred).

- **State** (`game.ts`, `GameState.playerSubnetwork: PlayerSubnetwork`): `unlocked`, `level`
  (`1 + installed module count`), `integrity` (0–100, static 100 in v1), `storageCapacity`
  (`STORAGE_BASE 500` + DATA VAULT bonus), `modules` (`Record<ModuleId, 0–3>`),
  `lastVisitedDepth`, `homeNodeId`. Initial: locked, level 1, integrity 100, empty modules.
- **Unlock**: latched in the `gameReducer` wrapper once **Mission 03 is complete**
  (`missionId ≥ 3 && missionComplete`). One-time (persists). Because the check runs every
  action/TICK, a **loaded save that already finished Mission 03 auto-unlocks** on its first tick.
  On the unlock transition `GameApp` shows a one-time toast: **PLAYER SUBNETWORK UNLOCKED /
  PRIVATE GRID ACCESS GRANTED** (`.subnet-toast`, auto-dismiss).
- **HOME node** (`HOME_NODE_INDEX`): the interactive node nearest the cloud centre (deterministic
  from `WORLD_SEED`); set as `homeNodeId` on unlock. Rendered by `PlayerSubnetwork.tsx` (inside
  the rotating grid group): a brighter structured wireframe frame (slow self-rotation + gentle
  breath) + a faint cube shell + an inner marker — NEVA monochrome, no colour icon. **Dev Scan
  labels it `HOME`** (`DevScanOverlay`). Selecting the HOME node opens the subnetwork panel
  (the inspection panel is suppressed for it via `NodePanelHost.suppressNode`).
- **Panel** (`PlayerSubnetworkPanel.tsx`): reuses the Upgrade panel's `.up` chrome + staged
  open/close animation (`.up--subnet` trims the size). Title **NEVA // PLAYER SUBNETWORK** /
  **PRIVATE GRID CONTROL**. Sections: grid status strip (LEVEL / INTEGRITY / STORAGE / MODULES),
  resource strip (DATA/MEM/KEYS/SIGNAL/CORE), and a 4-card module grid (install / upgrade / MAX).
  Opened with **B** (only once unlocked) or by selecting the HOME node; **B / Esc** close it; it
  owns the keyboard while open (`uiCapture`) and closes the Upgrade panel (one modal at a time).
  HUD shows **PRIVATE GRID: ONLINE** + a **`B SUBNETWORK`** hint once unlocked.
- **Modules** (`MODULE_DEFS`, levels 0–3, `INSTALL_MODULE` reducer action). Costs spend **DATA**
  (`= extractedData`) + resources via `canAffordModule`; messages `MODULE INSTALLED` /
  `MODULE UPGRADED · <NAME> LV n` / `INSUFFICIENT RESOURCES` / `MODULE AT MAX`. Install costs:
  - **DATA VAULT** (`VAULT`): `100 DATA · 5 MEM` → storage `+250/lvl` (display/strategy; raises
    `storageCapacity`).
  - **TRACE SHIELD** (`SHIELD`): `80 DATA · 4 SIGNAL` → action trace `−4%/lvl` (added to
    TRACE_DAMPENER in `withTrace`; combined reduction capped at 60%).
  - **KEY CACHE** (`CACHE`): `120 DATA · 1 KEY · 4 MEM` → key-drop `+6%/lvl` (added to `keyChance`
    on ARCHIVE/LOCKED exports).
  - **SIGNAL RELAY** (`RELAY`): `100 DATA · 5 SIGNAL · 3 MEM` → pulse `−4%/lvl` (in `pulseMul`)
    + wider corrupted-link repair at lvl ≥ 2 (`wideStab`).
  Effects are deliberately small and **layer on top of** upgrades (never replace them).
- **In-world visual**: each INSTALLED module is a small square-frame node on a ring around HOME,
  joined by a thin line, with a marker label (`VAULT/SHIELD/CACHE/RELAY`, `.psn-mod`) — the player
  watches their private grid grow.
- **Save**: persists in `neva:save:v1` (deep-merged over `initGame` in `loadSave`, so pre-subnetwork
  saves load with defaults). **R soft reset + checkpoint retry keep it; Shift+R full reset clears
  it** (`RESET` → `initGame`).
- **Future direction**: HOME integrity as a live stat (trace lock / attacks damage it; repair with
  resources); storage actually capping resources; more module tiers + a module tree; defensive
  modules; player-authored subnetwork layout; then — much later, explicitly deferred — mining
  expansions, economy/token, multiplayer, and alliances.

**Status after Player Subnetwork v1:** build passes, `pnpm lint` reports 0 problems, Missions
01–03 and all existing systems unchanged. First base-building layer is in.

---

## 25. Player Subnetwork — usefulness & feedback pass

Makes the modules **felt, visible, and understood** (the grid was working but invisible). No
mission / resource / upgrade / save / core-gameplay changes — only subnetwork usefulness + feedback.

- **DATA VAULT now has a live effect.** It adds **+8% DATA per level** on every EXPORT
  (`vaultDataBonus`, on top of the base yield) — so the module is felt each export — and still
  raises `storageCapacity`. Effect text: `DATA EXPORT +N% · STORAGE +N`.
- **Module feedback messages** (so the player sees the grid help):
  - EXPORT: `DATA EXTRACTED +N … · VAULT +X` when DATA VAULT contributes, `· KEY CACHE` when a key drops with KEY CACHE installed.
  - TRACE (stabilize): `CORRUPTED LINK STABILIZED · SIGNAL RELAY ASSIST` when SIGNAL RELAY is installed.
  - USE_KEY: `ACCESS KEY USED · KEY CACHE · ROUTE SECURED` when KEY CACHE is installed.
  - TRACE SHIELD: the HUD trace-change readout appends **`· SHIELD`** whenever the module
    softened a trace gain — driven by a new transient `GameState.traceShielded` flag set in
    `withTrace` (defaults false; merges cleanly into old saves; never needs persisting).
- **Panel module cards** now show, per module: **STATUS ACTIVE/INACTIVE** (muted-green when
  active), `LV n/3 · PURPOSE`, **CURRENT:** effect at the installed level, and **NEXT:** effect
  at the next level (or INSTALL: for level 0). Cost + INSTALL/UPGRADE/MAX button unchanged.
- **HUD active-modules readout** (left stats, once unlocked): `PRIVATE GRID: ONLINE` (ice tone) ·
  `MODULES: n ACTIVE` · one compact line per active module (`▹ TRACE SHIELD −4%`,
  `▹ SIGNAL RELAY −4%`, `▹ DATA VAULT +8%`, `▹ KEY CACHE +6%`) + the `B SUBNETWORK` hint.
- **Objective hint** (after unlock): `INSTALL FIRST MODULE · PRESS B` while no module is installed,
  then `PRIVATE GRID ONLINE · MODULE EFFECTS ACTIVE`. Folded into the `missionComplete` branch so
  it only changes the post-Mission-03 objective (mission 1/2 completion text unchanged).
- **HOME node visual**: each installed module node now **breathes subtly** (out-of-phase opacity
  pulse) so it reads as active — monochrome, no neon. (Module nodes + connector lines as in v1.)
- **Save**: module levels / active states persist (already covered by the v1 merge); the new
  `traceShielded` flag is transient feedback, not gameplay. R keeps, Shift+R clears (unchanged).

**Status after this pass:** build passes, `pnpm lint` reports 0 problems, Missions 01–03 and all
existing systems unchanged. The private grid now reads as useful, not decorative.

---

## 26. Prototype v1 — threat tier + completion summary (fast sprint, partial)

- **Threat tier** (`threatState(trace)`): STABLE < 30 → WATCHED < 60 → TRACED < 85 → CRITICAL.
  Pure derive of `traceLevel` (no new state). Shown as a HUD `THREAT` row under the trace bar,
  toned green/amber/red. A plain-language reading of the existing trace meter.
- **Prototype v1 complete**: the final mission (03) completion overlay now shows
  **NEVA NETWORK / PROTOTYPE v1 COMPLETE** + a summary (DATA extracted · nodes secured · modules
  n/4 · LV total · final threat). CONTINUE NETWORK still works — play is never forced to stop.
- **Already satisfied by earlier passes** (so not re-done here): objective hints + guidance,
  module visibility/effects/feedback (§24–§25), upgrade economy, save/load, action feedback msgs.
### 26.1 Mission chain → 7 + node taxonomy + CORE node (now done)

Done as two safe, additive passes (the previously-deferred work), keeping Missions 01–03 intact:

- **7-mission chain.** Added Missions 04–07 as a CONTINUATION after the existing SIGNAL WAR (M03),
  which already unlocks the subnetwork on completion — so M04 can use it. `missionTasksDone` now
  branches per id (3 is `=== 3`; 4–7 added), `MISSION_ADVANCE`/`continueNetwork` cap → 7,
  `missionMeta` + objective + task-checklist entries added for 4–7:
  - **M04 // PRIVATE GRID** — open the subnetwork (B) + install your first module (`installed ≥ 1`).
  - **M05 // SECURE ROUTES** — `riskIsolated ≥ 2 && traced ≥ 4`.
  - **M06 // DEEP EXTRACTION** — `extracted ≥ 250` (per-mission).
  - **M07 // CORE BREACH** — reach Depth 03 + SECURE the CORE node (extract/trace/unlock/isolate;
    TRACE works on any node type → always completable). Final mission → Prototype v1 summary.
  Backward-compatible: a save mid-chain resolves via the same per-mission checks; the subnetwork
  unlock still fires at M03 complete. **Old-save fix:** `loadSave` clears a stale `continued` flag
  when `missionComplete && missionId < 7`, so a save that finished the old 3-mission game re-shows
  the CONTINUE overlay and can advance into M04–M07 (otherwise it would be stuck post-M03).
- **CORE node.** `CORE_NODE_INDEX` = the interactive node FARTHEST from the cloud centre (deep
  frontier; distinct from HOME = nearest). Dev Scan (V) tags it **CORE**; M07 objective points to it.
- **Node taxonomy (CLASS).** `nodeCategory(index,type)` surfaces a player-facing CLASS over the
  existing deterministic types — **no regeneration**: HOME / CORE (designated), DATA (MEMORY/MESSAGE),
  KEY (IDENTITY), VAULT (ARCHIVE), FIREWALL (LOCKED), CORRUPTED (DECOY), WATCHER (CAMERA), GATEWAY.
  Shown as a `CLASS` row in the inspection panel. (RELAY is a *module*, not a node, in this design.)
- **Threat tier + Prototype v1 summary** (from §26) now key off the new final mission (07).

### 26.2 Stage gap-closing (3 / 4 / 6 / 8)

Completed the remaining sprint stages (no balance change, no frustration mechanics):
- **Stage 3 (threat/risk):** added `corruptionRisk(s)` (% of corrupted links still unstabilized,
  Signal-War onward) → HUD **CORRUPTION** readout; a transient **RISK RISING / RISK CRITICAL** flash
  on threat-tier increase (alongside the existing THREAT tier + `· SHIELD` feedback). No reward
  penalty / no hard action-block (kept it non-punishing) — high trace already risks the lock.
- **Stage 4 (node purpose):** `CATEGORY_PURPOSE` per CLASS, shown in the NodeInfo panel; CLASS row
  added to both panels.
- **Stage 6 (clarity):** **CORE NODE SECURED** milestone flash; a subtle **AUTOSAVE** indicator;
  the HUD stats/mission panels type in word-by-word.
- **Stage 8 (light polish):** installed-module **ACTIVE** badge breathes; CORE/RISK flashes toned
  for contrast; module nodes + home pulse (from §24). No redesign.

## 27. Mission 00 — First Signal (guided onboarding intro)

A guided tutorial layered **before** Mission 01 (no renumbering — `missionId` stays `1`; M00 is a
gated *phase*). Reveals a deterministic **9-node path one-by-one** before the full network opens.
Each step is bound to a **real node of the named type**, taught with that type's **correct action**
— so the guide can never mislabel a node. The reducer runs the **normal action** and advances when
the right action lands, so the player learns true mechanics (not a scripted fake). Decision:
intro-phase over renumbering/separate scene to minimise risk to the 1–7 chain and saves.

- **State** (`game.ts`): `networkRevealed` + `mission00 { complete, step }`. `initGame` → intro
  active (`complete:false, step:0, networkRevealed:false`).
- **Curriculum** (`TUTORIAL_STEPS`, each `{ want type, action, copy }`): 1 FIRST SIGNAL (MEMORY ·
  INSPECT) → 2 DATA (MEMORY · EXPORT) → 3 KEY (IDENTITY · EXPORT, yields a key) → 4 ARCHIVE (·
  TRACE the route) → 5 FIREWALL (LOCKED · USE KEY) → 6 WATCHER (CAMERA · ISOLATE) → 7 DECOY (·
  ISOLATE, never export) → 8 GATEWAY (· OPEN STREAM) → 9 CORE (· sync → reveal). `TUTORIAL_NODES`
  picks one real node per `want` type (greedy nearest path from centre; CORE = `CORE_NODE_INDEX`),
  fully deterministic. No fake roles — the inspection panel's TYPE/CLASS now matches the guide.
- **Advance:** `advanceMission00(prev, next, action)` runs after the real reducer; if the action is
  the step's correct one on its node AND took effect (extracted / traced / unlocked / isolated /
  stream-opened / inspected) it bumps `step` (final beat → `complete` + `networkRevealed`). `ENTER_SUB`
  is blocked during the intro so the gateway beat can't descend and break the reveal gate.
- **Reveal gate:** `InteractiveNodes` hides all but `TUTORIAL_NODES[0..step]` (scale 0 → also
  unclickable); `handleSelect`/`handleHover` gate selection to the revealed set; `TutorialPath`
  draws a light path in place of the full edge mesh until revealed.
- **UI:** `Mission00Intro` (lower-left flexible card — title, objective, 1–2 line explanation,
  feedback, progress dots, one guided action button + Enter; responsive width/position).
  `NodeInfoPanel` shows the step explanation for the selected intro node. HUD simplified during the
  intro (THREAT row + mission/tasks panel hidden). Completion → reveal + an "ENTER THE NETWORK"
  hand-off → `MISSION_START` (M01).
- **Save:** a pre-intro save (no `mission00` field) → forced `complete + revealed` (existing players
  never re-run onboarding); a save made mid-intro resumes at its step. Fresh save → step 0.

---

## 28. NEVA Core Assistant v1 (AI Integration — advisory only)

An in-game guide/narrator that explains the current mission, the selected node, risk, resources,
upgrades, and the next action. **Advisory only — it never changes missions, save, resources,
rewards, completion, victory, or failure. The game stays deterministic.**

- **Backend-only OpenAI.** `server/neva-ai.mjs` calls the OpenAI **Responses API** via plain `fetch`
  (no SDK dependency). Route: **`POST /api/ai/neva-core`** (`server/index.mjs`, light per-IP rate
  limit + 8 KB body cap + ~9 s timeout). Key + model from env: **`OPENAI_API_KEY`**,
  **`OPENAI_MODEL`** (default `gpt-4o-mini`), `OPENAI_TIMEOUT_MS`. **The key is server-side only —
  never a `VITE_` var, never in the bundle, never logged.**
- **Offline-safe.** No key / error / timeout → a **deterministic fallback hint** (per mode + node
  type) so gameplay never blocks. Response is short (3–5 lines, ≤ ~80 words).
- **Help modes:** `MISSION_HINT` · `NODE_EXPLAIN` · `RISK_WARNING` · `RESOURCE_HELP` ·
  `UPGRADE_HELP` · `LORE_LINE` · `LOZA_EASTER_EGG` (dormant hook — returns
  `"LOZA ASSIST NODE // dormant signal detected."`, no full feature).
- **Frontend:** `src/nevaCore.ts` builds a **compact, safe** context (mission/objective/selected
  node/trace/depth/resources/upgrades/modules/recent action — **never** the save file, email, or
  waitlist data) and posts it. `src/components/NevaCorePanel.tsx` shows the hint in a compact
  monochrome AR panel; opened with **N** (post-tutorial launcher button), with a `THINKING` state
  and an `OFFLINE` badge. It never dispatches a game action.
- **Safety rails (in the system prompt):** no financial/profit/earnings claims; token/coin/presale
  is "a future utility concept, locked until later roadmap + legal + Sharia review, nothing for
  sale"; no legal/religious/Sharia rulings; no invented mechanics. Cost-aware + short output.

---

## 29. Playtest Notes — local QA logger (developer tool)

A lightweight, **local-only** QA logger for the **Mission 00 → Mission 20 manual playthrough**.
Its purpose is to capture friction points *in-game* (with the live context auto-attached) so the
v1.1 Playtest Patch can be authored from real notes — **before** building any new systems. It is a
developer/testing overlay only.

- **Toggle:** **P** opens/closes the compact **NEVA // PLAYTEST NOTES** panel (docked top-right).
  Non-modal — it never captures the keyboard or blocks gameplay (focus inside the panel just lets
  the panel own that keystroke; everything else keeps flying/playing). Hint lives in the dev/help
  area only (NEVA Terminal `help` → `KEYS  P  playtest notes`), not in normal gameplay HUD.
- **Auto-captured context** (read-only snapshot at note time): mission id + name, current objective,
  depth, sector (A01/A02), trace %, selected node id + type (if any), resources summary, and the
  current checkpoint label.
- **Quick buttons** (one click → timestamped note + context): `OBJECTIVE UNCLEAR`,
  `NODE HARD TO FIND`, `TRACE TOO HIGH`, `UI CLUTTER`, `SAVE ISSUE`, `BUG`, `GOOD MOMENT`. Plus a
  manual add: category dropdown (11 categories) + "Write quick note…" text + **ADD NOTE**.
- **Storage:** notes persist in localStorage under its **own** key **`neva_playtest_notes_v1`**
  (completely separate from the game autosave / checkpoint — `neva:save:v1` / `neva:checkpoint:v1`).
  Each note = `{ id, createdAt, missionId, missionName, objective, depth, sector, trace,
  selectedNodeId, selectedNodeType, checkpoint, resources, category, message }`.
- **Export:** **EXPORT NOTES** downloads **`neva-playtest-notes.json`** (the full notes array,
  pretty-printed). **COPY SUMMARY** copies a plain-text digest to the clipboard. **CLEAR NOTES**
  wipes the list after a `CLEAR ALL PLAYTEST NOTES?` confirm. **No backend** — nothing is sent to
  the server or waitlist.
- **No gameplay impact (hard rule):** this tool never touches missions, trace, resources, node
  state, progression, save/checkpoint, the backend, or the waitlist. Pure read-only QA overlay.
- **Files:** `src/playtest.ts` (note type / categories / localStorage / context capture / export +
  copy helpers) · `src/components/PlaytestNotesPanel.tsx` (the docked panel) · wired in
  `src/GameApp.tsx` (P toggle, add/clear handlers, panel mount); styles `.pt*` in `src/styles.css`.

---

## 30. Player Profile & Account Layer (Phase 7 — local-first identity)

A **local-first operator identity** layer that prepares the game for future accounts / early access
**without requiring login yet**. It summarizes who the operator is and how far they've come, and is
**identity/advisory only** — it never touches gameplay.

### What it is (and is NOT)
- **Local-first.** No remote save, no authentication, no email linking, no wallet linking. Local
  save stays the source of truth. The profile is a **separate localStorage slot**, not part of the
  game save — so a session reset never wipes the identity (see "Save behaviour").
- **Identity-only (hard rule):** the profile NEVER dispatches a game action and NEVER changes
  missions, resources, trace, node state, rewards, completion, the save/checkpoint, the backend, or
  the waitlist. (Same posture as NEVA Core / Playtest Notes.)
- **NOT implemented this pass (intentionally):** real login, remote accounts, remote save, email /
  account / invite-code linking, wallet/token linking. The panel shows these as **PLANNED**;
  `accountStatus` stays `LOCAL_ONLY` and `futureAccountLink` stays `null`.

### Data model (`src/profile.ts`, `neva:profile:v1` + `.bak`, versioned w/ migration seam)
- **Identity:** `callsign`, `profileCreatedAt`, `lastUpdatedAt`, `accountStatus: 'LOCAL_ONLY'`,
  `futureAccountLink: null`, `achievements: string[]`.
- **Progression high-water marks (monotonic — only ever rise):** `highestMissionReached`,
  `missionsCompleted`, `mission00Completed`, `highestDepthReached`, `totalDataExtracted`,
  `totalNodesInspected`, `totalNodesExported`, `totalLinksTraced`, `totalNodesIsolated`,
  `coreFragments`, `modulesInstalled`, `modulesUpgraded`, `upgradesInstalled`. Plus a lifetime
  event counter `totalTraceLocks`. These are **derived from the live `GameState`** and folded in by
  the pure `syncProfile` — never duplicated into the reducer. For a single continuous run the marks
  equal the running totals; across resets they keep your best (the "account" never regresses).

### Callsign setup
- First run with no profile → small **CREATE CALLSIGN** prompt (`CallsignPrompt`): 3–18 chars,
  `[A-Za-z0-9_-]`, trimmed; **no email, no backend call, saved locally only**. Skipping generates a
  default `OPERATOR-XXXX`. NEVA-style, not a big onboarding blocker.

### Player level & network score (derived, deterministic)
- `networkScore = missionsCompleted*100 + highestDepthReached*50 + floor(totalDataExtracted/10) +
  upgradesInstalled*25 + modulesInstalled*30 + coreFragments*100`.
- `playerLevel = 1 + floor(networkScore / 500)` (Level 1 start; every 500 score = +1 level).

### Achievements v1 (local, unlock-once, accumulate)
FIRST SIGNAL (M00) · SURFACE BREACH (M01) · SIGNAL SURVIVOR (M03) · PRIVATE GRID ONLINE (grid
unlock) · CORE BREACH (M07) · ALPHA CORE ONLINE (M20) · CLEAN OPERATOR (complete a mission below
50% trace) · KEY HOLDER (hold 3 access keys) · MODULE BUILDER (install first module) · UPGRADED
(buy first upgrade). Persist locally; never removed; not social/shared.

### Profile panel (`ProfilePanel`, open with **L** / the `◇ PROFILE` launcher)
Title **NEVA // PLAYER PROFILE**, subtitle **LOCAL OPERATOR IDENTITY**. Sections: callsign · player
level (+ progress bar) · network score · mission progress (`X / 20` complete, CURRENT M·name,
HIGHEST M·name, M00–M20 status strip) · highest depth · resources (live run snapshot) · private grid
(status / modules / upgrades / lifetime activity) · achievements grid · **account status**
(`LOCAL SAVE ONLY` · `REMOTE ACCOUNT: PLANNED`) + a **FUTURE ACCOUNT LINK** block (Not connected ·
Remote save: Planned · Early access account: Planned). NEVA holographic style (translucent dark, thin
lines, one muted ice accent, compact mono rows; no avatars, no colourful card look). The only action
is **RESET PROFILE** (confirmed) → clears the local identity ONLY (gameplay save untouched) and
re-shows the callsign prompt.

### Save behaviour (why a separate slot matters)
- **R (soft reset)** keeps the profile (it never touches game state). **Shift+R (full session
  reset)** resets gameplay (`RESET` → `initGame()`) but **keeps the callsign/profile identity**, and
  the high-water marks never regress. **Checkpoint retry** (`LOAD_CHECKPOINT`) never rolls the
  profile back. Because the profile is its own slot, none of these can delete it — only the in-panel
  **RESET PROFILE** clears it.
- The pure reducer and the game save schema are **untouched** (no determinism / migration impact;
  StrictMode-safe). `syncProfile` returns the same object when nothing changed, so idle ticks never
  write.

### Future (Phase 8+)
Profiles can later be connected to **invite codes / remote accounts / early-access** at the
backend/account phase — the `accountStatus` / `futureAccountLink` placeholders are the seam. Token /
presale / wallet stay blocked behind the roadmap + legal + Sharia gates.

### Files
`src/profile.ts` (schema, load/write/clear, callsign helpers, `syncProfile`, score/level,
achievements) · `src/components/ProfilePanel.tsx` · `src/components/CallsignPrompt.tsx` ·
`src/components/profile.css` (`.pf*` / `.cs*` / `.pf-launch`) · wired in `src/GameApp.tsx`
(profile state, sync effect, L toggle, panel/prompt mount, RESET PROFILE handler).

---

## 31. Phase 8 — Backend Foundation (early access; no accounts/payments)

A safe **early-access backend layer** on top of the existing Phase-7 waitlist. Still the
**zero-dependency Node** server (stdlib only, `pnpm server`), still JSON files under `data/`.
**No accounts, login, sessions, passwords, email sending, database, or Web3/wallet/token/presale/
payment** — those are explicitly out of scope (the "what's missing" list below is the seam). Full
run/endpoint reference lives in **`server/README.md`**.

### Invite code system (`server/waitlist-store.mjs`)
Invite codes extend the existing waitlist entry (its `status`/`invited`/`inviteCode` fields). Helpers:
`generateInviteCode()`, `assignInviteCodeToEntry({email|entryId})` (idempotent, marks `invited`),
`getInviteByCode(code)` (email-free status), `redeemInviteCode(code, {callsign, profileId})`
(redeem **once**), `listInviteStats()` (aggregate). Codes are readable **`NEVA-XXXX-XXXX`** from an
unambiguous charset (no `I L O U 0 1`), unique, stored in `waitlist.json`, one code ↔ one entry.
Redemption records `redeemed` / `redeemedAt` / `redeemedByCallsign` / `accessStatus:"early_access"`.

### Endpoints (`server/index.mjs`)
- `POST /api/invite/generate` — **admin-gated**; `{email|entryId}` → `{ ok, entryId, inviteCode }`.
- `POST /api/invite/redeem` — `{ inviteCode, callsign? }` → `{ ok, accessStatus, message,
  profileAccess:{earlyAccess:true} }`; reused code → `409 ALREADY_REDEEMED`, bad code → `INVALID`.
- `GET  /api/invite/status?code=…` — `{ ok, valid, redeemed, accessStatus }` (no private data).
- `POST /api/feedback` — category allow-list (`bug/balance/ui/mission/performance/idea/other`),
  capped message + optional `callsign`/`missionId`/`trace`/`depth`/`source` → `{ ok, feedbackId }`
  (`server/feedback-store.mjs` → `data/feedback.json`).
- `POST /api/analytics/event` — allow-listed `eventName` (`game_started`, `mission_started`,
  `mission_completed`, `trace_locked`, `invite_redeemed`, `profile_created`,
  `landing_waitlist_joined`, `ai_hint_used`), sanitized + capped `metadata` (**emails stripped**) →
  `{ ok }` (`server/analytics-store.mjs` → `data/analytics.json`).
- `GET  /api/admin/summary` — **admin-gated**; aggregate counts only (waitlist total + byRole,
  invites withCode/invited/redeemed, feedback total + byCategory, analytics total + byEventName,
  latest timestamps). **Never returns emails or raw entries.** Secret unset → `503` setup message.

### Admin secret + guards
`NEVA_ADMIN_SECRET` (server-side only, never `VITE_`). When **unset**: admin summary → `503`;
invite-generate allowed **only from localhost** (dev convenience). When set: required via
`x-neva-admin-secret` header / `?secret=` / body `adminSecret`, compared in constant time. Per-IP
rate limits per channel + 8 KB body cap (16 KB feedback). Data files git-ignored
(`data/waitlist.json` · `data/feedback.json` · `data/analytics.json` + `*.backup.json` / `*.bak` /
`*.json.tmp`). Shared file-store helper: `server/json-store.mjs`.

### Frontend (early access — landing only, local-only)
The landing `#waitlist` section gains an **invite-code redemption** block: code input + **REDEEM
ACCESS** → `POST /api/invite/redeem`; success shows **EARLY ACCESS UNLOCKED** and stores a
local-only flag (`src/earlyAccess.ts`, key `neva:earlyaccess:v1`), failure shows **INVALID OR USED
CODE**. **It does NOT gate the game** (the alpha is open) and is deliberately **separate from the
Player Profile** (the profile guardrail forbids invite-code linking) and from the game save.

### Scripts
`pnpm feedback:summary` · `pnpm analytics:summary` · `pnpm backend:check` (load all stores + report
config) — alongside the existing `pnpm waitlist:count`. Aggregate-only output (no emails/messages).

### Status: **Phase 8 Foundation — Partial Complete.** Built: invite codes, redemption, early-access
gating (local), feedback capture, analytics capture, protected admin summary, safer stats.
**Still missing (by design):** real accounts · login/sessions · passwords · email sending/
verification · remote save · a database · auth on broader surfaces · token/presale/Web3/payments.

---

## 32. Visual Upgrade Pass v1 (rendering only — no gameplay change)

A premium/depth/readability pass on the 3D network. **Rendering/material/shader only** — no
gameplay, missions, resources, trace, save, or progression touched; node **state colour language
is unchanged** (active/selected/extracted/isolated/decoy/locked/gateway/core/home stay readable).

- **Network depth** — interactive nodes + background dust + links now fade by distance (near sharp →
  far melts into the void) via `patchNodeDepthFade` / tighter `createFadeLineMaterial` far ranges, so
  the field reads as a deep 3D volume, not a flat star map. Far clutter reduced (dimmer far dust,
  tighter link far-fade); far nodes stay present for scale.
- **Node material quality** — each interactive node is now a **soft translucent core cube** inside a
  **crisp additive hollow-edge frame** (one extra merged `LineSegments`, one draw call) with a very
  subtle global glow breath — replacing the old solid/overexposed boxes. Raycasting is unchanged
  (separate hit-proxy mesh). `InteractiveNodes.tsx` + `fadeMaterials.ts`.
- **State visual language refined** (recognizable, not redesigned): EXTRACTED is now **dim ice-blue**
  (processed/spent) instead of green — matching the documented convention; CORE carries a **premium
  teal-ice glow** (controlled); GATEWAY a dim cool "route" tint; HOME (once unlocked) a structured
  cool tint; LOCKED a dim/blocked cool look; tripped DECOY muted red. State (extracted/isolated/
  locked) still takes precedence over identity tint. `InteractiveNodes.tsx` + `SelectedNodeFocus.tsx`.
- **Bloom/glow** — slightly higher luminance threshold + softer smoothing + tighter radius so only
  bright edges/cores/selection bloom (crisp, not a blown-out white blob). Monochrome + teal-ice
  identity preserved. `InteractiveNetworkExplorer.tsx`.

Files: `fadeMaterials.ts`, `components/InteractiveNodes.tsx`, `components/NodeConnections.tsx`,
`components/InstancedBackgroundNodes.tsx`, `components/InteractiveNetworkExplorer.tsx`. Build/lint/
typecheck pass; gameplay unchanged.

---

## 33. Visual Upgrade Pass v2 — cinematic action feedback (visual only)

Clear, premium FX for **existing** actions. **No reducer/gameplay/save change** — effects are
*derived* from game-state transitions and are transient + local (never stored in the save).

- **Derivation** (`actionFx.ts`): from a (prev → next) `GameState` diff — using the reducer's existing
  `msgId` / `msgNode` / `message.kind` + status/depth — classify the resolved action into an FX event
  (`export · trace · isolate · openStream · enterSubnetwork · coreSecure · fail`). Success effects only
  fire on `kind === 'ok'`; failed actions (`fail`) get a small glitch flicker; a tripped DECOY reads as
  a glitch, not an export. CORE/Alpha-Core/sector rising edges → premium `coreSecure`.
- **Detection + lifecycle** (`GameApp.tsx`): a `useEffect` on `game` pushes derived events into local
  `fxEvents` state (capped at 8), auto-pruned by per-event timers; `enterSubnetwork` also flashes a
  brief screen "depth dive" warp (`.fx-dive`).
- **3D layer** (`components/ActionEffects.tsx`): a few small additive **thin-line** primitives —
  expanding/contracting cube frames (scan/containment), an upward dashed data **streak** (export),
  a **core flash**, gateway **route convergence**, and a deterministic **glitch** — animated by
  normalized age and removed on expiry. Shared module-level geometries; only a handful exist at once
  (user-paced). Rendered inside the rotating network group; raycasting untouched.
- **Per-action feel:** EXPORT = data pulled out (frame pop + flash + rising streak, node → ice-blue);
  TRACE = route-scan ripple; ISOLATE = containment cage that closes in; OPEN STREAM = scan rings
  (plus the existing leader line); ENTER SUBNETWORK = route convergence + dive flash + the existing
  DEPTH 0N ACCESSED / SUBNETWORK LINK overlay; CORE = controlled premium teal-ice pulse (with the
  existing `core-sweep`). NEVA palette only (white / ice-blue / slate / muted red) — no colour, no
  arcade. Lightweight (no textures/assets/heavy shaders); FPS stable.

Files: `actionFx.ts`, `components/ActionEffects.tsx`, `components/InteractiveNetworkExplorer.tsx`,
`GameApp.tsx`, `styles.css` (`.fx-dive`). Build/lint/typecheck pass; gameplay/save unchanged.

---

## 34. Visual Upgrade Pass v3 — link route identity + centralized material seed (visual only)

Gives the **links** stronger identity to match the v1/v2 node work. **Rendering only** — no reducer,
gameplay, missions, resources, trace, save, picking, or progression touched. Builds on (does not
replace) the existing link rendering: normal links (`NodeConnections`), the dashed/flicker corrupted
overlay (`CorruptedLinks`), and the selected-node's travelling trace links (`SelectedNodeFocus`) all
stay as they are.

- **Objective route links** (`components/ObjectiveRouteLinks.tsx`) — the gap that remained: the edges
  *leading to* the current mission objective node used to render as plain gray. Now the (≤3) edges
  from the objective node to its neighbours render as a **flowing "living route" travelling toward the
  node**, tinted by the objective's visual kind: teal-ice for **gateway/data/core** routes, a slower
  **striped/blocked** pattern for **firewall** routes, an unstable muted-red flow for **corruption**,
  and a calm flow for **relay**. Mounted beside `ObjectiveMarker` in the rotating network group and
  driven by the SAME gated `objectiveNode` prop — so it shows only when the objective is **not** the
  selected node (never fights `SelectedNodeFocus`'s own trace links) and only post-tutorial.
  Distance-faded + additive (bloom-friendly, kept below pure white). Cheap: one node's edges → one
  draw call, one `uTime` uniform write/frame.
- **Centralized material seed** (`src/visual/nevaMaterials.ts`) — owns the route-link palette
  (`ROUTE_KINDS` per `ObjectiveVisualKind`) + `createRouteLinkMaterial` (the flowing/striped/jitter
  shader) + the shared link distance-fade window. The shared home for further link/material
  centralization. (Node / selected / marker palettes already live centralized with their own
  components — `InteractiveNodes.colorOf`, `SelectedNodeFocus`, `ObjectiveMarker.KINDS`,
  `fadeMaterials` — and are intentionally left as-is.)

Files: `src/visual/nevaMaterials.ts` (new), `components/ObjectiveRouteLinks.tsx` (new),
`components/InteractiveNetworkExplorer.tsx` (mount). Build/lint/typecheck pass; gameplay/save/picking
unchanged.

---

## 35. Visual Upgrade Pass v3.1 — VISUAL MODE toggle (CLASSIC ↔ ENHANCED), wired & visible

A **deliberately visible** rendering pass (not subtle polish): a proper CLASSIC/ENHANCED toggle that
wires the centralized material presets into the **real active render path**. Press **K** to flip
between a flat baseline (CLASSIC) and the premium look (ENHANCED, default) — the before/after is
obvious. Pure visual — no gameplay, missions, resources, trace, save, picking, or progression changes.

- **Single source of truth** (`src/visual/nevaMaterials.ts` → `VISUAL_PRESETS` + `getPreset(enhanced)`):
  one preset object per mode holds node core/edge opacity, brightness, glow-breath, link base
  opacity + far-fade, traced-link boost, selected-frame opacities + pulse, and **Bloom**
  intensity/threshold. The real components read from it — no scattered magic numbers.
- **Wired into the active components** (the previous pass existed but read as "no change" because the
  difference was small — this makes it a real, mode-gated jump):
  - **Interactive nodes** — `components/InteractiveNodes.tsx`: core/edge opacity, per-node brightness,
    and glow-breath now come from the preset (`enhanced` prop). ENHANCED adds **structural shells**
    (shape cues, not just colour): a **layered double-frame shell on the CORE** and a **larger
    structured frame on the HOME** node (cheap static additive line frames; the network's rotation
    animates them). CLASSIC = dim flat cores, faint frame, no breath, no shells.
  - **Selected / focused node** — `components/SelectedNodeFocus.tsx`: fill/edge/bracket opacities +
    success-pulse + traced-link boost scale from the preset. ENHANCED = crisp, brighter, premium
    focus frame; CLASSIC = simpler. Picking unchanged (hit-proxy mesh).
  - **Normal links** — `components/NodeConnections.tsx`: resting opacity from the preset (ENHANCED
    calmer/quieter so the glow + route flow carry the look — less spiderweb).
  - **Bloom** — `components/InteractiveNetworkExplorer.tsx`: intensity/threshold from the preset
    (ENHANCED = strong controlled glow; CLASSIC = near-flat). The most visible global lever.
  - Corrupted (`CorruptedLinks`), traced (`SelectedNodeFocus`), and objective-route
    (`ObjectiveRouteLinks` / §34) links keep their distinct identities.
- **The toggle** (`GameApp.tsx` + `.visual-mode` in `styles.css`): **K** flips
  `enhancedVisuals` (default ENHANCED); a small NEVA chip (`VISUAL MODE: ENHANCED|CLASSIC [K]`, ice
  accent when ENHANCED) shows the active mode and is clickable. Local UI state only — not persisted,
  not in the save. Blocked while a modal panel owns the keyboard, like the other dev hotkeys.
- **Performance:** instancing/batched geometry preserved; the structural shells are ≤3 static line
  meshes for ≤2 nodes; preset reads are reference lookups (no per-frame allocations).

Files: `src/visual/nevaMaterials.ts`, `components/InteractiveNodes.tsx`,
`components/SelectedNodeFocus.tsx`, `components/NodeConnections.tsx`,
`components/InteractiveNetworkExplorer.tsx`, `GameApp.tsx`, `styles.css` (`.visual-mode`).
Build/lint/typecheck pass; gameplay/save/picking unchanged.

---

## 36. Visual Upgrade Pass v4 — link / route rendering (visual only)

Makes the **links** feel like an active holographic system. Rendering only — no gameplay, missions,
resources, trace, save, picking, or progression changes. ENHANCED (K) gets the upgrades; CLASSIC
keeps the old link behaviour.

- **Normal links cleaner** (`components/NodeConnections.tsx`): in ENHANCED the resting mesh runs at a
  calmer base opacity AND a tighter far-fade (`preset.linkFar`, driven live into the material's
  `uFar` uniform) so distant links melt away sooner — less far "spiderweb" — while near/mid links
  stay readable. CLASSIC keeps the wider far range + flatter opacity.
- **Traced links settle bright** (`components/NodeConnections.tsx`): once a node's route is scanned
  (`status.traced`), its resting links settle into a brighter, stable **scanned-ice** colour
  (ENHANCED only) — so revealed routes light up across the network and the player immediately reads
  "this route was scanned." The short **moving pulse** on TRACE is the selected node's travelling
  trace-band (`SelectedNodeFocus`, boosted by `preset.tracedBoost`) + the `trace` action FX
  (§33) — together: scan-pulse → settle brighter.
- **Corrupted links** (`components/CorruptedLinks.tsx`, unchanged): already a dashed / glitch-gap /
  flicker shader in muted red-gray with AR warning ticks; on TRACE the edge stabilises (drops from
  the overlay, the resting link reverts → now reads as a traced/scanned route) with the `trace` FX
  standing in for the route-restored pulse.
- **Firewall / gateway / core routes** (`components/ObjectiveRouteLinks.tsx` + `nevaMaterials.ts`,
  §34): the route *to the current objective* already renders per-kind — **firewall** = striped /
  blocked, **gateway** = teal-ice flow toward the node, **core** = stronger flow; the `coreSecure`
  FX (§33) + core-sweep cover the premium "secured" moment. (Per-type segmentation/flow on every
  LOCKED/GATEWAY node across the field is intentionally NOT added — it would clutter and cost; the
  objective route carries the mission-relevant one.)
- **Action-triggered line effects** (`actionFx.ts` + `components/ActionEffects.tsx`, §33): export /
  trace / isolate / openStream / enterSubnetwork / coreSecure / fail are already hooked to
  *successful* state transitions only (no FX on failed actions).
- **Performance:** all on the existing batched `LineSegments` meshes — the traced state is a
  per-vertex colour write on state change (not per frame); the far-fade is a single `uFar.set` per
  frame (no allocation). No new per-link components, textures, or assets.

Files: `components/NodeConnections.tsx`, `src/visual/nevaMaterials.ts` (presets `linkFar` /
`tracedBoost`). Build/lint/typecheck pass; gameplay/save/picking unchanged.

---

## 37. Visual Upgrade Pass v5 — camera / focus cinematic composition (visual only)

Improves the *feel* of selecting and inspecting nodes. Camera/composition only — no gameplay,
missions, picking, save, or progression changes. The existing focus path was already cinematic
(smooth exponential glide-in that never overshoots or goes behind the node, ease-in-out return,
perpetual node-centred focus orbit + slow bob, panels mounting in sync at 85% of the glide,
objective focus reusing the same `setSelected` glide); the one real gap was **composition**.

- **Cinematic composition offset** (`components/FlyCamera.tsx`): a focused node used to sit
  dead-centre, so the right-side Inspection Panel covered it. Now, once the node is focused **and**
  its panel has revealed, the camera eases its look-at to a point slightly to the node's RIGHT, so
  the **node settles LEFT-of-centre** — clearly visible between the Node Info (left) and Inspection
  (right) panels. Eased in/out (`COMPOSE_LERP`), magnitude `COMPOSE_OFFSET` × orbit radius (subtle —
  never enough to lose the node), and synced to the panel entrance via `focusReadyNode`. On deselect
  / retarget it eases back to dead-centre. **Picking is unaffected** (raycast + far-pick fallback use
  the live cursor, not the look-at), and manual flight is untouched (the offset lives only in the
  orbit look-at branch).
- **VISUAL MODE gated** (K): the composition offset is **ENHANCED only**; **CLASSIC keeps the old
  dead-centre framing**, so the K toggle also shows the camera-feel difference. `enhanced` threads
  `GameApp → InteractiveNetworkExplorer → FlyCamera` (mirrored to a frame-loop ref).
- **Already present (verified, not redone):** smooth select glide + smooth `R` return-to-overview
  (ease-in-out, keeps progress), Shift+R full reset unchanged, focus micro-motion (orbit + bob),
  synchronized Node Info + Inspection reveal, objective focus via the same glide, gateway/depth dive.
  The panels intentionally have **no leader line** (removed earlier) — not reintroduced.
- **Performance:** the offset is a few vector ops per frame on existing temporaries (no allocations),
  inside the existing camera update loop. No new dependencies.

Files: `components/FlyCamera.tsx` (composition offset + `enhanced` gate),
`components/InteractiveNetworkExplorer.tsx` (pass `enhanced`). Build/lint/typecheck pass;
gameplay/save/picking unchanged.

---

## 38. Visual Upgrade Pass v6 — sector / depth atmosphere (visual only)

Makes each sector AND each depth feel different while keeping the monochrome AR identity. Atmosphere
only — no gameplay, missions, save, picking, or progression changes.

- **Centralized atmosphere presets** (`src/visual/nevaMaterials.ts`): `SECTOR_ATMOSPHERE` (A01/A02/
  A03) + `depthAtmosphere(depth)` + a pure `resolveAtmosphere(missionId, depth, visualPreset)` that
  combines sector mood + depth scale + the VISUAL MODE bloom base into one `{ fogDensity,
  bloomIntensity, bloomThreshold, particleOpacity }`. Single source of truth; no scattered constants.
  - **A01 — MEMORY GRID:** clean first layer — low fog (0.0026), calm dust (~0.82), higher bloom
    threshold so only the brightest cores/edges bloom. Readable, mysterious, not hostile.
  - **A02 — DEEP NETWORK:** deeper/more dangerous — heavier fog (0.0040), fuller dust (~1.0), +bloom,
    lower threshold so routes/cores glow harder. (Plus the existing `data-sector='A02'` heavier CSS
    vignette + cool edge tint in `ExplorerHud`.)
  - **A03 — CORRUPTED SECTOR (FUTURE placeholder):** strongest fog, unstable `flicker`, deeper
    contrast — **defined for later, NOT activated** (no mission range maps to A03; `sectorKeyForMission`
    only returns A01/A02).
- **Depth-based scaling** (`depthAtmosphere`): deeper layers add fog (+0.0006/depth), a touch more
  bloom pressure, and **thinner far dust** (more depth separation) — subtle but visible as you descend.
- **Smooth transitions** (`SectorAtmosphere` in `InteractiveNetworkExplorer.tsx`): the `<fogExp2>` is
  created once at a stable density (`FOG_INITIAL`); a tiny in-Canvas `useFrame` **eases
  `scene.fog.density`** toward the live target, so moving into A02 / deeper fades the atmosphere in
  instead of snapping. The background dust eases its global presence (`InstancedBackgroundNodes`
  `atmoOpacity`, applied to the mesh material) the same way. (Bloom updates at the boundary, under the
  existing mission-warp / depth-flash cinematics.)
- **Background dust** (`components/InstancedBackgroundNodes.tsx`): already clustered + near/far
  depth-faded + far-dimmed (less "white snow"); now also breathes with the sector/depth atmosphere
  via the eased `atmoOpacity` — calmer in A01, denser in A02, thinner deeper.
- **HUD sector label:** unchanged — A01 MEMORY GRID / A02 DEEP NETWORK already correct; A03 name
  (`CORRUPTED SECTOR`) reserved in the preset for when it's built.
- **Performance:** memoized presets, pure resolver, two single-value eases per frame (fog density +
  particle opacity), no new particles/textures/assets, no per-frame allocations.

Files: `src/visual/nevaMaterials.ts` (presets + resolver), `components/InteractiveNetworkExplorer.tsx`
(SectorAtmosphere + atmosphere wiring), `components/InstancedBackgroundNodes.tsx` (`atmoOpacity`).
Build/lint/typecheck pass; gameplay/save/picking unchanged.

---

## 39. Sector Progression — Sector A01 (Missions 00–20) → Sector A02 (new procedural grid)

A major progression update that REFRAMES the whole existing game as **Sector A01** and adds a
cinematic crossing into **Sector A02** — a new, larger, deterministic procedural grid. **Mission
00–20 gameplay is unchanged** (same reducer, gates, save, network); everything here is ADDITIVE and
only activates once A02 is entered, so A01 cannot break.

### Sector mapping
- **Missions 00–20 = Sector A01.** (Within A01: Memory Grid 00–07, then the Deep Network chapter
  08–20 — a *chapter*, not a separate sector.) The HUD sector label now reads **A01** for the whole
  chain; the chapter name still shows MEMORY GRID / DEEP NETWORK.
- **Mission 20 completion = SECTOR A01 COMPLETE** (Alpha Core online) and **UNLOCKS the route to
  Sector A02** — it no longer means "A02 secured". The internal `sectorA02Secured` flag is kept as
  the Mission-20 *completion gate* (renaming it would need a save migration); only the player-facing
  framing changed.

### Sector progression state (`game.ts` → `GameState.sectorProgress`, additive + save-merged)
`{ currentSector: 'A01'|'A02', completedSectors: string[], a02Unlocked, a02Entered, a02Seed }`.
Mission 20 complete → `a02Unlocked = true` + `completedSectors` gains `'A01'` (idempotent, runs in
the reducer post-latch). New action **`ENTER_SECTOR_A02`** flips `currentSector='A02'` + `a02Entered`
and pins the deterministic `a02Seed` — preserving ALL progress (profile/resources/upgrades/private
grid/modules/achievements/AI). Old saves default to A01 (loadSave deep-merges `sectorProgress`).

### A01 → A02 cinematic (`components/SectorTransition.tsx` + `sectorTransition.css`)
From the A01-complete overlay (**ENTER SECTOR A02**) or the dev terminal (`enter a02`): full
**blackout** → a small glowing **boot/terminal panel** → a **typewriter narrative** (timed, subtle
flicker, Enter/Space gracefully fast-forwards) → on finish it dispatches `ENTER_SECTOR_A02` (the A02
grid mounts + begins its reveal *behind* the still-black overlay) → the overlay **fades out** to
reveal the rebuilt HUD + the forming grid. Pure presentation; GameApp owns the actual sector switch.

### A02 procedural grid (`src/sectorGen.ts`)
`generateSector(opts)` → the same `Network` shape as A01, parameterised + larger. **A02_OPTS** =
**16 lobes · 760 nodes · ~1200 links (incl. ~30 LONG bridge routes)**, `spreadScale 2.6`,
`bounds.radius ≈ 331`. A **`fillFraction` (≈0.42)** scatters ~310 nodes UNIFORMLY through the sphere
so the space BETWEEN the lobes is populated — a DENSE field with no big black gaps (the rest cluster
in the lobes). Deterministic from a **string seed** `A02_SEED = hash('NEVA_A02_DEEP_GRID')`; memoized
once as `SECTOR_A02`. The field is **re-centred on the origin** so the overview camera frames it dead-on. Exposes `special`
anchors (core / gateway hubs / corruption / firewalls) + `bounds` (center+radius) as **hooks for
future A02 missions + camera framing** (not yet wired into gameplay).

> **Follow-up fix (A02 "empty space" → visible grid):** the first pass rendered but read as empty —
> A01-sized nodes (0.56u) are sub-pixel across a 5× world, the camera sat at the A01 radius inside the
> inner void, and clusters were isolated islands. Fixed by: (1) **bigger A02 nodes** (core 1.7 /
> frame 2.6) + wider depth-fade so they read as chunky cubes; (2) **long bridge routes** linking the
> clusters; (3) an **A02 establishing camera** — `FlyCamera` gained `overviewRadius`/`overviewHeight`
> props; the explorer passes `bounds.radius × 1.5 ≈ 500`, so entering A02 eases the camera back to
> frame the whole grid (R-reset returns to this A02 framing; zoom ceiling raised); (4) re-centred grid
> + (5) lighter A02 fog (0.0014, no A01-depth bleed) so the big structure reads with depth haze.
>
> **Root-cause render bug (fixed):** the field's `useFrame` guarded on `mesh.instanceColor`, but that
> is `null` until the first `setColorAt()` — so the instance-writing loop never ran and all 340 cubes
> stayed at the identity matrix (stacked at the origin → ONE dot, the reported "empty" A02). Fixed by
> dropping that guard (the loop allocates `instanceColor` on its first write) + filling the sphere so
> the grid is dense from any camera position.
>
> **A02 background star-dust:** `InstancedBackgroundNodes` gained a `spread` prop (default 1 = A01
> unchanged). A02 passes `spread 3`, scaling the whole glowing-cube star field — positions, cube size,
> AND depth-fade — up to fill the larger world so the same A01-style "stars" surround the A02 grid.
>
> **A02 flight speed:** the larger world flies ~30% faster — `FlyCamera` scales `BASE_SPEED` by a
> `flightSpeedScale` prop (1 in A01, 1.3 in A02) so traversing the bigger grid doesn't feel sluggish.

### Visible-route system (link readability — all sectors)

Links are now **logical graph vs visible routes**, so the field reads as data routes, not a permanent
spiderweb. The full LOGICAL graph stays in data (`NETWORK.edges` / `SECTOR_A02.net.edges`). What's
SHOWN is tiered on the existing batched `LineSegments` (per-edge vertex-colour magnitude = relative
opacity; one global `uOpacity` scales it) — no per-frame geometry rebuild, no component-per-line.

- **Route categories** (`src/visual/routes.ts` — `RouteKind` + `ROUTE_STYLES`): STRUCTURAL ·
  DATA_ROUTE · TRACE_ROUTE · GATEWAY_ROUTE · CORRUPTED_ROUTE · FIREWALL_ROUTE · PRIVATE_GRID_ROUTE ·
  OBJECTIVE_ROUTE. The animated categories are drawn by their existing dedicated overlays
  (`SelectedNodeFocus` traced flow, `CorruptedLinks` dashed, `ObjectiveRouteLinks` gateway/firewall/
  objective, `ActionEffects` export data-stream); this module owns STRUCTURAL + the A02 bridge tier.
- **Default (free-scan):** most links are faint **STRUCTURAL** background (≈0.08 effective);
  meaningful routes pop above it — state routes in A01 (`NodeConnections`: extracted ice / isolated
  dim / tripped-decoy red / **TRACED** scanned-ice), and the **15 long BRIDGE routes** in A02
  (`SectorA02Field`: teal GATEWAY tier, ≈0.25) against the **934 faint structural** links. Far links
  fade further (line fade material). No more uniform spiderweb.
- **Reveal:** TRACE → traced endpoints settle bright (persist); EXPORT → temporary data-stream
  (`ActionEffects`); gateway/objective/corrupted/firewall → their overlays, shown when relevant
  (selected / nearby / objective / dev). Brighter routes draw/pulse in then settle.
- **Dev Scan (V):** lifts STRUCTURAL toward the full logical graph (A01 `struct` → `STRUCT_DEV`; A02
  link opacity ×2) so all links show for debugging, while normal play stays clean.
- **A02 line density:** big but readable — faint cluster structure + the few prominent bridges that
  suggest scale; the rest is background.

### A02 rendering + reveal (`components/SectorA02Field.tsx`)
Renders the A02 grid with the SAME node/cube/link visual language (soft core + additive hollow
edge-frame + faded links), batched (3 draw calls). On mount it plays a ~4.6s **progressive reveal**
(nodes bloom centre-outward → routes draw in → settle, then a cheap global breath keeps it alive).
The explorer swaps the A01 interactive layers for this field when `currentSector==='A02'` (A01
picking/panels disabled — A02 is free-scan; `handleSelect` ignores A02 picks so no phantom focus).

### A02 visual identity (`nevaMaterials.ts` atmosphere)
Lighter fog than late-A01 (a 5× world must read across distance) but darker + glowier with a heavier
vignette + fuller distant dust — vast, advanced, more dangerous, monochrome AR (no neon). HUD reads
**SECTOR A02 // DEEP GRID**; the mission panel shows **AWAITING NEXT OBJECTIVE** (`getMissionHudState`
A02 branch).

### Save / dev
- Persisted: `currentSector`, `a02Unlocked`, `a02Entered`, `a02Seed`, completed sectors + all player
  progress. **Refresh after entering A02 resumes in A02** (the grid regenerates from `a02Seed`).
  Soft **R** stays in A02; **Shift+R** full-reset returns to the start (profile identity preserved,
  separate slot).
- **Dev:** V (Dev Scan) shows the sector + A02 seed / node / lobe counts; NEVA Terminal `enter a02`
  (also `go sector a02` / `sector a02` / `a02`) plays the transition for testing.

### NOT in this task (future)
A02 missions / objectives / node interaction (the `special` anchors are the seam). No token/Web3/
presale. A03 stays a visual placeholder only (§38).

Files: `src/sectorGen.ts` (new), `components/SectorA02Field.tsx` (new), `components/SectorTransition.tsx`
+ `sectorTransition.css` (new), `game.ts` (sector state + `ENTER_SECTOR_A02` + M20 unlock), `save.ts`
(merge), `components/InteractiveNetworkExplorer.tsx` (A01↔A02 swap), `components/ExplorerHud.tsx`
(sector label), `missions.ts` (A02 HUD), `terminal.ts` + `GameApp.tsx` (transition wiring + dev),
`styles.css` (`.sector-dev`). Build/lint/typecheck pass; Mission 00–20 gameplay/save unchanged.

---

## 40. A01 decoy-density nodes + sector coordinate registry

**A01 is now a dense field of mostly DECOY traps around the real mission nodes** — without touching
the mission graph. `network.ts` splits the interactive set into **`MISSION_NODE_COUNT = 220`** (the
original graph — **byte-identical**: same seed/RNG order → same positions, types, edges, and
designated CORE/HOME/VAULT/… anchors, so missions + existing saves are untouched) and
**`DECOY_NODE_COUNT = 1980`** appended FIELD nodes (`INTERACTIVE_COUNT = 2200`) — a deterministic
mix: **~60% real EXTRACTABLE data nodes (MEMORY/MESSAGE/IDENTITY/ARCHIVE → DATA + resource yields)
and ~40% DECOY hidden traps** (`APPENDED_TYPES` in `game.ts`, own RNG stream).

- **Behaviour (existing mechanics, reused):** every appended node renders as a normal active cube and
  opens its inspection panel on select. EXTRACTING a **yield** node earns DATA/keys/shards (scaled by
  depth); extracting a **DECOY** trips it → muted-red + a TRACE spike. They carry **no edges**, are
  **never** chosen as a designated/tutorial node, and aren't required by any mission. They fill A01's
  space (≈40% uniform through the sphere, the rest clustered around the lobes) so A01 reads dense and
  is worth scanning — a treasure-vs-trap field. (Extracting field yield nodes feeds the generic
  `extracted` data counters, so data-gated missions get a touch easier; mission-specific anchors —
  VAULT/FRAGMENT/etc. — are still the original <220 indices and unaffected.)
- **Focus declutter (selected-node readability):** when a node is FOCUSED, the surrounding interactive
  nodes recede hard (brightness ×0.12) and the background dust dims (×0.2), and a soft **DepthOfField**
  (`worldFocusDistance ≈ 19`, the focus standoff; `bokehScale 0→3` only while focused, A01 only) gives
  the surrounding field a little blur — so the selected node + its panel read clearly against the dense
  grid. No blur / no DoF cost effect when not focused or in A02.
- **Why missions/saves are safe:** decoys are **appended after index 219**, so every mission anchor,
  the tutorial path, the type tables, and save `statuses` (keyed by index) are unchanged. All
  designated/tutorial/type loops in `game.ts` are pinned to `MISSION_NODE_COUNT`; only the render/pick
  layers iterate the full `INTERACTIVE_COUNT` (so decoys show + are clickable). Edges/corruption span
  mission nodes only.
- **Sector coordinate registry** (`src/sectors.ts`): each sector's node coordinates in one file —
  `SECTORS.A01` (mission + decoy, `NETWORK`) and `SECTORS.A02` (`SECTOR_A02`), each with seed / node
  count / mission vs decoy split / edges, plus `sectorNodePos(sector, i)` and `exportSectorCoords()`.
  Coordinates are deterministic from the seed (reproducible), so this is the canonical, saved
  per-sector coordinate set. Dev Scan (V) now shows A01's mission/decoy counts from it.

Files: `network.ts` (mission/decoy split + append), `game.ts` (`nodeType` decoy + pinned mission
loops), `src/sectors.ts` (new registry), `GameApp.tsx` (dev readout). Build/lint/typecheck pass;
Mission 00–20 gameplay/anchors/saves unchanged.
