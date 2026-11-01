import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { Atom } from "effect/reactivity";

export const countAtom = Atom.make(0);

/**
 * Correctly subscribes to the canonical count through an atom. Functional
 * updates use the current value, and other subscribers observe the same state.
 */
export function Count() {
  const count = useAtomValue(countAtom);
  const setCount = useAtomSet(countAtom);
  return (
    <button type="button" onClick={() => setCount((current) => current + 1)}>
      {count}
    </button>
  );
}
