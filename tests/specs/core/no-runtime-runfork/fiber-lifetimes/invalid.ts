import { Effect } from "effect";

const detachedOperationValue = Effect.gen(function* () {
  return Effect.runFork(Effect.void);
});

const applicationRunnerValue = Effect.runFork(Effect.void);
