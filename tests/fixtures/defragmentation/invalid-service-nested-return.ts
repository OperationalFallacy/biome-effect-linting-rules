import { Effect } from "effect";

export function makeOperations() {
  const staged = Effect.succeed(1);
  function makeNestedOperations() {
    const staged = Effect.succeed(2);
    return { staged };
  }
  const run = staged.pipe(Effect.map((value) => value + 1));

  return { run, makeNestedOperations };
}

export function makeCallbackOperations() {
  const staged = Effect.succeed(1);
  const callback = () => {
    return { staged };
  };
  const run = staged.pipe(Effect.map((value) => value + 1));

  return { run, callback };
}
