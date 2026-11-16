import { Effect, FileSystem, Schema } from "effect";

const CatalogView = Schema.Struct({
  pageSize: Schema.Int.check(Schema.isBetween({ minimum: 1, maximum: 100 })),
  showArchived: Schema.Boolean,
});

const SavedCatalogView = Schema.fromJsonString(CatalogView);

/**
 * The readCatalogView function places its fallback in the same pipeline as
 * the file read and the decoder. The fallback handles a read failure or a
 * decode failure because recovery follows both operations.
 */
export const readCatalogView = Effect.fn("readCatalogView")(function* (
  filePath: string,
) {
  const fs = yield* FileSystem.FileSystem;

  return yield* fs.readFileString(filePath).pipe(
    Effect.flatMap(Schema.decodeUnknownEffect(SavedCatalogView)),
    // The function returns the default view after a read or decode failure.
    Effect.catch(() =>
      Effect.succeed(CatalogView.make({ pageSize: 20, showArchived: false })),
    ),
  );
});
