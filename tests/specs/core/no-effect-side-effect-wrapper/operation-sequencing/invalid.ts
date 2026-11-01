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
 * Questionably hides result selection in an Effect.as wrapper around logging.
 * The operation returns its input after the observation completes.
 */
export const report = Effect.fn("report")((message: string) =>
  Effect.as(Effect.logInfo(message), message),
);
export const savedCount = Effect.fn("savedCount")((count: number) =>
  Effect.as(Effect.logInfo("Saved count", count), count),
);

/**
 * Incorrectly nests an invalidation inside data-first sequencing arguments.
 * The next operation depends on that invalidation completing first.
 */
export const continueAfterInvalidate = Effect.fn("continueAfterInvalidate")(
  ({ invalidate, next }: StateActions) =>
    Effect.andThen(invalidate(["catalog"]), next),
);

/**
 * Incorrectly hides a native state update inside sequencing arguments.
 * Its order relative to the following Effect belongs in an explicit pipeline.
 */
export const markReady = Effect.fn("markReady")(
  ({ setState, setReady }: StateActions) =>
    Effect.andThen(
      Effect.sync(() => setState({ ready: true })),
      setReady,
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
