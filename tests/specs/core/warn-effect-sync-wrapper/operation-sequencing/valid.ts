import { Effect } from "effect";

interface CounterStore {
  readonly update: () => Effect.Effect<number>;
}

/**
 * Correctly exposes the store's update as the operation's Effect.
 * Execution performs the update and returns its success value.
 */
export const increment = Effect.fn("increment")((store: CounterStore) =>
  store.update(),
);
