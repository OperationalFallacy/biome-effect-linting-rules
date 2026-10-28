import { Ref, Struct } from "effect";

declare const shelf: Ref.Ref<{ readonly books: Readonly<Record<string, number>> }>;
declare const isbn: string;

export const addBook = Ref.update(
  shelf,
  Struct.evolve({
    books: (books) => Object.fromEntries([...Object.entries(books), [isbn, 1]]),
  }),
);
