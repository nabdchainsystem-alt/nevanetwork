import {
  BACKGROUND_NOISE_VALUES,
  HUD_DENSITY_VALUES,
  PANEL_OPACITY_VALUES,
  TEXT_SIZE_VALUES,
  UI_SCALE_VALUES,
  type BackgroundNoise,
  type HudDensity,
  type PanelOpacity,
  type TextSize,
  type UiScale,
  type UiSettings,
} from '../uiSettings';

type SettingKey = keyof UiSettings;

interface Row<T extends string | number> {
  key: SettingKey;
  label: string;
  desc: string;
  values: readonly T[];
  value: T;
  format?: (v: T) => string;
}

function nextValue<T extends string | number>(values: readonly T[], value: T, dir: -1 | 1): T {
  const idx = values.indexOf(value);
  const next = (idx + dir + values.length) % values.length;
  return values[next];
}

export default function InterfaceSettingsPanel({
  settings,
  onChange,
  onReset,
  onClose,
  closing = false,
}: {
  settings: UiSettings;
  onChange: (next: UiSettings) => void;
  onReset: () => void;
  onClose: () => void;
  closing?: boolean;
}) {
  const rows: Row<UiScale | TextSize | PanelOpacity | BackgroundNoise | HudDensity>[] = [
    {
      key: 'uiScale',
      label: 'UI SCALE',
      desc: 'Changes HUD and panel size.',
      values: UI_SCALE_VALUES,
      value: settings.uiScale,
      format: (v) => `${v}%`,
    },
    {
      key: 'textSize',
      label: 'TEXT SIZE',
      desc: 'Changes interface text size.',
      values: TEXT_SIZE_VALUES,
      value: settings.textSize,
    },
    {
      key: 'panelOpacity',
      label: 'PANEL OPACITY',
      desc: 'Darkens panels behind text.',
      values: PANEL_OPACITY_VALUES,
      value: settings.panelOpacity,
    },
    {
      key: 'backgroundNoise',
      label: 'BACKGROUND NOISE',
      desc: 'Reduces visual particles behind UI.',
      values: BACKGROUND_NOISE_VALUES,
      value: settings.backgroundNoise,
    },
    {
      key: 'hudDensity',
      label: 'HUD DENSITY',
      desc: 'Controls spacing and compactness.',
      values: HUD_DENSITY_VALUES,
      value: settings.hudDensity,
    },
  ];

  const step = (row: Row<UiScale | TextSize | PanelOpacity | BackgroundNoise | HudDensity>, dir: -1 | 1) => {
    onChange({
      ...settings,
      [row.key]: nextValue(row.values, row.value, dir),
    });
  };

  return (
    // settings is a true pause: dim the scene, center the panel, label it PAUSED.
    // clicking the backdrop closes (and resumes); the panel itself swallows clicks.
    <div className={`ifx-modal${closing ? ' is-closing' : ''}`} onClick={onClose}>
      <span className="ifx-modal__paused" aria-hidden="true">PAUSED</span>

      <div className={`ifx${closing ? ' up--closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        <span className="up__corner up__corner--tl" />
        <span className="up__corner up__corner--tr" />
        <span className="up__corner up__corner--br" />
        <span className="up__corner up__corner--bl" />

        <div className="ifx__inner">
        <span className="up__scan" />
        <div className="ifx__head">
          <div className="up__titles">
            <span className="up__title">INTERFACE SETTINGS</span>
            <span className="up__sub">READABILITY PROFILE</span>
          </div>
          <button className="up__x" type="button" onClick={onClose}>✕ CLOSE</button>
        </div>
        <div className="up__rule" />

        <div className="ifx__rows">
          {rows.map((row) => (
            <div className="ifx__row" key={row.key}>
              <div className="ifx__copy">
                <span className="ifx__label">{row.label}</span>
                <span className="ifx__desc">{row.desc}</span>
              </div>
              <div className="ifx__stepper">
                <button type="button" onClick={() => step(row, -1)} aria-label={`${row.label} previous`}>
                  ‹
                </button>
                <span>{row.format ? row.format(row.value) : row.value}</span>
                <button type="button" onClick={() => step(row, 1)} aria-label={`${row.label} next`}>
                  ›
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="up__rule" />
        <div className="ifx__foot">
          <button className="ifx__reset" type="button" onClick={onReset}>RESET UI</button>
          <span className="up__hint">, / ESC TO CLOSE</span>
        </div>
        </div>
      </div>
    </div>
  );
}
