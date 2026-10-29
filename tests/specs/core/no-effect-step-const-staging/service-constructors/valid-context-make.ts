import { Context, Effect, Layer, Ref } from "effect";

interface CounterApi {
  readonly read: Effect.Effect<number>;
}

/**
 * Correctly names a complete constructor for Context.Service's make option.
 * The declaration connects the service contract to its construction effect.
 */
const makeCounter = Effect.gen(function* () {
  const count = yield* Ref.make(0);
  return { read: Ref.get(count) };
});

export class Counter extends Context.Service<Counter, CounterApi>()(
  "example/Counter",
  { make: makeCounter },
) {
  static readonly layer = Layer.effect(Counter, Counter.make);
}
