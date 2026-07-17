import { Match } from "effect";

interface DataMessage {
  readonly kind: "data";
  readonly payload: string;
}

type StreamMessage = DataMessage | { readonly kind: "status" };

class StreamFailure extends Error {}

// Allowed: this narrows an existing typed union; it does not validate unknown data.
const isDataMessage = (message: StreamMessage): message is DataMessage =>
  message.kind === "data";

// Allowed: instanceof verifies runtime class identity instead of reconstructing a model.
const failureMessage = (cause: unknown) =>
  Match.value(cause).pipe(
    Match.when(
      (error: unknown): error is StreamFailure => error instanceof StreamFailure,
      (error) => error.message,
    ),
    Match.orElse(String),
  );

export { failureMessage, isDataMessage };
