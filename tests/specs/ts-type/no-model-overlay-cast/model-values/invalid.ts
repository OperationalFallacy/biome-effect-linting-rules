import { Effect } from "effect";

interface Profile {
  readonly id: string;
  readonly name: string;
}

/**
 * Incorrectly asserts untrusted input into model types without validation.
 * Invalid fields reach the success channel because these assertions only
 * change TypeScript's view of the input.
 */
export const decodeProfile = Effect.fn("decodeProfile")(function* (input: unknown) {
  const profile = input as Profile;
  return profile;
});

export const decodeInlineProfile = Effect.fn("decodeInlineProfile")(function* (
  input: unknown,
) {
  const profile = input as { readonly id: string; readonly name: string };
  return profile;
});
