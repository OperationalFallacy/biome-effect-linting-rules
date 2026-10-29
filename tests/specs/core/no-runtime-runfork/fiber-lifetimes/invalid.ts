import { Deferred, Effect } from "effect";

interface BackgroundWork {
  readonly run: Effect.Effect<void>;
  readonly stopRequested: Deferred.Deferred<void>;
}

/**
 * Incorrectly starts an independent runtime fiber inside an Effect operation.
 * The child can outlive the operation after its stop signal arrives.
 */
export const observe = Effect.fn("observe")(function* (work: BackgroundWork) {
  Effect.runFork(work.run);
  yield* Deferred.await(work.stopRequested);
});

/**
 * Correctly uses a runtime runner at an application integration entry point.
 * The caller receives the fiber and manages its lifetime.
 */
export const startApplication = (work: BackgroundWork) =>
  Effect.runFork(work.run);
