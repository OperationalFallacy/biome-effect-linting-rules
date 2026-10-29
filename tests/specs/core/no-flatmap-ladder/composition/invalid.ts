import { Effect, Schema } from "effect";

const Guest = Schema.Struct({ name: Schema.NonEmptyString });

/**
 * Unnecessarily nests Effect.flatMap callbacks to compose dependent effects,
 * adding callback scopes to a linear workflow.
 */
export const greet = Effect.fn("greet")((input: unknown) =>
  Effect.flatMap(Schema.decodeUnknownEffect(Guest)(input), (guest) =>
    Effect.flatMap(Effect.logInfo(`Hello, ${guest.name}`), () =>
      Effect.succeed(guest.name),
    ),
  ),
);
