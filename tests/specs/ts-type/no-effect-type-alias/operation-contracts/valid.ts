import { Effect, Ref } from "effect";

/**
 * Correctly infers the named operation's channels from its implementation.
 * The operation's type follows the effect it returns.
 */
export const readCount = Effect.fn("readCount")((counter: Ref.Ref<number>) =>
  Ref.get(counter),
);
