import { Effect, Schema } from "effect";

/**
 * Correctly reads dependent values through direct yields and constructs the
 * result record once. The operation retains the decoder's failure channel.
 */
export const readCount = Effect.fn("readCount")(function* (input: unknown) {
  const count = yield* Schema.decodeUnknownEffect(Schema.Int)(input);
  return { label: "Counter", count };
});
