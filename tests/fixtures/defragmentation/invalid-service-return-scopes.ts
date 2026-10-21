import { Effect } from "effect";

export function makeOperations() {
  const step = Effect.succeed(1);
  const run = Effect.gen(function* () {
    const step = Effect.succeed(1);
    return yield* step;
  });

  return { step, run };
}

export function makeNestedObject() {
  const staged = Effect.succeed(1);
  return { metadata: { staged } };
}

export function makeBlockOperations() {
  const run = Effect.succeed(1);
  {
    const run = Effect.succeed(1);
    void run;
  }
  return { run };
}
