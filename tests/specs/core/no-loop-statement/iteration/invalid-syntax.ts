/**
 * Effect.forEach traverses sequentially unless concurrency is requested. For
 * condition-driven work, an Effect repetition combinator must also preserve
 * whether the first step runs before the condition is checked.
 */
export function visit(values: ReadonlyArray<number>, record: Readonly<Record<string, number>>, emit: (value: unknown) => void, ready: () => boolean) {
  for (let index = 0; index < values.length; index++) { emit(values[index]); }
  for (const key in record) { emit(record[key]); }
  while (ready()) { emit("next"); }
  do { emit("first"); } while (ready());
}
export async function consume(values: AsyncIterable<number>, emit: (value: number) => void) {
  for await (const value of values) { emit(value); }
}
