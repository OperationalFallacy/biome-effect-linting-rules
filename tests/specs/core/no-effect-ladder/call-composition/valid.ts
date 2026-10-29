import { Effect } from "effect";

const summary = loadRows.pipe(
  Effect.map(selectActiveRows),
  Effect.map(calculateTotals),
  Effect.map(formatTotals),
);
