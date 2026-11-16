import { Effect } from "effect";
import { HttpClient } from "effect/http";

/**
 * isListening checks for a running HTTP service.
 * Any response means true, even a 503. A failed request means false.
 */
export const isListening = (endpoint: string) =>
  HttpClient.get(`${endpoint}/status`).pipe(
    // The function returns true after the server responds.
    Effect.map(() => true),
    Effect.orElseSucceed(() => false),
  );
