import { format as Effect } from "node:util";

/**
 * Correctly binds a synchronous formatter from another module.
 * These bound functions format text and do not compose Effect operations.
 */
export const formatCount = Effect.bind(undefined, "count=%d");
export const formatNamedCount = Effect.bind(undefined, "%s=%d", "count");
