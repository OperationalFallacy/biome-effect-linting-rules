import { type Effect, Ref } from "effect";

/**
 * The return annotation incorrectly repeats the Effect type already determined
 * by Ref.get. The body and its handwritten channel declaration become two
 * places to maintain the same operation contract.
 */
export function readCounter(counter: Ref.Ref<number>): Effect.Effect<number> {
  // This handwritten return type incorrectly duplicates Ref.get's inferred channels.
  return Ref.get(counter);
}
