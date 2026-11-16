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
 * file path after the write succeeds. Match selects the encoder, then one
 * sequence encodes the report once and writes it. Input, encoding, and write
 * failures remain Effect failures; no receipt is returned after a failed write.
 */
export const exportReport = Effect.fn("exportReport")(function* (
  input: unknown,
  filePath: string,
) {
  const request = yield* Schema.decodeUnknownEffect(ReportRequest)(input);
  const fs = yield* FileSystem.FileSystem;

  // It correctly selects the encoder before the Effect sequence.
  const encodeReport = Match.value(request.format).pipe(
    Match.when("compact", () => Schema.encodeEffect(CompactReport)),
    Match.orElse(() => Schema.encodeEffect(IndentedReport)),
  );
  const contents = yield* encodeReport(request.report);

  yield* fs.writeFileString(filePath, contents);

  return ReportReceipt.make({ filePath });
});
