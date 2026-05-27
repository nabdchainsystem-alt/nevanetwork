/**
 * Terminal navigation channel — render-free, like `telemetry`. `FlyCamera` provides an
 * on-demand "nearest node of a given type" function (computed against the live camera
 * position + grid rotation); the terminal's `go to <type>` command calls it. Off-screen
 * by default so it never costs anything until a command fires.
 */
import type { NodeType } from './game';

export interface NearestResult {
  id: number; // node index, or -1 if none of that type exist in the current layer
  dist: number; // world distance to it
}

export const terminalNav: { nearestOfType: (type: NodeType) => NearestResult } = {
  nearestOfType: () => ({ id: -1, dist: 0 }),
};
