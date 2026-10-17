import { Effect } from "effect";

// This cache deliberately distinguishes object instances.
export const cache = new Map<object, string>();
export const ready = Effect.succeed(true);
