// Shared HUD tokens, kept out of HudIcon.tsx so that file only exports a
// component (keeps Vite fast-refresh happy: react-refresh/only-export-components).

// Type-only import: every @tabler/icons-react icon shares this component shape,
// so we borrow one icon's type. `import type` is erased at build → no bundle cost.
import type { IconActivity } from '@tabler/icons-react';

/** The shape of any Tabler outline icon component. */
export type TablerIconComp = typeof IconActivity;

/**
 * Muted, low-saturation functional tones for the left HUD. The world stays
 * monochrome — tint is *earned* state feedback, never decoration — so every
 * value here is desaturated and glow-free. They resolve to CSS variables
 * (defined in styles.css) so the palette lives in one place.
 */
export const HUD_TONE = {
  amber: 'var(--hud-amber)', // trace warning (>= 70%)
  red: 'var(--hud-red)', // trace critical (>= 90%) / locked / decoy
  mem: 'var(--hud-mem)', // memory shards — cool blue-gray
  keys: 'var(--hud-keys)', // access keys — pale gold
  signal: 'var(--hud-signal)', // signal energy — faint cyan/green
  core: 'var(--hud-core)', // core fragments — faint violet-gray
  green: 'var(--hud-green)', // access granted
  ice: 'var(--hud-ice)', // extracted — ice-blue (matches node colour language)
  slate: 'var(--hud-slate)', // isolated — muted cool slate
} as const;
