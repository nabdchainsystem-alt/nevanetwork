/**
 * NEVA Core Assistant v1 — backend-only OpenAI helper (Phase: AI Integration).
 *
 * ADVISORY TEXT ONLY. This module never touches game state, missions, rewards, resources, trace,
 * or save — it returns short tactical hints for the frontend to display. The OpenAI key lives
 * server-side (`OPENAI_API_KEY`); it is never exposed to the client and is never logged.
 *
 * Uses the OpenAI Responses API via plain `fetch` (no SDK dependency). If the key is missing, or
 * the call errors/times out, it returns a deterministic fallback so the game never breaks.
 */

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const TIMEOUT_MS = Number(process.env.OPENAI_TIMEOUT_MS || 9000);
const ENDPOINT = 'https://api.openai.com/v1/responses';

const MODES = [
  'MISSION_HINT',
  'NODE_EXPLAIN',
  'RISK_WARNING',
  'RESOURCE_HELP',
  'UPGRADE_HELP',
  'LORE_LINE',
  'LOZA_EASTER_EGG',
];

const SYSTEM = `You are NEVA Core, the in-game tactical assistant inside the game "NEVA Network".
You guide the operator: explain the current mission, the selected node, risk/trace, resources,
upgrades/modules, and the best next action, using the game's own terms (trace, nodes,
EXTRACT/OPEN/TRACE/ISOLATE, firewall, gateway, Private Grid). You are ADVISORY ONLY.

STYLE: concise, cinematic, tactical. 3-5 short lines, under ~80 words. No long paragraphs.
No spoilers. No fake certainty — if unsure, point to the active objective / FOCUS OBJECTIVE / panel.

HARD RULES (never break):
- Never claim to change mission state, complete a mission, grant rewards, or modify save/resources.
- Never promise profit, earnings, passive income, "pump", or any financial return.
- Never give legal, religious, or Sharia rulings.
- If asked about a token/coin/presale/ICO/buying/wallet: say it is a future utility concept that is
  LOCKED until later roadmap + legal + Sharia review, and nothing is for sale.
- Do not invent nodes, mechanics, or rewards that are not in the provided context.`;

// ---- deterministic fallbacks (no key / error / timeout) ----
const NODE_FALLBACK = {
  MEMORY: 'Memory node — low-risk data. EXTRACT [E] is usually safe.',
  MESSAGE: 'Message node — low risk. TRACE may reveal routes; EXTRACT [E] for data.',
  IDENTITY: 'Identity node — high value, yields a key on EXTRACT [E]. Mind the trace cost.',
  ARCHIVE: 'Archive/Vault — TRACE [T] to verify the route, then EXTRACT [E] for a cleaner pull.',
  CAMERA: 'Watcher node — a signal source. ISOLATE [I] to cut it; exporting spikes trace.',
  GATEWAY: 'Gateway — OPEN STREAM [O], then ENTER the subnetwork route to go deeper.',
  DECOY: 'Decoy — a trap. Do NOT EXTRACT (trace spike). ISOLATE [I] to neutralize it.',
  LOCKED: 'Firewall — TRACE [T] to analyze, then OPEN [O] or USE KEY [K] to unlock it.',
};
function fallbackText(ctx) {
  const nt = ctx.node?.type;
  switch (ctx.mode) {
    case 'NODE_EXPLAIN':
      return (nt && NODE_FALLBACK[nt]) || 'Select a node and check its TYPE, STATUS and RISK before acting.';
    case 'RISK_WARNING':
      return `Trace is ${ctx.trace ?? '—'}%. Above 70%, reduce it: ISOLATE risk nodes, avoid decoys, let it decay. 100% locks the session.`;
    case 'RESOURCE_HELP':
      return 'Keys open firewalls (USE KEY). Signal boosts ISOLATE / STABILIZE. Memory powers ANALYZE + upgrades. DATA funds the Private Grid.';
    case 'UPGRADE_HELP':
      return 'Open UPGRADES [U] or the Private Grid [B]. Trace Shield/Dampener cut trace; Data Vault boosts data; Key Cache helps keys.';
    case 'LORE_LINE':
      return 'The grid hums. Every node you touch remembers you. // NEVA';
    default: // MISSION_HINT
      return ctx.objective
        ? `Objective: ${ctx.objective}. Press FOCUS OBJECTIVE if you lose the target.`
        : 'Follow the active objective. Use FOCUS OBJECTIVE if you are lost.';
  }
}

const LOZA_LINE = 'LOZA ASSIST NODE // dormant signal detected.';
function isLoza(ctx) {
  if (ctx.mode === 'LOZA_EASTER_EGG') return true;
  const q = String(ctx.question || '').trim().toUpperCase();
  return q === 'LOZA' || q === 'LOZA_NODE' || /\bLOZA\b/.test(q);
}

function buildUserMessage(ctx) {
  const lines = [
    `HELP MODE: ${ctx.mode}`,
    ctx.question ? `OPERATOR QUESTION: ${String(ctx.question).slice(0, 300)}` : null,
    '--- GAME CONTEXT ---',
    ctx.missionName ? `Mission ${ctx.missionId ?? '?'} // ${ctx.missionName}` : null,
    ctx.sector ? `Sector ${ctx.sector} · Depth ${ctx.depth ?? '?'}` : null,
    ctx.objective ? `Objective: ${ctx.objective}` : null,
    ctx.requiredAction ? `Required action: ${ctx.requiredAction}` : null,
    ctx.trace != null ? `Trace ${ctx.trace}% (${ctx.traceTier ?? ''})` : null,
    ctx.corruption != null ? `Corruption ${ctx.corruption}%` : null,
    ctx.node
      ? `Selected node: ${ctx.node.type}/${ctx.node.category} · status ${ctx.node.status} · risk ${ctx.node.risk} · value ${ctx.node.value}${ctx.node.isObjective ? ' · MISSION TARGET' : ''}`
      : 'Selected node: none',
    ctx.resources ? `Resources: ${ctx.resources}` : null,
    ctx.upgrades ? `Upgrades: ${ctx.upgrades}` : null,
    ctx.modules ? `Private Grid: ${ctx.modules}` : null,
    ctx.lastAction ? `Recent: ${ctx.lastAction}` : null,
    ctx.devScan ? 'Dev scan: ON' : null,
  ].filter(Boolean);
  return lines.join('\n');
}

function extractText(data) {
  if (!data) return '';
  if (typeof data.output_text === 'string') return data.output_text;
  const parts = [];
  for (const item of data.output ?? []) {
    for (const c of item.content ?? []) {
      if (c && typeof c.text === 'string') parts.push(c.text);
    }
  }
  return parts.join('\n').trim();
}

/**
 * Resolve a NEVA Core hint for a compact game context. Always resolves (never throws) — returns a
 * deterministic fallback when offline / on error / on timeout. Shape:
 *   { ok:true, mode, text, model? }                 — live AI answer
 *   { ok:true, offline:true, source, mode, text }   — fallback (no key / error / timeout)
 *   { ok:true, easterEgg:true, mode, text }          — LOZA dormant hook
 */
export async function nevaCore(input = {}) {
  const ctx = input && typeof input === 'object' ? input : {};
  ctx.mode = MODES.includes(ctx.mode) ? ctx.mode : 'MISSION_HINT';

  // Dormant Easter-egg hook — never calls the API.
  if (isLoza(ctx)) return { ok: true, easterEgg: true, mode: 'LOZA_EASTER_EGG', text: LOZA_LINE };

  const key = process.env.OPENAI_API_KEY;
  if (!key) return { ok: true, offline: true, source: 'AI_OFFLINE', mode: ctx.mode, text: fallbackText(ctx) };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: MODEL,
        instructions: SYSTEM,
        input: buildUserMessage(ctx),
        max_output_tokens: 220,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!r.ok) return { ok: true, offline: true, source: 'AI_ERROR', mode: ctx.mode, text: fallbackText(ctx) };
    const text = extractText(await r.json()).trim();
    if (!text) return { ok: true, offline: true, source: 'AI_EMPTY', mode: ctx.mode, text: fallbackText(ctx) };
    return { ok: true, mode: ctx.mode, text: text.slice(0, 700), model: MODEL };
  } catch {
    clearTimeout(timer);
    return { ok: true, offline: true, source: 'AI_TIMEOUT', mode: ctx.mode, text: fallbackText(ctx) };
  }
}
