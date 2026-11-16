import { Effect, Ref, Schema } from "effect";

const Book = Schema.Struct({ title: Schema.String });
const CopyHistory = Schema.Struct({ completed: Schema.Int });
interface Storage {
  readonly write: (payload: string) => Effect.Effect<void>;
  readonly read: Effect.Effect<string>;
}

/**
 * copyBook writes the supplied book, reads a stored payload, and copies that
 * payload back. Storage can contain externally edited data, so the copy must
 * reject malformed books before the second write. Raw JSON accepts unchecked
 * fields, and parse errors escape the typed decoding channel.
 * A successful copy increments the completed count and returns that history.
 * The preset also requires model field operations for this state update.
 */
export const copyBook = Effect.fn("copyBook")(
  (
    book: typeof Book.Type,
    storage: Storage,
    history: Ref.Ref<typeof CopyHistory.Type>,
  ) =>
    Effect.gen(function* () {
      // It incorrectly serializes the model through raw JSON.
      yield* storage.write(JSON.stringify(book));
      const raw = yield* storage.read;
      yield* storage.write(JSON.stringify(JSON.parse(raw)));

      // It incorrectly rebuilds copy history through an object spread.
      yield* Ref.update(history, (current) => ({
        ...current,
        completed: current.completed + 1,
      }));

      return yield* Ref.get(history);
    }),
);

/**
 * The parser incorrectly accepts JSON without validating the Book model.
 * Its result has no schema-established fields or typed decoding failure.
 */
export const decodeBook = (input: string) => JSON.parse(input);

/**
 * The checked decoder correctly combines JSON parsing with the Book schema.
 * The model type comes from validation rather than unchecked parsed data.
 */
export const decodeCheckedBook = Schema.decodeUnknownEffect(
  Schema.fromJsonString(Book),
);
