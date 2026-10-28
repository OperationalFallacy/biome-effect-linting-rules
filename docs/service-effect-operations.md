# Complete service operations and intermediate steps

The `no-effect-step-const-staging` rule allows complete operations exposed through a function's returned API. It still reports intermediate Effect constants inside those operations.

These examples use a synthetic counter. They apply to this rule individually.

## Allowed service operations

Define the operations and return them as API members. Keep their inferred Effect types.

```ts
import { Effect, Ref } from "effect";

export function makeCounterApi(counter: Ref.Ref<number>) {
  const readCount = Ref.get(counter).pipe(
    Effect.map((count) => ({ count })),
  );
  const resetCount = Effect.gen(function* () {
    yield* Ref.set(counter, 0);
  });
  const increment = Effect.fnUntraced(function* () {
    yield* Ref.update(counter, (count) => count + 1);
    return yield* Ref.get(counter);
  });

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

The declaration and the direct object return must belong to the same function body. Returns inside nested functions and references inside nested objects do not exempt the declaration. Names that match in another scope do not establish API membership.

Keep intermediate steps inside their operation. Extra API members alter the public contract and leave the fragmented implementation intact. Expose complete operations through the API and fix their intermediate steps in place.
