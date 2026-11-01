import { Effect, Schema } from "effect";

/**
 * Correctly decodes an effectful condition before conditional work.
 * A decoding failure stays in the error channel and prevents that work from running.
 */
export const reportWhenDecoded = Effect.fn("reportWhenDecoded")(
  (input: unknown) =>
    Effect.logInfo("Ready").pipe(
      Effect.when(Schema.decodeUnknownEffect(Schema.Boolean)(input)),
    ),
);
