import { Match, Schema } from "effect";

const MissingBook = Schema.TaggedStruct("MissingBook", {
  isbn: Schema.String,
  shelf: Schema.String,
});

type MissingBook = typeof MissingBook.Type;
export const decodeMissingBook = Schema.decodeUnknownEffect(MissingBook);

// Match narrows an already decoded domain value.
export const missingIsbn = (failure: MissingBook) =>
  Match.value(failure).pipe(
    Match.tag("MissingBook", ({ isbn }) => isbn),
    Match.exhaustive,
  );
