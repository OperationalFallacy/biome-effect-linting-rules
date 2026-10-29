import { Match } from "effect";

const selected = Match.value(state).pipe(
  Match.when({ _tag: "Ready" }, (ready) => ready.value),
  Match.orElse(() => fallback),
);
