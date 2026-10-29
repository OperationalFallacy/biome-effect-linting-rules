import { Effect } from "effect";
import { Atom, AtomRegistry } from "effect/reactivity";

export const counter = Atom.make(0);

/**
 * Incorrectly wraps an atom read in sync. The wrapper succeeds with the
 * unexecuted read Effect instead of reading the current count.
 */
export const readCount = Effect.sync(() => Atom.get(counter));
export const readCountBlock = Effect.sync(() => {
  return Atom.get(counter);
});

/**
 * Incorrectly returns a write Effect from sync. The counter is never changed.
 */
export const setCount = Effect.sync(() => Atom.set(counter, 1));
export const setCountBlock = Effect.sync(() => {
  return Atom.set(counter, 1);
});

/**
 * Incorrectly returns an update Effect from sync. The increment remains unexecuted.
 */
export const increment = Effect.sync(() =>
  Atom.update(counter, (count) => count + 1),
);
export const incrementBlock = Effect.sync(() => {
  return Atom.update(counter, (count) => count + 1);
});

/**
 * Incorrectly returns a modification Effect from sync. Neither its returned
 * count nor its new state is produced by executing the wrapper.
 */
export const takeAndIncrement = Effect.sync(() =>
  Atom.modify(counter, (count) => [count, count + 1]),
);
export const takeAndIncrementBlock = Effect.sync(() => {
  return Atom.modify(counter, (count) => [count, count + 1]);
});

/**
 * Incorrectly returns a refresh Effect from sync. Refreshing remains deferred
 * inside the wrapper's success value.
 */
export const refresh = Effect.sync(() => Atom.refresh(counter));
export const refreshBlock = Effect.sync(() => {
  return Atom.refresh(counter);
});

/**
 * Correctly defers synchronous registry instance methods. The factory owns
 * the registry and exposes disposal alongside its operations.
 */
export const makeRegistryOperations = () => {
  const registry = AtomRegistry.make();
  return {
    read: Effect.sync(() => registry.get(counter)),
    write: Effect.sync(() => {
      registry.set(counter, 1);
    }),
    dispose: () => registry.dispose(),
  };
};

/**
 * Correctly creates an owned atom in a deferred factory. The returned function
 * constructs a read operation when its caller requests one.
 */
export const makeReader = Effect.sync(() => {
  const localCounter = Atom.make(0);
  return () => Atom.get(localCounter);
});
