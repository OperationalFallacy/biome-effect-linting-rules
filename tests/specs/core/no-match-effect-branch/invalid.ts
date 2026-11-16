import { Effect, FileSystem, Match, Schema } from "effect";

const ReportRequest = Schema.Struct({
  format: Schema.Literals(["compact", "indented"]),
  report: Schema.Struct({ title: Schema.NonEmptyString, total: Schema.Finite }),
});
const CompactReport = Schema.fromJsonString(ReportRequest.fields.report);
const IndentedReport = Schema.fromJsonString(ReportRequest.fields.report, {
  space: 2,
});
const ReportReceipt = Schema.Struct({ filePath: Schema.NonEmptyString });

/**
 * exportReport writes a report in the requested JSON format and returns its
 * file path after the write succeeds. Each branch encodes only its own format,
 * but repeats the encoding, write, and receipt sequence. The preset requires
 * the format decision to select an encoder before that shared sequence.
 */
export const exportReport = Effect.fn("exportReport")(function* (
  input: unknown,
  filePath: string,
) {
  const request = yield* Schema.decodeUnknownEffect(ReportRequest)(input);
  const fs = yield* FileSystem.FileSystem;

  // It incorrectly builds the complete Effect sequence in each format branch.
  return yield* Match.value(request.format).pipe(
    Match.when("compact", () =>
      Schema.encodeEffect(CompactReport)(request.report).pipe(
        Effect.flatMap((contents) => fs.writeFileString(filePath, contents)),
        Effect.map(() => ReportReceipt.make({ filePath })),
      ),
    ),
    Match.orElse(() =>
      Schema.encodeEffect(IndentedReport)(request.report).pipe(
        Effect.flatMap((contents) => fs.writeFileString(filePath, contents)),
        Effect.map(() => ReportReceipt.make({ filePath })),
      ),
    ),
  );
});
