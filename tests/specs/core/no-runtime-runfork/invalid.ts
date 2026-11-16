import { Deferred, Effect } from "effect";

interface BackgroundWork {
  readonly run: Effect.Effect<void>;
  readonly stopRequested: Deferred.Deferred<void>;
}

/**
 * observe runs background work until stopRequested completes. This runtime
 * launch creates an independent fiber, so the work can continue after the
 * observer finishes. Fork the work in the observer's scope to stop it there.
 */
export const observe = Effect.fn("observe")(function* (work: BackgroundWork) {
  // It incorrectly starts a detached runtime fiber inside the operation.
  Effect.runFork(work.run);
  yield* Deferred.await(work.stopRequested);
});

/**
 * startApplication starts work at the external integration entry point and
 * returns its fiber. The external caller controls cancellation and cleanup.
 */
export const startApplication = (work: BackgroundWork) =>
  // It correctly returns the startup fiber to its external caller.
  Effect.runFork(work.run);
