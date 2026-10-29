import { Effect, Ref } from "effect";

/**
 * Misuses Effect.all by grouping sequential operations into an array,
 * then enforcing their order with a concurrency limit.
 */
export const markDelivered = Effect.fn("markDelivered")(function* (
  delivered: Ref.Ref<boolean>,
  recipient: string,
) {
  yield* Effect.all(
    [
      Effect.logInfo(`Parcel delivered to ${recipient}`),
      Ref.set(delivered, true),
    ],
    { concurrency: 1 },
  );
  return yield* Ref.get(delivered);
});
