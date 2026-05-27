/**
 * NEVA Network — backend smoke check (Phase 8). Run with `pnpm backend:check`.
 * Loads every store module, runs its aggregate function, and reports config — no server needed.
 * Prints aggregate counts only (no emails / messages / personal data). Useful before a deploy.
 */
import { stats, listInviteStats } from '../server/waitlist-store.mjs';
import { feedbackStats } from '../server/feedback-store.mjs';
import { analyticsStats } from '../server/analytics-store.mjs';

const w = stats();
const inv = listInviteStats();
const fb = feedbackStats();
const an = analyticsStats();

console.log('NEVA NETWORK · BACKEND CHECK');
console.log('────────────────────────────────');
console.log(`waitlist total : ${w.total}`);
console.log(`invites        : withCode ${inv.withCode} · invited ${inv.invited} · redeemed ${inv.redeemed}`);
console.log(`feedback total : ${fb.total}`);
console.log(`analytics total: ${an.total}`);
console.log(`admin secret   : ${process.env.NEVA_ADMIN_SECRET ? 'set' : 'NOT set (admin summary → 503; local invite-gen allowed)'}`);
console.log(`openai key     : ${process.env.OPENAI_API_KEY ? 'set' : 'NOT set (NEVA Core → offline fallback)'}`);
console.log('stores OK ✓');
