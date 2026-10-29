import { pipe, Schema } from "effect";

declare const rows: readonly string[];

const mappedRows = rows.map((row) => {
  const normalized = row.trim();
  return normalized.toUpperCase();
});

const pipedRows = pipe(rows, (items) =>
  items.map((item) => {
    return item.toLowerCase();
  }),
);

const singleResultBlockValue = [1].map((n) => {
  return n + 1;
});

const expressionArrowValue = [1].map((n) => n + 1);

const nonEmptyString = Schema.String.pipe(
  Schema.check(
    Schema.makeFilter((value: string) => {
      return value.length > 0;
    }),
  ),
);
