import { Data, Effect, Match, Option } from "effect";

type Frame =
  | { readonly _tag: "Acknowledged"; readonly id: string }
  | { readonly _tag: "Data"; readonly id: string; readonly body: string }
  | { readonly _tag: "Completed"; readonly id: string };

interface Subscription {
  readonly acknowledge: Effect.Effect<void, Error>;
}

class SubscriptionEnded extends Data.TaggedError("SubscriptionEnded")<{
  readonly id: string;
}> {}

/**
 * The readFrame function returns data for the requested subscription.
 * An acknowledgment updates its status before the operation returns. A
 * completion fails the operation so the caller can start recovery.
 */
export const readFrame = Effect.fn("readFrame")(function* (
  frame: Frame,
  subscriptionId: string,
  subscription: Subscription,
) {
  yield* Effect.fail(new SubscriptionEnded({ id: subscriptionId })).pipe(
    Effect.when(
      Effect.succeed(frame._tag === "Completed" && frame.id === subscriptionId),
    ),
  );
  yield* subscription.acknowledge.pipe(
    Effect.when(
      Effect.succeed(
        frame._tag === "Acknowledged" && frame.id === subscriptionId,
      ),
    ),
  );
  return Match.value(frame).pipe(
    Match.when({ _tag: "Data", id: subscriptionId }, (data) =>
      Option.some(data.body),
    ),
    Match.orElse(() => Option.none()),
  );
});
