import { Deferred, Effect } from "effect";

interface Subscription {
  readonly stopRequested: Deferred.Deferred<void>;
  readonly close: Effect.Effect<void>;
}

interface SubscriptionSource {
  readonly open: Effect.Effect<Subscription>;
}

/**
 * Correctly ties the subscription's lifetime to its stop signal.
 * Acquire/use/release keeps cleanup attached to completion and interruption.
 */
export const observe = Effect.fn("observe")((source: SubscriptionSource) =>
  Effect.acquireUseRelease(
    source.open,
    (subscription) => Deferred.await(subscription.stopRequested),
    (subscription) => subscription.close,
  ),
);
