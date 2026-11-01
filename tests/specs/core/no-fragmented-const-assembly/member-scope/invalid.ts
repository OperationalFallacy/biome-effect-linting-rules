const errorFields = (cause: Error) => ({ message: cause.message });

/**
 * Incorrectly splits a nested response body across a fragment helper and its
 * parent object. The body declaration hides part of its own payload.
 */
export const response = (cause: Error) => ({
  status: 400,
  body: { type: "ValidationFailure", ...errorFields(cause) },
});
