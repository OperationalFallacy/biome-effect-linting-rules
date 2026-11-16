import { Effect } from "effect";

interface StateActions {
  readonly invalidate: (keys: ReadonlyArray<string>) => Effect.Effect<void>;
  readonly next: Effect.Effect<string>;
  readonly setState: (state: { readonly ready: boolean }) => void;
  readonly setReady: Effect.Effect<void>;
}

/**
 * continueAfterInvalidate invalidates the catalog before it runs next.
 * The pipeline starts with invalidation, as the preset requires, and runs
 * next only after invalidation succeeds.
 */
export const continueAfterInvalidate = Effect.fn("continueAfterInvalidate")(
  ({ invalidate, next }: StateActions) =>
    // It correctly starts the pipeline with invalidation.
    invalidate(["catalog"]).pipe(Effect.andThen(() => next)),
);

/**
 * markReady defers the native ready update until its Effect runs, then runs
 * setReady. The deferred update starts the pipeline, as the preset requires,
 * and setReady follows it as the next step.
 */
export const markReady = Effect.fn("markReady")(
  ({ setState, setReady }: StateActions) =>
    // It correctly starts the pipeline with the deferred update.
    Effect.sync(() => setState({ ready: true })).pipe(
      Effect.andThen(() => setReady),
    ),
);
