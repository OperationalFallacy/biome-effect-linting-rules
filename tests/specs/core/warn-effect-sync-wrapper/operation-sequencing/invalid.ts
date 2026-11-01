import { Effect } from "effect";

interface CounterStore {
  readonly update: () => Effect.Effect<number>;
}

/**
 * Questionably wraps an already-effectful update in Effect.sync. Running the
 * outer effect only constructs the update instead of executing it.
 */
export const increment = Effect.fn("increment")((store: CounterStore) =>
  Effect.sync(() => store.update()),
);
