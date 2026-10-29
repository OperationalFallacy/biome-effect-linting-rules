import { Effect, Schema } from "effect";

const Settings = Schema.Struct({
  enabled: Schema.optionalKey(Schema.Boolean).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed(false)),
  ),
});

/**
 * Correctly defines the boolean default in the schema. Decoding applies the
 * same validation and absence policy before the operation uses the value.
 */
export const decodeEnabled = Effect.fn("decodeEnabled")((input: unknown) =>
  Schema.decodeUnknownEffect(Settings)(input).pipe(
    Effect.map((settings) => settings.enabled),
  ),
);
