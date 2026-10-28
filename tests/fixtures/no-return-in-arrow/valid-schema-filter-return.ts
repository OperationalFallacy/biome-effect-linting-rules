import { Schema } from "effect";

export const nonEmptyString = Schema.String.pipe(
  Schema.makeFilter((value) => {
    return value.length > 0;
  }),
);
