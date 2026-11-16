interface InvoiceLine {
  readonly quantity: number;
  readonly unitPriceCents: number;
}

/**
 * invoiceTotal returns the invoice total in cents, or zero for an empty invoice.
 * Each unit price is already in cents. The callback mutates an outer total,
 * which the preset prohibits. Use a reducer so each calculation receives
 * its subtotal and returns the next one.
 */
export function invoiceTotal(lines: ReadonlyArray<InvoiceLine>) {
  // It incorrectly declares a mutable running total.
  let totalCents = 0;
  lines.forEach((line) => {
    // It incorrectly mutates the total from the callback.
    totalCents += line.quantity * line.unitPriceCents;
  });
  return totalCents;
}
