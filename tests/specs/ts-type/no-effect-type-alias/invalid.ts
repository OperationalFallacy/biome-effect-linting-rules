import { type Effect, Ref } from "effect";

/**
 * The ReadCount alias incorrectly separates the operation from its Effect
 * channels. The reader must follow another type declaration to inspect a
 * contract that Ref.get already determines.
 */
// ReadCount incorrectly adds a type lookup for the channels already inferred from Ref.get.
type ReadCount = (counter: Ref.Ref<number>) => Effect.Effect<number>;
export const readCount: ReadCount = (counter) => Ref.get(counter);
