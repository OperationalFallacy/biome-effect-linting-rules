import { Effect } from "effect";

const consoleLog = Effect.sync(() => console.log("saved"));
const effectLog = Effect.log("saved");
