import { Effect, Option } from "effect";
import { Atom } from "effect/reactivity";

type Book = { readonly isbn: string; readonly title: string };
export const bookResultsAtom = Atom.make<ReadonlyArray<Book>>([]);
export const visibleBookListAtom = Atom.make<ReadonlyArray<Book>>([]);
export const booksCollectionAtom = Atom.make<ReadonlyArray<Book>>([]);

/**
 * Incorrectly makes an item query depend on all search results. A list update
 * invalidates the item query even when the requested book has not changed.
 */
export const effectBookAtom = Atom.family((isbn: string) =>
  Atom.make(
    Effect.gen(function* () {
      const books = yield* Atom.get(bookResultsAtom);
      return Option.fromNullishOr(books.find((book) => book.isbn === isbn));
    }),
  ),
);

/**
 * Incorrectly reads the visible list from each item projection. The dependency
 * belongs to the list view and couples item reads to its visibility policy.
 */
export const contextBookAtom = Atom.family((isbn: string) =>
  Atom.make((get) =>
    Option.fromNullishOr(
      get.get(visibleBookListAtom).find((book) => book.isbn === isbn),
    ),
  ),
);

/**
 * Incorrectly reads the entire collection from each keyed family member.
 */
export const directBookAtom = Atom.family((isbn: string) =>
  Atom.make((get) =>
    Option.fromNullishOr(
      get(booksCollectionAtom).find((book) => book.isbn === isbn),
    ),
  ),
);

/**
 * Correctly reads a collection for a list-level count projection.
 */
export const bookCountAtom = Atom.make((get) => get(bookResultsAtom).length);
