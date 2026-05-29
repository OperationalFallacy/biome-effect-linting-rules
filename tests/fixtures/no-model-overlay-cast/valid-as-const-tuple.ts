import { Effect } from "effect";

const DAY_TOKENS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;

export const first = Effect.succeed(DAY_TOKENS[0]);
