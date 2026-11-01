import { Effect } from "effect";

interface CounterSource {
  readOnce(listener: (value: number) => void): () => void;
}

/**
 * Correctly bridges a one-shot callback with Effect.callback. The returned
 * cleanup Effect cancels the pending native read on interruption.
 */
export const nextCount = (source: CounterSource) =>
  Effect.callback<number>((resume) => {
    const cancel = source.readOnce((value) => resume(Effect.succeed(value)));
    return Effect.sync(cancel);
  });

export const nextCountGeneric = nextCount;
