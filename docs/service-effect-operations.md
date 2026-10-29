# Complete service operations and intermediate steps

The `no-effect-step-const-staging` rule allows complete operations exposed through a function's returned API, named service constructors, and exported query effects. It still reports intermediate Effect constants inside those operations.

These examples apply to this rule individually.

## Allowed service operations

Define the operations and return them as API members. Keep their inferred Effect types.

```ts
import { Effect, Ref } from "effect";

export function makeCounterApi(counter: Ref.Ref<number>) {
  const readCount = Ref.get(counter).pipe(
    Effect.map((count) => ({ count })),
  );
  const resetCount = Ref.set(counter, 0);
  const increment = Effect.fnUntraced(() =>
    Ref.updateAndGet(counter, (count) => count + 1),
  );

  return { readCount, resetCount, increment };
}
```

The returned members are complete operations. Both `Effect.fn` and `Effect.fnUntraced` functions are supported. Explicit property names, such as `return { read: readCount }`, also establish API membership.

## Intermediate steps still require changes

The rule still checks the steps inside each API operation.

```ts
import { Effect, Ref } from "effect";

export function makeCounterApi(counter: Ref.Ref<number>) {
  const readCount = Effect.gen(function* () {
    const snapshot = Ref.get(counter).pipe(
      Effect.map((count) => ({ count })),
    );
    return yield* snapshot;
  });

  return { readCount };
}
```

The rule reports `snapshot`. Inline that intermediate pipeline into the operation. Use the `readCount` implementation from the first example.

## Scope of the exception

For returned API members, the declaration and the direct object return must belong to the same function body. Returns inside nested functions and references inside nested objects do not exempt the declaration. Names that match in another scope do not establish API membership.

A named constructor may also feed `Layer.effect(Service, constructor)`, `Layer.effect(Service)(constructor)`, or the `make` option in a `Context.Service` declaration. The consumer must refer to the constructor in the same lexical scope, including a class's static layer declaration. Intermediate declarations inside that constructor remain subject to the rule.

An exported Effect value is a public operation. Its intermediate steps still belong in its pipeline. An export does not exempt declarations inside callbacks or generators.

Keep intermediate steps inside their operation. Extra API members alter the public contract and leave the fragmented implementation intact. Expose complete operations through the API and fix their intermediate steps in place.
