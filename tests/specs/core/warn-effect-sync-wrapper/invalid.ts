import { Effect } from "effect";

interface CounterStore {
  readonly update: () => Effect.Effect<number>;
}

/**
 * The update incorrectly sits inside Effect.sync even though it already
 * returns an Effect. The outer callback constructs the update as its result,
 * adding an unexecuted Effect instead of performing the increment.
 */
export const increment = Effect.fn("increment")((store: CounterStore) =>
  // Effect.sync incorrectly returns store.update's Effect without running it.
  Effect.sync(() => store.update()),
);
