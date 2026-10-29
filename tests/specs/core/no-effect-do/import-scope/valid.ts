import { constants } from "node:os";

const Effect = { Do: constants.signals };

/**
 * Correctly accesses data through a local namespace outside Effect composition.
 * The Do property contains native signal constants.
 */
export const signals = Effect.Do;
