import { Effect } from "effect";

// Scalar keys can be intentional. The warning asks for review, not replacement.
export const byId = new Map<string, number>();
export const selectedIds = new Set(["a", "b"]);
export const ready = Effect.succeed(true);
