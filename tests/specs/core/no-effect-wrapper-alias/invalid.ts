import { Effect } from "effect";

interface SessionStore {
  readonly read: Effect.Effect<string>;
}

/**
 * loadSession incorrectly hides its read and trim inside the local normalize
 * function. That helper only forwards the Effect, so the complete session
 * query is separated from the body that returns it.
 */
export const loadSession = Effect.fn("loadSession")((store: SessionStore) => {
  // normalize incorrectly separates the session read and trim from loadSession.
  const normalize = () => Effect.map(store.read, (session) => session.trim());

  return normalize();
});

/**
 * fromForwarder incorrectly adds a second call around the Effect returned by
 * loadSessionDirect. The extra function separates the public session query
 * from the read and normalization that define it.
 */
// loadSessionDirect incorrectly adds a forwarding lookup for fromForwarder.
function loadSessionDirect(store: SessionStore) {
  return Effect.map(store.read, (session) => session.trim());
}
export const fromForwarder = (store: SessionStore) => loadSessionDirect(store);
