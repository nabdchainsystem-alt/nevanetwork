/**
 * Mutable, render-free channel from the in-Canvas camera to the HTML HUD.
 * FlyCamera writes every frame; ExplorerHud samples it a few times a second,
 * avoiding 60fps React re-renders.
 */
export const telemetry = {
  x: 34,
  y: 26,
  z: 188,
  speed: 0,
};
