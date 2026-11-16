import { Array as Arr, Effect, Option, Schema } from "effect";

const DownloadAccess = Schema.Struct({
  permissions: Schema.Array(Schema.String),
  downloadUrl: Schema.NonEmptyString,
});

const DownloadLink = Schema.Struct({ url: Schema.NonEmptyString });

/**
 * The download lookup selects its fixed link in an Option.map callback as
 * the repository convention requires. It constructs the link before the
 * permission lookup in both forms. The callback returns that existing link
 * only for a matching permission; an absent permission still returns None.
 */
export const resolveDownload = Effect.fn("resolveDownload")(function* (
  input: unknown,
) {
  const access = yield* Schema.decodeUnknownEffect(DownloadAccess)(input);
  const link = DownloadLink.make({ url: access.downloadUrl });

  return Arr.findFirst(
    access.permissions,
    (permission) => permission === "download",
  ).pipe(
    // It correctly selects the existing link through a callback.
    Option.map(() => link),
  );
});
