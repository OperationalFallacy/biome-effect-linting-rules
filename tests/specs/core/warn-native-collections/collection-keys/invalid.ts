import { Data, HashMap, HashSet } from "effect";

class Key extends Data.Class<{ readonly id: string }> {}

/**
 * Questionably uses native collections for value-object keys. A fresh equal
 * key has a different object identity, so a native lookup misses the stored entry.
 */
export const byDomainKey = new Map<Key, string>([
  [new Key({ id: "guest-1" }), "Mira"],
]);
export const selectedDomainKeys = new Set<Key>([new Key({ id: "guest-1" })]);

/**
 * Questionably uses reconstructed record keys with native Map and Set.
 * The logical identity comes from the fields of each key.
 */
const itemKey = (group: string, id: number) => ({ group, id });
export const items = new Map<ReturnType<typeof itemKey>, string>([
  [itemKey("catalog", 3), "Mira"],
]);
export const selectedItems = new Set<ReturnType<typeof itemKey>>([
  itemKey("catalog", 3),
]);

/**
 * Questionably keys a native Map by reconstructed coordinate arrays.
 * Equal row and column values do not identify the same native key instance.
 */
const cellKey = (row: number, column: number): readonly [number, number] => [
  row,
  column,
];
export const cells = new Map<ReturnType<typeof cellKey>, string>([
  [cellKey(0, 1), "occupied"],
]);

/**
 * Questionably uses qualified native constructors for record-valued keys.
 * Constructor qualification preserves the same reference-equality behavior.
 */
const qualifiedKey = (id: string) => ({ id });
export const qualifiedIndex = new globalThis.Map<
  ReturnType<typeof qualifiedKey>,
  number
>([[qualifiedKey("guest-1"), 3]]);
export const qualifiedSelection = new globalThis.Set<
  ReturnType<typeof qualifiedKey>
>([qualifiedKey("guest-1")]);

/**
 * Questionably treats plain record keys as stable native identities.
 */
const plainKey = (id: string) => ({ id });
export const plainIndex = new Map<ReturnType<typeof plainKey>, number>([
  [plainKey("guest-1"), 3],
]);

/**
 * Correctly uses Effect collections for record keys that require value equality.
 */
export const structuralIndex = HashMap.make([itemKey("catalog", 3), "Mira"]);
export const structuralSelection = HashSet.make(itemKey("catalog", 3));
