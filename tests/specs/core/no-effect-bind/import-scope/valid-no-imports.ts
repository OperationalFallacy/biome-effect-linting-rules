const Effect = {
  bind: (name: string, read: () => number) => ({ [name]: read() }),
};

/**
 * Correctly uses a local synchronous data builder outside Effect composition.
 * The builder reads its value immediately and returns an ordinary record.
 */
export const count = Effect.bind("count", () => 3);
