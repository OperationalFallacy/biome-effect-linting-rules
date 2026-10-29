import { Effect, Schema } from "effect";

/**
 * Correctly sequences decoding with a direct yield and constructs the result
 * record once, after the operation has its value.
 */
export const readCount = Effect.fn("readCount")(function* (input: unknown) {
  const count = yield* Schema.decodeUnknownEffect(Schema.Int)(input);
  return { count };
});
