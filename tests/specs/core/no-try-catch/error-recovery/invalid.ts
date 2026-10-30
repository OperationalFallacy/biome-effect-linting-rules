import { Effect, Schema } from "effect";

/**
 * Effect.try captures exceptions from JSON.parse as typed failures. Chain the
 * schema decoder with Effect.flatMap so one Effect.catch can recover from
 * either failure.
 */
export const readCount = Effect.fn("readCount")(function* (text: string) {
  try {
    return Schema.decodeUnknownSync(Schema.Number)(JSON.parse(text));
  } catch {
    return 0;
  }
});
