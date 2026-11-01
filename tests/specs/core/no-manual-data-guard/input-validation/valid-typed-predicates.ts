type DataMessage = { readonly kind: "data"; readonly payload: string };
type StreamMessage = DataMessage | { readonly kind: "status" };

/**
 * Correctly narrows an already-typed union through its discriminant.
 * The input has already passed the external-data validation step.
 */
export const isDataMessage = (message: StreamMessage): message is DataMessage =>
  message.kind === "data";

export class StreamFailure extends Error {}

/**
 * Correctly checks nominal class identity with instanceof. The predicate
 * identifies an existing error instance for subsequent error handling.
 */
export const isStreamFailure = (cause: unknown): cause is StreamFailure =>
  cause instanceof StreamFailure;
