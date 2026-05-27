/**
 * NEVA Network — tiny shared JSON-array file store (Phase 8). Zero dependencies (Node stdlib
 * only). Used by the feedback + analytics stores; the waitlist store keeps its own copy of this
 * pattern for backwards compatibility. Pure server-side — never bundled into the client.
 *
 * Each store is a single JSON array file under `data/`. Writes are near-atomic (write to `.tmp`
 * then rename) and a corrupt file is backed up rather than lost. No database, no Web3, no auth.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const DATA_DIR = join(ROOT, 'data');

/** Create a JSON-array store backed by `data/<fileName>`. Returns { STORE_PATH, readAll, writeAll }. */
export function createJsonStore(fileName) {
  const STORE_PATH = join(DATA_DIR, fileName);
  const base = fileName.replace(/\.json$/, '');

  function ensure() {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    if (!existsSync(STORE_PATH)) writeFileSync(STORE_PATH, '[]\n', 'utf8');
  }

  function readAll() {
    ensure();
    try {
      const arr = JSON.parse(readFileSync(STORE_PATH, 'utf8'));
      return Array.isArray(arr) ? arr : [];
    } catch {
      // corrupt file → back it up so nothing is lost, then start fresh
      try {
        renameSync(STORE_PATH, join(DATA_DIR, `${base}.${Date.now()}.backup.json`));
      } catch {
        /* ignore — best-effort backup */
      }
      writeFileSync(STORE_PATH, '[]\n', 'utf8');
      return [];
    }
  }

  function writeAll(arr) {
    ensure();
    const tmp = `${STORE_PATH}.tmp`;
    writeFileSync(tmp, `${JSON.stringify(arr, null, 2)}\n`, 'utf8');
    renameSync(tmp, STORE_PATH); // near-atomic replace so a crash can't truncate the store
  }

  return { STORE_PATH, readAll, writeAll };
}

/** Coerce a value to a bounded integer, or null when absent/invalid. */
export function clampIntOrNull(v, min, max) {
  if (v === undefined || v === null || v === '') return null;
  const n = Math.trunc(Number(v));
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, n));
}
