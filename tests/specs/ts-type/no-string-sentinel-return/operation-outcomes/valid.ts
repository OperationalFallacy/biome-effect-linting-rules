import { Data, Match } from "effect";

class Ready extends Data.TaggedClass("Ready")<{ readonly count: number }> {}
class Empty extends Data.TaggedClass("Empty") {}

const outcome = Match.value(rows.length).pipe(
  Match.when(0, () => new Empty()),
  Match.orElse((count) => new Ready({ count })),
);
