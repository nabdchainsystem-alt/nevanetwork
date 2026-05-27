// LEGACY — UNWIRED PROTOTYPE: parallel node/sector registry, NOT imported by the live app
// (0 external importers as of the P1 audit). Kept for reference only — adopt deliberately or
// remove in Phase 3; do not build new gameplay on it without wiring it in first.
/**
 * NEVA Network — Node Frame kind registry.
 * Story role + default stats + which actions each kind allows. Mirrors the
 * gameplay tuning in src/game.ts (TYPE_CFG) so they stay conceptually aligned.
 */
import type { NodeKind, NodeTypeDefinition } from '../types';

export const NODE_TYPE_REGISTRY: Record<NodeKind, NodeTypeDefinition> = {
  MEMORY: {
    label: 'MEMORY',
    description: 'A stored memory fragment. Safe, reliable export target.',
    defaultRisk: 'LOW',
    defaultValue: 10,
    defaultAccess: 'OPEN',
    canExport: true,
    canOpenStream: true,
    canTrace: true,
    canIsolate: true,
  },
  CAMERA: {
    label: 'CAMERA',
    description: 'A surveillance feed. Opening its stream raises trace quickly.',
    defaultRisk: 'MED',
    defaultValue: 6,
    defaultAccess: 'LIMITED',
    canExport: true,
    canOpenStream: true,
    canTrace: true,
    canIsolate: true,
  },
  IDENTITY: {
    label: 'IDENTITY',
    description: 'A person record. High-value export, high trace cost.',
    defaultRisk: 'HIGH',
    defaultValue: 20,
    defaultAccess: 'SECURE',
    canExport: true,
    canOpenStream: true,
    canTrace: true,
    canIsolate: true,
  },
  MESSAGE: {
    label: 'MESSAGE',
    description: 'A communication packet. Tracing it reveals nearby links.',
    defaultRisk: 'LOW',
    defaultValue: 8,
    defaultAccess: 'OPEN',
    canExport: true,
    canOpenStream: true,
    canTrace: true,
    canIsolate: true,
  },
  ARCHIVE: {
    label: 'ARCHIVE',
    description: 'A sealed archive. Must be traced before it can be exported.',
    defaultRisk: 'MED',
    defaultValue: 15,
    defaultAccess: 'RESTRICTED',
    canExport: true, // gated until traced/unlocked
    canOpenStream: true,
    canTrace: true,
    canIsolate: true,
  },
  GATEWAY: {
    label: 'GATEWAY',
    description: 'An entry point to a deeper Subnetwork. Cannot be isolated safely.',
    defaultRisk: 'HIGH',
    defaultValue: 0,
    defaultAccess: 'SECURE',
    canExport: false,
    canOpenStream: true,
    canTrace: true,
    canIsolate: false,
  },
  DECOY: {
    label: 'DECOY',
    description: 'A trap node. Exporting it spikes trace and yields no data.',
    defaultRisk: 'CRIT',
    defaultValue: 0,
    defaultAccess: 'OPEN',
    canExport: false,
    canOpenStream: true,
    canTrace: true,
    canIsolate: true,
  },
  LOCKED: {
    label: 'LOCKED',
    description: 'A protected node. Needs isolation/trace or higher access to export.',
    defaultRisk: 'HIGH',
    defaultValue: 12,
    defaultAccess: 'RESTRICTED',
    canExport: false, // until unlocked or access level raised
    canOpenStream: true,
    canTrace: true,
    canIsolate: true,
  },
};
