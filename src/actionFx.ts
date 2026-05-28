/**
 * Action visual-FX layer (Visual Upgrade Pass v2) — PURE VISUAL, derived from existing game state.
 *
 * The reducer is untouched: it already bumps `msgId` (per resolved action), records the acted node
 * (`msgNode`), the result `kind` (ok/warn/fail), and the resulting status/depth. From a (prev → next)
 * state transition we classify which action succeeded and emit a short-lived FX event for the 3D
 * effects layer. Events are transient + local — never stored in the save, never affect gameplay.
 */
import { coreSecured, nodeType, type GameState } from './game';

export type FxType =
  | 'export'
  | 'trace'
  | 'isolate'
  | 'openStream'
  | 'enterSubnetwork'
  | 'coreSecure'
  | 'fail';

export interface FxEvent {
  id: number;
  type: FxType;
  nodeId: number | null;
  startedAt: number; // performance.now() at spawn
  duration: number; // ms
}

/** Per-type lifetime (ms). Kept short — these are punchy action accents, not lingering VFX. */
export const FX_DURATION: Record<FxType, number> = {
  export: 900, // slower, softer green extraction bloom
  trace: 560,
  isolate: 640,
  openStream: 560,
  enterSubnetwork: 900,
  coreSecure: 1150,
  fail: 380,
};

let _id = 0;
export function makeFx(type: FxType, nodeId: number | null, now: number): FxEvent {
  return { id: ++_id, type, nodeId, startedAt: now, duration: FX_DURATION[type] };
}

/**
 * Classify a single resolved action from a (prev → next) game-state transition and return the FX
 * event(s) to play. Reads state only; never mutates. Returns [] when nothing visual should fire.
 */
export function deriveActionFx(prev: GameState, next: GameState, now: number): FxEvent[] {
  // ENTER SUBNETWORK — the dive is the headline event for this tick.
  if (next.currentDepth > prev.currentDepth) {
    return [makeFx('enterSubnetwork', next.gatewayNode ?? next.streamNode ?? next.msgNode, now)];
  }

  // CORE / ALPHA CORE / mission-objective secured (rising edge) — premium pulse, takes precedence
  // over the underlying generic action (e.g. the trace that secured it).
  const coreEdge =
    (coreSecured(next) && !coreSecured(prev)) ||
    (next.alphaCoreStabilized && !prev.alphaCoreStabilized) ||
    (next.sectorA02Secured && !prev.sectorA02Secured);
  if (coreEdge) return [makeFx('coreSecure', next.msgNode ?? prev.streamNode, now)];

  // OPEN STREAM — a node's stream just opened (can happen on the same tick msgId bumps).
  if (next.streamNode !== prev.streamNode && next.streamNode != null) {
    return [makeFx('openStream', next.streamNode, now)];
  }

  // Everything else keys off a freshly-resolved action message.
  if (next.msgId === prev.msgId) return [];
  const node = next.msgNode;
  const kind = next.message?.kind ?? null;
  if (node == null) return [];
  if (kind === 'fail') return [makeFx('fail', node, now)]; // failed action → glitch flicker only
  if (kind !== 'ok') return []; // 'warn' → neutral, no success FX

  const ps = prev.statuses[node];
  const ns = next.statuses[node];
  if (!!ns?.extracted && !ps?.extracted) {
    // a tripped DECOY is a trap, not a successful pull → glitch, not an export stream
    return [makeFx(nodeType(node, next.currentDepth) === 'DECOY' ? 'fail' : 'export', node, now)];
  }
  if (!!ns?.isolated && !ps?.isolated) return [makeFx('isolate', node, now)];

  // TRACE — links revealed / highlighted, or corrupted links repaired
  const stabilizedChanged = Object.keys(next.linkStabilized).length !== Object.keys(prev.linkStabilized).length;
  if (next.tracedFrom !== prev.tracedFrom || next.revealedLinks !== prev.revealedLinks || stabilizedChanged) {
    return [makeFx('trace', node, now)];
  }
  return [];
}
