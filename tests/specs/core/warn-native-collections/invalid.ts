import * as Value from "effect/Data";

class Cell extends Value.Class<{
  readonly row: number;
  readonly column: number;
}> {}

/**
 * findCell should retrieve the label stored at a coordinate, or undefined
 * when that coordinate is absent. The native Map compares Cell keys by
 * reference. The new key for row 0, column 1 therefore misses occupied even
 * though it represents the stored coordinate.
 */
// It incorrectly uses reference equality for coordinate keys.
export const cells = new Map<Cell, string>([
  [new Cell({ row: 0, column: 1 }), "occupied"],
]);

export const findCell = (row: number, column: number) =>
  cells.get(new Cell({ row, column }));
