import { Effect } from "effect";

/**
 * Match invokes only the selected branch callback and returns its value. Use
 * that result as the input to later transformations in the value pipeline.
 */
export function selectLabel(enabled: boolean) {
  if (enabled) {
    return "Enabled";
  }
  return "Disabled";
}

/**
 * Use Effect.when to compose the condition with the log. An Effect-valued
 * condition keeps any reads or failures in the same execution as the selected
 * work.
 */
export const logWhenEnabled = Effect.fn("logWhenEnabled")(function* (
  enabled: boolean,
) {
  if (enabled) {
    yield* Effect.logInfo("Enabled");
  }
});
