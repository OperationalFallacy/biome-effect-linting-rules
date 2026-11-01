import { Effect, Schema } from "effect";

const Book = Schema.Struct({ title: Schema.String });
const BookJson = Schema.fromJsonString(Book);
const encodeBook = Schema.encodeEffect(BookJson);
interface Storage {
  readonly write: (payload: string) => Effect.Effect<void>;
  readonly read: Effect.Effect<string>;
}

/**
 * Correctly serializes model data through schema codecs. Malformed stored data
 * now produces a typed decoding failure instead of an unchecked value or throw.
 * Both writes retain their order around the storage read.
 */
export const copyBook = Effect.fn("copyBook")(
  (book: typeof Book.Type, storage: Storage) =>
    Effect.gen(function* () {
      yield* encodeBook(book).pipe(
        Effect.flatMap((payload) => storage.write(payload)),
      );
      const raw = yield* storage.read;
      const decoded = yield* decodeBook(raw);
      yield* encodeBook(decoded).pipe(
        Effect.flatMap((payload) => storage.write(payload)),
      );
    }),
);

/**
 * Correctly decodes the complete model with a typed failure channel.
 */
export const decodeBook = Schema.decodeUnknownEffect(BookJson);
export const decodeCheckedBook = decodeBook;
