import { Effect, Schema, pipe } from "effect";

const Book = Schema.Struct({ title: Schema.NonEmptyString, pages: Schema.Int });
const books = [
  { title: "Garden Notes", pages: 118 },
  { title: "Night Ferry", pages: 331 },
];

/**
 * Unnecessarily uses block callbacks for direct projections. The return
 * statements add control-flow syntax to single-expression transformations.
 */
export const titles = books.map((book) => { return book.title; });
export const summaries = books.map((book): string => {
  return `${book.title}: ${book.pages} pages`;
});
export const pageCounts = books.map(book => { return book.pages; });

export const decodeTitle = (input: unknown) =>
  Effect.map(Schema.decodeUnknownEffect(Book)(input), (book) => {
    return book.title;
  });

export const bookCount = pipe(books, (items) => { return items.length; });
