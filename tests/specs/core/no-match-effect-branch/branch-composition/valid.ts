import { Effect, Match } from "effect";

/**
 * Correctly completes pure value selection before constructing the Effect.
 * The operation has one continuation after the decision.
 */
export const chooseLabel = Effect.fn("chooseLabel")((ready: boolean) => {
  const label = Match.value(ready).pipe(
    Match.when(true, () => " Ready ".trim()),
    Match.orElse(() => "Loading"),
  );
  return Effect.succeed(label);
});
