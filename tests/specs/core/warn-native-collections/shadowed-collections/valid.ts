import { Data } from "effect";

class Key extends Data.Class<{ id: string }> {}
class Map<K, V> {
  declare key: K;
  declare value: V;
}
class Set<K> {
  declare key: K;
}
const index = new Map<Key, string>();
const selected = new Set<Key>();
