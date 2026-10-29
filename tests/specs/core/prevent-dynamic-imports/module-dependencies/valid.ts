import { randomUUID } from "node:crypto";
import { Effect } from "effect";

/**
 * Correctly declares the native dependency at module scope and defers its
 * invocation with Effect.sync. The operation's dependency is visible up front.
 */
export const createId = Effect.fn("createId")(() => Effect.sync(randomUUID));
