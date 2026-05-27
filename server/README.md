# NEVA Network — Backend (Phase 8 Foundation)

Zero-dependency Node backend (stdlib only). One process serves the API and, in production, the
built `dist/`. **No accounts, login, sessions, passwords, email sending, database, or any
Web3/wallet/token/presale/payment logic** — this is an early-access foundation only.

## Run

```bash
# Dev: run the API alongside Vite (Vite proxies /api → :8787, see vite.config.ts)
pnpm server        # terminal A  (http://localhost:8787)
pnpm dev           # terminal B  (http://localhost:5173)

# Production: build once, then the server also serves the site
pnpm build
pnpm server        # serves dist/ + /api on :8787
```

`pnpm server` auto-loads `.env` if present (`node --env-file-if-exists=.env`).

### Local summaries / smoke check (no server needed)

```bash
pnpm waitlist:count      # waitlist totals (no emails)
pnpm feedback:summary    # feedback totals by category
pnpm analytics:summary   # analytics totals by event / mission
pnpm backend:check       # load every store + report config (admin/openai set?)
```

## Environment (server-side only — never `VITE_`)

Copy `.env.example` → `.env`.

| Var | Purpose |
|-----|---------|
| `NEVA_ADMIN_SECRET` | Gate for `POST /api/invite/generate` + `GET /api/admin/summary`. **Unset →** admin summary returns `503` and invite-generate is allowed **only from localhost** (dev). Set a long random value before any non-local deploy. |
| `OPENAI_API_KEY` | Enables NEVA Core hints (else offline deterministic fallback). |
| `OPENAI_MODEL` | Optional, default `gpt-4o-mini`. |
| `OPENAI_TIMEOUT_MS` | Optional, default `9000`. |
| `PORT` | Optional, default `8787`. |

## Endpoints

| Method · Path | Auth | Returns |
|---|---|---|
| `POST /api/waitlist` | — | `{ ok, message, entryId }` / `{ ok, duplicate }` / `{ ok:false, error }` |
| `GET  /api/waitlist/stats` | — | `{ total, byRole, latestCreatedAt }` (no emails) |
| `POST /api/ai/neva-core` | — | advisory hint (server-side OpenAI; key never leaves server) |
| `POST /api/invite/generate` | **admin** | `{ ok, entryId, inviteCode }` — assign a code to an existing entry (by `email` or `entryId`) |
| `POST /api/invite/redeem` | — | `{ ok, accessStatus, message, profileAccess:{earlyAccess:true} }` — redeem once |
| `GET  /api/invite/status?code=…` | — | `{ ok, valid, redeemed, accessStatus }` (no private data) |
| `POST /api/feedback` | — | `{ ok, feedbackId, message }` |
| `POST /api/analytics/event` | — | `{ ok }` (privacy-safe; emails stripped) |
| `GET  /api/admin/summary` | **admin** | aggregate counts only (waitlist/invites/feedback/analytics) |

Admin secret is read from `x-neva-admin-secret` header, `?secret=` query, or `adminSecret` body field.

### Invite codes
Readable `NEVA-XXXX-XXXX` (charset excludes `I L O U 0 1`). One code ↔ one waitlist entry,
redeemable once. Redemption records `redeemed`, `redeemedAt`, `redeemedByCallsign`,
`accessStatus: "early_access"`. No emails are returned by any invite endpoint.

## Storage (JSON files under `data/`, all git-ignored)

- `data/waitlist.json` — waitlist entries **+ invite-code fields** (`inviteCode`, `invited`, `redeemed`, …).
- `data/feedback.json` — feedback (`category`, capped `message`, optional `callsign`/mission context).
- `data/analytics.json` — coarse events (allow-listed `eventName`, sanitized `metadata`, **no emails**).

Writes are near-atomic (`.tmp` → rename); a corrupt file is backed up (`*.backup.json`) rather than lost.

## Abuse guards
8 KB body cap (16 KB for feedback), per-IP per-minute rate limits (waitlist 8 · invite-redeem 10 ·
invite-status 30 · feedback 6 · analytics 120 · admin 30), constant-time admin-secret compare.

## Security notes / NOT done yet
- **Aggregate-only public stats** — no emails or raw entries are ever exposed publicly.
- Single-process file store, in-memory rate limit (resets on restart). For a real launch add a DB,
  durable rate limiting, and auth on any new admin surface.
- **Still missing (by design):** real accounts, login, sessions, passwords, email sending/verification,
  remote save, a database, and any token/presale/Web3/payment flow. None of these are built here.
