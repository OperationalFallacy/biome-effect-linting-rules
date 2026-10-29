import { Effect, Schema } from "effect";

const Guest = Schema.Struct({ name: Schema.NonEmptyString });

/**
 * Correctly composes parsing and validation in one pipeline. The source reads
 * in execution order, and a failure prevents the dependent transformations.
 */
export const decodeName = Effect.fn("decodeName")((text: string) =>
  Effect.try(() => JSON.parse(text)).pipe(
    Effect.flatMap(Schema.decodeUnknownEffect(Guest)),
    Effect.map((guest) => guest.name),
  ),
);

/**
 * Correctly sequences the continuation after decoding through Effect.andThen.
 * The continuation runs only after the decoder succeeds.
 */
export const reportDecodedName = Effect.fn("reportDecodedName")(
  (text: string) =>
    decodeName(text).pipe(
      Effect.andThen(() => Effect.logInfo("Decoded guest name")),
    ),
);
