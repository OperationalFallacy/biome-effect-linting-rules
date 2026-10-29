const names = ["Ada", "Grace"];

/**
 * Unnecessarily wraps a single callback expression in a block and return
 * statement. The extra control-flow syntax obscures a direct transformation.
 */
export const searchTerms = names.map((name) => {
  return name.toLowerCase();
});
