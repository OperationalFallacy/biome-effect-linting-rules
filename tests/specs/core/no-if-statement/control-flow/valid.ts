import { Effect, Match } from "effect";

/**
 * Match invokes only the selected branch callback. Each branch returns the
 * label that subsequent transformations will receive.
 */
export const selectLabel = (enabled: boolean) =>
  Match.value(enabled).pipe(
    Match.when(true, () => "Enabled"),
    Match.orElse(() => "Disabled"),
  );

/**
 * Effect.when returns None when its condition succeeds with false. A failed
 * condition remains a failure, so callers can distinguish a skipped log from a
 * failed condition.
 */
export const logWhenEnabled = Effect.fn("logWhenEnabled")(function* (
  enabled: boolean,
) {
  yield* Effect.logInfo("Enabled").pipe(Effect.when(Effect.succeed(enabled)));
});
