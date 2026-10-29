import { Effect } from "effect";

interface CounterSource {
  readOnce(listener: (value: number) => void): () => void;
}

interface ResumeCount {
  (value: Effect.Effect<number>): void;
}

/**
 * Incorrectly uses the obsolete Effect.async constructor for a callback bridge.
 * The one-shot source supplies a cancellation function for interrupted reads.
 */
export const nextCount = (source: CounterSource) =>
  Effect.async((resume: ResumeCount) => {
    const cancel = source.readOnce((value) => resume(Effect.succeed(value)));
    return Effect.sync(cancel);
  });

export const nextCountGeneric = (source: CounterSource) =>
  Effect.async<number>((resume: ResumeCount) => {
    const cancel = source.readOnce((value) => resume(Effect.succeed(value)));
    return Effect.sync(cancel);
  });
