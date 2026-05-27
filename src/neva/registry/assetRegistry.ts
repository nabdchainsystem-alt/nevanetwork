// LEGACY — UNWIRED PROTOTYPE: parallel node/sector registry, NOT imported by the live app
// (0 external importers as of the P1 audit). Kept for reference only — adopt deliberately or
// remove in Phase 3; do not build new gameplay on it without wiring it in first.
/**
 * NEVA Network — central asset registry.
 * One object that references every typed registry. Import this to understand or
 * enumerate all NEVA spatial objects in one place.
 */
import { NODE_TYPE_REGISTRY } from './nodeTypes';
import { VISUAL_ASSET_REGISTRY } from './visualTypes';
import { SECTOR_REGISTRY } from './sectors';

export const NEVA_ASSET_REGISTRY = {
  nodeTypes: NODE_TYPE_REGISTRY,
  visualTypes: VISUAL_ASSET_REGISTRY,
  sectors: SECTOR_REGISTRY,
} as const;

export type NevaAssetRegistry = typeof NEVA_ASSET_REGISTRY;
