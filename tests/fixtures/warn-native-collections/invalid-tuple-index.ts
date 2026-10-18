import { Data as Value } from "effect";

const cellKey = (row: number, column: number) => Value.tuple(row, column);
export const cells = new Map<ReturnType<typeof cellKey>, string>();
