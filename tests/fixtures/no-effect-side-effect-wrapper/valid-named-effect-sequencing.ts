import { Effect } from "effect";

declare const loadState: Effect.Effect<readonly string[]>;
declare const publishState: Effect.Effect<void>;
declare const invalidateQuotes: Effect.Effect<void>;

export const namedEffectSequence = Effect.andThen(loadState, invalidateQuotes);

export const continuousTap = loadState.pipe(
  Effect.tap(() => publishState),
  Effect.andThen(invalidateQuotes),
);
