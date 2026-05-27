import { useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { touchInput } from '../touchInput';

const JOY_R = 46; // px the knob travels from centre = full deflection

interface Props {
  /** Hand control back from a focused node so movement engages (deselects). */
  onResume: () => void;
}

/**
 * On-screen touch controls for phones / tablets. A mode pill flips between:
 *  - ORBIT: one-finger drag + pinch are handled on the canvas (FlyCamera); this
 *    overlay only shows the toggle + hint.
 *  - FLY: a virtual joystick (move) and UP/DOWN buttons (climb), plus drag-to-look
 *    on the canvas. The joystick writes the shared `touchInput` directly (no React
 *    re-render per move — convention #4).
 */
export default function TouchControls({ onResume }: Props) {
  const [mode, setMode] = useState<'orbit' | 'fly'>(touchInput.mode);
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const joyId = useRef<number | null>(null);
  const centre = useRef({ x: 0, y: 0 });

  const switchMode = (m: 'orbit' | 'fly') => {
    touchInput.mode = m;
    if (m !== 'fly') {
      touchInput.moveX = touchInput.moveZ = touchInput.lift = 0;
    }
    setMode(m);
  };

  const moveKnob = (dx: number, dy: number) => {
    const len = Math.hypot(dx, dy);
    const s = len > JOY_R ? JOY_R / len : 1;
    const kx = dx * s, ky = dy * s;
    if (knobRef.current) knobRef.current.style.transform = `translate(${kx}px, ${ky}px)`;
    touchInput.moveX = kx / JOY_R;
    touchInput.moveZ = ky / JOY_R; // screen-down is +; FlyCamera negates for forward
  };
  const resetKnob = () => {
    if (knobRef.current) knobRef.current.style.transform = 'translate(0px, 0px)';
    touchInput.moveX = touchInput.moveZ = 0;
  };

  const onJoyDown = (e: RPointerEvent) => {
    e.preventDefault();
    onResume();
    const r = baseRef.current!.getBoundingClientRect();
    centre.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    joyId.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    moveKnob(e.clientX - centre.current.x, e.clientY - centre.current.y);
  };
  const onJoyMove = (e: RPointerEvent) => {
    if (joyId.current !== e.pointerId) return;
    moveKnob(e.clientX - centre.current.x, e.clientY - centre.current.y);
  };
  const onJoyUp = (e: RPointerEvent) => {
    if (joyId.current !== e.pointerId) return;
    joyId.current = null;
    resetKnob();
  };

  const setLift = (v: number) => (e: RPointerEvent) => {
    e.preventDefault();
    if (v) onResume();
    touchInput.lift = v;
  };

  return (
    <div className="tc">
      <button
        className={`tc__pill${mode === 'fly' ? ' is-fly' : ''}`}
        onClick={() => switchMode(mode === 'orbit' ? 'fly' : 'orbit')}
      >
        <span className={mode === 'orbit' ? 'is-on' : ''}>ORBIT</span>
        <span className="tc__pill-sep">/</span>
        <span className={mode === 'fly' ? 'is-on' : ''}>FLY</span>
      </button>

      <div className="tc__hint">
        {mode === 'orbit'
          ? 'DRAG ORBIT · PINCH ZOOM · TAP NODE'
          : 'JOYSTICK MOVE · DRAG LOOK · TAP NODE'}
      </div>

      {mode === 'fly' && (
        <>
          <div
            className="tc__joy"
            ref={baseRef}
            onPointerDown={onJoyDown}
            onPointerMove={onJoyMove}
            onPointerUp={onJoyUp}
            onPointerCancel={onJoyUp}
          >
            <div className="tc__joy-knob" ref={knobRef} />
          </div>
          <div className="tc__lift">
            <button
              className="tc__liftbtn"
              aria-label="ascend"
              onPointerDown={setLift(1)}
              onPointerUp={setLift(0)}
              onPointerLeave={setLift(0)}
              onPointerCancel={setLift(0)}
            >
              ▲
            </button>
            <button
              className="tc__liftbtn"
              aria-label="descend"
              onPointerDown={setLift(-1)}
              onPointerUp={setLift(0)}
              onPointerLeave={setLift(0)}
              onPointerCancel={setLift(0)}
            >
              ▼
            </button>
          </div>
        </>
      )}
    </div>
  );
}
