import { Atom } from "effect/reactivity";

export const counter = Atom.make(0);

/**
 * The counter API reads the count, sets it to 1, increments it, returns the old
 * count during an increment, and requests a refresh. Each exported value is
 * the Atom operation itself, so its Effect performs the requested work and
 * returns that operation's result when the caller runs it.
 */
// It correctly exposes Atom.get directly.
export const readCount = Atom.get(counter);

// It correctly exposes Atom.set directly.
export const setCount = Atom.set(counter, 1);

// It correctly exposes Atom.update directly.
export const increment = Atom.update(counter, (count) => count + 1);

// It correctly exposes Atom.modify directly.
export const takeAndIncrement = Atom.modify(counter, (count) => [
  count,
  count + 1,
]);

// It correctly exposes Atom.refresh directly.
export const refresh = Atom.refresh(counter);
