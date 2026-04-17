import { Effect } from "effect";

declare const state: {
  readonly session: {
    readonly connectFrame: unknown;
  };
};
declare const write: (payload: string) => Effect.Effect<void>;
declare const read: () => Effect.Effect<string>;

export const invalidJsonTransition = Effect.gen(function* () {
  yield* write(JSON.stringify(state.session.connectFrame));
  const raw = yield* read();
  yield* write(JSON.stringify(JSON.parse(raw)));
});
