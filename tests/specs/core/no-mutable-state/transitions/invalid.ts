/**
 * Array.reduce passes each subtotal to the next callback and returns the final
 * subtotal. Use that accumulator to keep the sum in the transformation instead
 * of coordinating updates through a captured variable.
 */
export function sum(values: ReadonlyArray<number>) {
  let total = 0;
  values.forEach((value) => { total += value; });
  return total;
}
