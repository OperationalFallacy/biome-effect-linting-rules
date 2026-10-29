import { Effect } from "effect";

type Load = Effect.Effect<number>;

function load(): Effect.Effect<number> {
  return Effect.succeed(1);
}
