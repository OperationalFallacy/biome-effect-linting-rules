import { Atom } from "effect/reactivity";

const booksCollectionAtom = Atom.make<readonly string[]>([]);

export const bookAtom = Atom.family((isbn: string) =>
  Atom.make((get) => get(booksCollectionAtom).find((book) => book === isbn)),
);
