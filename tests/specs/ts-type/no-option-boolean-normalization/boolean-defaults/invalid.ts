import { Effect, Option } from "effect";

/**
 * Questionably normalizes an optional boolean inside the operation.
 * The default policy is separate from input validation and can drift between callers.
 */
export const decodeEnabled = Effect.fn("decodeEnabled")(
  (input: { readonly enabled?: boolean }) =>
    Effect.succeed(
      Option.match(Option.fromNullishOr(input.enabled), {
        onSome: (flag) => flag === true,
        onNone: () => false,
      }),
    ),
);
