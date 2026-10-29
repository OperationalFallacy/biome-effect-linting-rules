import { Effect } from "effect";

function serviceNestedReturnMakeOperations() {
  const staged = Effect.succeed(1);
  function makeNestedOperations() {
    const staged = Effect.succeed(2);
    return { staged };
  }
  const run = staged.pipe(Effect.map((value) => value + 1));

  return { run, makeNestedOperations };
}

function makeCallbackOperations() {
  const staged = Effect.succeed(1);
  const callback = () => {
    return { staged };
  };
  const run = staged.pipe(Effect.map((value) => value + 1));

  return { run, callback };
}

function serviceReturnScopesMakeOperations() {
  const step = Effect.succeed(1);
  const run = Effect.gen(function* () {
    const step = Effect.succeed(1);
    return yield* step;
  });

  return { step, run };
}

function makeNestedObject() {
  const staged = Effect.succeed(1);
  return { metadata: { staged } };
}

function makeBlockOperations() {
  const run = Effect.succeed(1);
  {
    const run = Effect.succeed(1);
    void run;
  }
  return { run };
}

function makeRenamedOperations() {
  const run = Effect.succeed(1);
  return { execute: run };
}

function makeTypedOperations() {
  const run: Effect.Effect<number> = Effect.succeed(1);
  return { run };
}

function makeNestedFactory() {
  const makeOperations = () => {
    const run = Effect.succeed(1);
    return { run };
  };
  return { makeOperations };
}
