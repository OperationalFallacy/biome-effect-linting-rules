import { Effect, Match } from "effect";

/**
 * Correctly expresses pure value selection with Match. The selected value
 * can continue through a pipeline without separate return paths.
 */
export const selectLabel = (enabled: boolean) =>
  Match.value(enabled).pipe(
    Match.when(true, () => "Enabled"),
    Match.orElse(() => "Disabled"),
  );

/**
 * Correctly keeps a conditional yield inside a named Effect operation.
 * The decision runs when the operation executes.
 */
export const logWhenEnabled = Effect.fn("logWhenEnabled")(function* (
  enabled: boolean,
) {
  if (enabled) {
    yield* Effect.logInfo("Enabled");
  }
});
