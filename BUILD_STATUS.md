# NEVA Network — Six-Month Grid Build Status

> **THE LIVE PROGRESS TRACKER.** Read BEFORE starting any /goal. Update AFTER any /goal completes.
> This file is the contract between sessions. Never trust a ☑ that has no signature.

---

## Phase completion

| Phase | Title | Status | Signed by | Date | Commit | Tests passing |
|---|---|---|---|---|---|---|
| **0** | Foundation (vitest, wallet, seasons, event store, HUD) | ☐ Not started | — | — | — | 0 |
| **1** | Season 0 launch (Operator, 8 puzzle engines, 4 factions, TP-S0) | ☐ Not started | — | — | — | 0 |
| **2** | Season 1 (Corsair class, ICE subsystem, Black Market, TP-S1) | ☐ Not started | — | — | — | 0 |
| **3** | Season 2 (Ghost class, Coherence, bonds, TP-S2 The Mirror) — **6+ month target** | ☐ Not started | — | — | — | 0 |
| **4** | Season 3 (Architect class, bastion editor, async raids, Witness Node) — **saga complete** | ☐ Not started | — | — | — | 0 |
| 5 | Sandbox AI faction layer (stretch) | ☐ Outline only | — | — | — | — |
| 6 | Token activation (Sharia + legal gated) | ☐ Outline only | — | — | — | — |

**Latest /goal in progress:** none

---

## Rules of engagement — for any Claude reading this file

### Before starting a /goal

1. **Read this file.** Confirm the requested phase's prerequisites are all ☑.
2. **If the user asks for Phase N and Phase N-1 is ☐:** REFUSE. Explain why. Offer to run the missing prior phase instead.
3. **Verify the repo is clean:** `git status`, `pnpm build`, `pnpm test:run`. All should be green.
4. **Re-read the relevant plan file** at `docs/superpowers/plans/2026-05-28-six-month-grid-phase-N.md`.

### After completing a /goal

5. **Verify EVERY "Done when" gate passes.** Don't sign off on partial work.
6. **Replace ☐ with ☑** in the table above.
7. **Fill in the signature row:**
   - **Signed by**: your Claude model ID (e.g., `claude-opus-4-7`).
   - **Date**: today's ISO date (e.g., `2026-06-15`).
   - **Commit**: the short hash of the final phase-completion commit.
   - **Tests passing**: the actual `pnpm test:run` count.
8. **Append a line to the "Notes log" section below** — what was learned, what was hard, what to playtest.
9. **Commit this file** with message `docs: mark Phase N complete (signed)`.

### If asked to roll back

10. Set the phase back to ☐ and clear the signature row with dashes.
11. `git revert` the affected commits.
12. Append a roll-back entry to the Notes log explaining why.

### Never

- **Never ☑ a phase you didn't fully complete.** Partial = ☐.
- **Never edit prior signatures.** History is append-only here.
- **Never skip prerequisite phases.** Phase 3 requires Phase 2 ☑, which requires Phase 1 ☑, which requires Phase 0 ☑.

---

## Verifiable signatures

Each ☑ is independently verifiable WITHOUT trusting this file:

| Phase | Phase-marker file (must exist) | Test floor | Confirmation command |
|---|---|---|---|
| 0 | `src/wallet.ts` | ≥ 25 | `pnpm test:run 2>&1 \| tail -3` |
| 1 | `src/puzzles/caesar.ts` | ≥ 60 | `pnpm test:run 2>&1 \| tail -3` |
| 2 | `src/classes/corsair/index.ts` | ≥ 85 | `pnpm test:run 2>&1 \| tail -3` |
| 3 | `src/ghostGraph/index.ts` | ≥ 105 | `pnpm test:run 2>&1 \| tail -3` |
| 4 | `src/baseBuilder/bastion.ts` | ≥ 130 | `pnpm test:run 2>&1 \| tail -3` |

**If a phase shows ☑ but the marker file doesn't exist or tests don't pass, distrust the signature.** Reset to ☐ and investigate via `git log`.

---

## Quick status check (paste-able prompt for fresh sessions)

If you're a Claude that just opened this repo and don't know where things stand, run this:

```
Read BUILD_STATUS.md. Then verify the marker files exist and tests pass.
Report:
  - Which phases are genuinely complete (signatures + markers + tests align).
  - Which phases claim ☑ but fail verification (distrust those).
  - What the next /goal should be.
  - Anything blocking next steps.
Keep the report under 200 words.
```

---

## Notes log (append-only)

Each phase appends one entry after completing. Format:

```
### YYYY-MM-DD — Phase N
- What got done in one sentence.
- Anything surprising / what to playtest.
- Blocked on: (or "nothing").
```

---

(no entries yet — first phase pending)
