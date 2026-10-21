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

Returning an operation through the API does not exempt the steps inside its implementation.

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

The rule reports `snapshot`. Inline that intermediate pipeline into the operation. The first example shows the resulting `readCount` implementation.

## Scope of the exception

The declaration and the direct object return must belong to the same function body. Returns inside nested functions and references inside nested objects do not exempt the declaration. Matching names in another scope do not establish API membership.

Keep intermediate steps inside their operation. Adding fragments to the public API solely to suppress the diagnostic changes the contract without fixing the fragmented implementation.
