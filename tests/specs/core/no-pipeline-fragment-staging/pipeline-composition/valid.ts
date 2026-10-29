import { Effect } from "effect";

const readSummary = Effect.fn("readSummary")(() =>
  readOrders.pipe(
    Effect.map(selectCompleted),
    Effect.map(calculateTotals),
  ),
);
