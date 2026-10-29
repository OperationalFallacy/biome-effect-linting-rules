import { Context, Effect, Layer, Ref } from "effect";

interface CounterApi {
  readonly read: Effect.Effect<number>;
}

/**
 * Correctly names a service constructor used by a static layer declaration.
 * The class exposes the layer that provides its service contract.
 */
const makeCounter = Effect.gen(function* () {
  const count = yield* Ref.make(0);
  return { read: Ref.get(count) };
});

export class Counter extends Context.Service<Counter, CounterApi>()(
  "example/Counter",
) {
  static readonly layer = Layer.effect(Counter, makeCounter);
}
