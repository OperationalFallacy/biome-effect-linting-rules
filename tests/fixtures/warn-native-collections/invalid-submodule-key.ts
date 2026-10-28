import * as Value from 'effect/Data';

const cellKey = (row: number, column: number) => [row, column];
export const cells = new Map<ReturnType<typeof cellKey>, string>();
