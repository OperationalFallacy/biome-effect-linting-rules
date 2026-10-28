import { Ref } from "effect";

declare const shelf: Ref.Ref<{ readonly books: Readonly<Record<string, number>> }>;
declare const isbn: string;

export const addBook = Ref.update(shelf, (state) => ({
  ...state,
  books: { ...state.books, [isbn]: 1 },
}));
