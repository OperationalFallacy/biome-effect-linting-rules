import { Context, Effect, Layer, Ref } from "effect";

interface CounterApi {
  readonly read: Effect.Effect<number>;
}

export class Counter extends Context.Service<Counter, CounterApi>()(
  "example/Counter",
) {}

/**
 * Correctly supplies a complete service constructor through curried Layer.effect.
 * The named effect represents service construction with its own dependencies.
 */
const makeCounter = Effect.gen(function* () {
  const count = yield* Ref.make(0);
  return { read: Ref.get(count) };
});

export const counterLayer = Layer.effect(Counter)(makeCounter);
