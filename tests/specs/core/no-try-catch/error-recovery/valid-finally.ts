import { Effect } from "effect";

/**
 * Effect.ensuring runs close as a finalizer when use completes or fails. The
 * finalizer also runs if the operation is interrupted.
 */
export const useResource = Effect.fn("useResource")((use: () => number, close: () => void) =>
  Effect.sync(use).pipe(Effect.ensuring(Effect.sync(close))),
);
