// LEGACY — UNWIRED PROTOTYPE: parallel node/sector registry, NOT imported by the live app
// (0 external importers as of the P1 audit). Kept for reference only — adopt deliberately or
// remove in Phase 3; do not build new gameplay on it without wiring it in first.
/**
 * NEVA Network — sector registry.
 * Sectors are coordinate-based regions of the Spatial Memory Graph. These are
 * sample definitions; getSectorFromPosition() (systems/coordinateSystem.ts)
 * computes a live sector id for any position.
 */
import type { SectorDefinition, SectorId } from '../types';

export const SECTOR_REGISTRY: Record<SectorId, SectorDefinition> = {
  // A01 — the origin sector: the whole Depth 01 Spatial Memory Graph you spawn
  // into. Full coordinates / composition / rules live in Sectors.md.
  A01: {
    id: 'A01',
    label: 'SECTOR A01',
    coordinateRange: { min: { x: -130, y: -130, z: -130 }, max: { x: 130, y: 130, z: 130 } },
    density: 1,
    securityLevel: 'LOW',
    description: 'Origin sector. Depth 01 field: 220 nodes in 11 lobes, spawn (34,26,188).',
  },
  '04-03-17': {
    id: '04-03-17',
    label: 'SECTOR 04-03-17',
    coordinateRange: { min: { x: 24, y: 16, z: 128 }, max: { x: 40, y: 32, z: 152 } },
    density: 0.6,
    securityLevel: 'MED',
    description: 'Outer memory belt. Mixed memory and message traffic.',
  },
  '04-03-18': {
    id: '04-03-18',
    label: 'SECTOR 04-03-18',
    coordinateRange: { min: { x: 24, y: 16, z: 152 }, max: { x: 40, y: 32, z: 176 } },
    density: 0.5,
    securityLevel: 'LOW',
    description: 'Quiet archive fringe. Low activity, low trace.',
  },
  '05-01-01': {
    id: '05-01-01',
    label: 'SECTOR 05-01-01',
    coordinateRange: { min: { x: 40, y: 0, z: 0 }, max: { x: 72, y: 24, z: 24 } },
    density: 0.8,
    securityLevel: 'HIGH',
    description: 'Identity cluster. High-value, heavily monitored.',
  },
  '00-CORE': {
    id: '00-CORE',
    label: 'CORE 00',
    coordinateRange: { min: { x: -30, y: -30, z: -30 }, max: { x: 30, y: 30, z: 30 } },
    density: 1,
    securityLevel: 'CRIT',
    description: 'The network core. Densest region, maximum security.',
  },
};
