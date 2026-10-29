import { Effect, Schema, pipe } from "effect";

const Policy = Schema.Struct({ allow: Schema.optionalKey(Schema.Boolean) });
const decodePolicy = Schema.decodeUnknownEffect(Schema.fromJsonString(Policy));
type Decision = { readonly decision: "ALLOW" | "DENY" };

/**
 * Incorrectly stages validation and result construction as separate Effect
 * constants. The reader must follow the bindings to reconstruct one operation.
 */
export const evaluatePolicy = Effect.fn("evaluatePolicy")((text: string) => {
  const allowed = decodePolicy(text).pipe(
    Effect.map((policy) => policy.allow === true),
  );
  const evaluated = allowed.pipe(
    Effect.map((allow): Decision => ({ decision: allow ? "ALLOW" : "DENY" })),
  );
  return evaluated;
});

/**
 * Incorrectly names an entire pipeline only to return it in the next statement.
 * The binding adds another lookup without representing a reusable operation.
 */
export const evaluateViaPipe = Effect.fn("evaluateViaPipe")((text: string) => {
  const evaluation = pipe(
    decodePolicy(text),
    Effect.map(
      (policy): Decision => ({
        decision: policy.allow === true ? "ALLOW" : "DENY",
      }),
    ),
  );
  return evaluation;
});

/**
 * Correctly names a completed domain value inside a transformation.
 * This local record is the operation's result, not an unexecuted Effect step.
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
