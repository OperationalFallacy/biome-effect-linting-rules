import { open } from "node:fs/promises";
import { Effect } from "effect";

/**
 * Correctly supplies acquisition and release to Effect.acquireRelease.
 * The acquired resource remains attached to the caller's scope.
 */
export const acquireController = Effect.fn("acquireController")(() =>
  Effect.acquireRelease(
    Effect.sync(() => new AbortController()),
    (controller) => Effect.sync(() => controller.abort()),
  ),
);

/**
 * Correctly closes a scoped acquisition with Effect.scoped around a generator.
 * Only the observed state leaves the scope, not the resource itself.
 */
export const isControllerActive = Effect.scoped(
  Effect.gen(function* () {
    const controller = yield* acquireController();
    return !controller.signal.aborted;
  }),
);

/**
 * Correctly brackets file reading with Effect.acquireUseRelease.
 * The operation returns the text and closes the handle on success or failure.
 */
export const readTextFile = Effect.fn("readTextFile")((file: string) =>
  Effect.acquireUseRelease(
    Effect.tryPromise(() => open(file, "r")),
    (handle) => Effect.tryPromise(() => handle.readFile("utf8")),
    (handle) => Effect.tryPromise(() => handle.close()),
  ),
);
