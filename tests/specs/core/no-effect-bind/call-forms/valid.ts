import { Effect } from "effect";

const dependent = Effect.succeed(1).pipe(Effect.flatMap((count) => Effect.succeed(count + 1)));
const directYields = Effect.gen(function* () {
  const count = yield* read;
  return count + 1;
});
const namedResult = task.pipe(Effect.bindTo("count"));
const unrelatedBind = other.bind("count", read);
