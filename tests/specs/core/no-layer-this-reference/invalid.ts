import { Context, Effect, Layer } from "effect";

interface CounterApi {
  readonly read: Effect.Effect<number>;
}
export class Seed extends Context.Service<Seed, { readonly initial: number }>()(
  "example/Seed",
) {}
export const dependencies = Layer.succeed(Seed, { initial: 3 });
const makeCounter = Effect.gen(function* () {
  const seed = yield* Seed;
  return { read: Effect.succeed(seed.initial) };
});

/**
 * Counter and its variants expose a read of the configured seed value.
 * Their static layers use this for the service key, constructor, or both.
 * The preset requires explicit class references where this names the service
 * or its constructor. ProvidedCounter must retain its external factory and
 * seed dependency when its service key changes to the class name.
 */
export class Counter extends Context.Service<Counter, CounterApi>()(
  "example/Counter",
  { make: makeCounter },
) {
  // It incorrectly uses this for the service and constructor.
  static readonly layer = Layer.effect(this, this.make);
}

export class CounterByMake extends Context.Service<CounterByMake, CounterApi>()(
  "example/CounterByMake",
  { make: makeCounter },
) {
  // It incorrectly uses this.make for the constructor.
  static readonly layer = Layer.effect(CounterByMake, this.make);
}

export class CounterByKey extends Context.Service<CounterByKey, CounterApi>()(
  "example/CounterByKey",
  { make: makeCounter },
) {
  // It incorrectly uses this for the service key.
  static readonly layer = Layer.effect(this, CounterByKey.make);
}

export class ProvidedCounter extends Context.Service<
  ProvidedCounter,
  CounterApi
>()("example/ProvidedCounter") {
  // It incorrectly uses this for the service key beside an external factory.
  static readonly layer = Layer.effect(this, makeCounter).pipe(
    Layer.provide(dependencies),
  );
}
