import { Array as Arr, Effect, pipe } from "effect";

const amounts = [12, 8, 5];
const sum = (values: ReadonlyArray<number>) =>
  Arr.reduce(values, 0, (total, value) => total + value);
const format = (total: number) => `$${total.toFixed(2)}`;

/**
 * Correctly composes consecutive transformations in one pipeline. A new pipe
 * call is unnecessary when the next step continues the same data flow.
 */
export const receipt = pipe(amounts, sum, format);
export const receiptEffect = Effect.succeed(amounts).pipe(
  Effect.map(sum),
  Effect.map(format),
);
export const directReceipt = pipe(amounts, sum, format);
