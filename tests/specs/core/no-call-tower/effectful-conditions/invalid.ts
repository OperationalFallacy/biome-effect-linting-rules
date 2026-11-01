import { Effect } from "effect";

/**
 * Incorrectly nests Effect.map around a state read. The dependent transformation
 * needs a pipeline even when it supplies an operation to Effect.when.
 */
export const readWhenReady = Effect.fn("readWhenReady")(
  (state: { ready: boolean; message: string }) =>
    Effect.when(
      Effect.map(
        Effect.sync(() => state.message),
        (message) => message.trim(),
      ),
      Effect.sync(() => state.ready),
    ),
);
