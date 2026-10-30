import { Effect, Match } from "effect";

/**
 * Effect.sync evaluates the projection each time the returned Effect runs.
 * Match supplies plain numbers to the array callback, so the elements remain
 * values rather than Effects that would need another traversal to execute.
 */
export const clamp = Effect.fn("clamp")((values: ReadonlyArray<number>) =>
  Effect.sync(() => values.map((value) => Match.value(value).pipe(
    Match.when((number) => number < 0, () => 0),
    Match.orElse((number) => number),
  ))),
);
