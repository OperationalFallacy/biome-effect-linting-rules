import { Effect } from "effect";

/**
 * selectLabel returns "Enabled" when enabled is true and "Disabled" otherwise.
 * The if statement separates the alternatives across returns. The preset
 * requires one Match expression for conditional value selection.
 */
export function selectLabel(enabled: boolean) {
  // It incorrectly uses an if statement for value selection.
  if (enabled) {
    return "Enabled";
  }
  return "Disabled";
}

/**
 * logWhenEnabled logs "Enabled" once when enabled is true and skips it otherwise.
 * The if statement keeps the condition outside the log Effect. The preset
 * requires Effect.when so optional work carries its execution condition.
 */
export const logWhenEnabled = Effect.fn("logWhenEnabled")(function* (
  enabled: boolean,
) {
  // It incorrectly uses an if statement for optional Effect work.
  if (enabled) {
    yield* Effect.logInfo("Enabled");
  }
});
