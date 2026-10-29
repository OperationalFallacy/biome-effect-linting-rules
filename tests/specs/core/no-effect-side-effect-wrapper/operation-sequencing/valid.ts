import { Effect } from "effect";

interface StateActions {
  readonly invalidate: (keys: ReadonlyArray<string>) => Effect.Effect<void>;
  readonly next: Effect.Effect<string>;
  readonly setState: (state: { readonly ready: boolean }) => void;
  readonly setReady: Effect.Effect<void>;
  readonly load: Effect.Effect<ReadonlyArray<string>>;
  readonly publish: Effect.Effect<void>;
  readonly invalidateCatalog: Effect.Effect<void>;
}

/**
 * Correctly uses tap for logging that preserves an existing success value.
 */
export const report = Effect.fn("report")((message: string) =>
  Effect.succeed(message).pipe(Effect.tap((value) => Effect.logInfo(value))),
);
export const savedCount = Effect.fn("savedCount")((count: number) =>
  Effect.succeed(count).pipe(
    Effect.tap((value) => Effect.logInfo("Saved count", value)),
  ),
);

/**
 * Correctly sequences the dependent operation after invalidation in a pipeline.
 */
export const continueAfterInvalidate = Effect.fn("continueAfterInvalidate")(
  ({ invalidate, next }: StateActions) =>
    invalidate(["catalog"]).pipe(Effect.andThen(() => next)),
);

/**
 * Correctly defers the native update and sequences the following Effect after it.
 */
export const markReady = Effect.fn("markReady")(
  ({ setState, setReady }: StateActions) =>
    Effect.sync(() => setState({ ready: true })).pipe(
      Effect.andThen(() => setReady),
    ),
);

/**
 * Correctly composes named operations whose identities already describe their work.
 */
export const invalidateAfterLoad = Effect.fn("invalidateAfterLoad")(
  ({ load, invalidateCatalog }: StateActions) =>
    Effect.andThen(load, invalidateCatalog),
);

/**
 * Correctly sequences state publication and invalidation in one pipeline.
 */
export const publishLoaded = Effect.fn("publishLoaded")(
  ({ load, publish, invalidateCatalog }: StateActions) =>
    load.pipe(
      Effect.andThen(() => publish),
      Effect.andThen(() => invalidateCatalog),
    ),
);
