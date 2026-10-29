import { Effect, Schema } from "effect";

const LineItem = Schema.Struct({
  unitPrice: Schema.Number,
  quantity: Schema.Int,
});

/**
 * Incorrectly nests Effect combinators around a parser. The reader must work
 * from the innermost call outward to follow the dependent transformations.
 */
export const formatTotal = Effect.fn("formatTotal")((text: string) => {
  return Effect.map(
    Effect.map(
      Effect.flatMap(
        Effect.try(() => JSON.parse(text)),
        Schema.decodeUnknownEffect(LineItem),
      ),
      (item) => item.unitPrice * item.quantity,
    ),
    (total) => `$${total.toFixed(2)}`,
  );
});
