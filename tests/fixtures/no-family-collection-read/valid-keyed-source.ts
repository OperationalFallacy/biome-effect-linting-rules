import { Atom } from "effect/reactivity";

const booksByKeyAtom = Atom.make<Readonly<Record<string, string>>>({});
const bookIndexAtom = Atom.make<Readonly<Record<string, string>>>({});

export const bookAtom = Atom.family((isbn: string) =>
  Atom.make((get) => get(booksByKeyAtom)[isbn] ?? get.get(bookIndexAtom)[isbn]),
);
