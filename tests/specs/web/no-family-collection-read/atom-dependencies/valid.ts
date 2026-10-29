import { Option } from "effect";
import { Atom } from "effect/reactivity";

type Book = { readonly isbn: string; readonly title: string };
export const bookSourceAtom = Atom.family((_isbn: string) =>
  Atom.make(Option.none<Book>()),
);
export const bookResultsAtom = Atom.make<ReadonlyArray<Book>>([]);

/**
 * Correctly reads a per-key source from each item projection. Updating one
 * source leaves unrelated item atoms independent of list changes.
 */
export const effectBookAtom = Atom.family((isbn: string) =>
  Atom.make(Atom.get(bookSourceAtom(isbn))),
);
export const contextBookAtom = Atom.family((isbn: string) =>
  Atom.make((get) => get.get(bookSourceAtom(isbn))),
);
export const directBookAtom = Atom.family((isbn: string) =>
  Atom.make((get) => get(bookSourceAtom(isbn))),
);

/**
 * Correctly keeps collection reads in the list-level count projection.
 */
export const bookCountAtom = Atom.make((get) => get(bookResultsAtom).length);
