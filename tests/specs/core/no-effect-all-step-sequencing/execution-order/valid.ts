import { Effect, Ref } from "effect";

/**
 * Correctly sequences effects in an Effect.fn generator body, where yield*
 * expresses their execution order directly.
 */
export const markDelivered = Effect.fn("markDelivered")(function* (
  delivered: Ref.Ref<boolean>,
  recipient: string,
) {
  yield* Effect.logInfo(`Parcel delivered to ${recipient}`);
  yield* Ref.set(delivered, true);
  return yield* Ref.get(delivered);
});
