import { Array as Arr } from "effect";

interface InvoiceLine {
  readonly quantity: number;
  readonly unitPriceCents: number;
}

/**
 * invoiceTotal returns the invoice total in cents, or zero for an empty invoice.
 * Each unit price is already in cents. Arr.reduce passes the subtotal into
 * each line calculation and uses its result as the next subtotal without
 * a callback mutating an outer variable.
 */
export const invoiceTotal = (lines: ReadonlyArray<InvoiceLine>) =>
  // It correctly returns each subtotal through Arr.reduce.
  Arr.reduce(
    lines,
    0,
    (totalCents, line) => totalCents + line.quantity * line.unitPriceCents,
  );
