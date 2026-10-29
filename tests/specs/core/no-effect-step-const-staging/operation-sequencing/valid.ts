import { Effect, Schema } from "effect";

const Policy = Schema.Struct({ allow: Schema.optionalKey(Schema.Boolean) });
const decodePolicy = Schema.decodeUnknownEffect(Schema.fromJsonString(Policy));
type Decision = { readonly decision: "ALLOW" | "DENY" };

/**
 * Correctly composes validation and result construction in one operation.
 * The decoder's failure channel flows through the dependent transformation.
 */
export const evaluatePolicy = Effect.fn("evaluatePolicy")((text: string) =>
  decodePolicy(text).pipe(
    Effect.map((policy) => policy.allow === true),
    Effect.map((allow): Decision => ({ decision: allow ? "ALLOW" : "DENY" })),
  ),
);
export const evaluateViaPipe = evaluatePolicy;

/**
 * Correctly names a completed domain value inside a transformation.
 */
export const evaluateDirect = Effect.fn("evaluateDirect")((text: string) =>
  decodePolicy(text).pipe(
    Effect.map((policy): Decision => {
      const result: Decision = {
        decision: policy.allow === true ? "ALLOW" : "DENY",
      };
      return result;
    }),
  ),
);
