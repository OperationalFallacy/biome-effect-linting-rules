import { Effect } from "effect";

/**
 * Correctly composes acquisition transformations in a pipeline and supplies
 * the completed acquisition effect with its matching release callback.
 */
export const acquireSession = Effect.fn("acquireSession")(() =>
  Effect.acquireRelease(
    Effect.sync(() => new AbortController()).pipe(
      Effect.map((controller) => ({ controller })),
    ),
    (session) => Effect.sync(() => session.controller.abort()),
  ),
);
