import { Effect, FileSystem, Match, Option, Schema } from "effect";

const PreferenceChange = Schema.Struct({
  enabled: Schema.optional(Schema.Unknown),
});

const DigestPreferences = Schema.Struct({
  recipient: Schema.NonEmptyString,
  enabled: Schema.Boolean,
});

const SavedPreferences = Schema.fromJsonString(DigestPreferences);

/**
 * The updateDigestPreference function treats "true" as though the request
 * supplied no flag. The caller receives a successful result with the old
 * preference because the function ignores the malformed value.
 */
export const updateDigestPreference = Effect.fn("updateDigestPreference")(
  function* (input: unknown, preferencesPath: string) {
    const change = yield* Schema.decodeUnknownEffect(PreferenceChange)(input);

    // It incorrectly converts malformed flags to absence in the Match.
    const enabled = Match.value(change.enabled).pipe(
      Match.when(
        (value: unknown) => typeof value === "boolean",
        (value) => value,
      ),
      Match.orElse(() => null),
    );

    const requested = Option.fromNullishOr(enabled);

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
