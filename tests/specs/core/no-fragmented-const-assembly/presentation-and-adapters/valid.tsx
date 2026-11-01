import { Array as Arr, Data, Match, Option } from "effect";
import { AsyncResult, Atom } from "effect/reactivity";
import { useAtomSet, useAtomValue } from "@effect/atom-react";

type Book = {
  readonly isbn: string;
  readonly title: string;
  readonly available: boolean;
};
type BookView = {
  readonly label: string;
  readonly note: Option.Option<string>;
};
const bookViews = {
  available: () => ({ label: "Available", note: Option.none<string>() }),
  borrowed: () => ({
    label: "Borrowed",
    note: Option.some("Join the wait list"),
  }),
} satisfies Record<string, () => BookView>;

/**
 * Correctly projects a complete typed view through domain-specific constructors.
 */
export const bookView = (book: Book): BookView =>
  Match.value(book.available).pipe(
    Match.when(true, bookViews.available),
    Match.orElse(bookViews.borrowed),
  );

const reservedAtom = Atom.family((_isbn: string) => Atom.make(false));

/**
 * Correctly keeps complete render expressions and event callbacks together.
 * The selected model supplies the key for the reservation subscription.
 */
export function ReserveBook({
  selectedBook,
  fallbackIsbn,
}: {
  readonly selectedBook: AsyncResult.AsyncResult<Book, Error>;
  readonly fallbackIsbn: string;
}) {
  const isbn = AsyncResult.match(selectedBook, {
    onInitial: () => fallbackIsbn,
    onFailure: () => fallbackIsbn,
    onSuccess: ({ value }) => value.isbn,
  });
  const reserved = useAtomValue(reservedAtom(isbn));
  const setReserved = useAtomSet(reservedAtom(isbn));
  const renderButton = () =>
    Option.match(Option.some(reserved), {
      onNone: () => null,
      onSome: (disabled) => (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setReserved(true)}
        >
          Reserve
        </button>
      ),
    });
  return (
    <section>
      {AsyncResult.match(selectedBook, {
        onInitial: () => "Select a book",
        onFailure: () => "Unavailable",
        onSuccess: ({ value }) => bookView(value).label,
      })}
      {renderButton()}
    </section>
  );
}

type Catalog = { readonly isbns: ReadonlyArray<string> };
type ReadingList = { readonly books: ReadonlyArray<Book> };
export const bookAtom = Atom.family((_isbn: string) =>
  Atom.make(AsyncResult.initial<Book, Error>()),
);
export const catalogAtom = Atom.make(AsyncResult.initial<Catalog, Error>());

/**
 * Correctly derives a complete collection from keyed source models.
 */
const availableBooks = (
  catalog: Catalog,
  get: Atom.AtomContext,
): ReadonlyArray<Book> =>
  Arr.flatMap(catalog.isbns, (isbn) =>
    AsyncResult.match(get(bookAtom(isbn)), {
      onInitial: () => [],
      onFailure: () => [],
      onSuccess: ({ value }) => [value],
    }),
  );
export const readingListAtom = Atom.make((get) =>
  AsyncResult.map(
    get(catalogAtom),
    (catalog): ReadingList => ({ books: availableBooks(catalog, get) }),
  ),
);

class CatalogError extends Data.TaggedError("CatalogError")<{
  readonly section: string;
  readonly cause: unknown;
}> {}

/**
 * Correctly constructs a complete typed error and preserves an existing domain
 * error without wrapping it again.
 */
export const catalogError =
  (section: string) =>
  (cause: unknown): CatalogError =>
    Match.value(cause).pipe(
      Match.when(
        (error: unknown): error is CatalogError =>
          error instanceof CatalogError,
        (error) => error,
      ),
      Match.orElse((error) => new CatalogError({ section, cause: error })),
    );
