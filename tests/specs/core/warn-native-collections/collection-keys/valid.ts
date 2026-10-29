import { Data, HashMap, HashSet } from "effect";

class Key extends Data.Class<{ readonly id: string }> {}
const itemKey = (group: string, id: number) => ({ group, id });
const cellKey = (row: number, column: number): readonly [number, number] => [
  row,
  column,
];
const qualifiedKey = (id: string) => ({ id });
const plainKey = (id: string) => ({ id });

/**
 * Correctly uses Effect collections for reconstructed value keys.
 * Lookups can use a newly constructed equal key.
 */
export const byDomainKey = HashMap.make([new Key({ id: "guest-1" }), "Mira"]);
export const selectedDomainKeys = HashSet.make(new Key({ id: "guest-1" }));
export const items = HashMap.make([itemKey("catalog", 3), "Mira"]);
export const selectedItems = HashSet.make(itemKey("catalog", 3));
export const cells = HashMap.make([cellKey(0, 1), "occupied"]);
export const qualifiedIndex = HashMap.make([qualifiedKey("guest-1"), 3]);
export const qualifiedSelection = HashSet.make(qualifiedKey("guest-1"));
export const plainIndex = HashMap.make([plainKey("guest-1"), 3]);
export const structuralIndex = HashMap.make([itemKey("catalog", 3), "Mira"]);
export const structuralSelection = HashSet.make(itemKey("catalog", 3));

/**
 * Correctly uses native collections for scalar keys and object values.
 * Equality of the stored value does not affect lookup by its string key.
 */
export const labels = new Map<string, string>([["guest-1", "Mira"]]);
export const visited = new Set<number>([3]);
export const objectValues = new Map<string, ReturnType<typeof itemKey>>([
  ["guest-1", itemKey("catalog", 3)],
]);
export const inferredIds = new Set(["guest-1", "guest-2"]);

/**
 * Correctly attaches metadata to object lifetimes through weak collections.
 */
export const weakIndex = new WeakMap<object, string>();
export const weakSelection = new WeakSet<object>();
