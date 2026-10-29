/**
 * Questionably represents an operation's state with a string token.
 * The token cannot carry the data that explains the selected state.
 */
export const stringStatus = "ready";

/**
 * Correctly represents the state and its associated data in a tagged value.
 */
export const taggedStatus = { _tag: "Ready", count: 3 };
