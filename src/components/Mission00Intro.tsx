import { useEffect, useState } from 'react';
import { TUTORIAL_STEPS, TUTORIAL_NODES, type GameState, type TutorialAction } from '../game';

const pad2 = (n: number) => String(n).padStart(2, '0');
const M0_SWAP_MS = 260; // close → open transition between steps (matches the CSS m0-out duration)

// The REAL on-panel button label for each taught action (so the prompt names the exact control
// the player must press — never an invented one).
const ACTION_BTN: Record<TutorialAction, string> = {
  INSPECT: 'the node',
  EXPORT: 'EXTRACT',
  TRACE: 'TRACE LINKS',
  USE_KEY: 'USE KEY',
  ISOLATE: 'ISOLATE',
  OPEN_STREAM: 'OPEN STREAM',
};

// The real keyboard shortcut, where one exists (INSPECT = a click; USE KEY = panel button only).
const ACTION_KEY: Partial<Record<TutorialAction, string>> = {
  EXPORT: 'E',
  TRACE: 'T',
  ISOLATE: 'I',
  OPEN_STREAM: 'O',
};

/**
 * The Mission 00 guided onboarding card (floating, lower-left). Instruction-only — it names the
 * current node, explains it, and tells the player the exact two beats: (1) SELECT the node to read
 * it, then (2) press the exact action button/shortcut. The player performs both on the real node
 * panel; the reducer advances the step only on the correct action. The card closes then re-opens
 * on each step so it visibly transitions, like the other panels.
 */
export default function Mission00Intro({
  game,
  selected,
  objectiveNode,
}: {
  game: GameState;
  selected: number | null;
  objectiveNode: number | null;
}) {
  const liveStep = Math.min(game.mission00.step, TUTORIAL_STEPS.length - 1);
  const [shown, setShown] = useState(liveStep);
  const [closing, setClosing] = useState(false);

  // on each step change: retract the current card, then swap to the new step (which re-opens)
  useEffect(() => {
    if (liveStep === shown) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- begin the retract on step change
    setClosing(true);
    const t = window.setTimeout(() => {
      setShown(liveStep);
      setClosing(false);
    }, M0_SWAP_MS);
    return () => window.clearTimeout(t);
  }, [liveStep, shown]);

  const s = TUTORIAL_STEPS[shown];
  const msg = game.message?.text;

  // Is the player currently inspecting THIS step's node? Drives the two-part prompt:
  //   Part 1 (not selected) → "Select the node to inspect it."
  //   Part 2 (selected)     → "Press <BUTTON> [<KEY>]."
  const stepNode = TUTORIAL_NODES[shown];
  const onNode = selected != null && (selected === objectiveNode || selected === stepNode);
  const key = ACTION_KEY[s.action];
  const keyTag = key ? ` [${key}]` : '';

  let doText: string;
  let part: '1' | '2';
  if (s.action === 'INSPECT') {
    // selecting the node IS the action — a single clear beat
    part = '1';
    doText = 'Select the node to synchronize the signal.';
  } else if (!onNode) {
    part = '1';
    doText = `Select the node to inspect it — then press ${ACTION_BTN[s.action]}${keyTag}.`;
  } else {
    part = '2';
    doText = `Press ${ACTION_BTN[s.action]}${keyTag} on the node panel.`;
  }

  return (
    <div className="m0">
      {/* re-keyed by step so the open animation replays after each retract */}
      <div className={`m0__bar${closing ? ' is-closing' : ''}`} key={shown}>
        <div className="m0__head">
          <span className="m0__tag">MISSION 00 · FIRST SIGNAL</span>
          <span className="m0__count">{pad2(shown + 1)} / {pad2(TUTORIAL_STEPS.length)}</span>
        </div>
        <div className="m0__role">{s.title}</div>
        <div className="m0__obj">{s.objective}</div>
        <div className="m0__lines">
          <div className="m0__what">{s.what}</div>
          <div className="m0__why">{s.why}</div>
          <div className="m0__remember">▹ {s.remember}</div>
        </div>
        {msg && <div className="m0__msg">{msg}</div>}
        <div className="m0__do">
          <span className="m0__step-tag">STEP {part}</span> {doText}
        </div>
        <div className="m0__dots">
          {TUTORIAL_STEPS.map((_, i) => (
            <span key={i} className={`m0__dot${i < shown ? ' is-done' : i === shown ? ' is-now' : ''}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
