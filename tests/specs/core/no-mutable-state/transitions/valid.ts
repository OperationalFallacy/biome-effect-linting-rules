import { Array as Arr } from "effect";

/**
 * Effect's Array.reduce passes the index after the accumulator and current
 * item. Each callback returns the next accumulator, so a rewrite must preserve
 * that argument order.
 */
export const sum = (values: ReadonlyArray<number>) =>
  Arr.reduce(values, 0, (total, value) => total + value);
