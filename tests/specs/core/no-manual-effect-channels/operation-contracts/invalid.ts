import { Effect, Context } from "effect";

interface Counter {
  read(): Effect.Effect<number>;
}
function read(): Effect.Effect<number> {
  return Effect.succeed(1);
}

{
  class Counter extends Context.Service<
    Counter,
    {
      readonly read: Effect.Effect<number>;
      readonly increment: (n: number) => Effect.Effect<number>;
    }
  >()("example/Counter") {}
}

{
  interface Counter {
    read(): Effect.Effect<number>;
    increment(n: number): Effect.Effect<number>;
  }
}
