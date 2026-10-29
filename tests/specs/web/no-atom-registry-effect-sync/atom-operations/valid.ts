import { Effect } from "effect";
import { Atom, AtomRegistry } from "effect/reactivity";

export const counter = Atom.make(0);

/**
 * Correctly exposes direct Atom operations. Executing each Effect performs
 * its read, state change, or refresh through the required registry service.
 */
export const readCount = Atom.get(counter);
export const setCount = Atom.set(counter, 1);
export const increment = Atom.update(counter, (count) => count + 1);
export const takeAndIncrement = Atom.modify(counter, (count) => [
  count,
  count + 1,
]);
export const refresh = Atom.refresh(counter);

/**
 * Correctly defers synchronous registry instance methods and exposes disposal
 * for the registry that the factory owns.
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
 * Correctly creates an owned atom in a deferred factory and returns its reader.
 */
export const makeReader = Effect.sync(() => {
  const localCounter = Atom.make(0);
  return () => Atom.get(localCounter);
});
