/**
 * NEVA Network — feedback storage + validation (Phase 8). Zero-dependency Node module backed by
 * data/feedback.json. Pure server-side. No emails are collected here — only an optional callsign,
 * a category, a capped message, and a little game context. No database, no Web3, no auth.
 */
import { randomUUID } from 'node:crypto';
import { createJsonStore, clampIntOrNull } from './json-store.mjs';

const store = createJsonStore('feedback.json');
export const FEEDBACK_PATH = store.STORE_PATH;

/** Allowed feedback categories (anything else is rejected). */
export const FEEDBACK_CATEGORIES = ['bug', 'balance', 'ui', 'mission', 'performance', 'idea', 'other'];

const MAX_MESSAGE = 2000;
const MAX_CALLSIGN = 80;
const MAX_SOURCE = 160;

/**
 * Add a feedback entry. Returns:
 *   { ok: true, feedbackId, message } | { ok: false, error }
 */
export function addFeedback(input = {}) {
  const category = String(input.category ?? '').trim().toLowerCase();
  if (!FEEDBACK_CATEGORIES.includes(category)) {
    return { ok: false, error: `Category must be one of: ${FEEDBACK_CATEGORIES.join(', ')}.` };
  }
  const message = String(input.message ?? '').trim().slice(0, MAX_MESSAGE);
  if (!message) return { ok: false, error: 'A feedback message is required.' };

  const callsign = String(input.callsign ?? '').trim().slice(0, MAX_CALLSIGN) || null;
  const source = String(input.source ?? input.userAgent ?? '').trim().slice(0, MAX_SOURCE) || null;
  const now = new Date().toISOString();
  const entry = {
    id: randomUUID(),
    createdAt: now,
    category,
    message,
    callsign,
    missionId: clampIntOrNull(input.missionId, 0, 99),
    trace: clampIntOrNull(input.trace, 0, 100),
    depth: clampIntOrNull(input.depth, 0, 99),
    source,
  };
  const all = store.readAll();
  all.push(entry);
  store.writeAll(all);
  return { ok: true, feedbackId: entry.id, message: 'Feedback received. Thank you.' };
}

/** Aggregate feedback stats only — never exposes message bodies. */
export function feedbackStats() {
  const all = store.readAll();
  const byCategory = {};
  let latestCreatedAt = null;
  for (const e of all) {
    if (!e) continue;
    byCategory[e.category] = (byCategory[e.category] ?? 0) + 1;
    if (!latestCreatedAt || e.createdAt > latestCreatedAt) latestCreatedAt = e.createdAt;
  }
  return { total: all.length, byCategory, latestCreatedAt };
}
