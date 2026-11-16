/**
 * The response correctly defines the complete nested body in one place.
 * Its type and message are visible together without a fragment helper.
 */
export const response = (cause: Error) => ({
  status: 400,
  body: { type: "ValidationFailure", message: cause.message },
});

/**
 * The workflow and request correctly extend complete input records. Their
 * spreads preserve supplied values, while the new steps and retries remain
 * visible at construction.
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
