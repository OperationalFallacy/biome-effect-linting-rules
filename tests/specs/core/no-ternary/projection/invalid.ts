import { Effect } from "effect";

/**
 * Use Match for the per-element decision and keep Effect.sync around the whole
 * projection. Each execution then recomputes the array without constructing an
 * Effect for every element.
 */
export const clamp = Effect.fn("clamp")((values: ReadonlyArray<number>) =>
  Effect.sync(() => values.map((value) => value < 0 ? 0 : value)),
);
