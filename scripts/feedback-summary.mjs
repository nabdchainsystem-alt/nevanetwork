/**
 * NEVA Network — local feedback summary (Phase 8). Run with `pnpm feedback:summary`.
 * Prints aggregate counts only (no message bodies). Reads the same store the server writes.
 */
import { feedbackStats, FEEDBACK_PATH, FEEDBACK_CATEGORIES } from '../server/feedback-store.mjs';

const s = feedbackStats();
console.log('NEVA NETWORK · FEEDBACK SUMMARY');
console.log('────────────────────────────────');
console.log(`store        : ${FEEDBACK_PATH}`);
console.log(`total        : ${s.total}`);
console.log('by category  :');
for (const c of FEEDBACK_CATEGORIES) console.log(`  ${c.padEnd(12)} ${s.byCategory[c] ?? 0}`);
console.log(`latest entry : ${s.latestCreatedAt ?? '—'}`);
