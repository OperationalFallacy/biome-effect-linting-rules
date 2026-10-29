import { Effect, Match } from "effect";

/**
 * Incorrectly models optional work as a Match branch returning Effect.void.
 * This turns the decision to skip work into an empty branch operation.
 */
export const saveWhenEnabled = Effect.fn("saveWhenEnabled")(
  (enabled: boolean) =>
    Match.value(enabled).pipe(
      Match.when(false, () => Effect.void),
      Match.orElse(() => Effect.logInfo("Saved settings")),
    ),
);
