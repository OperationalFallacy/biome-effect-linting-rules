import { pipe } from "effect";

declare const rows: readonly string[];

export const mappedRows = rows.map((row) => {
  const normalized = row.trim();
  return normalized.toUpperCase();
});

export const pipedRows = pipe(
  rows,
  (items) =>
    items.map((item) => {
      return item.toLowerCase();
    }),
);
