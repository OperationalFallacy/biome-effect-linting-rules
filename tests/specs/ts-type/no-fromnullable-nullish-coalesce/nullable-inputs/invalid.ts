import { Option } from "effect";

/**
 * Unnecessarily normalizes nullish values before Option.fromNullishOr.
 * The fallback repeats the conversion that already represents absence.
 */
export const asName = (input: string | null | undefined) =>
  Option.fromNullishOr(input ?? null);
export const asNameWithUndefined = (input: string | null | undefined) =>
  Option.fromNullishOr(input ?? undefined);

/**
 * Correctly converts a nullable input directly into an Option.
 */
export const directName = (input: string | null | undefined) =>
  Option.fromNullishOr(input);
