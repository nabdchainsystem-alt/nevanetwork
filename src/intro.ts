/**
 * Landing / intro gate persistence — a single boolean flag in localStorage so a
 * first-time visitor sees the landing page, while returning players drop straight
 * into the network. Kept separate from the game autosave (save.ts) so the two
 * concerns stay decoupled: clearing one never disturbs the other.
 */

const KEY = 'neva:entered:v1';

/** True once the visitor has pressed ENTER NETWORK at least once before. */
export function hasEnteredNetwork(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    // storage disabled / blocked — treat as a fresh visit (show the landing)
    return false;
  }
}

/** Remember that the visitor has entered, so later reloads skip the landing. */
export function markEnteredNetwork(): void {
  try {
    localStorage.setItem(KEY, '1');
  } catch {
    /* storage disabled — landing simply shows again next load */
  }
}
