import { Effect } from "task-builder";

const addCount = Effect.bind("count", read);
const addCountToTask = Effect.bind(task, "count", read);
