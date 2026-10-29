import * as Value from "effect/Data";

class Cell extends Value.Class<{
  readonly row: number;
  readonly column: number;
}> {}

/**
 * Questionably uses structural coordinate values as native Map keys.
 * A reconstructed equal coordinate has a different native object identity.
 */
export const cells = new Map<Cell, string>([
  [new Cell({ row: 0, column: 1 }), "occupied"],
]);
