import { Effect, Schema } from "effect";

/**
 * Questionably sequences decoding through record-building callbacks.
 * The builder makes the reader track an intermediate record between steps.
 */
export const readCount = Effect.fn("readCount")((input: unknown) =>
  Effect.succeed({ label: "Counter" }).pipe(
    Effect.bind("count", () => Schema.decodeUnknownEffect(Schema.Int)(input)),
  ),
);
