import { Effect, Schema } from "effect";

/**
 * A recovery handler applies to the Effect composed before it. Keep
 * Effect.catch after parsing and decoding when both failures should produce
 * the same fallback.
 */
export const readCount = Effect.fn("readCount")((text: string) =>
  Effect.try(() => JSON.parse(text)).pipe(
    Effect.flatMap(Schema.decodeUnknownEffect(Schema.Number)),
    Effect.catch(() => Effect.succeed(0)),
  ),
);
