import { Effect } from "effect";

export function makeRenamedOperations() {
  const run = Effect.succeed(1);
  return { execute: run };
}

export function makeTypedOperations() {
  const run: Effect.Effect<number> = Effect.succeed(1);
  return { run };
}

export function makeNestedFactory() {
  const makeOperations = () => {
    const run = Effect.succeed(1);
    return { run };
  };
  return { makeOperations };
}
