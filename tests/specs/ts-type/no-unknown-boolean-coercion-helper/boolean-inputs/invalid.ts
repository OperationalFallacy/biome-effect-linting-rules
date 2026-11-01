import { Match } from "effect";

/**
 * Incorrectly converts malformed boolean input into a null sentinel.
 * Rejection loses the structured failure information needed by Effect callers.
 */
export const decodeEnabled = (input: unknown) =>
  Match.value(input).pipe(
    Match.when(
      (value: unknown): value is boolean => typeof value === "boolean",
      (value) => value,
    ),
    Match.orElse(() => null),
  );
