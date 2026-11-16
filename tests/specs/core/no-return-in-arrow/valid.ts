import { Array as Arr, String as Str } from "effect";

const names = ["Ada", "Grace"];

/**
 * searchTerms converts display names to lowercase search terms.
 * Arr.map accepts Str.toLowerCase directly, so the operation needs no
 * wrapper callback.
 */
export const searchTerms = Arr.map(
  names,
  // It correctly passes Str.toLowerCase directly to Arr.map.
  Str.toLowerCase,
);
