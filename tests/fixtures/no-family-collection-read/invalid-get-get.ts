import { Atom } from "effect/reactivity";

const VisibleBooksAtom = Atom.make<readonly string[]>([]);

export const bookAtom = Atom.family((isbn: string) =>
  Atom.make((get) => get.get(VisibleBooksAtom).find((book) => book === isbn)),
);
