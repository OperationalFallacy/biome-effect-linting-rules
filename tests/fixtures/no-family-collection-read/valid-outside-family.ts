import { Atom } from "effect/reactivity";

const booksCollectionAtom = Atom.make<readonly string[]>([]);

export const bookCountAtom = Atom.make((get) => get(booksCollectionAtom).length);
