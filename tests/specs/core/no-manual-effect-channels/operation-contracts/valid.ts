import { Effect, Ref } from "effect";

/**
 * Correctly lets TypeScript infer the operation's Effect channels, so its
 * return type follows changes to the implementation.
 */
export const readCounter = Effect.fn("readCounter")(
  (counter: Ref.Ref<number>) => Ref.get(counter),
);
