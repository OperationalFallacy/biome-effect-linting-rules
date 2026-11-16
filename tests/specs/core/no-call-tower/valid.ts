import { Effect, FileSystem, Schema, Struct } from "effect";

const Guest = Schema.fromJsonString(
  Schema.Struct({ name: Schema.NonEmptyString }),
);

/**
 * readGuestName reads a guest JSON file and returns the decoded name. It retries
 * the file read twice; malformed JSON or an invalid name fails without a retry.
 * The pipeline applies retry to the read before decoding begins, as the preset
 * requires for this sequence of dependent steps.
 */
export const readGuestName = Effect.fn("readGuestName")(function* (
  filePath: string,
) {
  const fs = yield* FileSystem.FileSystem;

  // It correctly composes the retried read and decoder in one pipeline.
  return yield* fs
    .readFileString(filePath)
    .pipe(
      Effect.retry({ times: 2 }),
      Effect.flatMap(Schema.decodeUnknownEffect(Guest)),
      Effect.map(Struct.get("name")),
    );
});

/**
 * reportDecodedName logs a successful guest-file read and decode. A read or
 * decoding failure prevents the log. The pipeline places the log after the
 * complete read operation, as the preset requires.
 */
export const reportDecodedName = Effect.fn("reportDecodedName")(
  (filePath: string) =>
    // It correctly puts the log after the read operation in the pipeline.
    readGuestName(filePath).pipe(
      Effect.andThen(() => Effect.logInfo("Decoded guest name")),
    ),
);
