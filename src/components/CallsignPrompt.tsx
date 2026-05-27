import { useState } from 'react';
import { CALLSIGN_MIN, CALLSIGN_MAX, sanitizeCallsign } from '../profile';
import './profile.css';

/**
 * First-run CREATE CALLSIGN prompt — a small NEVA-style modal shown once when no local profile
 * exists. Local only: no email, no backend call, no account. Skipping generates an OPERATOR-XXXX
 * default. `onSubmit(name)` creates the profile with that callsign; `onSubmit(null)` = skip.
 */
export default function CallsignPrompt({ onSubmit }: { onSubmit: (name: string | null) => void }) {
  const [value, setValue] = useState('');
  const valid = sanitizeCallsign(value) !== null;
  const submit = () => {
    if (valid) onSubmit(value);
  };
  return (
    <div className="cs-backdrop">
      <div className="cs">
        <div className="cs__title">CREATE CALLSIGN</div>
        <div className="cs__sub">ENTER A LOCAL CALLSIGN FOR THIS DEVICE</div>
        <input
          className="cs__input"
          autoFocus
          value={value}
          maxLength={CALLSIGN_MAX}
          placeholder="OPERATOR"
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && valid) submit();
          }}
        />
        <div className="cs__rule-line">
          {CALLSIGN_MIN}–{CALLSIGN_MAX} CHARS · LETTERS, NUMBERS, _ -
        </div>
        <div className="cs__actions">
          <button className="cs__go" type="button" disabled={!valid} onClick={submit}>
            CREATE
          </button>
          <button className="cs__skip" type="button" onClick={() => onSubmit(null)}>
            SKIP
          </button>
        </div>
        <div className="cs__note">LOCAL ONLY · NO EMAIL · NO ACCOUNT REQUIRED</div>
      </div>
    </div>
  );
}
