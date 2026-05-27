/**
 * NEVA Network — minimal waitlist API + static server (Phase 7). Zero dependencies (Node stdlib
 * only). Run with `pnpm server` (or `node server/index.mjs`). In dev, Vite proxies /api here
 * (see vite.config.ts); in production this also serves the built `dist/`.
 *
 * Endpoints:
 *   POST /api/waitlist          → { ok, message, entryId } | { ok, duplicate, message } | { ok:false, error }
 *   GET  /api/waitlist/stats    → { total, byRole, latestCreatedAt }   (no emails exposed)
 *   POST /api/ai/neva-core      → advisory hint (server-side OpenAI; key never leaves the server)
 *   --- Phase 8 backend foundation (early-access; no accounts/login/payments) ---
 *   POST /api/invite/generate   → { ok, entryId, inviteCode }          (admin-gated)
 *   POST /api/invite/redeem     → { ok, accessStatus, message, profileAccess }
 *   GET  /api/invite/status     → { ok, valid, redeemed, accessStatus } (no private data)
 *   POST /api/feedback          → { ok, feedbackId, message }
 *   POST /api/analytics/event   → { ok }                                (privacy-safe, no emails)
 *   GET  /api/admin/summary     → aggregate counts only                 (admin-gated; 503 if unset)
 *
 * No Web3, wallet, token sale, payments, login/sessions, or database — JSON files + light guards.
 */
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { timingSafeEqual } from 'node:crypto';
import { addEntry, stats, assignInviteCodeToEntry, getInviteByCode, redeemInviteCode, listInviteStats } from './waitlist-store.mjs';
import { addFeedback, feedbackStats } from './feedback-store.mjs';
import { addEvent, analyticsStats } from './analytics-store.mjs';
import { nevaCore } from './neva-ai.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const PORT = Number(process.env.PORT ?? 8787);
const MAX_BODY = 8 * 1024; // 8 KB default — reject anything larger
const FEEDBACK_MAX_BODY = 16 * 1024; // feedback can carry a longer message

// Admin secret for invite generation + the admin summary. Server-side only (never a VITE_ var).
const ADMIN_SECRET = String(process.env.NEVA_ADMIN_SECRET ?? '').trim();

// --- light per-IP rate limits (in-memory; reset on restart). Separate buckets so spam in one
//     channel can't block another. ---
function makeLimiter(maxHits, windowMs = 60_000) {
  const hits = new Map();
  return (ip) => {
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    hits.set(ip, recent);
    return recent.length > maxHits;
  };
}
const rateLimited = makeLimiter(8); // waitlist
const aiRateLimited = makeLimiter(12); // NEVA Core (advisory hints — a touch more headroom)
const inviteRateLimited = makeLimiter(10); // invite redeem (guess-resistance)
const inviteStatusRateLimited = makeLimiter(30); // invite status (read-only)
const feedbackRateLimited = makeLimiter(6); // feedback submissions
const analyticsRateLimited = makeLimiter(120); // analytics events (fire often → generous)
const adminRateLimited = makeLimiter(30); // admin endpoints (secret-gated, but still bounded)

function isLocal(ip) {
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip === 'local';
}

/** Constant-time string compare (length-guarded). */
function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/**
 * Gate an admin action. When NEVA_ADMIN_SECRET is set, `provided` must match it. When it is unset
 * the action is refused with a 503 setup message — unless `allowLocalIfUnset` and the caller is on
 * localhost (a dev convenience for generating codes without configuring a secret).
 * Returns { ok: true } | { ok: false, code, error }.
 */
function checkAdmin(provided, ip, { allowLocalIfUnset = false } = {}) {
  if (!ADMIN_SECRET) {
    if (allowLocalIfUnset && isLocal(ip)) return { ok: true, devLocal: true };
    return { ok: false, code: 503, error: 'Admin not configured. Set NEVA_ADMIN_SECRET in the server environment.' };
  }
  if (!provided || !safeEqual(provided, ADMIN_SECRET)) return { ok: false, code: 401, error: 'Unauthorized.' };
  return { ok: true };
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
};

function sendJson(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}

function readBody(req, max = MAX_BODY) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > max) {
        reject(new Error('payload too large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

/** Read + JSON-parse a request body. Throws on oversize; resolves to null on invalid JSON. */
async function readJson(req, max = MAX_BODY) {
  const raw = await readBody(req, max);
  try {
    return JSON.parse(raw || '{}');
  } catch {
    return null;
  }
}

/** Pull an admin secret from the request (header, POST body field, or ?secret= query). */
function providedSecret(req, url, body) {
  const header = req.headers['x-neva-admin-secret'];
  return (
    (typeof header === 'string' && header) ||
    (body && typeof body.adminSecret === 'string' && body.adminSecret) ||
    url.searchParams.get('secret') ||
    ''
  );
}

function serveStatic(res, pathname) {
  if (!existsSync(DIST)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('NEVA waitlist API is running. Build the app (pnpm build) to also serve the site here.');
    return;
  }
  let rel = decodeURIComponent(pathname);
  if (rel === '/' || rel === '') rel = '/index.html';
  let file = normalize(join(DIST, rel));
  if (!file.startsWith(DIST)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(DIST, 'index.html'); // SPA fallback
  res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  const { pathname } = url;
  const fwd = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(fwd) ? fwd[0] : fwd?.split(',')[0]) ?? req.socket.remoteAddress ?? 'local';

  if (pathname === '/api/waitlist' && req.method === 'POST') {
    if (rateLimited(ip)) return sendJson(res, 429, { ok: false, error: 'Too many requests. Please try again shortly.' });
    let raw;
    try {
      raw = await readBody(req);
    } catch {
      return sendJson(res, 413, { ok: false, error: 'Request too large.' });
    }
    let input;
    try {
      input = JSON.parse(raw || '{}');
    } catch {
      return sendJson(res, 400, { ok: false, error: 'Valid email is required.' });
    }
    const result = addEntry(input);
    return sendJson(res, result.ok ? 200 : 400, result);
  }

  if (pathname === '/api/waitlist/stats' && req.method === 'GET') {
    return sendJson(res, 200, stats()); // aggregate only — no emails
  }

  // NEVA Core Assistant v1 — advisory hints only (server-side OpenAI; key never leaves the server).
  if (pathname === '/api/ai/neva-core' && req.method === 'POST') {
    if (aiRateLimited(ip))
      return sendJson(res, 429, { ok: true, offline: true, source: 'RATE_LIMIT', text: 'NEVA Core is cooling down. Try again shortly.' });
    let raw;
    try {
      raw = await readBody(req);
    } catch {
      return sendJson(res, 413, { ok: false, error: 'Request too large.' });
    }
    let input;
    try {
      input = JSON.parse(raw || '{}');
    } catch {
      input = {};
    }
    const result = await nevaCore(input); // always resolves (deterministic fallback on error/no key)
    return sendJson(res, 200, result);
  }

  // ===================== Phase 8 — invite codes (early-access gating) =====================
  // Generate/assign an invite code for an existing waitlist entry. Admin-gated. Never returns email.
  if (pathname === '/api/invite/generate' && req.method === 'POST') {
    if (adminRateLimited(ip)) return sendJson(res, 429, { ok: false, error: 'Too many requests. Please try again shortly.' });
    let input;
    try {
      input = await readJson(req);
    } catch {
      return sendJson(res, 413, { ok: false, error: 'Request too large.' });
    }
    if (input === null) return sendJson(res, 400, { ok: false, error: 'Invalid JSON.' });
    const auth = checkAdmin(providedSecret(req, url, input), ip, { allowLocalIfUnset: true });
    if (!auth.ok) return sendJson(res, auth.code, { ok: false, error: auth.error });
    if (!input.email && !input.entryId) return sendJson(res, 400, { ok: false, error: 'email or entryId is required.' });
    const result = assignInviteCodeToEntry({ email: input.email, entryId: input.entryId });
    return sendJson(res, result.ok ? 200 : 404, result);
  }

  // Redeem an invite code once → unlocks early access. No login/password/session is created.
  if (pathname === '/api/invite/redeem' && req.method === 'POST') {
    if (inviteRateLimited(ip)) return sendJson(res, 429, { ok: false, error: 'Too many attempts. Please try again shortly.' });
    let input;
    try {
      input = await readJson(req);
    } catch {
      return sendJson(res, 413, { ok: false, error: 'Request too large.' });
    }
    if (input === null) return sendJson(res, 400, { ok: false, error: 'Invalid JSON.' });
    const result = redeemInviteCode(input.inviteCode, { callsign: input.callsign, profileId: input.profileId });
    if (!result.ok) {
      const code = result.error === 'ALREADY_REDEEMED' ? 409 : 400;
      return sendJson(res, code, { ok: false, error: result.error, message: result.message });
    }
    return sendJson(res, 200, {
      ok: true,
      accessStatus: result.accessStatus,
      message: result.message,
      profileAccess: { earlyAccess: true },
    });
  }

  // Check a code's validity without revealing any private data.
  if (pathname === '/api/invite/status' && req.method === 'GET') {
    if (inviteStatusRateLimited(ip)) return sendJson(res, 429, { ok: false, error: 'Too many requests. Please try again shortly.' });
    const info = getInviteByCode(url.searchParams.get('code'));
    if (!info) return sendJson(res, 200, { ok: true, valid: false, redeemed: false, accessStatus: null });
    return sendJson(res, 200, { ok: true, valid: true, redeemed: info.redeemed, accessStatus: info.accessStatus });
  }

  // ===================== Phase 8 — feedback =====================
  if (pathname === '/api/feedback' && req.method === 'POST') {
    if (feedbackRateLimited(ip)) return sendJson(res, 429, { ok: false, error: 'Too many requests. Please try again shortly.' });
    let input;
    try {
      input = await readJson(req, FEEDBACK_MAX_BODY);
    } catch {
      return sendJson(res, 413, { ok: false, error: 'Request too large.' });
    }
    if (input === null) return sendJson(res, 400, { ok: false, error: 'Invalid JSON.' });
    const result = addFeedback(input);
    return sendJson(res, result.ok ? 200 : 400, result);
  }

  // ===================== Phase 8 — analytics (privacy-safe; no emails) =====================
  if (pathname === '/api/analytics/event' && req.method === 'POST') {
    if (analyticsRateLimited(ip)) return sendJson(res, 429, { ok: false, error: 'Too many requests. Please try again shortly.' });
    let input;
    try {
      input = await readJson(req);
    } catch {
      return sendJson(res, 413, { ok: false, error: 'Request too large.' });
    }
    if (input === null) return sendJson(res, 400, { ok: false, error: 'Invalid JSON.' });
    const result = addEvent(input);
    return sendJson(res, result.ok ? 200 : 400, result);
  }

  // ===================== Phase 8 — admin summary (aggregate only; secret-gated) =====================
  if (pathname === '/api/admin/summary' && req.method === 'GET') {
    if (adminRateLimited(ip)) return sendJson(res, 429, { ok: false, error: 'Too many requests. Please try again shortly.' });
    const auth = checkAdmin(providedSecret(req, url, null), ip, { allowLocalIfUnset: false });
    if (!auth.ok) return sendJson(res, auth.code, { ok: false, error: auth.error });
    const w = stats();
    const inv = listInviteStats();
    const fb = feedbackStats();
    const an = analyticsStats();
    return sendJson(res, 200, {
      ok: true,
      waitlist: { total: w.total, byRole: w.byRole, latestCreatedAt: w.latestCreatedAt },
      invites: { withCode: inv.withCode, invited: inv.invited, redeemed: inv.redeemed, latestRedeemedAt: inv.latestRedeemedAt },
      feedback: { total: fb.total, byCategory: fb.byCategory, latestCreatedAt: fb.latestCreatedAt },
      analytics: { total: an.total, byEventName: an.byEventName, latestCreatedAt: an.latestCreatedAt },
    });
  }

  if (pathname.startsWith('/api/')) return sendJson(res, 404, { ok: false, error: 'Not found.' });

  if (req.method === 'GET' || req.method === 'HEAD') return serveStatic(res, pathname);
  res.writeHead(405, { 'Content-Type': 'text/plain' });
  res.end('Method not allowed');
});

server.listen(PORT, () => {
  console.log(`NEVA backend server → http://localhost:${PORT}`);
  console.log('  waitlist : POST /api/waitlist · GET /api/waitlist/stats');
  console.log('  invite   : POST /api/invite/generate · POST /api/invite/redeem · GET /api/invite/status');
  console.log('  feedback : POST /api/feedback   analytics: POST /api/analytics/event');
  console.log(`  admin    : GET /api/admin/summary  (${ADMIN_SECRET ? 'secret set' : 'NEVA_ADMIN_SECRET not set → 503'})`);
});
