import { Effect, Ref } from "effect";

/**
 * The delivery workflow incorrectly puts the log and state update in a result
 * collection, then uses concurrency: 1 to impose their order. The array hides
 * the fact that these are successive actions whose results are discarded.
 */
export const markDelivered = Effect.fn("markDelivered")(function* (
  delivered: Ref.Ref<boolean>,
  recipient: string,
) {
  // The array incorrectly collects unused log and delivery-update results.
  yield* Effect.all(
    [
      Effect.logInfo(`Parcel delivered to ${recipient}`),
      Ref.set(delivered, true),
    ],
    { concurrency: 1 },
  );
  return yield* Ref.get(delivered);
});
