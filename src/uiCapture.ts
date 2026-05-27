/**
 * Shared input-capture flag — render-free, like `telemetry`. True while a DOM UI (the
 * NEVA Terminal) owns the keyboard, so the camera/game key handlers stand down and the
 * player can type commands freely without flying or firing actions.
 */
export const uiCapture = { active: false };
