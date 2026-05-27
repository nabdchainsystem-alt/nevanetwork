// LEGACY — UNWIRED PROTOTYPE: parallel node/sector registry, NOT imported by the live app
// (0 external importers as of the P1 audit). Kept for reference only — adopt deliberately or
// remove in Phase 3; do not build new gameplay on it without wiring it in first.
/**
 * NEVA Network — visual asset registry.
 * The official look/feel definitions for every drawable in the interface.
 * Values are descriptive defaults (the components own the real rendering for
 * now); this is the naming + tuning reference for future work.
 */
import type { VisualAssetKind, VisualAssetDefinition } from '../types';

export const VISUAL_ASSET_REGISTRY: Record<VisualAssetKind, VisualAssetDefinition> = {
  NODE_FRAME_TINY: {
    label: 'Node Frame · Tiny',
    description: 'Smallest hollow data-cube frame.',
    defaultScale: 0.22,
    opacity: 0.85,
    glowIntensity: 0.3,
    lineWeight: 1,
  },
  NODE_FRAME_SMALL: {
    label: 'Node Frame · Small',
    description: 'Standard clickable data-cube frame.',
    defaultScale: 0.55,
    opacity: 0.9,
    glowIntensity: 0.4,
    lineWeight: 1,
  },
  NODE_FRAME_MEDIUM: {
    label: 'Node Frame · Medium',
    description: 'Larger / higher-value data-cube frame.',
    defaultScale: 1.0,
    opacity: 0.95,
    glowIntensity: 0.5,
    lineWeight: 1,
  },
  FOCUS_NODE_FRAME: {
    label: 'Focus Node Frame',
    description: 'Pulsing hollow cage around the currently inspected node.',
    defaultScale: 2.6,
    opacity: 0.55,
    glowIntensity: 0.6,
    lineWeight: 1,
  },
  MICRO_NODE_DUST: {
    label: 'Micro Node',
    description: 'Tiny non-interactive background particles / data dust.',
    defaultScale: 0.08,
    opacity: 0.4,
    glowIntensity: 0.2,
    lineWeight: 0,
  },
  LINK_LINE_NORMAL: {
    label: 'Link Line',
    description: 'Resting connection line between two Node Frames.',
    defaultScale: 1,
    opacity: 0.26,
    glowIntensity: 0.1,
    lineWeight: 1,
  },
  LINK_LINE_TRACE: {
    label: 'Trace Link',
    description: 'Highlighted/animated link revealed from the Focus Node.',
    defaultScale: 1,
    opacity: 0.85,
    glowIntensity: 0.7,
    lineWeight: 1,
  },
  TRACKING_BRACKETS: {
    label: 'Tracking Brackets',
    description: 'Corner brackets around hovered/selected Node Frames.',
    defaultScale: 1,
    opacity: 0.8,
    glowIntensity: 0.4,
    lineWeight: 1,
  },
  LEADER_LINE: {
    label: 'Leader Line',
    description: 'Thin line joining the Focus Node to its Inspection Panel.',
    defaultScale: 1,
    opacity: 0.4,
    glowIntensity: 0.1,
    lineWeight: 1,
  },
  INSPECTION_PANEL: {
    label: 'Inspection Panel',
    description: 'Holographic AR data panel beside the Focus Node.',
    defaultScale: 1,
    opacity: 0.66,
    glowIntensity: 0.3,
    lineWeight: 1,
  },
  COORDINATE_RULER: {
    label: 'Coordinate Ruler',
    description: 'Bottom comb/barcode space-time navigation HUD.',
    defaultScale: 1,
    opacity: 0.9,
    glowIntensity: 0.5,
    lineWeight: 1,
  },
};
