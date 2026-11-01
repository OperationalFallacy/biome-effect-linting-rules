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
 * Questionably uses implicit static receivers for the service key and constructor.
 * Explicit class names identify both parts of the layer at its declaration.
 */
export class Counter extends Context.Service<Counter, CounterApi>()(
  "example/Counter",
  { make: makeCounter },
) {
  static readonly layer = Layer.effect(this, this.make);
}

/**
 * Questionably leaves the construction Effect behind a static this reference.
 */
export class CounterByMake extends Context.Service<CounterByMake, CounterApi>()(
  "example/CounterByMake",
  { make: makeCounter },
) {
  static readonly layer = Layer.effect(CounterByMake, this.make);
}

/**
 * Questionably leaves the service key behind a static this reference.
 */
export class CounterByKey extends Context.Service<CounterByKey, CounterApi>()(
  "example/CounterByKey",
  { make: makeCounter },
) {
  static readonly layer = Layer.effect(this, CounterByKey.make);
}

/**
 * Questionably carries implicit class references into dependency assembly.
 */
export class ProvidedCounter extends Context.Service<
  ProvidedCounter,
  CounterApi
>()("example/ProvidedCounter", { make: makeCounter }) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(dependencies),
  );
}

/**
 * Correctly names the service and its construction Effect in a static layer.
 */
export class ExplicitCounter extends Context.Service<
  ExplicitCounter,
  CounterApi
>()("example/ExplicitCounter", { make: makeCounter }) {
  static readonly layer = Layer.effect(ExplicitCounter, ExplicitCounter.make);
}

/**
 * Correctly uses the static receiver inside a callable layer factory.
 * The factory establishes its own operation boundary.
 */
export class FactoryCounter extends Context.Service<
  FactoryCounter,
  CounterApi
>()("example/FactoryCounter", { make: makeCounter }) {
  static createLayer = () => Layer.effect(this, this.make);
}

/**
 * Correctly uses a helper class's own key and constructor in its layer factory.
 * This class assembles an existing key rather than declaring a service subclass.
 */
export class Widget {
  static readonly key = Context.Service<CounterApi>("example/Widget");
  static readonly make = Effect.succeed({ read: Effect.succeed(3) });
  static readonly layer = Layer.effect(this.key, this.make);
}
