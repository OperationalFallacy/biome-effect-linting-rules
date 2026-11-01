import { Effect } from "effect";

/**
 * A try/finally inside Effect.sync covers that synchronous callback. Use
 * Effect.ensuring to keep cleanup attached when the operation later includes
 * asynchronous work.
 */
export const useResource = Effect.fn("useResource")((use: () => number, close: () => void) =>
  Effect.sync(() => { try { return use(); } finally { close(); } }),
);
