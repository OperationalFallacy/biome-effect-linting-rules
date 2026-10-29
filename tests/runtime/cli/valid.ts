import { Effect } from "effect";

export const load = Effect.fn("load")(function* () {
  yield* Effect.log("done");
  return 1;
});
