import { Effect, Schema } from "effect";

const decodedCount = Schema.decodeUnknownEffect(Schema.Int)(3);

/**
 * Correctly passes an Effect.fn operation as a flatMap callback. The operation
 * performs its work when the preceding effect supplies its input.
 */
export const reportCount = Effect.flatMap(
  decodedCount,
  Effect.fn("reportCount")(function* (count: number) {
    yield* Effect.logDebug("Count", count);
    return count;
  }),
);

/**
 * Correctly uses the untraced operation constructor as a flatMap callback.
 */
export const reportCountUntraced = Effect.flatMap(
  decodedCount,
  Effect.fnUntraced(function* (count: number) {
    yield* Effect.logDebug("Count", count);
    return count;
  }),
);

/**
 * Correctly uses the eager untraced constructor as a flatMap callback.
 * The callback's first yield supplies an Effect for execution.
 */
export const reportCountEager = Effect.flatMap(
  decodedCount,
  Effect.fnUntracedEager(function* (count: number) {
    yield* Effect.logDebug("Count", count);
    return count;
  }),
);

/**
 * Correctly passes an Effect directly to a runner at an integration entry point.
 */
export const timestamp = Effect.runSync(
  Effect.clockWith((clock) => clock.currentTimeMillis),
);
export const timestampExit = Effect.runSyncExit(
  Effect.clockWith((clock) => clock.currentTimeMillis),
);
