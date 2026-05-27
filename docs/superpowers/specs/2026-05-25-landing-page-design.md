# NEVA NETWORK — Landing Page (design spec)

**Date:** 2026-05-25
**Status:** Approved (brainstorming) → implementation

## Goal

A first-load landing page for NEVA NETWORK that feels cut from the same WebGL world
as the game: a full-viewport, non-interactive "attract mode" of the glowing node
field (same black void, fog, Bloom), with a minimal monochrome holographic overlay
and a single **ENTER NETWORK** call to action. Shown on first visit; remembered
afterward so returning players go straight to the game.

## Decisions (from brainstorming)

- **Structure:** immersive single screen — no scrolling.
- **3D backdrop:** a *live, dedicated* R3F scene matching the game (not the game scene
  itself, not CSS-only).
- **Entry flow:** landing shows first; ENTER mounts the game; a persisted flag lets
  returning players skip it; a discreet in-game control returns to the landing.
- **Intro motion:** a brief (~1.2s) boot sequence (scanline sweep + terminal boot-log
  lines type in) then the wordmark flickers/resolves. Skipped under
  `prefers-reduced-motion`.
- **CTA:** `ENTER NETWORK` only. (A saved game still auto-resumes once inside.)

## Architecture

New, self-contained, decoupled from game state:

```
src/components/landing/
  Landing.tsx              — screen shell: owns <Canvas> + DOM overlay; runs the boot
                             sequence; fades to black on enter, then calls onEnter.
  LandingScene.tsx         — R3F scene contents: fog, background haze, constellation, bloom.
  LandingCamera.tsx        — slow auto-orbit around field center + subtle pointer parallax.
  LandingConstellation.tsx — bright "hero" nodes + connecting edges as ONE InstancedMesh.
src/intro.ts               — hasEnteredNetwork() / markEnteredNetwork() (localStorage flag).
```

- **Reuse `InstancedBackgroundNodes`** unchanged (decorative, takes `focused`; pass
  `false`) so the landing's atmospheric dust is identical to the game's.
- **`LandingConstellation`** is generated deterministically from `WORLD_SEED ^ 0x1a4d9`
  (its own XOR'd sub-seed per the determinism convention) — beautiful but never reads
  `NETWORK` or game state. One `InstancedMesh` for nodes; a single `LineSegments` /
  buffer for edges. Brightness tuned to catch the Bloom (whites/grays only).
- **`LandingCamera`** orbits the origin slowly (no controls), lerping a small offset
  toward the pointer for parallax. Writes nothing to `telemetry` or game.
- Canvas mirrors the game: `flat`, `dpr={[1,1.5]}`, `camera fov 70 near 0.1 far 1600`,
  `<color #000>`, `<fogExp2 #000 0.0028>`, and the identical
  `<Bloom intensity={0.7} luminanceThreshold={0.2} luminanceSmoothing={0.24} radius={0.6} mipmapBlur>`.

## App integration

- `App` gains `entered` state, initialized from `hasEnteredNetwork()`.
- `entered === false` → render **only** `<Landing onEnter={…} />`. The game (and its
  WebGL canvas) is not mounted, so there is never more than one WebGL context live.
- `ENTER NETWORK` → `Landing` runs a ~700ms fade-to-black, then calls `onEnter`, which
  sets `entered=true` and `markEnteredNetwork()`. Game mounts; its existing Mission 01
  briefing appears unchanged.
- **Revisit:** a discreet translucent `⏏ INTRO` text button (bottom-left, minimal HUD
  language) sets `entered=false`. It does not clear the save — re-entering resumes the run.

## Overlay UI

New `.lp__*` classes in `styles.css`, reusing the existing aesthetic vocabulary
(`.hud__brand` breathing wordmark + glint light-line, corner brackets, scanline/vignette/noise):

- Faint scanlines + vignette over the canvas ("captured feed").
- Top-left boot-log: `▌ LINK ESTABLISHED` / `DECRYPTING SPATIAL INDEX…` /
  `SPATIAL MEMORY ONLINE` (type in during boot, then settle as a static status line).
- Center: **NEVA NETWORK** wordmark (Orbitron, breathing glow) + `SPATIAL-MEMORY INTERFACE`
  subtitle + glint light-line + a one-line tagline
  (e.g. `A DETERMINISTIC FIELD OF GLOWING NODES — FLY IN, DECODE THE SIGNAL`).
- `[ ENTER NETWORK ]` button (reuses `.hud__act`/`.mx__go` feel; hover glow).
- Bottom status strip: `SEED 0x5EED1D · NODES 12K · DEPTH 01`.
- `prefers-reduced-motion`: skip the boot sequence, slow/stop orbit + breathing.

## Conventions honored

- Determinism: constellation from `WORLD_SEED ^ 0x1a4d9`; no `Date.now()`/`Math.random()`
  in render paths.
- One `InstancedMesh` for the hero nodes.
- Monochrome; glow earned, never neon.
- Panels/surfaces are plain translucent (no neon, restrained).
- `pnpm build` (tsc + vite) is the completion gate.

## Out of scope

Scrollable marketing sections, screenshots/trailer embeds, audio on the landing,
localization, analytics. (Can be layered later if desired.)
