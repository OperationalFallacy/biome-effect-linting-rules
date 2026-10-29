import { Effect, Schema } from "effect";

/**
 * Incorrectly wraps a dependent pipeline in an outer recovery call. The reader
 * must inspect the nested argument to determine which failures recovery covers.
 */
export const readCount = Effect.fn("readCount")((text: string) =>
  Effect.catch(
    Effect.try(() => JSON.parse(text)).pipe(
      Effect.flatMap(Schema.decodeUnknownEffect(Schema.Number)),
    ),
    () => Effect.succeed(0),
  ),
);
