const names = ["Ada", "Grace"];

/**
 * Correctly uses an expression callback for a single transformation.
 */
export const searchTerms = names.map((name) => name.toLowerCase());

/**
 * Correctly uses a block callback when a local declaration needs its own scope.
 */
export const labels = names.map((input) => {
  const name = input.trim();
  return name.toUpperCase();
});
