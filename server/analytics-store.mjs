/**
 * NEVA Network — privacy-safe analytics event capture (Phase 8). Zero-dependency Node module
 * backed by data/analytics.json. Pure server-side. Captures coarse gameplay events only — NEVER
 * emails or personal data. Event names are allow-listed; metadata is sanitized + capped. No
 * database, no Web3, no auth.
 */
import { randomUUID } from 'node:crypto';
import { createJsonStore, clampIntOrNull } from './json-store.mjs';

const store = createJsonStore('analytics.json');
export const ANALYTICS_PATH = store.STORE_PATH;

/** Allow-listed event names (anything else is rejected). */
export const ANALYTICS_EVENTS = [
  'game_started',
  'mission_started',
  'mission_completed',
  'trace_locked',
  'invite_redeemed',
  'profile_created',
  'landing_waitlist_joined',
  'ai_hint_used',
];

const MAX_SECTOR = 40;
const MAX_CALLSIGN = 80;
const MAX_META_KEYS = 12;
const MAX_META_STR = 200;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Sanitize a metadata object: drop nested values, cap key/value sizes and key count, and refuse
 * anything email-shaped (privacy). Returns null when there's nothing safe to keep.
 */
function sanitizeMeta(meta) {
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return null;
  const out = {};
  let count = 0;
  for (const [k, v] of Object.entries(meta)) {
    if (count >= MAX_META_KEYS) break;
    const key = String(k).slice(0, 40);
    if (key.toLowerCase().includes('email')) continue; // never store emails
    if (v === null) { out[key] = null; count++; continue; }
    if (typeof v === 'number' && Number.isFinite(v)) { out[key] = v; count++; continue; }
    if (typeof v === 'boolean') { out[key] = v; count++; continue; }
    if (typeof v === 'string') {
      const s = v.trim();
      if (EMAIL_RE.test(s)) continue; // drop email-like values
      out[key] = s.slice(0, MAX_META_STR);
      count++;
    }
    // objects / arrays / functions are skipped
  }
  return Object.keys(out).length ? out : null;
}

/**
 * Record one analytics event. Returns { ok: true } | { ok: false, error }.
 */
export function addEvent(input = {}) {
  const eventName = String(input.eventName ?? '').trim();
  if (!ANALYTICS_EVENTS.includes(eventName)) {
    return { ok: false, error: 'Unknown event name.' };
  }
  const now = new Date().toISOString();
  const entry = {
    id: randomUUID(),
    createdAt: now,
    eventName,
    missionId: clampIntOrNull(input.missionId, 0, 99),
    depth: clampIntOrNull(input.depth, 0, 99),
    sector: String(input.sector ?? '').trim().slice(0, MAX_SECTOR) || null,
    callsign: String(input.callsign ?? '').trim().slice(0, MAX_CALLSIGN) || null, // no emails
    clientTimestamp: typeof input.timestamp === 'string' ? input.timestamp.slice(0, 40) : null,
    metadata: sanitizeMeta(input.metadata),
  };
  const all = store.readAll();
  all.push(entry);
  store.writeAll(all);
  return { ok: true };
}

/** Aggregate analytics stats only — never exposes personal data. */
export function analyticsStats() {
  const all = store.readAll();
  const byEventName = {};
  const byMission = {};
  let latestCreatedAt = null;
  for (const e of all) {
    if (!e) continue;
    byEventName[e.eventName] = (byEventName[e.eventName] ?? 0) + 1;
    if (e.missionId != null) {
      const key = `M${String(e.missionId).padStart(2, '0')}`;
      byMission[key] = (byMission[key] ?? 0) + 1;
    }
    if (!latestCreatedAt || e.createdAt > latestCreatedAt) latestCreatedAt = e.createdAt;
  }
  return { total: all.length, byEventName, byMission, latestCreatedAt };
}
