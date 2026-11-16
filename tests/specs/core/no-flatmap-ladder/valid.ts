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
 * The confirmCheckIn function expresses the dependent steps in one Effect
 * generator. Each step must succeed before the next begins, so the sequence
 * needs no nested callbacks to carry earlier results forward.
 */
export const confirmCheckIn = Effect.fn("confirmCheckIn")(function* (
  input: unknown,
  confirmationPath: string,
) {
  const fs = yield* FileSystem.FileSystem;

  const guest = yield* Schema.decodeUnknownEffect(CheckIn)(input);

  const contents = yield* Schema.encodeEffect(SavedCheckIn)(guest);

  yield* fs.writeFileString(confirmationPath, contents);

  // The function returns the receipt only after the file write succeeds.
  return CheckInReceipt.make({ guestId: guest.guestId, confirmationPath });
});
