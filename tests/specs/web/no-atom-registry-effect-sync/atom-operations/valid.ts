import { Effect } from "effect";
import { Atom } from "@effect/atom-react";

const readCount = Effect.fn("readCount")(function* () {
  const count = yield* Atom.get(countAtom);
  yield* Atom.set(countAtom, count + 1);
  return count;
});
