import { Atom, AsyncResult } from "effect/reactivity";
import { Array, Data, Match } from "effect";

type Book = { readonly isbn: string; readonly title: string };
type Catalog = { readonly isbns: readonly string[] };
type ReadingList = { readonly books: readonly Book[] };

declare const bookAtom: (isbn: string) => Atom.Atom<AsyncResult.AsyncResult<Book>>;
declare const catalogAtom: Atom.Atom<AsyncResult.AsyncResult<Catalog>>;

const availableBooks = (catalog: Catalog, get: Atom.AtomContext): readonly Book[] =>
  Array.flatMap(catalog.isbns, (isbn) =>
    AsyncResult.match(get(bookAtom(isbn)), {
      onInitial: () => [],
      onFailure: () => [],
      onSuccess: ({ value }) => [value],
    }),
  );

export const readingListAtom = Atom.make((get) =>
  AsyncResult.map(get(catalogAtom), (catalog): ReadingList => ({
    books: availableBooks(catalog, get),
  })),
);

class CatalogError extends Data.TaggedError("CatalogError")<{
  readonly section: string;
  readonly cause: unknown;
}> {}

export const catalogError = (section: string) => (cause: unknown): CatalogError =>
  Match.value(cause).pipe(
    Match.when(
      (error: unknown): error is CatalogError => error instanceof CatalogError,
      (error) => error,
    ),
    Match.orElse((error) => new CatalogError({ section, cause: error })),
  );
