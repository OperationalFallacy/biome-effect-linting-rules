import { Data, Option, Schema } from "effect";

/**
 * Correctly constructs the complete response at one site. The field definitions
 * describe the result without a fragment-producing helper.
 */
export const toResponse = (error: Error) => ({
  kind: "Failure",
  message: error.message,
});
export const toTracedResponse = (error: Error) => ({
  message: error.message,
  trace: Option.fromNullishOr(error.stack).pipe(
    Option.map((stack) => stack.split("\n")),
  ),
});

class ReadFailure extends Schema.TaggedError<ReadFailure>()("ReadFailure", {
  operation: Schema.String,
  reason: Schema.String,
  cause: Schema.Unknown,
}) {}

/**
 * Correctly supplies the complete error payload to its schema constructor.
 */
export const toReadFailure = (operation: string, cause: unknown) =>
  new ReadFailure({ operation, reason: "Read failed", cause });

type FailureKind = Data.TaggedEnum<{ Read: { readonly operation: string } }>;
const FailureKind = Data.taggedEnum<FailureKind>();

/**
 * Correctly exposes a complete tagged constructor as a reusable domain operation.
 */
export const readFailureKind = FailureKind.Read;

interface ErrorView {
  readonly message: string;
}

/**
 * Correctly defines a complete typed projection.
 */
export const projectError = (error: Error): ErrorView => ({
  message: error.message,
});

/**
 * Correctly exposes a complete schema decoder as a reusable operation.
 */
export const decodeErrorView = Schema.decodeUnknownEffect(
  Schema.Struct({ message: Schema.String }),
);
