import { Effect, Schema } from "effect";

/**
 * The formatLineTotal operation incorrectly nests formatting around the
 * calculation and input collection. The reader must trace inward to find
 * quantity and unitPrice, then outward to follow their formatted total.
 */
export const formatLineTotal = Effect.fn("formatLineTotal")(function* (
  quantity: unknown,
  unitPrice: unknown,
) {
  // The nested maps incorrectly require an inward lookup to connect quantity and unitPrice to their total.
  return yield* Effect.map(
    Effect.map(
      Effect.all({
        quantity: Schema.decodeUnknownEffect(Schema.Int)(quantity),
        unitPrice: Schema.decodeUnknownEffect(Schema.Finite)(unitPrice),
      }),
      (item) => item.quantity * item.unitPrice,
    ),
    (total) => `$${total.toFixed(2)}`,
  );
});
