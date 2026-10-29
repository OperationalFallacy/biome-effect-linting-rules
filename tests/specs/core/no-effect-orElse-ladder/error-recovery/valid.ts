import { Effect, Schema } from "effect";

/**
 * Correctly places recovery after the dependent steps in one pipeline.
 * The recovery applies to both parsing and decoding failures.
 */
export const readCount = Effect.fn("readCount")((text: string) =>
  Effect.try(() => JSON.parse(text)).pipe(
    Effect.flatMap(Schema.decodeUnknownEffect(Schema.Number)),
    Effect.catch(() => Effect.succeed(0)),
  ),
);
