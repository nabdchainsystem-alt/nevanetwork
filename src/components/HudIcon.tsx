import type { CSSProperties } from 'react';
import type { TablerIconComp } from './hudTokens';

interface Props {
  icon: TablerIconComp;
  /** subtle status colour (use a HUD_TONE.* value); omit for default monochrome */
  color?: string;
  /** glyph size in px (kept 12–14 to sit beside 9–11px mono text) */
  size?: number;
  style?: CSSProperties;
}

/**
 * A small monochrome HUD glyph. Thin 1.5 stroke + reduced opacity keep Tabler
 * outline icons in the technical AR register; an optional muted `color` carries
 * functional state without breaking NEVA's monochrome identity.
 */
export default function HudIcon({ icon: Icon, color, size = 13, style }: Props) {
  return (
    <Icon
      className="hud-ico"
      size={size}
      stroke={1.5}
      aria-hidden
      style={color ? { color, ...style } : style}
    />
  );
}
