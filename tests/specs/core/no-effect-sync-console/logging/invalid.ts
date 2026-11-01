import { Effect } from "effect";

/**
 * Misuses Effect.sync as a logging adapter. The wrapped console call
 * bypasses Effect's logger configuration and minimum log level.
 */
export const announceDelivery = Effect.fn("announceDelivery")(function* (
  recipient: string,
) {
  yield* Effect.sync(() => console.info(`Parcel delivered to ${recipient}`));
  return recipient;
});
