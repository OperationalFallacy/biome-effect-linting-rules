import { Effect, Ref } from "effect";

/**
 * Unnecessarily annotates an implemented operation's Effect return type.
 * The annotation duplicates channels that TypeScript can infer from the body.
 */
export function readCounter(counter: Ref.Ref<number>): Effect.Effect<number> {
  return Ref.get(counter);
}
