import { Effect, Schema } from "effect";

/**
 * readCount decodes input as an integer and returns it with the label "Counter".
 * A decoding failure remains an Effect failure for the caller to handle.
 * The generator reads the count without an intermediate label record.
 * It constructs the result after decoding, as the preset requires.
 */
export const readCount = Effect.fn("readCount")(function* (input: unknown) {
  // It correctly reads the count directly with a generator yield.
  const count = yield* Schema.decodeUnknownEffect(Schema.Int)(input);
  return { label: "Counter", count };
});
