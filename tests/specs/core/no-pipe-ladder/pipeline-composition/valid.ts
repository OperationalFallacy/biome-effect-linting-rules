import { Effect, pipe } from "effect";

const summary = pipe(rows, selectActive, calculateTotals, formatTotals);
const operation = readUser.pipe(
  Effect.flatMap((user) =>
    readOrders(user.id).pipe(Effect.map((orders) => ({ user, orders }))),
  ),
);
