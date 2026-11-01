import { pipe } from "effect";

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
const addLabel = (value: string) => `Total: ${value}`;

/**
 * Correctly composes transformations in one pipeline. Intermediate values pass
 * directly between callbacks without nested function invocations.
 */
export const describeTotal = (price: number, quantity: number) =>
  pipe(price * quantity, formatCurrency, addLabel);
export const describeValue = (value: number) =>
  pipe(value, formatCurrency, addLabel);
