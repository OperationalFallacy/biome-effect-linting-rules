import { Effect } from "effect";

interface CounterSource {
  subscribe(listener: (value: number) => void): () => void;
}

function registerWithCallback(source: CounterSource) {
  return Effect.callback<number>((resume) => {
    const unsubscribe = source.subscribe((value) => {
      resume(Effect.succeed(value));
    });
    return Effect.sync(unsubscribe);
  });
}
