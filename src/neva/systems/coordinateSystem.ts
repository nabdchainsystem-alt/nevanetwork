// LEGACY — UNWIRED PROTOTYPE: parallel node/sector registry, NOT imported by the live app
// (0 external importers as of the P1 audit). Kept for reference only — adopt deliberately or
// remove in Phase 3; do not build new gameplay on it without wiring it in first.
/**
 * NEVA Network — coordinate system helpers (powers the Coordinate Ruler).
 * Simple, local, pure functions. Sector ids are derived from position so the
 * network feels like a real, addressable space as it grows.
 */
import type { CoordinateState, SectorId, Vec3 } from '../types';

/** "+0034.0" style fixed-width signed coordinate. */
export function formatCoordinate(value: number): string {
  return (value >= 0 ? '+' : '-') + Math.abs(value).toFixed(1).padStart(6, '0');
}

export function formatVector3(position: Vec3): string {
  return `${formatCoordinate(position.x)} ${formatCoordinate(position.y)} ${formatCoordinate(position.z)}`;
}

const secPart = (n: number) =>
  ((Math.floor(n / 8) & 0xff) >>> 0).toString(16).toUpperCase().padStart(2, '0');

/** Grid sector id for a position, e.g. "04-03-17". */
export function getSectorFromPosition(position: Vec3): SectorId {
  return `${secPart(position.x)}-${secPart(position.y)}-${secPart(position.z)}`;
}

export function getDistanceBetween(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/** Assemble a full Coordinate Ruler readout from a position + velocity. */
export function createCoordinateState(
  position: Vec3,
  velocity: number,
  depth = 1,
): CoordinateState {
  const layer = (((Math.round(position.y / 26) % 8) + 8) % 8) + 1;
  return {
    position,
    velocity,
    sector: getSectorFromPosition(position),
    depth,
    layer,
  };
}
