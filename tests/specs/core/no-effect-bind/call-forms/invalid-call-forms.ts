import { Effect } from "effect";

interface CounterLabel {
  readonly label: string;
}

const base = Effect.succeed({ label: "Counter" });
const read = () => Effect.succeed(3);

/**
 * Questionably accumulates result fields through Effect.bind call forms.
 * Each callback adds another record-building step to the operation.
 */
export const curried = Effect.bind("count", read);
export const dataFirst = Effect.bind(base, "count", read);
export const computed = base.pipe(
  Effect.bind("count", () => Effect.succeed(3)),
);
export const generic = base.pipe(
  Effect.bind<"count", CounterLabel, number, never, never>("count", read),
);
