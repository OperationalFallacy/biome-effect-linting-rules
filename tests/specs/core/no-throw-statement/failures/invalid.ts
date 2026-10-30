import { Effect } from "effect";

/**
 * Effect.sync treats a thrown exception as a defect. Use Effect.fail when
 * callers are expected to recover from the rejection through the typed error
 * channel.
 */
export const reject = Effect.sync(() => { throw new Error("Rejected"); });
