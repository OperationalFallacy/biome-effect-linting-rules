import { Effect, Match } from "effect";

/**
 * Correctly expresses value-pipeline alternatives with Match. The selection
 * is an expression that can continue into later transformations.
 */
export const selectLabel = (enabled: boolean) =>
  Match.value(enabled).pipe(
    Match.when(true, () => "Enabled"),
    Match.orElse(() => "Disabled"),
  );

/**
 * Correctly defers a decision inside Effect.suspend. The condition is read
 * each time the effect executes.
 */
export const readDeferredLabel = (state: { enabled: boolean }) =>
  Effect.suspend(() => Effect.succeed(state.enabled ? "Enabled" : "Disabled"));
