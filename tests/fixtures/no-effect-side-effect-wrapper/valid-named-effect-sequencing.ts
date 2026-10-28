import { Effect } from "effect";

declare const loadState: Effect.Effect<readonly string[]>;
declare const publishState: Effect.Effect<void>;
declare const invalidateCatalog: Effect.Effect<void>;

export const namedEffectSequence = Effect.andThen(loadState, invalidateCatalog);

export const continuousTap = loadState.pipe(
  Effect.tap(() => publishState),
  Effect.andThen(invalidateCatalog),
);
