/**
 * Phase 8 — local-only early-access flag, set after an invite code is redeemed on the landing page.
 *
 * This is DELIBERATELY separate from both the game save (`save.ts` / `GameState`) and the Player
 * Profile (`profile.ts`): redeeming a code must never touch missions, resources, trace, the reducer,
 * or the profile. It is a read-only signal only — it does NOT gate the game (the alpha is open to
 * everyone). It's preparation for a later accounts phase (server-issued accounts / login).
 */
export const EARLY_ACCESS_KEY = 'neva:earlyaccess:v1';

export interface EarlyAccess {
  earlyAccess: true;
  code: string;
  callsign: string | null;
  redeemedAt: string; // ISO timestamp (local)
}

export function loadEarlyAccess(): EarlyAccess | null {
  try {
    const raw = localStorage.getItem(EARLY_ACCESS_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<EarlyAccess>;
    return v && v.earlyAccess === true && typeof v.code === 'string' ? (v as EarlyAccess) : null;
  } catch {
    return null;
  }
}

export function saveEarlyAccess(ea: EarlyAccess): void {
  try {
    localStorage.setItem(EARLY_ACCESS_KEY, JSON.stringify(ea));
  } catch {
    /* storage unavailable — non-fatal; the redeem still succeeded server-side */
  }
}

export function clearEarlyAccess(): void {
  try {
    localStorage.removeItem(EARLY_ACCESS_KEY);
  } catch {
    /* ignore */
  }
}
