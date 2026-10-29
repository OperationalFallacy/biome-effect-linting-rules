import { Effect } from "effect";

const observe = Effect.acquireRelease(openSubscription, closeSubscription).pipe(
  Effect.flatMap((subscription) => subscription.read),
  Effect.scoped,
);
