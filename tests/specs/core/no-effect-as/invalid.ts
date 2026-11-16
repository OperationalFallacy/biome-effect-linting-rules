import { Effect } from "effect";
import { HttpClient } from "effect/http";

/**
 * isListening checks for a running HTTP service.
 * Any response means true, even a 503. A failed request means false.
 */
export const isListening = (endpoint: string) =>
  HttpClient.get(`${endpoint}/status`).pipe(
    // Effect.as passes true directly. The preset requires a function here.
    Effect.as(true),
    Effect.orElseSucceed(() => false),
  );
