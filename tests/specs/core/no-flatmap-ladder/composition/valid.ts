import { Effect, Schema } from "effect";

const Guest = Schema.Struct({ name: Schema.NonEmptyString });

/**
 * Correctly composes dependent effects in a pipeline. Effect.tap adds logging
 * while preserving the pipeline's success value.
 */
export const greet = Effect.fn("greet")((input: unknown) =>
  Schema.decodeUnknownEffect(Guest)(input).pipe(
    Effect.map((guest) => guest.name),
    Effect.tap((name) => Effect.logInfo(`Hello, ${name}`)),
  ),
);
