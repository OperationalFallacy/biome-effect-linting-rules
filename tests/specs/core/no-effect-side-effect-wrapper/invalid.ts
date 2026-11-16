import { Effect } from "effect";

interface StateActions {
  readonly invalidate: (keys: ReadonlyArray<string>) => Effect.Effect<void>;
  readonly next: Effect.Effect<string>;
  readonly setState: (state: { readonly ready: boolean }) => void;
  readonly setReady: Effect.Effect<void>;
}

/**
 * continueAfterInvalidate invalidates the catalog before it runs next.
 * A failed invalidation must prevent next from running. The data-first
 * Effect.andThen nests invalidation in its arguments; the preset requires
 * invalidation to start the pipeline so both actions appear in execution order.
 */
export const continueAfterInvalidate = Effect.fn("continueAfterInvalidate")(
  ({ invalidate, next }: StateActions) =>
    // It incorrectly nests invalidation inside Effect.andThen.
    Effect.andThen(invalidate(["catalog"]), next),
);

/**
 * markReady defers the native ready update until its Effect runs, then runs
 * setReady. Effect.andThen nests the deferred update in its arguments.
 * The preset requires that update to start the pipeline so the two actions
 * appear in execution order.
 */
export const markReady = Effect.fn("markReady")(
  ({ setState, setReady }: StateActions) =>
    // It incorrectly nests the deferred update inside Effect.andThen.
    Effect.andThen(
      Effect.sync(() => setState({ ready: true })),
      setReady,
    ),
);
