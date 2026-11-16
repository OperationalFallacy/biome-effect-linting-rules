import { Ref } from "effect";

/**
 * The count operation correctly keeps its implementation and inferred
 * channels together. There is no separate alias to inspect or maintain when
 * the returned Effect changes.
 */
// It correctly infers the function contract from the counter read.
export const readCount = (counter: Ref.Ref<number>) => Ref.get(counter);
