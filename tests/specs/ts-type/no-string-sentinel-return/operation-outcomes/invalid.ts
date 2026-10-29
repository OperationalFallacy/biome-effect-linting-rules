import { Effect } from "effect";

const stringOutcome = Effect.succeed("ready");
const taggedOutcome = Effect.succeed({ _tag: "Ready" });
