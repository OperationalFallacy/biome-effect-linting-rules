import { Effect } from "effect";

/**
 * Effect.forEach is sequential by default. Set discard to true when the
 * operation returns void, so the traversal does not collect an unused array
 * of write results.
 */
export const writeAll = Effect.fn("writeAll")((values: ReadonlyArray<number>, write: (value: number) => Effect.Effect<void, Error>) =>
  Effect.forEach(values, write, { discard: true }),
);
