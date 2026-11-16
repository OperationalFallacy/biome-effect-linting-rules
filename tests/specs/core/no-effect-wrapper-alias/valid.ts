import { Effect } from "effect";

interface SessionStore {
  readonly read: Effect.Effect<string>;
}

/**
 * loadSession correctly keeps the read and normalization in its named
 * Effect function. The pipeline defines the complete session query, so a
 * forwarding helper is unnecessary.
 */
export const loadSession = Effect.fn("loadSession")((store: SessionStore) =>
  // This pipeline correctly keeps the session read and trim inside loadSession.
  store.read.pipe(Effect.map((session) => session.trim())),
);
// fromForwarder correctly reuses the complete operation without a wrapper.
export const fromForwarder = loadSession;
