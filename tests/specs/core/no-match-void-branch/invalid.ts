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
 * The removeExpiredSession function adds an empty Effect.void branch for a
 * live session. This makes optional removal look like a choice between two
 * operations.
 */
export const removeExpiredSession = Effect.fn("removeExpiredSession")(
  function* (sessionPath: string, now: number) {
    const fs = yield* FileSystem.FileSystem;

    const session = yield* fs
      .readFileString(sessionPath)
      .pipe(Effect.flatMap(Schema.decodeUnknownEffect(SavedSession)));

    const expired = session.expiresAt <= now;

    // The function uses a separate empty branch just to keep a live session.
    yield* Match.value(expired).pipe(
      Match.when(false, () => Effect.void),
      Match.orElse(() => fs.remove(sessionPath)),
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
