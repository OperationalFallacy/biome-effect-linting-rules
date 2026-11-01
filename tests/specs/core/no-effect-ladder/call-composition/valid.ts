import { Effect, Schema } from "effect";

const LineItem = Schema.Struct({
  unitPrice: Schema.Number,
  quantity: Schema.Int,
});

/**
 * Correctly composes parsing and dependent transformations in one pipeline.
 * The pipeline presents the work in execution order and propagates failures.
 */
export const formatTotal = Effect.fn("formatTotal")((text: string) =>
  Effect.try(() => JSON.parse(text)).pipe(
    Effect.flatMap(Schema.decodeUnknownEffect(LineItem)),
    Effect.map((item) => item.unitPrice * item.quantity),
    Effect.map((total) => `$${total.toFixed(2)}`),
  ),
);
