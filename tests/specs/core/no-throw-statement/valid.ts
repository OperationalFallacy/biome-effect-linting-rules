import { Effect } from "effect";

/**
 * The rejection correctly uses Effect.fail for an expected error. The failure
 * is part of the operation's error channel, where callers can compose their
 * recovery without handling a defect.
 */
// Effect.fail correctly exposes the expected rejection to the caller's recovery.
export const reject = Effect.fail(new Error("Rejected"));

/**
 * handled correctly recovers the expected rejection with Effect.catch.
 * The expected failure reaches ordinary recovery, which returns an explicit
 * rejection outcome for the caller.
 */
export const handled = reject.pipe(
  // This recovery correctly receives the expected rejection failure.
  Effect.catch(() => Effect.succeed({ rejected: true })),
);
