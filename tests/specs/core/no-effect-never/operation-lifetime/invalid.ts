import { Deferred, Effect } from "effect";

interface Subscription {
  readonly stopRequested: Deferred.Deferred<void>;
  readonly close: Effect.Effect<void>;
}

interface SubscriptionSource {
  readonly open: Effect.Effect<Subscription>;
}

/**
 * Incorrectly keeps an acquired subscription alive with Effect.never.
 * The subscription's own stop signal has no role in the operation's lifetime.
 */
export const observe = Effect.fn("observe")((source: SubscriptionSource) =>
  Effect.acquireUseRelease(
    source.open,
    () => Effect.never,
    (subscription) => subscription.close,
  ),
);
