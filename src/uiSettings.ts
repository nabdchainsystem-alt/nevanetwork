export type UiScale = 90 | 100 | 110 | 125 | 140;
export type TextSize = 'Small' | 'Normal' | 'Large' | 'XL';
export type PanelOpacity = 'Low' | 'Medium' | 'High';
export type BackgroundNoise = 'Low' | 'Normal' | 'High';
export type HudDensity = 'Compact' | 'Normal' | 'Readable';

export interface UiSettings {
  uiScale: UiScale;
  textSize: TextSize;
  panelOpacity: PanelOpacity;
  backgroundNoise: BackgroundNoise;
  hudDensity: HudDensity;
}

const KEY = 'neva:ui-settings:v1';

export const UI_SCALE_VALUES: UiScale[] = [90, 100, 110, 125, 140];
export const TEXT_SIZE_VALUES: TextSize[] = ['Small', 'Normal', 'Large', 'XL'];
export const PANEL_OPACITY_VALUES: PanelOpacity[] = ['Low', 'Medium', 'High'];
export const BACKGROUND_NOISE_VALUES: BackgroundNoise[] = ['Low', 'Normal', 'High'];
export const HUD_DENSITY_VALUES: HudDensity[] = ['Compact', 'Normal', 'Readable'];

export function defaultUiSettings(width = typeof window !== 'undefined' ? window.innerWidth : 1600): UiSettings {
  if (width <= 1400) {
    return {
      uiScale: 110,
      textSize: 'Large',
      panelOpacity: 'High',
      backgroundNoise: 'Low',
      hudDensity: 'Readable',
    };
  }
  return {
    uiScale: 100,
    textSize: 'Normal',
    panelOpacity: 'Medium',
    backgroundNoise: 'Normal',
    hudDensity: 'Normal',
  };
}

function isUiScale(v: unknown): v is UiScale {
  return UI_SCALE_VALUES.includes(v as UiScale);
}
function isTextSize(v: unknown): v is TextSize {
  return TEXT_SIZE_VALUES.includes(v as TextSize);
}
function isPanelOpacity(v: unknown): v is PanelOpacity {
  return PANEL_OPACITY_VALUES.includes(v as PanelOpacity);
}
function isBackgroundNoise(v: unknown): v is BackgroundNoise {
  return BACKGROUND_NOISE_VALUES.includes(v as BackgroundNoise);
}
function isHudDensity(v: unknown): v is HudDensity {
  return HUD_DENSITY_VALUES.includes(v as HudDensity);
}

export function loadUiSettings(): UiSettings {
  const fallback = defaultUiSettings();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<UiSettings> | null;
    if (!parsed) return fallback;
    return {
      uiScale: isUiScale(parsed.uiScale) ? parsed.uiScale : fallback.uiScale,
      textSize: isTextSize(parsed.textSize) ? parsed.textSize : fallback.textSize,
      panelOpacity: isPanelOpacity(parsed.panelOpacity) ? parsed.panelOpacity : fallback.panelOpacity,
      backgroundNoise: isBackgroundNoise(parsed.backgroundNoise)
        ? parsed.backgroundNoise
        : fallback.backgroundNoise,
      hudDensity: isHudDensity(parsed.hudDensity) ? parsed.hudDensity : fallback.hudDensity,
    };
  } catch {
    return fallback;
  }
}

export function saveUiSettings(settings: UiSettings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    /* localStorage can fail in private contexts */
  }
}

const textScale: Record<TextSize, number> = {
  Small: 0.94,
  Normal: 1,
  Large: 1.12,
  XL: 1.24,
};

const panelAlpha: Record<PanelOpacity, [number, number]> = {
  Low: [0.62, 0.76],
  Medium: [0.78, 0.88],
  High: [0.9, 0.96],
};

const noiseAlpha: Record<BackgroundNoise, [number, number]> = {
  Low: [0.012, 0.18],
  Normal: [0.04, 0.5],
  High: [0.075, 0.72],
};

const densityVars: Record<HudDensity, { gap: number; pad: number; line: number }> = {
  Compact: { gap: -2, pad: 0.9, line: 1.32 },
  Normal: { gap: 0, pad: 1, line: 1.5 },
  Readable: { gap: 4, pad: 1.12, line: 1.72 },
};

export function applyUiSettings(settings: UiSettings): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const px = (value: number) => `${Number(value.toFixed(2))}px`;
  const [panelBg, panelStrong] = panelAlpha[settings.panelOpacity];
  const [noise, scanline] = noiseAlpha[settings.backgroundNoise];
  const density = densityVars[settings.hudDensity];
  const uiScale = settings.uiScale / 100;
  const fontScale = textScale[settings.textSize];

  root.style.setProperty('--ui-scale', String(uiScale));
  root.style.setProperty('--text-scale', String(fontScale));
  root.style.setProperty('--panel-bg-alpha', String(panelBg));
  root.style.setProperty('--panel-bg-alpha-strong', String(panelStrong));
  root.style.setProperty('--noise-opacity', String(noise));
  root.style.setProperty('--scanline-opacity', String(scanline));
  root.style.setProperty('--hud-density-gap', `${density.gap}px`);
  root.style.setProperty('--hud-density-pad', String(density.pad));
  root.style.setProperty('--hud-density-line', String(density.line));
  root.style.setProperty('--node-panel-width', px(330 * uiScale)); // 330 = +30% over the original 254
  root.style.setProperty('--node-info-width', px(176 * uiScale));
  root.style.setProperty('--settings-panel-width', px(410 * uiScale));

  [7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 13, 14, 15, 18, 24].forEach((base) => {
    root.style.setProperty(`--fs-${String(base).replace('.', '')}`, px(base * fontScale));
  });

  [8, 10, 12, 14, 16, 18, 20, 22, 26].forEach((base) => {
    root.style.setProperty(`--pad-${base}`, px(base * density.pad));
  });
}
