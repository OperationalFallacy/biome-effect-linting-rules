import { Effect, pipe } from "effect";

type PolicyResult = {
  readonly decision: "ALLOW" | "DENY";
};

export const evaluatePolicy = (
  policyText: string,
): Effect.Effect<PolicyResult, Error> => {
  // Derailment: the pipeline itself is pre-staged as a const. The operation now
  // has a named Effect fragment instead of one continuous visible flow.
  const evaluationPipeline = pipe(
    Effect.try({
      try: () => JSON.parse(policyText) as { readonly allow?: boolean },
      catch: (cause) => new Error(`Policy parse failed: ${cause}`),
    }),
    Effect.map((policy): PolicyResult => ({
      decision: policy.allow === true ? "ALLOW" : "DENY",
    })),
  );

  return evaluationPipeline;
};
