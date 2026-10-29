/**
 * Correctly constructs the complete nested response body at its declaration site.
 */
export const response = (cause: Error) => ({
  status: 400,
  body: { type: "ValidationFailure", message: cause.message },
});

/**
 * Correctly spreads complete input records when the operation adds fields.
 * The inputs already represent the domain values that the caller supplies.
 */
export const workflow = (
  baseJob: { readonly name: string },
  existingSteps: ReadonlyArray<string>,
) => ({
  ...baseJob,
  steps: ["checkout", "corepack", ...existingSteps.slice(1)],
});

export const request = (
  defaults: { readonly endpoint: string },
  attempts: ReadonlyArray<{ readonly number: number }>,
) => ({
  ...defaults,
  retries: attempts.map((attempt) => ({ ...attempt, delay: 100 })),
});
