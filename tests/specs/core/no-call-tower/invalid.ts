import { Effect, FileSystem, Schema, Struct } from "effect";

const Guest = Schema.fromJsonString(
  Schema.Struct({ name: Schema.NonEmptyString }),
);

/**
 * readGuestName reads a guest JSON file and returns the decoded name. It retries
 * the file read twice; malformed JSON or an invalid name fails without a retry.
 * The nested retry call separates the read from its decoder. The preset requires
 * a pipeline so the dependent steps appear in execution order.
 */
export const readGuestName = Effect.fn("readGuestName")(function* (
  filePath: string,
) {
  const fs = yield* FileSystem.FileSystem;

  // It incorrectly nests the retried read inside the decoding call.
  return yield* Effect.flatMap(
    Effect.retry(fs.readFileString(filePath), { times: 2 }),
    Schema.decodeUnknownEffect(Guest),
  ).pipe(Effect.map(Struct.get("name")));
});

/**
 * reportDecodedName logs a successful guest-file read and decode. A read or
 * decoding failure prevents the log. Effect.andThen nests the log in its
 * arguments; the preset requires a pipeline for that continuation.
 */
export const reportDecodedName = Effect.fn("reportDecodedName")(
  (filePath: string) =>
    // It incorrectly nests the log inside Effect.andThen.
    Effect.andThen(
      readGuestName(filePath),
      Effect.logInfo("Decoded guest name"),
    ),
);
