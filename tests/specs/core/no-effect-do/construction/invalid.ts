import { Effect, Schema } from "effect";

/**
 * Questionably starts result construction with Effect.Do. The builder adds
 * record assembly to the sequence of dependent operations.
 */
export const readCount = Effect.fn("readCount")((input: unknown) =>
  Effect.Do.pipe(
    Effect.bind("count", () => Schema.decodeUnknownEffect(Schema.Int)(input)),
  ),
);
