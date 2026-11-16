import { Effect, FileSystem, Match, Option } from "effect";

/**
 * deliverReport writes a report once and skips an existing delivery. Its two
 * string outcomes identify those paths but omit the delivered file's path.
 * The rule asks for review of string-valued branch outcomes; here tagged
 * delivery results would let deliveryMessage locate the report after either
 * path without reconstructing the writer's file naming convention.
 */
export const deliverReport = Effect.fn("deliverReport")(function* (
  reportId: string,
  contents: string,
  deliveryDirectory: string,
) {
  const fs = yield* FileSystem.FileSystem;

  yield* fs.makeDirectory(deliveryDirectory, { recursive: true });

  const deliveryId = `${deliveryDirectory}/${encodeURIComponent(reportId)}.txt`;
  const exists = yield* fs.exists(deliveryId);

  const written = yield* fs
    .writeFileString(deliveryId, contents, { flag: "wx" })
    .pipe(Effect.when(Effect.succeed(!exists)));

  // It incorrectly returns delivery statuses without their result data.
  return yield* Option.match(written, {
    onSome: () => Effect.succeed("sent"),
    onNone: () => Effect.succeed("already-sent"),
  });
});

/**
 * deliveryMessage tells the user whether a report was written or already
 * existed and includes its location. The string result forces this caller
 * to repeat the writer's path construction to provide that location.
 */
export const deliveryMessage = Effect.fn("deliveryMessage")(
  (reportId: string, contents: string, deliveryDirectory: string) =>
    deliverReport(reportId, contents, deliveryDirectory).pipe(
      Effect.map((result) =>
        Match.value(result).pipe(
          Match.when(
            "sent",
            () =>
              `Report written to ${deliveryDirectory}/${encodeURIComponent(reportId)}.txt`,
          ),
          Match.orElse(
            () =>
              `Report already exists at ${deliveryDirectory}/${encodeURIComponent(reportId)}.txt`,
          ),
        ),
      ),
    ),
);
