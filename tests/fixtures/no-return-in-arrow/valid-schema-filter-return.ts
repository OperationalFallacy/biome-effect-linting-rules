import { Schema } from "effect";

export const nonEmptyString = Schema.String.pipe(
  Schema.check(Schema.makeFilter((value: string) => {
    return value.length > 0;
  })),
);
