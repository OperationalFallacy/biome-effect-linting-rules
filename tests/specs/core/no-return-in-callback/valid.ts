const names = [" Mira ", "Owen"];

/**
 * trimmed correctly uses an expression callback for each name's trim.
 * The transformation needs no local declarations or dynamic receiver.
 */
export const trimmed = names.map(
  // The expression correctly states the complete trim without a return-only body.
  (name) => name.trim(),
);
