import { Array as Arr, Option, Record, Ref, Schema, Struct } from "effect";

const Shelf = Schema.Struct({
  books: Schema.Record(Schema.String, Schema.Number),
});
type Shelf = typeof Shelf.Type;

/**
 * Incorrectly updates model state through nested object copies. The field
 * change bypasses the model's construction and validation rules.
 */
export const addBySpread = (shelf: Ref.Ref<Shelf>, isbn: string) =>
  Ref.update(shelf, (state) => ({
    ...state,
    books: { ...state.books, [isbn]: 1 },
  }));

/**
 * Incorrectly rebuilds an existing record through raw entries. The update
 * loses the field operation that describes the intended change.
 */
export const addByEntries = (shelf: Ref.Ref<Shelf>, isbn: string) =>
  Ref.update(
    shelf,
    Struct.evolve({
      books: (books) =>
        Object.fromEntries([...Object.entries(books), [isbn, 1]]),
    }),
  );

/**
 * Incorrectly assembles a model update through unvalidated Object.assign copies.
 */
export const addByAssign = (shelf: Ref.Ref<Shelf>, isbn: string) =>
  Ref.update(shelf, (state) =>
    Object.assign({}, state, {
      books: Object.assign({}, state.books, { [isbn]: 1 }),
    }),
  );

/**
 * Correctly describes a field change and reconstructs that field through its schema.
 */
export const addByField = (shelf: Ref.Ref<Shelf>, isbn: string) =>
  Ref.update(
    shelf,
    Struct.evolve({
      books: (books) => Shelf.fields.books.make(Record.set(books, isbn, 1)),
    }),
  );

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
