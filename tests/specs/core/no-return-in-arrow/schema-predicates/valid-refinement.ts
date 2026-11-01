import { Schema } from "effect";

/**
 * Correctly uses a type predicate in Schema.refine so validation narrows the
 * decoded type. The explicit predicate return type expresses that refinement.
 */
const ItemId = Schema.String.pipe(
  Schema.refine((value): value is `item:${string}` => {
    return value.startsWith("item:");
  }),
);

export type ItemId = typeof ItemId.Type;
export const decodeItemId = Schema.decodeUnknownEffect(ItemId);
