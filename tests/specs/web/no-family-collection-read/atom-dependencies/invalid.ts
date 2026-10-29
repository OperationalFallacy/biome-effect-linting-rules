import { Effect } from "effect";
import { Atom } from "effect/reactivity";

const bookResultsAtom = Atom.make<readonly string[]>([]);

const atomGetBookAtom = Atom.family((isbn: string) =>
  Atom.make(
    Effect.gen(function* () {
      const books = yield* Atom.get(bookResultsAtom);
      return books.find((book) => book === isbn);
    }),
  ),
);

const VisibleBooksAtom = Atom.make<readonly string[]>([]);

const getGetBookAtom = Atom.family((isbn: string) =>
  Atom.make((get) => get.get(VisibleBooksAtom).find((book) => book === isbn)),
);

const getBooksCollectionAtom = Atom.make<readonly string[]>([]);

const getBookAtom = Atom.family((isbn: string) =>
  Atom.make((get) => get(getBooksCollectionAtom).find((book) => book === isbn)),
);

const booksByKeyAtom = Atom.make<Readonly<Record<string, string>>>({});
const bookIndexAtom = Atom.make<Readonly<Record<string, string>>>({});

const keyedSourceBookAtom = Atom.family((isbn: string) =>
  Atom.make((get) => get(booksByKeyAtom)[isbn] ?? get.get(bookIndexAtom)[isbn]),
);

const outsideFamilyBooksCollectionAtom = Atom.make<readonly string[]>([]);

const bookCountAtom = Atom.make((get) => get(outsideFamilyBooksCollectionAtom).length);
