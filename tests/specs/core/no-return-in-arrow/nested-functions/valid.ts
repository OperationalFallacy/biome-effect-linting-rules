import { Effect } from "effect";

/**
 * Correctly uses a block to define and return an operation. The nested generator
 * needs its return statement to supply the operation's success value.
 */
export const makeGreeter = Effect.sync(() => {
  const greet = Effect.fn("greet")(function* (name: string) {
    yield* Effect.logInfo(`Hello, ${name}`);
    return name;
  });
  return { greet };
});

const rows = [
  { name: "Mira", hidden: false },
  { name: "Owen", hidden: true },
];

/**
 * Correctly retains a block callback with separate conditional returns.
 * An expression-only rewrite would need a different branching construct.
 */
export const labels = rows.map((row) => {
  if (row.hidden) {
    return "Hidden";
  }
  return row.name;
});
