import { Effect, Schema } from "effect";

const Book = Schema.Struct({ title: Schema.String });
interface Storage {
  readonly write: (payload: string) => Effect.Effect<void>;
  readonly read: Effect.Effect<string>;
}

/**
 * Incorrectly serializes model data through raw JSON calls. Parsing can throw,
 * and the operation never checks the stored payload against its model schema.
 */
export const copyBook = Effect.fn("copyBook")(
  (book: typeof Book.Type, storage: Storage) =>
    Effect.gen(function* () {
      yield* storage.write(JSON.stringify(book));
      const raw = yield* storage.read;
      yield* storage.write(JSON.stringify(JSON.parse(raw)));
    }),
);

/**
 * Incorrectly accepts a parsed value without model validation or a typed failure.
 */
export const decodeBook = (input: string) => JSON.parse(input);

/**
 * Correctly decodes serialized model data through its JSON schema.
 */
export const decodeCheckedBook = Schema.decodeUnknownEffect(
  Schema.fromJsonString(Book),
);
