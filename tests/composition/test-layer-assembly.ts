import { Effect } from "effect";
it.effect("reads", () => Effect.gen(function* () { return yield* read().pipe(Effect.provide(live)); }));
