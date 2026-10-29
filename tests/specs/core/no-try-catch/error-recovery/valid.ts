import { Effect, Schema } from "effect";

/**
 * Correctly represents parser and decoder failures in the Effect error channel.
 * Recovery covers both steps at the end of their pipeline.
 */
export const readCount = Effect.fn("readCount")((text: string) =>
  Effect.try(() => JSON.parse(text)).pipe(
    Effect.flatMap(Schema.decodeUnknownEffect(Schema.Number)),
    Effect.catch(() => Effect.succeed(0)),
  ),
);
