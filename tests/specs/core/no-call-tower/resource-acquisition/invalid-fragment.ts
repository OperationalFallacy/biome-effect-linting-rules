import { Effect } from "effect";

/**
 * Incorrectly nests Effect.map around an acquisition step. The acquisition's
 * dependent transformations need their own pipeline in execution order.
 */
export const acquireSession = Effect.fn("acquireSession")(() =>
  Effect.acquireRelease(
    Effect.map(
      Effect.sync(() => new AbortController()),
      (controller) => ({ controller }),
    ),
    (session) => Effect.sync(() => session.controller.abort()),
  ),
);
