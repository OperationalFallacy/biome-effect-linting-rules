import { Data, Effect, FileSystem, Match, Option } from "effect";

type DeliveryOutcome = Data.TaggedEnum<{
  Sent: { readonly reportId: string; readonly deliveryId: string };
  AlreadySent: { readonly reportId: string; readonly deliveryId: string };
}>;
const DeliveryOutcome = Data.taggedEnum<DeliveryOutcome>();

/**
 * deliverReport writes a report once and skips an existing delivery. Its tagged
 * outcomes include the file's path, so deliveryMessage can report its location
 * after either path. A repeated request keeps the existing contents.
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

  // It correctly returns tagged delivery results with their file paths.
  return Option.match(written, {
    onSome: () => DeliveryOutcome.Sent({ reportId, deliveryId }),
    onNone: () => DeliveryOutcome.AlreadySent({ reportId, deliveryId }),
  });
});

/**
 * deliveryMessage tells the user whether a report was written or already
 * existed and includes its location. The tagged result supplies the path
 * directly, so this caller no longer repeats the writer's naming convention.
 */
export const deliveryMessage = Effect.fn("deliveryMessage")(
  (reportId: string, contents: string, deliveryDirectory: string) =>
    deliverReport(reportId, contents, deliveryDirectory).pipe(
      Effect.map((result) =>
        Match.value(result).pipe(
          Match.tag(
            "Sent",
            ({ deliveryId }) => `Report written to ${deliveryId}`,
          ),
          Match.tag(
            "AlreadySent",
            ({ deliveryId }) => `Report already exists at ${deliveryId}`,
          ),
          Match.exhaustive,
        ),
      ),
    ),
);

/** Delivery instructions tell the user to choose a report. */
// It correctly returns ordinary text without a status diagnostic.
export const deliveryInstructions = Effect.succeed(
  "Choose a report to deliver.",
);
