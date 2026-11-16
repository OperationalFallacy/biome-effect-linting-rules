import { Result } from "effect";

/**
 * The summarize function resolves the Result before it constructs the summary
 * object. The count field receives the selected value, so the object
 * declaration no longer contains a decision.
 */
export const summarize = (result: Result.Result<number, string>) => {
  const count = Result.match(result, {
    onSuccess: (count) => count,
    onFailure: () => 0,
  });

  // A failure still produces a summary with a zero count.
  return { count };
};
