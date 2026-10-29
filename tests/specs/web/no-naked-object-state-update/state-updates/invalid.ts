import { Ref, Struct, Record, Schema, Array, Option } from "effect";

declare const spreadShelf: Ref.Ref<{ readonly books: Readonly<Record<string, number>> }>;
declare const spreadIsbn: string;

const spreadAddBook = Ref.update(spreadShelf, (state) => ({
  ...state,
  books: { ...state.books, [spreadIsbn]: 1 },
}));

declare const fromEntriesShelf: Ref.Ref<{ readonly books: Readonly<Record<string, number>> }>;
declare const fromEntriesIsbn: string;

const fromEntriesAddBook = Ref.update(
  fromEntriesShelf,
  Struct.evolve({
    books: (books) => Object.fromEntries([...Object.entries(books), [fromEntriesIsbn, 1]]),
  }),
);

declare const objectAssignShelf: Ref.Ref<{ readonly books: Readonly<Record<string, number>> }>;
declare const objectAssignIsbn: string;

const objectAssignAddBook = Ref.update(objectAssignShelf, (state) =>
  Object.assign({}, state, {
    books: Object.assign({}, state.books, { [objectAssignIsbn]: 1 }),
  }),
);

const Shelf = Schema.Struct({ books: Schema.Record(Schema.String, Schema.Number) });
declare const effectRecordSetShelf: Ref.Ref<typeof Shelf.Type>;
declare const effectRecordSetIsbn: string;

const effectRecordSetAddBook = Ref.update(
  effectRecordSetShelf,
  Struct.evolve({
    books: (books) => Shelf.fields.books.make(Record.set(books, effectRecordSetIsbn, 1)),
  }),
);

type Book = { readonly isbn?: string | null; readonly title: string };

const indexBooks = (books: ReadonlyArray<Book>) =>
  Object.fromEntries(
    Array.flatMap(books, (book) =>
      Option.match(Option.fromNullishOr(book.isbn), {
        onNone: () => [],
        onSome: (isbn) => [[isbn, book] as const],
      }),
    ),
  );
