import { Option, Array, Data, Match } from "effect";
import { AsyncResult, Atom } from "effect/reactivity";

type Book = { readonly isbn: string; readonly available: boolean };
type BookView = { readonly label: string; readonly note: Option.Option<string> };
declare const selectedBook: AsyncResult.AsyncResult<Book, Error>;
declare const useReserved: (isbn: string) => boolean;
declare const useReserve: (isbn: string) => () => void;

const bookViews = {
  available: () => ({ label: "Available", note: Option.none<string>() }),
  borrowed: () => ({ label: "Borrowed", note: Option.some("Join the wait list") }),
} satisfies Record<string, () => BookView>;

const bookView = (book: Book): BookView => bookViews[book.available ? "available" : "borrowed"]();

function ReserveBook({ fallbackIsbn }: { readonly fallbackIsbn: string }) {
  const isbn = AsyncResult.match(selectedBook, {
    onInitial: () => fallbackIsbn,
    onFailure: () => fallbackIsbn,
    onSuccess: ({ value }) => value.isbn,
  });
  const reserved = useReserved(isbn);
  const reserve = useReserve(isbn);
  const renderButton = () =>
    Option.match(Option.some(reserved), {
      onNone: () => null,
      onSome: (disabled) => (
        <button type="button" disabled={disabled} onClick={reserve}>
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

const readingListAtom = Atom.make((get) =>
  AsyncResult.map(
    get(catalogAtom),
    (catalog): ReadingList => ({
      books: availableBooks(catalog, get),
    }),
  ),
);

class CatalogError extends Data.TaggedError("CatalogError")<{
  readonly section: string;
  readonly cause: unknown;
}> {}

const catalogError =
  (section: string) =>
  (cause: unknown): CatalogError =>
    Match.value(cause).pipe(
      Match.when(
        (error: unknown): error is CatalogError => error instanceof CatalogError,
        (error) => error,
      ),
      Match.orElse((error) => new CatalogError({ section, cause: error })),
    );
