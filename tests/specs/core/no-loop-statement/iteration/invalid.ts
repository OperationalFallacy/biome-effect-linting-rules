import { Effect } from "effect";

/**
 * Effect.forEach sequences write Effects in input order by default and stops
 * at the first failure. Preserve both properties when you compose this
 * traversal, since a later write may depend on an earlier one.
 */
export const writeAll = Effect.fn("writeAll")((values: ReadonlyArray<number>, write: (value: number) => Effect.Effect<void, Error>) =>
  Effect.gen(function* () {
    for (const value of values) { yield* write(value); }
  }),
);
