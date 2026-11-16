import { HashMap, Option } from "effect";
import * as Value from "effect/Data";

class Cell extends Value.Class<{
  readonly row: number;
  readonly column: number;
}> {}

/**
 * findCell retrieves the label stored at a coordinate, or undefined when the
 * coordinate is absent. HashMap compares Cell keys by value, so a newly
 * constructed Cell for row 0, column 1 retrieves occupied.
 */
// It correctly uses value equality for coordinate keys.
export const cells = HashMap.make([
  new Cell({ row: 0, column: 1 }),
  "occupied",
]);

export const findCell = (row: number, column: number) =>
  HashMap.get(cells, new Cell({ row, column })).pipe(Option.getOrUndefined);
