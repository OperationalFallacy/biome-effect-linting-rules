import { Effect } from "effect";

const sequentialLogsValue = Effect.all([Effect.log("start"), Effect.log("done")], {
  concurrency: 1,
});

const collectedResultsValue = Effect.all([Effect.succeed(1), Effect.succeed(2)]);
