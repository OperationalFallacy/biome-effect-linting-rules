import { Schema } from "effect";

/**
 * Correctly places validation in Schema.makeFilter. A schema predicate describes
 * an input constraint, and its block body is valid for this callback API.
 */
const DisplayName = Schema.String.check(
  Schema.makeFilter((name) => {
    return name.trim().length > 0;
  }),
);

export const decodeDisplayName = Schema.decodeUnknownEffect(DisplayName);
