import { Effect, pipe } from "effect";

declare const invalidate: (key: readonly string[]) => Effect.Effect<void>;
declare const setReady: Effect.Effect<void>;
declare const nextStep: Effect.Effect<string>;

const invalidAsWrapper = Effect.as(
  Effect.sync(() => {
    console.info("ready");
  }),
  "ready",
);

const invalidAndThenWrapper = Effect.andThen(invalidate(["books"]), nextStep);

const invalidNestedSetStateWrapper = Effect.andThen(
  Effect.sync(() => {
    setState({ ready: true });
  }),
  setReady,
);

declare function setState(value: { readonly ready: boolean }): void;

const logResultReplacementValue = Effect.as(Effect.log("saved"), 1);

const explicitContinuationValue = Effect.log("saved").pipe(Effect.andThen(() => Effect.succeed(1)));

declare const loadState: Effect.Effect<readonly string[]>;
declare const publishState: Effect.Effect<void>;
declare const invalidateCatalog: Effect.Effect<void>;

const namedEffectSequence = Effect.andThen(loadState, invalidateCatalog);

/** Correctly sequences state publication and invalidation with Effect.andThen. */
const continuousSequence = loadState.pipe(
  Effect.andThen(() => publishState),
  Effect.andThen(invalidateCatalog),
);
