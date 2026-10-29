import { Effect, Match } from "effect";

const label = Match.value(state).pipe(
  Match.when({ _tag: "Ready" }, (ready) => ready.name),
  Match.orElse(() => "Loading"),
);

const display = Effect.logInfo(label);
