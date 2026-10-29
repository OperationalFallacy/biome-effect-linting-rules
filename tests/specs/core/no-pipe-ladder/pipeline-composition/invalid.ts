import { Array as Arr, Effect, pipe } from "effect";

const amounts = [12, 8, 5];
const sum = (values: ReadonlyArray<number>) =>
  Arr.reduce(values, 0, (total, value) => total + value);
const format = (total: number) => `$${total.toFixed(2)}`;

/**
 * Incorrectly nests or chains pipe calls to compose one sequence of
 * transformations. Each extra pipe splits the same data flow across expressions.
 */
export const receipt = pipe(pipe(amounts, sum), format);
export const receiptEffect = Effect.succeed(amounts)
  .pipe(Effect.map(sum))
  .pipe(Effect.map(format));

/**
 * Correctly places consecutive transformations in one pipe call.
 */
export const directReceipt = pipe(amounts, sum, format);
