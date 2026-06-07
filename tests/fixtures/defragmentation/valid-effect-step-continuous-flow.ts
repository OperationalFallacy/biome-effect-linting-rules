import { Effect, pipe } from "effect";

type PolicyResult = {
  readonly decision: "ALLOW" | "DENY";
};

export const evaluatePolicy = (
  policyText: string,
): Effect.Effect<PolicyResult, Error> =>
  // Proper usage for this rule: the Effect steps stay in one visible operation
  // pipeline. There is no intermediate const that stores a partial Effect step.
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
