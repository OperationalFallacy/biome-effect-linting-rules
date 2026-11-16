import { Context, Deferred, Effect } from "effect";

interface BackgroundWork {
  readonly run: Effect.Effect<void>;
  readonly stopRequested: Deferred.Deferred<void>;
}

/**
 * observe runs background work until stopRequested completes. Its scope closes
 * at that point and interrupts the child, so the background work cannot outlive
 * the observer. Interruption of the observer closes the same scope.
 */
export const observe = Effect.fn("observe")(function* (work: BackgroundWork) {
  // It correctly attaches the background work to the observer's scope.
  yield* Effect.forkScoped(work.run);
  yield* Deferred.await(work.stopRequested);
}, Effect.scoped);

/**
 * startApplication starts work at the external integration entry point and
 * returns its fiber. The external caller controls cancellation and cleanup.
 */
export const startApplication = (work: BackgroundWork) =>
  // It correctly returns the startup fiber to its external caller.
  Effect.runFork(work.run);

export class BackgroundWorker extends Context.Service<
  BackgroundWorker,
  BackgroundWork
>()("example/BackgroundWorker") {}

/**
 * prepareApplicationStart resolves the worker service and returns a callback
 * for an external host to start it later. The operation does not launch work.
 * The host owns the fiber returned when it invokes that startup callback.
 */
export const prepareApplicationStart = Effect.fn("prepareApplicationStart")(
  function* () {
    const worker = yield* BackgroundWorker;

    // It correctly returns a startup callback without launching its work.
    return () => Effect.runFork(worker.run);
  },
);
