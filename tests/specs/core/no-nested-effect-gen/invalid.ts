import { Effect, Schema } from "effect";

const decodeCount = Schema.decodeUnknownEffect(Schema.Int);

/**
 * readCount incorrectly wraps count decoding in two generator bodies. The
 * outer body only yields the inner decoding operation, adding a scope without
 * another step in the task.
 */
export const readCount = (input: unknown) =>
  Effect.gen(function* () {
    // This inner generator incorrectly adds a second scope around count decoding.
    return yield* Effect.gen(function* () {
      return yield* decodeCount(input);
    });
  });
