import { Option, Schema, Match } from "effect";

const renderCandidate = (candidate: unknown) =>
  Option.liftPredicate((value: unknown): value is string => typeof value === "string")(candidate);

interface ServiceManifest {
  readonly resources: Record<string, unknown>;
}

const isUnknownRecord = (input: unknown): input is Record<string, unknown> =>
  typeof input === "object" && input !== null;

const ServiceManifestSchema = Schema.declare(
  (input: unknown): input is ServiceManifest =>
    isUnknownRecord(input) && isUnknownRecord(input.resources),
);

const MissingBook = Schema.TaggedStruct("MissingBook", {
  isbn: Schema.String,
  shelf: Schema.String,
});

type MissingBook = typeof MissingBook.Type;
const decodeMissingBook = Schema.decodeUnknownEffect(MissingBook);

const missingIsbn = (failure: MissingBook) =>
  Match.value(failure).pipe(
    Match.tag("MissingBook", ({ isbn }) => isbn),
    Match.exhaustive,
  );

interface DataMessage {
  readonly kind: "data";
  readonly payload: string;
}

type StreamMessage = DataMessage | { readonly kind: "status" };

class StreamFailure extends Error {}

const isDataMessage = (message: StreamMessage): message is DataMessage => message.kind === "data";

const failureMessage = (cause: unknown) =>
  Match.value(cause).pipe(
    Match.when(
      (error: unknown): error is StreamFailure => error instanceof StreamFailure,
      (error) => error.message,
    ),
    Match.orElse(String),
  );
