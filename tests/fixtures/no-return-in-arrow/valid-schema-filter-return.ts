import { Schema } from "effect";

export const nonEmptyString = Schema.String.pipe(
  Schema.filter((value) => {
    return value.length > 0;
  }),
);
