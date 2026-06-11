class BoundaryError extends Error {
  readonly reason: string;
  readonly cause: unknown;

  constructor(input: {
    readonly reason: string;
    readonly parameterName: string;
    readonly cause: unknown;
  }) {
    super(input.reason);
    this.reason = input.reason;
    this.cause = input.cause;
  }
}

// Derailment: this helper returns a partial constructor payload instead of a
// named complete error contract.
const errorFields = (cause: unknown) => ({
  reason: "Failed to load config",
  cause,
});

// Derailment: the constructor payload is split across a helper fragment and the
// final call site.
export const toBoundaryError = (parameterName: string, cause: unknown) =>
  new BoundaryError({
    parameterName,
    ...errorFields(cause),
  });
