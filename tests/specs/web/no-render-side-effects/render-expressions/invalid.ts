import { Match, pipe } from "effect";

Match.value(1).pipe(
  Match.when(1, () => console.log("render")),
  Match.orElse(() => undefined),
);

const value = Match.value(1).pipe(
  Match.when(1, () => "ready"),
  Match.orElse(() => "waiting"),
);
