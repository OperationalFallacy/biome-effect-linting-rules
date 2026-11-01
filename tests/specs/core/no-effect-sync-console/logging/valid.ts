import { Effect } from "effect";

/**
 * Correctly uses Effect's logging API so logger configuration and minimum
 * log level apply to the operation's output.
 */
export const announceDelivery = Effect.fn("announceDelivery")(function* (
  recipient: string,
) {
  yield* Effect.logInfo(`Parcel delivered to ${recipient}`);
  return recipient;
});
