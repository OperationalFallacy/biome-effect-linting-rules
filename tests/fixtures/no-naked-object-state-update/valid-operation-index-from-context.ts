import { Array, Option } from "effect";

type Book = { readonly isbn?: string | null; readonly title: string };

// This index is a derived value, not a Ref state transition.
export const indexBooks = (books: ReadonlyArray<Book>) =>
  Object.fromEntries(
    Array.flatMap(books, (book) =>
      Option.match(Option.fromNullishOr(book.isbn), {
        onNone: () => [],
        onSome: (isbn) => [[isbn, book] as const],
      }),
    ),
  );
