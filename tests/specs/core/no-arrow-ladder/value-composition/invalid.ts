import { pipe } from "effect";

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
const addLabel = (value: string) => `Total: ${value}`;

/**
 * Unnecessarily nests immediately invoked callbacks to pass intermediate
 * values between transformations. Each function adds a scope to the same data flow.
 */
export const describeTotal = (price: number, quantity: number) =>
  ((subtotal: number) =>
    ((formatted: string) => addLabel(formatted))(formatCurrency(subtotal)))(
    price * quantity,
  );

/**
 * Correctly composes transformations in one pipeline.
 */
export const describeValue = (value: number) =>
  pipe(value, formatCurrency, addLabel);
