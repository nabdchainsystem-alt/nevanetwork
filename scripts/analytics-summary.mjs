/**
 * NEVA Network — local analytics summary (Phase 8). Run with `pnpm analytics:summary`.
 * Prints aggregate counts only (privacy-safe; no emails / personal data). Reads the same store
 * the server writes.
 */
import { analyticsStats, ANALYTICS_PATH, ANALYTICS_EVENTS } from '../server/analytics-store.mjs';

const s = analyticsStats();
console.log('NEVA NETWORK · ANALYTICS SUMMARY');
console.log('────────────────────────────────');
console.log(`store         : ${ANALYTICS_PATH}`);
console.log(`total events  : ${s.total}`);
console.log('by event name :');
for (const e of ANALYTICS_EVENTS) console.log(`  ${e.padEnd(24)} ${s.byEventName[e] ?? 0}`);
console.log('by mission    :');
const missions = Object.keys(s.byMission).sort();
if (missions.length === 0) console.log('  —');
for (const m of missions) console.log(`  ${m.padEnd(24)} ${s.byMission[m]}`);
console.log(`latest event  : ${s.latestCreatedAt ?? '—'}`);
