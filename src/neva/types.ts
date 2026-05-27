// LEGACY — UNWIRED PROTOTYPE: parallel node/sector registry, NOT imported by the live app
// (0 external importers as of the P1 audit). Kept for reference only — adopt deliberately or
// remove in Phase 3; do not build new gameplay on it without wiring it in first.
/**
 * NEVA Network — central type vocabulary.
 * One place that names every logical + visual object in the Spatial Memory
 * Graph. See NEVA_NETWORK_MASTER_BLUEPRINT.md for the canonical definitions.
 */

/** Index of a Node Frame inside the Spatial Memory Graph. */
export type NodeId = number;

/** Coordinate-based region id, e.g. "04-03-17" or "00-CORE". */
export type SectorId = string;

/** Logical kind of a Node Frame (story + gameplay role). */
export type NodeKind =
  | 'MEMORY'
  | 'CAMERA'
  | 'IDENTITY'
  | 'MESSAGE'
  | 'ARCHIVE'
  | 'GATEWAY'
  | 'DECOY'
  | 'LOCKED';

/** Live state of a Node Frame during a session. */
export type NodeStatus = 'ACTIVE' | 'TRACED' | 'ISOLATED' | 'EXTRACTED' | 'LOCKED';

/** Danger rating used by node kinds + sectors. */
export type RiskLevel = 'LOW' | 'MED' | 'HIGH' | 'CRIT';

/** Official visual asset names (see registry/visualTypes.ts). */
export type VisualAssetKind =
  | 'NODE_FRAME_TINY'
  | 'NODE_FRAME_SMALL'
  | 'NODE_FRAME_MEDIUM'
  | 'FOCUS_NODE_FRAME'
  | 'MICRO_NODE_DUST'
  | 'LINK_LINE_NORMAL'
  | 'LINK_LINE_TRACE'
  | 'TRACKING_BRACKETS'
  | 'LEADER_LINE'
  | 'INSPECTION_PANEL'
  | 'COORDINATE_RULER';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** A Node Frame in the Spatial Memory Graph. */
export interface NetworkNode {
  id: NodeId;
  kind: NodeKind;
  status: NodeStatus;
  position: Vec3;
  sector: SectorId;
  links: NodeId[];
  signal: number; // %
  access: string;
  label: string; // human id, e.g. "NX-0842"
}

/** A connection between two Node Frames. NORMAL = Link Line, TRACE = Trace Link. */
export interface NetworkLink {
  a: NodeId;
  b: NodeId;
  kind: 'NORMAL' | 'TRACE';
}

/** A coordinate-based region of the network. */
export interface SectorDefinition {
  id: SectorId;
  label: string;
  coordinateRange: { min: Vec3; max: Vec3 };
  density: number; // relative node density 0..1
  securityLevel: RiskLevel;
  description: string;
}

/** Tunable look of a visual asset (Node Frame, Link Line, panel, etc.). */
export interface VisualAssetDefinition {
  label: string;
  description: string;
  defaultScale: number;
  opacity: number;
  glowIntensity: number;
  lineWeight: number;
}

/** Definition of a node kind: story role + default stats + allowed actions. */
export interface NodeTypeDefinition {
  label: string;
  description: string;
  defaultRisk: RiskLevel;
  defaultValue: number; // export data value
  defaultAccess: string;
  canExport: boolean;
  canOpenStream: boolean;
  canTrace: boolean;
  canIsolate: boolean;
}

/** State of the Inspection Panel (the AR panel next to the Focus Node). */
export interface InspectionPanelState {
  focusNode: NodeId | null;
  open: boolean;
  streamOpen: boolean;
}

/** What the Coordinate Ruler reads out. */
export interface CoordinateState {
  position: Vec3;
  velocity: number;
  sector: SectorId;
  depth: number;
  layer: number;
}
