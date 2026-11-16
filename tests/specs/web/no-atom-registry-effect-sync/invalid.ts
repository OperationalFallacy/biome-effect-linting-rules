import { Atom } from "effect/reactivity";
import { Effect } from "effect";

export const counter = Atom.make(0);

/**
 * The counter API reads the count, sets it to 1, increments it, returns the old
 * count during an increment, and requests a refresh. Each Atom operation
 * already returns an Effect. Effect.sync returns that Effect as a success
 * value, so a caller runs the wrapper without performing the requested work.
 * Compose the Atom Effects directly.
 */
// It incorrectly wraps Atom.get in Effect.sync.
export const readCount = Effect.sync(() => Atom.get(counter));

// It incorrectly wraps Atom.set in Effect.sync.
export const setCount = Effect.sync(() => Atom.set(counter, 1));

// It incorrectly wraps Atom.update in Effect.sync.
export const increment = Effect.sync(() =>
  Atom.update(counter, (count) => count + 1),
);

// It incorrectly wraps Atom.modify in Effect.sync.
export const takeAndIncrement = Effect.sync(() =>
  Atom.modify(counter, (count) => [count, count + 1]),
);

// It incorrectly wraps Atom.refresh in Effect.sync.
export const refresh = Effect.sync(() => Atom.refresh(counter));
