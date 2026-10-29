import { Result } from "effect";

/**
 * Incorrectly embeds a Result decision inside an object field. The object
 * mixes value selection with result assembly.
 */
export const summarize = (result: Result.Result<number, string>) => ({
  count: Result.match(result, {
    onSuccess: (count) => count,
    onFailure: () => 0,
  }),
});
