import { Option } from "effect";

/**
 * Correctly converts a nullable input directly into an Option.
 * Both null and undefined become the same explicit absence value.
 */
export const asName = (input: string | null | undefined) =>
  Option.fromNullishOr(input);
export const asNameWithUndefined = asName;
export const directName = asName;
