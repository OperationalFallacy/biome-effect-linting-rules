import { Data, Option, Schema } from "effect";

const messageFields = (error: Error) => ({ message: error.message });

/**
 * Incorrectly splits response construction across object-fragment helpers.
 * The caller must inspect the helper to discover the complete response shape.
 */
export const toResponse = (error: Error) => ({
  kind: "Failure",
  ...messageFields(error),
});

export const toTracedResponse = (error: Error) => ({
  ...messageFields(error),
  trace: Option.fromNullishOr(error.stack).pipe(
    Option.map((stack) => stack.split("\n")),
  ),
});

class ReadFailure extends Schema.TaggedError<ReadFailure>()("ReadFailure", {
  operation: Schema.String,
  reason: Schema.String,
  cause: Schema.Unknown,
}) {}
const failureFields = (cause: unknown) => ({ reason: "Read failed", cause });

/**
 * Incorrectly hides required constructor fields in a spread-producing helper.
 * The construction site no longer describes the complete error value.
 */
export const toReadFailure = (operation: string, cause: unknown) =>
  new ReadFailure({ operation, ...failureFields(cause) });

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
 * Correctly defines a complete typed projection. The return type names the
 * whole result that the helper constructs.
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
