import { Data } from "effect";

type LoadState = Data.TaggedEnum<{
  Loading: {};
  Ready: { readonly count: number };
}>;
const LoadState = Data.taggedEnum<LoadState>();

/**
 * Correctly represents a state as a tagged value with its associated data.
 * Callers can select behavior through the discriminant and typed payload.
 */
export const state = LoadState.Ready({ count: 3 });
