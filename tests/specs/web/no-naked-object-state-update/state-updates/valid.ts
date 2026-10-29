import { Array as Arr, Option, Record, Ref, Schema, Struct } from "effect";

const Shelf = Schema.Struct({
  books: Schema.Record(Schema.String, Schema.Number),
});
type Shelf = typeof Shelf.Type;

/**
 * Correctly describes the field change with Record.set and Struct.evolve.
 * The field schema reconstructs the record before Ref commits the new state.
 */
export const addByField = (shelf: Ref.Ref<Shelf>, isbn: string) =>
  Ref.update(
    shelf,
    Struct.evolve({
      books: (books) => Shelf.fields.books.make(Record.set(books, isbn, 1)),
    }),
  );
export const addBySpread = addByField;
export const addByEntries = addByField;
export const addByAssign = addByField;

type Book = { readonly isbn?: string | null; readonly title: string };

/**
 * Correctly constructs a complete index from source models. Missing identifiers
 * contribute no entry to the newly constructed domain value.
 */
export const indexBooks = (books: ReadonlyArray<Book>) =>
  Object.fromEntries(
    Arr.flatMap(books, (book) =>
      Option.match(Option.fromNullishOr(book.isbn), {
        onNone: () => [],
        onSome: (isbn): ReadonlyArray<readonly [string, Book]> => [
          [isbn, book],
        ],
      }),
    ),
  );
