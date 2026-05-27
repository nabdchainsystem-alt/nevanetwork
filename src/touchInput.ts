/**
 * Shared mutable touch-input state — the touch equivalent of `telemetry`.
 *
 * Written by the on-screen <TouchControls> overlay and the canvas touch
 * listeners in FlyCamera; read by FlyCamera each frame. Lives outside React so
 * dragging the joystick / orbiting never triggers a re-render (convention #4:
 * hot-path data bypasses React).
 *
 * Two control modes the player toggles between:
 *  - 'orbit' (default): one-finger drag orbits the view, pinch zooms, tap picks.
 *  - 'fly': virtual joystick moves, drag looks, up/down climbs, tap picks.
 *
 * `moveX/moveZ/lift` are *held* analog states (joystick / buttons). The `*DX/DY`
 * and `pinchDelta` fields are *accumulated deltas* — FlyCamera reads and zeroes
 * them once per frame so each gesture pixel is consumed exactly once.
 */
export interface TouchInput {
  mode: 'orbit' | 'fly';
  // held joystick / button state (fly mode), normalised -1..1
  moveX: number; // strafe: +right
  moveZ: number; // forward axis: -1 = push stick up = fly forward
  lift: number; // -1 down / 0 / +1 up
  // per-frame accumulated deltas (consumed + zeroed by FlyCamera)
  lookDX: number; // fly-mode look (screen px since last frame)
  lookDY: number;
  orbitDX: number; // orbit-mode drag (screen px since last frame)
  orbitDY: number;
  pinchDelta: number; // orbit-mode pinch (px change in finger distance)
}

export const touchInput: TouchInput = {
  mode: 'orbit',
  moveX: 0,
  moveZ: 0,
  lift: 0,
  lookDX: 0,
  lookDY: 0,
  orbitDX: 0,
  orbitDY: 0,
  pinchDelta: 0,
};
