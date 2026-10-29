import { Effect } from "effect";

/**
 * Incorrectly stages a count before the exposed operation. The nested factory
 * exposes a different operation with the same local name.
 */
export function makeNestedReturn(initialCount: number) {
  const staged = Effect.succeed(initialCount);
  function makeNestedOperations() {
    const staged = Effect.succeed(initialCount);
    return { staged };
  }
  const run = staged.pipe(Effect.map((count) => count + 1));
  return { run, makeNestedOperations };
}

/**
 * Incorrectly stages an Effect outside the callback that returns it.
 * The outer operation's API exposes the callback and the completed run operation.
 */
export function makeCallbackOperations(initialCount: number) {
  const staged = Effect.succeed(initialCount);
  const callback = () => ({ staged });
  const run = staged.pipe(Effect.map((count) => count + 1));
  return { run, callback };
}

/**
 * Incorrectly stages a step inside an exposed generator. Each operation body
 * needs its own continuous sequence even when the outer API exposes a similar name.
 */
export function makeReturnScopes(initialCount: number) {
  const step = Effect.succeed(initialCount);
  const run = Effect.gen(function* () {
    const step = Effect.succeed(initialCount);
    return yield* step;
  });
  return { step, run };
}

/**
 * Questionably stores executable work under metadata. A consumer must traverse
 * the metadata record to find the locally staged operation.
 */
export function makeNestedObject(initialCount: number) {
  const staged = Effect.succeed(initialCount);
  return { metadata: { staged } };
}

/**
 * Incorrectly creates a shadowed, unused Effect in a nested block.
 * A reference to that value does not execute the operation.
 */
export function makeBlockOperations(initialCount: number) {
  const run = Effect.succeed(initialCount);
  {
    const run = Effect.succeed(initialCount);
    void run;
  }
  return { run };
}

/**
 * Correctly exposes a complete operation under an explicit API member name.
 */
export function makeRenamedOperations(initialCount: number) {
  const run = Effect.succeed(initialCount);
  return { execute: run };
}

interface CounterApi {
  readonly run: Effect.Effect<number>;
}

/**
 * Correctly checks an API operation against its public member type.
 */
export function makeTypedOperations(initialCount: number) {
  const run: CounterApi["run"] = Effect.succeed(initialCount);
  return { run };
}

/**
 * Correctly exposes a factory whose own body returns a complete operation.
 * Construction and operation scopes remain separate.
 */
export function makeNestedFactory(initialCount: number) {
  const makeOperations = () => {
    const run = Effect.succeed(initialCount);
    return { run };
  };
  return { makeOperations };
}
