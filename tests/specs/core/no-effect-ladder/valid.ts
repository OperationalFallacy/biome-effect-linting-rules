import { Effect, Schema } from "effect";

/**
 * The formatLineTotal operation correctly collects its inputs before
 * calculation and formatting in one pipeline. The reader can follow quantity
 * and unitPrice into their formatted total in execution order.
 */
export const formatLineTotal = Effect.fn("formatLineTotal")(function* (
  quantity: unknown,
  unitPrice: unknown,
) {
  // The pipeline correctly connects decoded quantity and unitPrice to calculation and formatting of their total.
  return yield* Effect.all({
    quantity: Schema.decodeUnknownEffect(Schema.Int)(quantity),
    unitPrice: Schema.decodeUnknownEffect(Schema.Finite)(unitPrice),
  }).pipe(
    Effect.map((item) => item.quantity * item.unitPrice),
    Effect.map((total) => `$${total.toFixed(2)}`),
  );
});
