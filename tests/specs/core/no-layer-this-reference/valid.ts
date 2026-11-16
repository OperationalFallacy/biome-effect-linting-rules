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
 * Class names identify the service and constructor in each static layer,
 * as the preset requires. ProvidedCounter retains its external factory and
 * supplies the seed dependency, so the configured read still returns 3.
 */
export class Counter extends Context.Service<Counter, CounterApi>()(
  "example/Counter",
  { make: makeCounter },
) {
  // It correctly names the service and constructor.
  static readonly layer = Layer.effect(Counter, Counter.make);
}
export class CounterByMake extends Context.Service<CounterByMake, CounterApi>()(
  "example/CounterByMake",
  { make: makeCounter },
) {
  // It correctly names the service and constructor.
  static readonly layer = Layer.effect(CounterByMake, CounterByMake.make);
}
export class CounterByKey extends Context.Service<CounterByKey, CounterApi>()(
  "example/CounterByKey",
  { make: makeCounter },
) {
  // It correctly names the service and constructor.
  static readonly layer = Layer.effect(CounterByKey, CounterByKey.make);
}
export class ProvidedCounter extends Context.Service<
  ProvidedCounter,
  CounterApi
>()("example/ProvidedCounter") {
  // It correctly names the service and preserves the external factory.
  static readonly layer = Layer.effect(ProvidedCounter, makeCounter).pipe(
    Layer.provide(dependencies),
  );
}
