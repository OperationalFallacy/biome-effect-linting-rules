import { Match } from "effect";

const label = Match.value(isReady).pipe(
  Match.when(true, () => "Ready"),
  Match.orElse(() => "Loading"),
);
const view = { label, count };
