import { Effect, FileSystem, Schema } from "effect";

const CheckIn = Schema.Struct({
  guestId: Schema.NonEmptyString,
  displayName: Schema.NonEmptyString,
});

const SavedCheckIn = Schema.fromJsonString(CheckIn);

const CheckInReceipt = Schema.Struct({
  guestId: Schema.NonEmptyString,
  confirmationPath: Schema.NonEmptyString,
});

/**
 * The confirmCheckIn function unnecessarily nests dependent steps in
 * Effect.flatMap callbacks. Those callback scopes obscure the order of
 * validation, encoding, and the file write.
 */
export const confirmCheckIn = Effect.fn("confirmCheckIn")(function* (
  input: unknown,
  confirmationPath: string,
) {
  const fs = yield* FileSystem.FileSystem;

  // The nested callbacks obscure the order of the check-in steps.
  return yield* Effect.flatMap(
    Schema.decodeUnknownEffect(CheckIn)(input),
    (guest) =>
      Effect.flatMap(Schema.encodeEffect(SavedCheckIn)(guest), (contents) =>
        Effect.flatMap(fs.writeFileString(confirmationPath, contents), () =>
          Effect.succeed(
            CheckInReceipt.make({ guestId: guest.guestId, confirmationPath }),
          ),
        ),
      ),
  );
});
