import { Effect, Schema } from "effect";

/**
 * readCount decodes input as an integer and returns it with the label "Counter".
 * A decoding failure remains an Effect failure for the caller to handle.
 * Effect.bind carries a label record through a decoder that only needs input.
 * The preset requires the operation to decode input directly and build
 * the result afterward.
 */
export const readCount = Effect.fn("readCount")((input: unknown) =>
  Effect.succeed({ label: "Counter" }).pipe(
    // It incorrectly accumulates the result through Effect.bind.
    Effect.bind("count", () => Schema.decodeUnknownEffect(Schema.Int)(input)),
  ),
);
