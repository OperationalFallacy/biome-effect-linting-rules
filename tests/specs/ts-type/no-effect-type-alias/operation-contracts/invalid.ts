import { Effect, Ref } from "effect";

/**
 * Questionably hides an operation's Effect channels behind a type alias.
 * The implementation already supplies the channels that TypeScript can infer.
 */
type ReadCount = (counter: Ref.Ref<number>) => Effect.Effect<number>;
export const readCount: ReadCount = (counter) => Ref.get(counter);
