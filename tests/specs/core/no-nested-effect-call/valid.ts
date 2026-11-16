import { Effect, FileSystem, Schema } from "effect";

const Configuration = Schema.fromJsonString(
  Schema.Struct({ endpoint: Schema.NonEmptyString }),
);

/**
 * The loadEndpoint operation correctly puts the file read and retry before
 * decoding and endpoint selection in the callback's pipeline. The retry
 * applies only to the read before decoding begins.
 */
export const loadEndpoint = Effect.fn("loadEndpoint")((path: string) =>
  Effect.flatMap(FileSystem.FileSystem, (fs) =>
    // The pipeline correctly limits retry to fs.readFileString before configuration decoding and endpoint selection.
    fs.readFileString(path).pipe(
      Effect.retry({ times: 2 }),
      Effect.flatMap(Schema.decodeUnknownEffect(Configuration)),
      Effect.map((configuration) => configuration.endpoint),
    ),
  ),
);
