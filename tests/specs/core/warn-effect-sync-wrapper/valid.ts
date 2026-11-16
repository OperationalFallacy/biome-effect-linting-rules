import { Effect } from "effect";

interface CounterStore {
  readonly update: () => Effect.Effect<number>;
}

/**
 * The operation correctly returns the store's update Effect directly.
 * There is no synchronous wrapper that turns the update into an unexecuted
 * success value.
 */
export const increment = Effect.fn("increment")((store: CounterStore) =>
  // Returning store.update directly correctly makes the increment executable.
  store.update(),
);
