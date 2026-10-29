import { Effect } from "effect";

const unboundedLifetimeValue = Effect.never;

const resourceLifetimeValue = Effect.acquireUseRelease(
  Effect.succeed(1),
  (n) => Effect.succeed(n),
  () => Effect.void,
);
