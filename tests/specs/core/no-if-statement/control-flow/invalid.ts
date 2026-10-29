import { Effect } from "effect";

/**
 * Questionably splits a pure value selection across imperative return paths.
 * A Match expression can represent the decision as one composable value.
 */
export function selectLabel(enabled: boolean) {
  if (enabled) {
    return "Enabled";
  }
  return "Disabled";
}

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
