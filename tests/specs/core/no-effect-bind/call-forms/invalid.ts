import { Effect } from "effect";

const addCount = Effect.bind("count", read);
const addCountToTask = Effect.bind(task, "count", read);
const addComputedCount = Effect.bind("count", () => Effect.succeed(1));
const addTypedCount = Effect.bind<"count">("count", read);
const withCount = task.pipe(Effect.bind("count", read));
