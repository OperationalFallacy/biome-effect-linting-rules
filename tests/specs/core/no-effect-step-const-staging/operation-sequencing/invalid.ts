import { Effect, pipe } from "effect";

type PolicyResult = {
  readonly decision: "ALLOW" | "DENY";
};

const effectStepConstStagingEvaluatePolicy = (
  policyText: string,
): Effect.Effect<PolicyResult, Error> => {
  const parsedPolicy = Effect.try({
    try: () => JSON.parse(policyText) as { readonly allow?: boolean },
    catch: (cause) => new Error(`Policy parse failed: ${cause}`),
  });

  // Derailment: this second Effect const continues the staged chain instead of
  // keeping parse -> validate -> result construction in one visible pipeline.
  const evaluatedPolicy = Effect.map(
    parsedPolicy,
    (policy): PolicyResult => ({
      decision: policy.allow === true ? "ALLOW" : "DENY",
    }),
  );

  return evaluatedPolicy;
};

const pipeEffectStepConstStagingEvaluatePolicy = (
  policyText: string,
): Effect.Effect<PolicyResult, Error> => {
  const evaluationPipeline = pipe(
    Effect.try({
      try: () => JSON.parse(policyText) as { readonly allow?: boolean },
      catch: (cause) => new Error(`Policy parse failed: ${cause}`),
    }),
    Effect.map(
      (policy): PolicyResult => ({
        decision: policy.allow === true ? "ALLOW" : "DENY",
      }),
    ),
  );

  return evaluationPipeline;
};

const effectStepContinuousFlowEvaluatePolicy = (
  policyText: string,
): Effect.Effect<PolicyResult, Error> =>
  pipe(
    Effect.try({
      try: () => JSON.parse(policyText) as { readonly allow?: boolean },
      catch: (cause) => new Error(`Policy parse failed: ${cause}`),
    }),
    Effect.map((policy): PolicyResult => {
      const result: PolicyResult = {
        decision: policy.allow === true ? "ALLOW" : "DENY",
      };

      return result;
    }),
  );
