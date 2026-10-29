import { Effect } from "effect";

/**
 * Questionably loads a known module inside the operation. The dependency
 * becomes visible only after the reader follows the operation's execution path.
 */
export const createId = Effect.fn("createId")(() =>
  Effect.promise(() => import("node:crypto")).pipe(
    Effect.map((crypto) => crypto.randomUUID()),
  ),
);
