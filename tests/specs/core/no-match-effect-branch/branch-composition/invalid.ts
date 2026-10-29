import { Effect, Match } from "effect";

/**
 * Incorrectly builds branch-specific Effect pipelines for a pure selection.
 * Each branch introduces another operation around a value transformation.
 */
export const chooseLabel = Effect.fn("chooseLabel")((ready: boolean) =>
  Match.value(ready).pipe(
    Match.when(true, () =>
      Effect.succeed(" Ready ").pipe(Effect.map((label) => label.trim())),
    ),
    Match.orElse(() => Effect.succeed("Loading")),
  ),
);
