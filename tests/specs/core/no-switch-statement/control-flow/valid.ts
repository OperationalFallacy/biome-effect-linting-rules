import { Match } from "effect";

const label = Match.value(state).pipe(
  Match.when({ _tag: "Ready" }, (ready) => ready.name),
  Match.when({ _tag: "Loading" }, () => "Loading"),
  Match.orElse(() => "Unknown"),
);
