/**
 * NEVA Network — local waitlist summary (Phase 7). Run with `pnpm waitlist:count`.
 * Prints aggregate counts only (no emails). Reads the same store the server writes.
 */
import { stats, STORE_PATH, ROLES } from '../server/waitlist-store.mjs';

const s = stats();
console.log('NEVA NETWORK · WAITLIST SUMMARY');
console.log('────────────────────────────────');
console.log(`store        : ${STORE_PATH}`);
console.log(`total        : ${s.total}`);
console.log('by role      :');
for (const role of ROLES) console.log(`  ${role.padEnd(10)} ${s.byRole[role] ?? 0}`);
console.log(`latest entry : ${s.latestCreatedAt ?? '—'}`);
