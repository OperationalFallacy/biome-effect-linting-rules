import { Effect } from "effect";

const observe = Effect.gen(function* () {
  const fiber = yield* Effect.forkScoped(observeUpdates);
  yield* awaitShutdown;
  return fiber;
}).pipe(Effect.scoped);
