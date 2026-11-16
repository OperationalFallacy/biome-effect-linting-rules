import { Effect, FileSystem } from "effect";

interface TextFile {
  readonly path: string;
  readonly content: string;
}

/**
 * writeFiles correctly expresses file writes in one Effect.forEach traversal.
 * Sequential execution preserves later writes to repeated paths, and discarded
 * results keep the operation's result void.
 */
export const writeFiles = Effect.fn("writeFiles")(function* (
  files: ReadonlyArray<TextFile>,
) {
  const fs = yield* FileSystem.FileSystem;
  // This traversal correctly writes in input order, including repeated file paths.
  return yield* Effect.forEach(
    files,
    (file) => fs.writeFileString(file.path, file.content),
    {
      concurrency: 1,
      discard: true,
    },
  );
});
