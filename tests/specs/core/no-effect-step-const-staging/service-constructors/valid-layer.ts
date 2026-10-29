import { Context, Effect, Layer, Ref } from "effect";

interface CounterApi {
  readonly read: Effect.Effect<number>;
}

export class Counter extends Context.Service<Counter, CounterApi>()(
  "example/Counter",
) {}

/**
 * Correctly names a complete service constructor and supplies it to Layer.effect.
 * The layer manages construction and exposes the resulting service API.
 */
const makeCounter = Effect.gen(function* () {
  const count = yield* Ref.make(0);
  return { read: Ref.get(count) };
});

export const counterLayer = Layer.effect(Counter, makeCounter);
