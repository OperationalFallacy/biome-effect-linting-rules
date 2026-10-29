import { Deferred, Effect } from "effect";

interface BackgroundWork {
  readonly run: Effect.Effect<void>;
  readonly stopRequested: Deferred.Deferred<void>;
}

/**
 * Correctly attaches background work to the operation's scope. The scoped
 * function transform closes that scope after shutdown or interruption.
 */
export const observe = Effect.fn("observe")(function* (work: BackgroundWork) {
  yield* Effect.forkScoped(work.run);
  yield* Deferred.await(work.stopRequested);
}, Effect.scoped);

/**
 * Correctly uses a runtime runner at an application integration entry point.
 * The caller receives the fiber and manages its lifetime.
 */
export const startApplication = (work: BackgroundWork) =>
  Effect.runFork(work.run);
