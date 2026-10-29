import { Effect } from "effect";

/**
 * Questionably uses a ternary for a value-pipeline decision. Match expresses
 * the alternatives through the same composition style as subsequent steps.
 */
export const selectLabel = (enabled: boolean) =>
  enabled ? "Enabled" : "Disabled";

/**
 * Correctly defers a decision inside Effect.suspend. The condition is read
 * each time the effect executes.
 */
export const readDeferredLabel = (state: { enabled: boolean }) =>
  Effect.suspend(() => Effect.succeed(state.enabled ? "Enabled" : "Disabled"));
