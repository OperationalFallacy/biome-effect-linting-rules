import * as Effect from "effect/Effect";

/**
 * Questionably exposes a record-building fragment from an Effect submodule.
 * Callers must supply the intermediate record that the builder extends.
 */
export const addCount = Effect.bind("count", () => Effect.succeed(3));
