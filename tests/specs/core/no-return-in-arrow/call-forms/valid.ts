import { Effect, Schema, pipe } from "effect";

const Book = Schema.Struct({ title: Schema.NonEmptyString, pages: Schema.Int });
const books = [
  { title: "Garden Notes", pages: 118 },
  { title: "Night Ferry", pages: 331 },
];

/**
 * Correctly uses expression callbacks for direct projections in collection
 * methods and Effect combinators.
 */
export const titles = books.map((book) => book.title);
export const summaries = books.map((book): string =>
  `${book.title}: ${book.pages} pages`,
);
export const pageCounts = books.map((book) => book.pages);

export const decodeTitle = (input: unknown) =>
  Effect.map(Schema.decodeUnknownEffect(Book)(input), (book) => book.title);

export const bookCount = pipe(books, (items) => items.length);
