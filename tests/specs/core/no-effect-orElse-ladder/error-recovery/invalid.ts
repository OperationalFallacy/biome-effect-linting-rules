import { Effect, pipe } from "effect";

const outerRecoveryValue = Effect.catch(
  Effect.succeed(1).pipe(Effect.flatMap((n) => Effect.succeed(n + 1))),
  () => Effect.succeed(0),
);

const pipelineRecoveryValue = Effect.succeed(1).pipe(
  Effect.flatMap((n) => Effect.succeed(n + 1)),
  Effect.catch(() => Effect.succeed(0)),
);
