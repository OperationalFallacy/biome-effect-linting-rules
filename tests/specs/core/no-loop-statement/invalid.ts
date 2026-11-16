import { Effect, FileSystem } from "effect";

interface TextFile {
  readonly path: string;
  readonly content: string;
}

/**
 * writeFiles incorrectly expresses file traversal with a statement loop.
 * Writes must stay in input order so later contents win when paths repeat,
 * but traversal is separate from the operation's Effect composition.
 */
export const writeFiles = Effect.fn("writeFiles")(function* (
  files: ReadonlyArray<TextFile>,
) {
  const fs = yield* FileSystem.FileSystem;
  // The for loop incorrectly separates file traversal from the composed writes.
  for (const file of files) {
    yield* fs.writeFileString(file.path, file.content);
  }
});
