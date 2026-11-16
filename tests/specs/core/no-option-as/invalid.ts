import { Array as Arr, Effect, Option, Schema } from "effect";

const DownloadAccess = Schema.Struct({
  permissions: Schema.Array(Schema.String),
  downloadUrl: Schema.NonEmptyString,
});

const DownloadLink = Schema.Struct({ url: Schema.NonEmptyString });

/**
 * The download lookup supplies a fixed link to Option.as. The repository
 * convention requires result selection in a callback, which this expression
 * omits.
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
    // The lookup supplies a fixed link without a result-producing callback.
    Option.as(link),
  );
});
