import { Effect, Schema } from "effect";

const Profile = Schema.Struct({ displayName: Schema.NonEmptyString });

/**
 * Incorrectly nests Effect.map around another Effect call. The outer syntax
 * presents the final transformation before the operation that supplies its value.
 */
export const displayName = Effect.fn("displayName")((text: string) =>
  Effect.map(
    Effect.flatMap(
      Effect.try(() => JSON.parse(text)),
      Schema.decodeUnknownEffect(Profile),
    ),
    (profile) => profile.displayName,
  ),
);
