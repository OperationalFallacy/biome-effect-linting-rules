/**
 * Questionably duplicates primitive validation in a function predicate.
 * The boolean result discards the decoder's structured failure information.
 */
export function isEnabled(input: unknown): input is boolean {
  return typeof input === "boolean";
}

/**
 * Questionably keeps structural validation in an object's guard method.
 * Each caller must combine the guard result with its own rejection handling.
 */
export const candidate = {
  hasName(input: unknown): input is { readonly name: string } {
    return (
      typeof input === "object" &&
      input !== null &&
      "name" in input &&
      typeof input.name === "string"
    );
  },
};
