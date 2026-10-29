import { Context, Effect, Layer, Ref } from "effect";

interface CounterApi {
  readonly read: Effect.Effect<number>;
}

export class Counter extends Context.Service<Counter, CounterApi>()(
  "example/Counter",
) {}

const makeCounter = Effect.gen(function* () {
  const count = yield* Ref.make(0);
  return { read: Ref.get(count) };
});

export const counterLayer = Layer.effect(Counter, makeCounter);

/**
 * Incorrectly stages a local transformation behind another constant.
 * The service constructor with the same name belongs to a different scope.
 */
export const readInitialCount = Effect.fn("readInitialCount")(function* () {
  const makeCounter = Effect.succeed(1);
  return yield* makeCounter;
});
