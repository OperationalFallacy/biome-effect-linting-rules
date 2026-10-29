import "@effect/atom-react";

type EffectApi = typeof import("effect").Effect;

/**
 * Questionably builds an intermediate record in a React integration module.
 * The supplied Effect namespace still creates a record-building fragment.
 */
export const addCount = (Effect: EffectApi) =>
  Effect.bind("count", () => Effect.succeed(3));
