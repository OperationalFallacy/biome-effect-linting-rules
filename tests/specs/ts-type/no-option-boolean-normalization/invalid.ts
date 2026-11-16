import { randomUUID } from "node:crypto";

import { Data, Effect, FileSystem, Option, Schema } from "effect";

const ReminderRequest = Schema.Struct({
  recipient: Schema.NonEmptyString,
  enabled: Schema.optional(Schema.Boolean),
});

const QueuedReminder = Schema.fromJsonString(
  Schema.Struct({ recipient: Schema.NonEmptyString }),
);

type ReminderOutcome = Data.TaggedEnum<{
  Scheduled: { readonly recipient: string; readonly notificationId: string };
  Disabled: { readonly recipient: string };
}>;
const ReminderOutcome = Data.taggedEnum<ReminderOutcome>();

/**
 * The reminder operation incorrectly supplies a default that belongs in its
 * request schema. Every operation that uses this optional flag must repeat
 * the same absence policy before it can decide whether to queue a notification.
 */
export const scheduleReminder = Effect.fn("scheduleReminder")(function* (
  input: unknown,
  queueDirectory: string,
) {
  const request = yield* Schema.decodeUnknownEffect(ReminderRequest)(input);

  const fs = yield* FileSystem.FileSystem;

  // The schema leaves enabled optional, so scheduling supplies the false default.
  const enabled = Option.match(Option.fromNullishOr(request.enabled), {
    onSome: (flag) => flag === true,
    onNone: () => false,
  });

  const notificationId = yield* Effect.sync(randomUUID);

  const contents = yield* Schema.encodeEffect(QueuedReminder)({
    recipient: request.recipient,
  });

  const queued = yield* fs
    .makeDirectory(queueDirectory, { recursive: true })
    .pipe(
      Effect.andThen(() =>
        fs.writeFileString(
          `${queueDirectory}/${notificationId}.json`,
          contents,
          { flag: "wx" },
        ),
      ),
      // A false flag skips directory creation and the notification write.
      Effect.when(Effect.succeed(enabled)),
    );

  return Option.match(queued, {
    onSome: () =>
      ReminderOutcome.Scheduled({
        recipient: request.recipient,
        notificationId,
      }),
    onNone: () => ReminderOutcome.Disabled({ recipient: request.recipient }),
  });
});
