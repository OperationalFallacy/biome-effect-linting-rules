import { Data, Effect, FileSystem, Match, Schema } from "effect";

const SavedSession = Schema.fromJsonString(
  Schema.Struct({
    sessionId: Schema.NonEmptyString,
    expiresAt: Schema.Finite,
  }),
);

type SessionCleanup = Data.TaggedEnum<{
  Removed: { readonly sessionId: string };
  Retained: { readonly sessionId: string; readonly expiresAt: number };
}>;
const SessionCleanup = Data.taggedEnum<SessionCleanup>();

/**
 * The removeExpiredSession function applies the expiry check to file removal
 * with Effect.when. The result confirms deletion or tells the caller when
 * the retained session expires.
 */
export const removeExpiredSession = Effect.fn("removeExpiredSession")(
  function* (sessionPath: string, now: number) {
    const fs = yield* FileSystem.FileSystem;

    const session = yield* fs
      .readFileString(sessionPath)
      .pipe(Effect.flatMap(Schema.decodeUnknownEffect(SavedSession)));

    const expired = session.expiresAt <= now;

    yield* fs.remove(sessionPath).pipe(
      // Effect.when keeps the file in place for a live session.
      Effect.when(Effect.succeed(expired)),
      Effect.asVoid,
    );

    return Match.value(expired).pipe(
      Match.when(true, () =>
        SessionCleanup.Removed({ sessionId: session.sessionId }),
      ),
      Match.orElse(() =>
        SessionCleanup.Retained({
          sessionId: session.sessionId,
          expiresAt: session.expiresAt,
        }),
      ),
    );
  },
);
