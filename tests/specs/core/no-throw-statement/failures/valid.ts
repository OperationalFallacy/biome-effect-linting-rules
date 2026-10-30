import { Effect } from "effect";

/**
 * Effect.fail declares the rejection in the operation's error type.
 * Effect.catch can then recover from it with another Effect.
 */
export const reject = Effect.fail(new Error("Rejected"));
