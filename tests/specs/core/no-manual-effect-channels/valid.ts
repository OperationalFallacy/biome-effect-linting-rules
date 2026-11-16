import { Ref } from "effect";

/**
 * readCounter returns the current counter value. It correctly leaves its
 * channels to inference from Ref.get.
 * The implementation determines the return type without a second annotation
 * that can diverge from the composed work.
 */
// It correctly infers the return type from Ref.get.
export function readCounter(counter: Ref.Ref<number>) {
  return Ref.get(counter);
}
