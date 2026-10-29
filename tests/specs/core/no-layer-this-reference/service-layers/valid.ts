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
 * Correctly names each service key and construction Effect at its static layer
 * declaration. The class identity remains explicit throughout dependency assembly.
 */
export class Counter extends Context.Service<Counter, CounterApi>()(
  "example/Counter",
  { make: makeCounter },
) {
  static readonly layer = Layer.effect(Counter, Counter.make);
}
export class CounterByMake extends Context.Service<CounterByMake, CounterApi>()(
  "example/CounterByMake",
  { make: makeCounter },
) {
  static readonly layer = Layer.effect(CounterByMake, CounterByMake.make);
}
export class CounterByKey extends Context.Service<CounterByKey, CounterApi>()(
  "example/CounterByKey",
  { make: makeCounter },
) {
  static readonly layer = Layer.effect(CounterByKey, CounterByKey.make);
}
export class ProvidedCounter extends Context.Service<
  ProvidedCounter,
  CounterApi
>()("example/ProvidedCounter", { make: makeCounter }) {
  static readonly layer = Layer.effect(
    ProvidedCounter,
    ProvidedCounter.make,
  ).pipe(Layer.provide(dependencies));
}
export class ExplicitCounter extends Context.Service<
  ExplicitCounter,
  CounterApi
>()("example/ExplicitCounter", { make: makeCounter }) {
  static readonly layer = Layer.effect(ExplicitCounter, ExplicitCounter.make);
}

/**
 * Correctly uses the static receiver inside a callable layer factory.
 */
export class FactoryCounter extends Context.Service<
  FactoryCounter,
  CounterApi
>()("example/FactoryCounter", { make: makeCounter }) {
  static createLayer = () => Layer.effect(this, this.make);
}

/**
 * Correctly assembles a function-style service key through an ordinary helper class.
 */
export class Widget {
  static readonly key = Context.Service<CounterApi>("example/Widget");
  static readonly make = Effect.succeed({ read: Effect.succeed(3) });
  static readonly layer = Layer.effect(this.key, this.make);
}
