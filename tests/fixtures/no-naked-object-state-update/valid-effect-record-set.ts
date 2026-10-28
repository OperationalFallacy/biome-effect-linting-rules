import { Record, Ref, Schema, Struct } from "effect";

const Shelf = Schema.Struct({ books: Schema.Record(Schema.String, Schema.Number) });
declare const shelf: Ref.Ref<typeof Shelf.Type>;
declare const isbn: string;

export const addBook = Ref.update(
  shelf,
  Struct.evolve({ books: (books) => Shelf.fields.books.make(Record.set(books, isbn, 1)) }),
);
