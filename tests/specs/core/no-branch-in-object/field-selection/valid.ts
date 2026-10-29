import { Result } from "effect";

/**
 * Correctly selects the field value before constructing the result object.
 * The object declaration describes the result's structure directly.
 */
export const summarize = (result: Result.Result<number, string>) => {
  const count = Result.match(result, {
    onSuccess: (count) => count,
    onFailure: () => 0,
  });
  return { count };
};
