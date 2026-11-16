import { Effect } from "effect";

/**
 * The rejection incorrectly throws from Effect.sync. That makes the expected
 * rejection a defect instead of a typed failure that callers can handle with
 * Effect recovery.
 */
export const reject = Effect.sync(() => {
  // throw incorrectly turns this expected rejection into a defect outside ordinary recovery.
  throw new Error("Rejected");
});

/**
 * handled cannot recover the expected rejection because reject incorrectly
 * throws it as a defect. Effect.catch never receives that error to select the
 * rejection outcome.
 */
export const handled = reject.pipe(
  // The throw incorrectly bypasses this caller's ordinary error recovery.
  Effect.catch(() => Effect.succeed({ rejected: true })),
);
