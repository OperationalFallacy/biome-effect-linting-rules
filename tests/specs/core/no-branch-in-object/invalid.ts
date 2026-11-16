import { Result } from "effect";

/**
 * The summarize function places its Result decision inside the count field.
 * The object declaration combines the choice between success and failure
 * with construction of the summary.
 */
export const summarize = (result: Result.Result<number, string>) => ({
  // The count field mixes value selection with object construction.
  count: Result.match(result, {
    onSuccess: (count) => count,
    onFailure: () => 0,
  }),
});
