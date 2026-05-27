/**
 * NEVA Network — waitlist storage + validation (Phase 7). Zero-dependency Node module: a small
 * JSON file at data/waitlist.json is the store. Pure server-side — never bundled into the client
 * (only imported by server/index.mjs and scripts/). No database, no Web3, no auth, no payments.
 *
 * Early-access foundation: each entry carries status/invited/inviteCode so Phase 8 can layer
 * accounts + invite codes on top without a data migration. We only keep email + optional callsign
 * + role — no sensitive personal data.
 */
import { randomUUID, randomInt } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = join(ROOT, 'data');
export const STORE_PATH = join(DATA_DIR, 'waitlist.json');

/** Allowed waitlist roles (anything else normalizes to 'Other'). */
export const ROLES = ['Player', 'Builder', 'Investor', 'Community', 'Other'];
/** Allowed entry statuses (early-access lifecycle). */
export const STATUSES = ['new', 'reviewed', 'invited', 'blocked'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL = 254;
const MAX_NAME = 80;
const MAX_SOURCE = 60;

function ensureStore() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(STORE_PATH)) writeFileSync(STORE_PATH, '[]\n', 'utf8');
}

function readAll() {
  ensureStore();
  try {
    const arr = JSON.parse(readFileSync(STORE_PATH, 'utf8'));
    return Array.isArray(arr) ? arr : [];
  } catch {
    // corrupt file → back it up so nothing is lost, then start a fresh store
    try {
      renameSync(STORE_PATH, join(DATA_DIR, `waitlist.${Date.now()}.backup.json`));
    } catch {
      /* ignore — best-effort backup */
    }
    writeFileSync(STORE_PATH, '[]\n', 'utf8');
    return [];
  }
}

function writeAll(arr) {
  ensureStore();
  const tmp = `${STORE_PATH}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(arr, null, 2)}\n`, 'utf8');
  renameSync(tmp, STORE_PATH); // near-atomic replace so a crash can't truncate the store
}

/**
 * Add a waitlist entry. Returns one of:
 *   { ok: true, message, entryId }              — stored
 *   { ok: true, duplicate: true, message }       — email already present
 *   { ok: false, error }                         — validation failed
 */
export function addEntry(input = {}) {
  const email = String(input.email ?? '').trim().toLowerCase();
  if (!email || email.length > MAX_EMAIL || !EMAIL_RE.test(email)) {
    return { ok: false, error: 'Valid email is required.' };
  }
  const callsign = String(input.callsign ?? input.name ?? '').trim().slice(0, MAX_NAME);
  let role = String(input.role ?? 'Player').trim();
  if (!ROLES.includes(role)) role = 'Other';
  const source = String(input.source ?? 'landing').trim().slice(0, MAX_SOURCE) || 'landing';

  const all = readAll();
  if (all.some((e) => e && e.email === email)) {
    return { ok: true, duplicate: true, message: 'You are already on the waitlist.' };
  }

  const now = new Date().toISOString();
  const entry = {
    id: randomUUID(),
    email,
    callsign,
    role,
    source,
    status: 'new', // new | reviewed | invited | blocked
    invited: false, // early-access foundation — Phase 8 wires invite codes
    inviteCode: null,
    notes: '',
    createdAt: now,
    updatedAt: now,
  };
  all.push(entry);
  writeAll(all);
  return { ok: true, message: 'You are on the waitlist.', entryId: entry.id };
}

/** Aggregate stats only — never exposes emails. */
export function stats() {
  const all = readAll();
  const byRole = {};
  let latestCreatedAt = null;
  for (const e of all) {
    if (!e) continue;
    byRole[e.role] = (byRole[e.role] ?? 0) + 1;
    if (!latestCreatedAt || e.createdAt > latestCreatedAt) latestCreatedAt = e.createdAt;
  }
  return { total: all.length, byRole, latestCreatedAt };
}

// ===================== Phase 8 — invite codes (early-access gating) =====================
// Invite codes belong to ONE waitlist entry, are stored in waitlist.json, and can be redeemed
// once. No emails are ever returned by the invite helpers — only aggregate / per-code status.
// No accounts, no passwords, no sessions, no payments. Redemption just flips an early-access flag.

// Unambiguous code charset (no I, L, O, U, 0, 1) so codes are easy to read/type aloud.
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTVWXYZ23456789';

function randomGroup(n) {
  let s = '';
  for (let i = 0; i < n; i++) s += CODE_CHARS[randomInt(CODE_CHARS.length)];
  return s;
}

/** A fresh readable code in NEVA-XXXX-XXXX form (not yet checked for uniqueness). */
function rawCode() {
  return `NEVA-${randomGroup(4)}-${randomGroup(4)}`;
}

/** Normalize a user-supplied code (uppercase, trimmed). */
export function normalizeInviteCode(code) {
  return String(code ?? '').trim().toUpperCase();
}

/** Generate a code that is unique against the current store. */
export function generateInviteCode() {
  const used = new Set(readAll().map((e) => e?.inviteCode).filter(Boolean));
  let code = rawCode();
  for (let tries = 0; used.has(code) && tries < 50; tries++) code = rawCode();
  return code;
}

function findEntryIndex(all, { email, entryId }) {
  const id = entryId != null ? String(entryId) : '';
  const mail = String(email ?? '').trim().toLowerCase();
  return all.findIndex((e) => e && ((id && e.id === id) || (mail && e.email === mail)));
}

/**
 * Assign an invite code to an existing waitlist entry (by entryId or email). Idempotent — if the
 * entry already has a code, it is returned unchanged. Marks the entry invited. Never returns email.
 *   { ok: true, entryId, inviteCode, existed? } | { ok: false, error }
 */
export function assignInviteCodeToEntry({ email, entryId } = {}) {
  const all = readAll();
  const idx = findEntryIndex(all, { email, entryId });
  if (idx < 0) return { ok: false, error: 'Waitlist entry not found.' };
  const entry = all[idx];
  if (entry.inviteCode) {
    return { ok: true, entryId: entry.id, inviteCode: entry.inviteCode, existed: true };
  }
  const used = new Set(all.map((e) => e?.inviteCode).filter(Boolean));
  let code = rawCode();
  for (let tries = 0; used.has(code) && tries < 50; tries++) code = rawCode();
  const now = new Date().toISOString();
  entry.inviteCode = code;
  entry.invited = true;
  entry.status = 'invited';
  if (entry.redeemed === undefined) entry.redeemed = false;
  entry.updatedAt = now;
  all[idx] = entry;
  writeAll(all);
  return { ok: true, entryId: entry.id, inviteCode: code };
}

/** Public, email-free status for a code. Returns null if the code is unknown. */
export function getInviteByCode(code) {
  const norm = normalizeInviteCode(code);
  if (!norm) return null;
  const entry = readAll().find((e) => e?.inviteCode && e.inviteCode === norm);
  if (!entry) return null;
  return {
    entryId: entry.id,
    inviteCode: entry.inviteCode,
    valid: true,
    redeemed: !!entry.redeemed,
    redeemedAt: entry.redeemedAt ?? null,
    accessStatus: entry.accessStatus ?? (entry.redeemed ? 'early_access' : null),
  };
}

/**
 * Redeem a code once. Records redeemed/redeemedAt/redeemedByCallsign + accessStatus 'early_access'.
 *   { ok: true, accessStatus, message } | { ok: false, error, message }
 */
export function redeemInviteCode(code, { callsign, profileId } = {}) {
  const norm = normalizeInviteCode(code);
  if (!norm) return { ok: false, error: 'INVALID', message: 'Invalid or used code.' };
  const all = readAll();
  const idx = all.findIndex((e) => e?.inviteCode === norm);
  if (idx < 0) return { ok: false, error: 'INVALID', message: 'Invalid or used code.' };
  const entry = all[idx];
  if (entry.redeemed) return { ok: false, error: 'ALREADY_REDEEMED', message: 'This code has already been used.' };
  const cs = String(callsign ?? '').trim().slice(0, MAX_NAME);
  const now = new Date().toISOString();
  entry.redeemed = true;
  entry.redeemedAt = now;
  entry.redeemedByCallsign = cs || null;
  if (profileId) entry.redeemedByProfileId = String(profileId).slice(0, 80);
  entry.accessStatus = 'early_access';
  entry.status = 'invited';
  entry.updatedAt = now;
  all[idx] = entry;
  writeAll(all);
  return { ok: true, accessStatus: 'early_access', message: 'Early access unlocked.' };
}

/** Aggregate invite stats only — never exposes emails or codes. */
export function listInviteStats() {
  const all = readAll();
  let invited = 0;
  let withCode = 0;
  let redeemed = 0;
  let latestRedeemedAt = null;
  for (const e of all) {
    if (!e) continue;
    if (e.inviteCode) withCode++;
    if (e.invited) invited++;
    if (e.redeemed) {
      redeemed++;
      if (!latestRedeemedAt || (e.redeemedAt ?? '') > latestRedeemedAt) latestRedeemedAt = e.redeemedAt ?? null;
    }
  }
  return { total: all.length, invited, withCode, redeemed, latestRedeemedAt };
}
