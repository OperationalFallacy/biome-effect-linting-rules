import { Effect, Schema } from "effect";

const Guest = Schema.Struct({ name: Schema.NonEmptyString });

/**
 * Incorrectly nests dependent Effect calls around a parser. The reader must
 * work from the innermost call outward to find the execution order.
 */
export const decodeName = Effect.fn("decodeName")((text: string) =>
  Effect.map(
    Effect.flatMap(
      Effect.try(() => JSON.parse(text)),
      Schema.decodeUnknownEffect(Guest),
    ),
    (guest) => guest.name,
  ),
);

/**
 * Incorrectly puts the continuation inside data-first Effect.andThen arguments.
 * A pipeline can express this sequence in execution order.
 */
export const reportDecodedName = Effect.fn("reportDecodedName")(
  (text: string) =>
    Effect.andThen(decodeName(text), Effect.logInfo("Decoded guest name")),
);
