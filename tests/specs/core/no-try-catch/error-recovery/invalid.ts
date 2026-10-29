import { Effect, Schema } from "effect";

/**
 * Incorrectly catches synchronous decoder exceptions inside an Effect operation.
 * The failures never enter the typed error channel for recovery through composition.
 */
export const readCount = Effect.fn("readCount")(function* (text: string) {
  try {
    return Schema.decodeUnknownSync(Schema.Number)(JSON.parse(text));
  } catch {
    return 0;
  }
});
