/**
 * NEVA Core Assistant v1 — frontend client (advisory only).
 *
 * Builds a COMPACT, SAFE game context (read-only — never mutates state, never sends the save file,
 * email, or waitlist data), posts it to the backend `/api/ai/neva-core` route, and returns a short
 * hint for the panel. If the backend/API is unavailable it falls back to a deterministic hint so
 * the game never blocks. The OpenAI key lives ONLY on the server — this module never sees it.
 */
import {
  nodeType,
  nodeCategory,
  statusLabel,
  TYPE_CFG,
  exportValueAt,
  threatState,
  corruptionRisk,
  MODULE_DEFS,
  type GameState,
} from './game';
import { resolveObjectiveTarget, actionDisplay } from './objectives';
import { getMissionHudState, missionName } from './missions';

export type NevaMode =
  | 'MISSION_HINT'
  | 'NODE_EXPLAIN'
  | 'RISK_WARNING'
  | 'RESOURCE_HELP'
  | 'UPGRADE_HELP'
  | 'LORE_LINE';

/** The compact context sent to the backend. Intentionally minimal — no save blob, no PII. */
export interface NevaContext {
  missionId: number;
  missionName: string;
  sector: string;
  depth: number;
  objective: string;
  requiredAction: string | null;
  trace: number;
  traceTier: string;
  corruption: number;
  node: {
    type: string;
    category: string;
    status: string;
    risk: string;
    value: number;
    isObjective: boolean;
  } | null;
  resources: string;
  upgrades: string;
  modules: string;
  lastAction: string | null;
  devScan: boolean;
}

export interface NevaResponse {
  text: string;
  offline: boolean;
  easterEgg?: boolean;
}

/** Build the compact context from current game state (pure / read-only). */
export function buildNevaContext(g: GameState, selected: number | null, devScan: boolean): NevaContext {
  const hud = getMissionHudState(g, selected);
  const obj = resolveObjectiveTarget(g, selected);
  const node =
    selected != null
      ? (() => {
          const t = nodeType(selected, g.currentDepth);
          return {
            type: t,
            category: nodeCategory(selected, t),
            status: statusLabel(g, selected),
            risk: TYPE_CFG[t].risk,
            value: exportValueAt(t, g.currentDepth),
            isObjective: obj?.targetNodeId === selected,
          };
        })()
      : null;
  const r = g.resources;
  const mods =
    MODULE_DEFS.filter((d) => g.playerSubnetwork.modules[d.id] > 0)
      .map((d) => `${d.name} L${g.playerSubnetwork.modules[d.id]}`)
      .join(', ') || (g.playerSubnetwork.unlocked ? 'none installed' : 'locked (after M03)');
  const ups =
    (Object.entries(g.upgrades) as [string, number][])
      .filter(([, l]) => l > 0)
      .map(([k, l]) => `${k} L${l}`)
      .join(', ') || 'none';
  return {
    missionId: g.missionId,
    missionName: missionName(g.missionId),
    sector: g.missionId >= 8 ? 'A02 Deep Network' : 'A01 Memory Grid',
    depth: g.currentDepth,
    objective: hud.objective,
    requiredAction: obj?.targetAction ? actionDisplay(obj.targetAction) : null,
    trace: Math.round(g.traceLevel),
    traceTier: threatState(g.traceLevel),
    corruption: corruptionRisk(g),
    node,
    resources: `DATA ${g.extractedData} · MEM ${r.memoryShards} · KEYS ${r.accessKeys} · SIGNAL ${r.signalEnergy} · CORE ${r.coreFragments}`,
    upgrades: ups,
    modules: mods,
    lastAction: g.message?.text ?? null,
    devScan,
  };
}

const NODE_FALLBACK: Record<string, string> = {
  MEMORY: 'Memory node — low-risk data. EXTRACT [E] is usually safe.',
  MESSAGE: 'Message node — low risk. TRACE may reveal routes; EXTRACT [E] for data.',
  IDENTITY: 'Identity node — high value, yields a key on EXTRACT [E]. Mind the trace cost.',
  ARCHIVE: 'Archive/Vault — TRACE [T] to verify the route, then EXTRACT [E] for a cleaner pull.',
  CAMERA: 'Watcher node — a signal source. ISOLATE [I] to cut it; exporting spikes trace.',
  GATEWAY: 'Gateway — OPEN STREAM [O], then ENTER the subnetwork route to go deeper.',
  DECOY: 'Decoy — a trap. Do NOT EXTRACT (trace spike). ISOLATE [I] to neutralize it.',
  LOCKED: 'Firewall — TRACE [T] to analyze, then OPEN [O] or USE KEY [K] to unlock it.',
};

/** Deterministic hint used when the backend can't be reached at all (mirrors the server fallback). */
export function nevaFallback(mode: NevaMode, ctx: NevaContext): string {
  switch (mode) {
    case 'NODE_EXPLAIN':
      return (ctx.node && NODE_FALLBACK[ctx.node.type]) || 'Select a node and check its TYPE, STATUS and RISK before acting.';
    case 'RISK_WARNING':
      return `Trace is ${ctx.trace}%. Above 70%, reduce it: ISOLATE risk nodes, avoid decoys, let it decay. 100% locks the session.`;
    case 'RESOURCE_HELP':
      return 'Keys open firewalls (USE KEY). Signal boosts ISOLATE / STABILIZE. Memory powers ANALYZE + upgrades. DATA funds the Private Grid.';
    case 'UPGRADE_HELP':
      return 'Open UPGRADES [U] or the Private Grid [B]. Trace Shield/Dampener cut trace; Data Vault boosts data; Key Cache helps keys.';
    case 'LORE_LINE':
      return 'The grid hums. Every node you touch remembers you. // NEVA';
    default:
      return ctx.objective
        ? `Objective: ${ctx.objective}. Press FOCUS OBJECTIVE if you lose the target.`
        : 'Follow the active objective. Use FOCUS OBJECTIVE if you are lost.';
  }
}

/** Ask NEVA Core for a hint. Always resolves; falls back deterministically if the route is down. */
export async function askNevaCore(ctx: NevaContext, mode: NevaMode, question?: string): Promise<NevaResponse> {
  try {
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), 10000);
    const res = await fetch('/api/ai/neva-core', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...ctx, mode, question: question ?? null }),
      signal: ctrl.signal,
    });
    window.clearTimeout(timer);
    const data = (await res.json().catch(() => ({}))) as Partial<NevaResponse>;
    if (data && typeof data.text === 'string' && data.text.trim()) {
      return { text: data.text.trim(), offline: !!data.offline, easterEgg: !!data.easterEgg };
    }
    return { text: nevaFallback(mode, ctx), offline: true };
  } catch {
    return { text: nevaFallback(mode, ctx), offline: true };
  }
}
