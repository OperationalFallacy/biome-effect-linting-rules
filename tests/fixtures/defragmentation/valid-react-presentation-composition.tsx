import { Option } from "effect";
import { AsyncResult } from "effect/reactivity";

type Book = { readonly isbn: string; readonly available: boolean };
type BookView = { readonly label: string; readonly note: Option.Option<string> };
declare const selectedBook: AsyncResult.AsyncResult<Book, Error>;
declare const useReserved: (isbn: string) => boolean;
declare const useReserve: (isbn: string) => () => void;

const bookViews = {
  available: () => ({ label: "Available", note: Option.none<string>() }),
  borrowed: () => ({ label: "Borrowed", note: Option.some("Join the wait list") }),
} satisfies Record<string, () => BookView>;

const bookView = (book: Book): BookView =>
  bookViews[book.available ? "available" : "borrowed"]();

export function ReserveBook({ fallbackIsbn }: { readonly fallbackIsbn: string }) {
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
      onSome: (disabled) => <button type="button" disabled={disabled} onClick={reserve}>Reserve</button>,
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
