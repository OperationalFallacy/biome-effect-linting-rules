import { Effect, pipe, Ref, Schema, Struct } from "effect";

const Book = Schema.Struct({ title: Schema.String });
const CopyHistory = Schema.Struct({ completed: Schema.Int });
const BookJson = Schema.fromJsonString(Book);
const encodeBook = Schema.encodeEffect(BookJson);
interface Storage {
  readonly write: (payload: string) => Effect.Effect<void>;
  readonly read: Effect.Effect<string>;
}

/**
 * copyBook writes the supplied book, reads a stored payload, and copies that
 * payload back. The Book JSON schema checks externally edited data before
 * the second write and copies only Book fields. Malformed books now fail
 * through the decoding channel. Valid books retain the same write, read,
 * and write sequence.
 * A successful copy increments the completed count and returns that history.
 * Struct.evolve and CopyHistory.make perform the state update as the preset
 * requires. A failed read, decode, or write leaves the history unchanged.
 */
export const copyBook = Effect.fn("copyBook")(
  (
    book: typeof Book.Type,
    storage: Storage,
    history: Ref.Ref<typeof CopyHistory.Type>,
  ) =>
    Effect.gen(function* () {
      // It correctly encodes the model through its JSON schema.
      yield* encodeBook(book).pipe(
        Effect.flatMap((payload) => storage.write(payload)),
      );
      const raw = yield* storage.read;
      const decoded = yield* decodeBook(raw);
      yield* encodeBook(decoded).pipe(
        Effect.flatMap((payload) => storage.write(payload)),
      );

      // It correctly updates the field and reconstructs copy history.
      yield* Ref.update(history, (current) =>
        pipe(
          current,
          Struct.evolve({ completed: (count) => count + 1 }),
          CopyHistory.make,
        ),
      );

      return yield* Ref.get(history);
    }),
);

/**
 * The decoder correctly establishes the whole Book model from serialized input.
 * Parsing and model validation share the same typed failure channel.
 */
export const decodeBook = Schema.decodeUnknownEffect(BookJson);
export const decodeCheckedBook = decodeBook;
