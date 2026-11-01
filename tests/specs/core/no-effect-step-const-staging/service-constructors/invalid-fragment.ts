import { Context, Effect, Layer, Ref } from "effect";

interface CounterApi {
  readonly read: Effect.Effect<number>;
}

export class Counter extends Context.Service<Counter, CounterApi>()(
  "example/Counter",
) {}

/**
 * Incorrectly stages a dependent step inside a service constructor.
 * Layer.effect consumes the completed constructor, not this local fragment.
 */
const makeCounter = Effect.gen(function* () {
  const count = yield* Ref.make(0);
  const snapshot = Effect.map(Ref.get(count), (value) => ({ value }));
  const initial = yield* snapshot;
  return { read: Effect.succeed(initial.value) };
});

export const counterLayer = Layer.effect(Counter, makeCounter);
