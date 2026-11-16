import { Effect, FileSystem, Match, Option, Schema } from "effect";

const PreferenceChange = Schema.Struct({
  enabled: Schema.optional(Schema.NullOr(Schema.Boolean)),
});

const DigestPreferences = Schema.Struct({
  recipient: Schema.NonEmptyString,
  enabled: Schema.Boolean,
});

const SavedPreferences = Schema.fromJsonString(DigestPreferences);

/**
 * The updateDigestPreference function rejects malformed flags during decoding.
 * It saves true or false as the new setting and returns the updated preference.
 * It keeps the current setting when enabled is null or undefined.
 */
export const updateDigestPreference = Effect.fn("updateDigestPreference")(
  function* (input: unknown, preferencesPath: string) {
    // It correctly validates the optional boolean before service work.
    const change = yield* Schema.decodeUnknownEffect(PreferenceChange)(input);

    const requested = Option.fromNullishOr(change.enabled);

    const fs = yield* FileSystem.FileSystem;
    const preferences = yield* fs
      .readFileString(preferencesPath)
      .pipe(Effect.flatMap(Schema.decodeUnknownEffect(SavedPreferences)));

    const updated = DigestPreferences.make({
      recipient: preferences.recipient,
      enabled: Option.getOrElse(requested, () => preferences.enabled),
    });

    const contents = yield* Schema.encodeEffect(SavedPreferences)(updated);

    yield* fs
      .writeFileString(preferencesPath, contents)
      .pipe(Effect.when(Effect.succeed(Option.isSome(requested))));

    return updated;
  },
);

/**
 * preferenceLabel shows whether a typed saved preference has a value. Both
 * true and false count as specified; undefined produces no label. This type
 * check does not coerce unknown input. The label's null fallback belongs to
 * a different operation and must not change the check's diagnostics.
 */
// It correctly checks presence without normalizing an unknown flag.
const isPreferenceSpecified = (enabled: boolean | undefined) =>
  typeof enabled === "boolean";

export const preferenceLabel = (enabled: boolean | undefined) =>
  Match.value(isPreferenceSpecified(enabled)).pipe(
    Match.when(true, () => "Preference set"),
    Match.orElse(() => null),
  );
