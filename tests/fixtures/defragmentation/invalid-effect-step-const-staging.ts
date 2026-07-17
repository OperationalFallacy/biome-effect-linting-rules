import { Effect } from "effect";

type PolicyResult = {
  readonly decision: "ALLOW" | "DENY";
};

export const evaluatePolicy = (
  policyText: string,
): Effect.Effect<PolicyResult, Error> => {
  // Derailment: this const stores an intermediate Effect step. The next const
  // depends on it, so the operation flow is split into named staging pieces.
  const parsedPolicy = Effect.try({
    try: () => JSON.parse(policyText) as { readonly allow?: boolean },
    catch: (cause) => new Error(`Policy parse failed: ${cause}`),
  });

  // Derailment: this second Effect const continues the staged chain instead of
  // keeping parse -> validate -> result construction in one visible pipeline.
  const evaluatedPolicy = Effect.map(parsedPolicy, (policy): PolicyResult => ({
    decision: policy.allow === true ? "ALLOW" : "DENY",
  }));

  return evaluatedPolicy;
};
