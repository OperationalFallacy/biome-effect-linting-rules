import { Array as Arr, Data, Equal, Option } from "effect";

class Key extends Data.Class<{ readonly id: string }> {}

/**
 * Correctly defines a local collection with explicit value-equality lookup.
 * Its Map name identifies this implementation's own semantics.
 */
class Map<K, V> {
  constructor(readonly entries: ReadonlyArray<readonly [K, V]>) {}
  get(key: K) {
    return Arr.findFirst(this.entries, ([stored]) =>
      Equal.equals(stored, key),
    ).pipe(Option.map(([, value]) => value));
  }
}

/**
 * Correctly defines local membership through explicit value equality.
 */
class Set<K> {
  constructor(readonly entries: ReadonlyArray<K>) {}
  has(key: K) {
    return Arr.some(this.entries, (stored) => Equal.equals(stored, key));
  }
}

export const index = new Map<Key, string>([
  [new Key({ id: "guest-1" }), "Mira"],
]);
export const selected = new Set<Key>([new Key({ id: "guest-1" })]);
