/**
 * Neva Network — shared config for the holographic network explorer.
 * Pure numbers; everything visual is generated procedurally from these.
 */

// --- Background atmosphere node count -----------------------------------------
export const QUALITY = {
  LOW: 5_000,
  MEDIUM: 12_000,
  HIGH: 20_000,
} as const;

export type QualityKey = keyof typeof QUALITY;
export const ACTIVE_QUALITY: QualityKey = 'MEDIUM';
export const NODE_COUNT = QUALITY[ACTIVE_QUALITY];

// --- The floating data field --------------------------------------------------
export const FIELD = {
  /** Radius of the spherical network cloud. */
  radius: 130,
} as const;

/** Master seed — keeps the network identical across reloads. */
export const WORLD_SEED = 0x5eed_1d;

/** Camera spawn + initial look target (outside the cloud, looking in). The look
 * target sits a little ABOVE the cloud centre so the network renders lower in the
 * frame (the camera aims high, pushing the grid down on screen). */
export const SPAWN: [number, number, number] = [34, 26, 188];
export const LOOK_AT: [number, number, number] = [0, 16, 0];

/**
 * mulberry32 — tiny deterministic PRNG.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
