import { Array as Arr, Effect, Schema } from "effect";

/**
 * Correctly uses Effect.all to collect independent validation results.
 * Result mode represents validation failures as data so one bad input
 * does not stop the batch.
 */
export const validateNames = Effect.fn("validateNames")(
  (names: ReadonlyArray<unknown>) =>
    Effect.all(
      Arr.map(names, (input) =>
        Schema.decodeUnknownEffect(Schema.NonEmptyString)(input).pipe(
          Effect.tap((name) => Effect.logInfo(`Guest name accepted: ${name}`)),
        ),
      ),
      { concurrency: 1, mode: "result" },
    ),
);
