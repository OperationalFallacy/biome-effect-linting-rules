import { Effect } from "effect";

interface CounterSource {
  subscribe(listener: (value: number) => void): () => void;
}

function registerWithAsync(source: CounterSource) {
  return Effect.async((resume) => {
    const unsubscribe = source.subscribe((value) => {
      resume(Effect.succeed(value));
    });
    return Effect.sync(unsubscribe);
  });
}

function registerWithGenericAsync(source: CounterSource) {
  return Effect.async<number>((resume) => {
    const unsubscribe = source.subscribe((value) => {
      resume(Effect.succeed(value));
    });
    return Effect.sync(unsubscribe);
  });
}
