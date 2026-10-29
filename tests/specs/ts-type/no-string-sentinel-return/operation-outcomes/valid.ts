import { Data, Effect, Match } from "effect";

class Ready extends Data.TaggedClass("Ready")<{ readonly count: number }> {}
class Empty extends Data.TaggedClass("Empty") {}

/**
 * Correctly returns a tagged domain outcome with its associated data.
 * The caller can distinguish an empty result from a completed count explicitly.
 */
export const summarize = Effect.fn("summarize")(
  (rows: ReadonlyArray<unknown>) => {
    const outcome = Match.value(rows.length).pipe(
      Match.when(0, () => new Empty()),
      Match.orElse((count) => new Ready({ count })),
    );
    return Effect.succeed(outcome);
  },
);
