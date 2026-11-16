import { Array as Arr, String as Str } from "effect";

const names = ["Ada", "Grace"];

/**
 * searchTerms converts display names to lowercase search terms.
 * The arrow wraps Str.toLowerCase in a block with only a return statement.
 * Pass this existing transformation directly to Arr.map.
 */
export const searchTerms = Arr.map(names, (name) => {
  // It incorrectly wraps one expression in a return-only block.
  return Str.toLowerCase(name);
});
