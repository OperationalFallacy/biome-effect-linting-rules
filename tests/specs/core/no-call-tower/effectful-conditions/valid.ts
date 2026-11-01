import { Effect } from "effect";

/**
 * Correctly exposes a reusable logging effect for conditional operations.
 */
export const reportReady = Effect.logInfo("Ready");

/**
 * Correctly supplies an effectful condition to Effect.when. The condition reads
 * mutable state when the operation runs, not when the operation is constructed.
 */
export const reportWhenReady = Effect.fn("reportWhenReady")(
  (state: { ready: boolean }) =>
    reportReady.pipe(Effect.when(Effect.sync(() => state.ready))),
);

/**
 * Correctly supplies an Effect-valued condition in data-first Effect.when.
 */
export const reportWhenReadyDirect = Effect.fn("reportWhenReadyDirect")(
  (state: { ready: boolean }) =>
    Effect.when(
      reportReady,
      Effect.sync(() => state.ready),
    ),
);

/**
 * Correctly lifts an immutable condition into the Effect accepted by Effect.when.
 */
export const reportWhenEnabled = Effect.fn("reportWhenEnabled")(
  (enabled: boolean) => reportReady.pipe(Effect.when(Effect.succeed(enabled))),
);

/**
 * Correctly supplies both effects inline to data-first Effect.when.
 * This form is supported directly by Effect v4.
 */
export const reportWhenEnabledDirect = Effect.fn("reportWhenEnabledDirect")(
  (enabled: boolean) =>
    Effect.when(Effect.logInfo("Ready"), Effect.succeed(enabled)),
);

/**
 * Correctly composes a state read and its transformation in a pipeline.
 * Effect.when evaluates the condition before it runs that pipeline.
 */
export const readWhenReady = Effect.fn("readWhenReady")(
  (state: { ready: boolean; message: string }) =>
    Effect.sync(() => state.message).pipe(
      Effect.map((message) => message.trim()),
      Effect.when(Effect.sync(() => state.ready)),
    ),
);
