import { Effect, Schema } from "effect";

const Profile = Schema.Struct({ displayName: Schema.NonEmptyString });

/**
 * Correctly composes dependent effects in a pipeline. The decoder and projection
 * follow the parser in execution order.
 */
export const displayName = Effect.fn("displayName")((text: string) =>
  Effect.try(() => JSON.parse(text)).pipe(
    Effect.flatMap(Schema.decodeUnknownEffect(Profile)),
    Effect.map((profile) => profile.displayName),
  ),
);
