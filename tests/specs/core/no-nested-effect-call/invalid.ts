import { Effect, FileSystem, Schema } from "effect";

const Configuration = Schema.fromJsonString(
  Schema.Struct({ endpoint: Schema.NonEmptyString }),
);

/**
 * The loadEndpoint operation incorrectly nests endpoint selection around
 * decoding and retry inside the callback. The reader must trace inward to
 * find the file read and determine which part retries.
 */
export const loadEndpoint = Effect.fn("loadEndpoint")((path: string) =>
  Effect.flatMap(FileSystem.FileSystem, (fs) =>
    // The nested map incorrectly hides fs.readFileString and its retry inside endpoint selection.
    Effect.map(
      Effect.flatMap(
        Effect.retry(fs.readFileString(path), { times: 2 }),
        Schema.decodeUnknownEffect(Configuration),
      ),
      (configuration) => configuration.endpoint,
    ),
  ),
);
