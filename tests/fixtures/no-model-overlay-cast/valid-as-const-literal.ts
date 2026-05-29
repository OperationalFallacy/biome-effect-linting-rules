import { Effect } from "effect";

const status = "open" as const;

export const program = Effect.succeed(status);
